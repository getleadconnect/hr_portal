<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\LeaveSetting;
use App\Models\Department;
use App\Models\Designation;
use Illuminate\Support\Facades\Storage;
use Validator;
use PDF;
use Carbon\Carbon;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = Employee::with('departmentRelation')->orderBy('id', 'DESC');

        // Search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                    ->orWhere('employee_id', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('mobile_number', 'LIKE', "%{$search}%");
            });
        }

        // Department filter
        if ($request->has('department_id') && $request->department_id) {
            $query->where('department_id', $request->department_id);
        }

        // Designation filter
        if ($request->has('designation_id') && $request->designation_id) {
            $query->where('designation_id', $request->designation_id);
        }

        // Date range filter (by created_at)
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $employees = $query->paginate($perPage);

        // Get current year for leave calculation
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth()->format('Y-m-d');
        $endOfMonth = $currentMonth->copy()->endOfMonth()->format('Y-m-d');

        // Get total leave from leave_settings table
        $totalLeave = LeaveSetting::where('status', 1)->sum('no_of_days');
        if ($totalLeave == 0) {
            $totalLeave = 23; // Default if no settings
        }

        // Calculate working days in current month (excluding weekends)
        $workingDays = 0;
        $date = $currentMonth->copy()->startOfMonth();
        while ($date <= $currentMonth->copy()->endOfMonth()) {
            if (!$date->isWeekend()) {
                $workingDays++;
            }
            $date->addDay();
        }

        // Transform data
        $employees->getCollection()->transform(function ($employee) use ($currentYear, $startOfMonth, $endOfMonth, $totalLeave, $workingDays) {
            // Calculate attendance percentage for current month
            $presentDays = Attendance::where('employee_id', $employee->id)
                ->whereBetween('attendance_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'present')
                ->count();

            $halfDays = Attendance::where('employee_id', $employee->id)
                ->whereBetween('attendance_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'half_day')
                ->count();

            $totalAttendedDays = $presentDays + ($halfDays * 0.5);
            $attendancePercentage = $workingDays > 0 ? round(($totalAttendedDays / $workingDays) * 100) : 0;

            // Calculate leave taken this year from leave_requests table
            $leaveTaken = LeaveRequest::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->whereYear('from_date', $currentYear)
                ->sum('days');

            return [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'employee_id' => $employee->employee_id,
                'mobile_number' => $employee->mobile_number,
                'email' => $employee->email,
                'job_title' => $employee->job_title,
                'department' => $employee->departmentRelation->department_name ?? null,
                'status' => $employee->status,
                'profile_image_url' => $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null,
                'created_at' => $employee->created_at->format('d-m-Y'),
                'attendance_percentage' => $attendancePercentage,
                'leave_taken' => (int) $leaveTaken,
                'total_leave' => $totalLeave,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Employee::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $data = [
                // Personal Information
                'full_name' => $request->full_name,
                'employee_id' => $request->employee_id,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'marital_status' => $request->marital_status,
                'qualification_id' => $request->qualification_id,
                'technology_stack' => $request->technology_stack,
                'join_date' => $request->join_date,
                'releaving_date' => $request->releaving_date,

                // Contact Information
                'mobile_number' => $request->mobile_number,
                'alternative_number_1' => $request->alternative_number_1,
                'alternative_number_2' => $request->alternative_number_2,
                'email' => $request->email,
                'address' => $request->address,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_number' => $request->emergency_contact_number,
                'relationship' => $request->relationship,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,

                // Employment Details
                'job_title' => $request->job_title,
                'department_id' => $request->department_id,
                'designation_id' => $request->designation_id,
                'date_of_hire' => $request->date_of_hire,
                'work_location' => $request->work_location,
                'hra' => $request->hra,
                'ta' => $request->ta,
                'salary' => $request->salary,

                // Additional Details
                'aadhar_number' => $request->aadhar_number,
                'pancard_number' => $request->pancard_number,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'ifsc_code' => $request->ifsc_code,

                'status' => Employee::ACTIVE,
            ];

            // Handle file uploads
            $files = ['profile_image', 'aadhar_file', 'pancard_file', 'experience_certificate', 'other_document'];

            foreach ($files as $fileField) {
                if ($request->hasFile($fileField)) {
                    $file = $request->file($fileField);
                    $fileName = time() . '_' . $fileField . '_' . $file->getClientOriginalName();
                    $filePath = 'Resume-Getlead/employees/' . $fileName;
                    Storage::disk('spaces')->put($filePath, file_get_contents($file), 'public');
                    $data[$fileField] = $filePath;
                }
            }

            $employee = Employee::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'data' => $employee
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $employee = Employee::with(['departmentRelation', 'designationRelation'])->find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        // Calculate attendance stats for current month
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth()->format('Y-m-d');
        $endOfMonth = $currentMonth->copy()->endOfMonth()->format('Y-m-d');

        // Get working days in current month (excluding weekends)
        $workingDays = 0;
        $date = $currentMonth->copy()->startOfMonth();
        while ($date <= $currentMonth->copy()->endOfMonth()) {
            if (!$date->isWeekend()) {
                $workingDays++;
            }
            $date->addDay();
        }

        // Get attendance stats
        $presentDays = Attendance::where('employee_id', $id)
            ->whereBetween('attendance_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'present')
            ->count();

        $halfDays = Attendance::where('employee_id', $id)
            ->whereBetween('attendance_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'half_day')
            ->count();

        // Calculate total hours this month
        $totalHours = Attendance::where('employee_id', $id)
            ->whereBetween('attendance_date', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['present', 'half_day'])
            ->sum('hours');

        // Calculate attendance rate
        $totalAttendedDays = $presentDays + ($halfDays * 0.5);
        $attendanceRate = $workingDays > 0 ? round(($totalAttendedDays / $workingDays) * 100, 1) : 0;

        // Get total leave from leave_settings table
        $totalLeave = LeaveSetting::where('status', 1)->sum('no_of_days');
        // If no leave settings configured, use default of 23
        if ($totalLeave == 0) {
            $totalLeave = 23;
        }

        $leaveTaken = LeaveRequest::where('employee_id', $id)
            ->where('status', 'approved')
            ->whereYear('from_date', $currentMonth->year)
            ->sum('days');
        $leaveBalance = max(0, $totalLeave - $leaveTaken);

        // Get recent activity (attendance and leave requests)
        $recentActivity = [];

        // Get recent attendances
        $recentAttendances = Attendance::where('employee_id', $id)
            ->orderBy('attendance_date', 'DESC')
            ->limit(5)
            ->get();

        foreach ($recentAttendances as $attendance) {
            $recentActivity[] = [
                'type' => 'attendance',
                'title' => 'Marked ' . ucfirst($attendance->status),
                'description' => Carbon::parse($attendance->attendance_date)->format('M d, Y') .
                    ($attendance->check_in ? ' at ' . Carbon::parse($attendance->check_in)->format('h:i A') : ''),
                'date' => $attendance->attendance_date,
                'created_at' => $attendance->created_at,
            ];
        }

        // Get recent leave requests
        $recentLeaves = LeaveRequest::where('employee_id', $id)
            ->orderBy('created_at', 'DESC')
            ->limit(5)
            ->get();

        foreach ($recentLeaves as $leave) {
            $statusText = $leave->status === 'approved' ? 'Approved' :
                         ($leave->status === 'rejected' ? 'Rejected' : 'Pending');
            $recentActivity[] = [
                'type' => 'leave',
                'title' => 'Leave Request ' . $statusText,
                'description' => $leave->leave_type . ' - ' .
                    Carbon::parse($leave->from_date)->format('M d') . '-' .
                    Carbon::parse($leave->to_date)->format('d, Y'),
                'date' => $leave->from_date,
                'created_at' => $leave->created_at,
                'status' => $leave->status,
            ];
        }

        // Sort by created_at and take top 5
        usort($recentActivity, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        $recentActivity = array_slice($recentActivity, 0, 5);

        $data = [
            'id' => $employee->id,
            'full_name' => $employee->full_name,
            'employee_id' => $employee->employee_id,
            'date_of_birth' => $employee->date_of_birth,
            'gender' => $employee->gender,
            'marital_status' => $employee->marital_status,
            'qualification_id' => $employee->qualification_id,
            'technology_stack' => $employee->technology_stack,
            'join_date' => $employee->join_date,
            'releaving_date' => $employee->releaving_date,
            'mobile_number' => $employee->mobile_number,
            'alternative_number_1' => $employee->alternative_number_1,
            'alternative_number_2' => $employee->alternative_number_2,
            'email' => $employee->email,
            'address' => $employee->address,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_number' => $employee->emergency_contact_number,
            'relationship' => $employee->relationship,
            'city' => $employee->city,
            'state' => $employee->state,
            'country' => $employee->country,
            'job_title' => $employee->job_title,
            'department_id' => $employee->department_id,
            'department_name' => $employee->departmentRelation->department_name ?? null,
            'designation_id' => $employee->designation_id,
            'designation_name' => $employee->designationRelation->designation_name ?? null,
            'date_of_hire' => $employee->date_of_hire,
            'work_location' => $employee->work_location,
            'hra' => $employee->hra,
            'ta' => $employee->ta,
            'salary' => $employee->salary,
            'aadhar_number' => $employee->aadhar_number,
            'pancard_number' => $employee->pancard_number,
            'bank_name' => $employee->bank_name,
            'account_number' => $employee->account_number,
            'ifsc_code' => $employee->ifsc_code,
            'status' => $employee->status,
            'profile_image_url' => $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null,
            'aadhar_file_url' => $employee->aadhar_file ? config('constants.file_path') . $employee->aadhar_file : null,
            'pancard_file_url' => $employee->pancard_file ? config('constants.file_path') . $employee->pancard_file : null,
            'experience_certificate_url' => $employee->experience_certificate ? config('constants.file_path') . $employee->experience_certificate : null,
            'other_document_url' => $employee->other_document ? config('constants.file_path') . $employee->other_document : null,
            // Stats
            'attendance_rate' => $attendanceRate,
            'leave_balance' => $leaveBalance,
            'total_leave' => $totalLeave,
            'leave_taken' => $leaveTaken,
            'hours_this_month' => abs(round($totalHours, 0)),
            // Recent Activity
            'recent_activity' => $recentActivity,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Employee::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            // Only update fields that are present in the request
            $fillableFields = [
                // Personal Information
                'full_name', 'employee_id', 'date_of_birth', 'gender', 'marital_status',
                'qualification_id', 'technology_stack', 'join_date', 'releaving_date',
                // Contact Information
                'mobile_number', 'alternative_number_1', 'alternative_number_2', 'email',
                'address', 'emergency_contact_name', 'emergency_contact_number',
                'relationship', 'city', 'state', 'country',
                // Employment Details
                'job_title', 'department_id', 'designation_id', 'date_of_hire',
                'work_location', 'hra', 'ta', 'salary',
                // Additional Details
                'aadhar_number', 'pancard_number', 'bank_name', 'account_number', 'ifsc_code',
            ];

            $data = [];
            foreach ($fillableFields as $field) {
                if ($request->has($field)) {
                    $data[$field] = $request->$field;
                }
            }

            // Handle file uploads
            $files = ['profile_image', 'aadhar_file', 'pancard_file', 'experience_certificate', 'other_document'];

            foreach ($files as $fileField) {
                if ($request->hasFile($fileField)) {
                    // Delete old file if exists
                    if ($employee->$fileField) {
                        Storage::disk('spaces')->delete($employee->$fileField);
                    }

                    $file = $request->file($fileField);
                    $fileName = time() . '_' . $fileField . '_' . $file->getClientOriginalName();
                    $filePath = 'Resume-Getlead/employees/' . $fileName;
                    Storage::disk('spaces')->put($filePath, file_get_contents($file), 'public');
                    $data[$fileField] = $filePath;
                }
            }

            $employee->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'data' => $employee
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Optional: Delete files from storage
            // if ($employee->profile_image) {
            //     Storage::disk('spaces')->delete($employee->profile_image);
            // }

            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            $newStatus = $employee->status == 1 ? 0 : 1;
            $employee->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Employee status updated successfully',
                'data' => ['status' => $newStatus]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance history for a specific employee
     */
    public function getAttendanceHistory(Request $request, $id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $startDate = Carbon::parse($month)->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::parse($month)->endOfMonth()->format('Y-m-d');

        // Get attendance records for the month
        $attendances = Attendance::where('employee_id', $id)
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->orderBy('attendance_date', 'DESC')
            ->get();

        // Calculate summary
        $workingDays = 0;
        $date = Carbon::parse($startDate);
        $endDateCarbon = Carbon::parse($endDate);
        while ($date <= $endDateCarbon) {
            if (!$date->isWeekend()) {
                $workingDays++;
            }
            $date->addDay();
        }

        $presentDays = $attendances->where('status', 'present')->count();
        $absentDays = $attendances->where('status', 'absent')->count();
        $leaveDays = $attendances->where('status', 'on_leave')->count();
        $halfDays = $attendances->where('status', 'half_day')->count();
        $totalHours = $attendances->whereIn('status', ['present', 'half_day'])->sum('hours');

        $data = [
            'summary' => [
                'working_days' => $workingDays,
                'present' => $presentDays,
                'absent' => $absentDays,
                'leave' => $leaveDays,
                'half_day' => $halfDays,
                'total_hours' => abs(round($totalHours, 0)),
            ],
            'records' => $attendances->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'date' => Carbon::parse($attendance->attendance_date)->format('M d, Y'),
                    'status' => $attendance->status,
                    'check_in' => $attendance->check_in ? Carbon::parse($attendance->check_in)->format('h:i A') : '-',
                    'check_out' => $attendance->check_out ? Carbon::parse($attendance->check_out)->format('h:i A') : '-',
                    'hours' => $attendance->hours ? abs(floor($attendance->hours)) . 'h ' . abs(round(($attendance->hours - floor($attendance->hours)) * 60)) . 'm' : '0h',
                    'remarks' => $attendance->remarks ?? '-',
                ];
            }),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Get leave history for a specific employee
     */
    public function getLeaveHistory(Request $request, $id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $year = $request->input('year', Carbon::now()->year);

        // Get leave requests for the year
        $leaveRequests = LeaveRequest::where('employee_id', $id)
            ->whereYear('from_date', $year)
            ->orderBy('from_date', 'DESC')
            ->get();

        // Get leave settings from database
        $leaveSettings = LeaveSetting::where('status', 1)->get();

        // Build leave types array from leave_settings table
        $leaveTypes = [];
        foreach ($leaveSettings as $setting) {
            $leaveTypes[$setting->leave_type] = [
                'total' => $setting->no_of_days,
                'used' => 0
            ];
        }

        // If no leave settings configured, use defaults
        if (empty($leaveTypes)) {
            $leaveTypes = [
                'Annual Leave' => ['total' => 15, 'used' => 0],
                'Sick Leave' => ['total' => 5, 'used' => 0],
                'Casual Leave' => ['total' => 3, 'used' => 0],
            ];
        }

        // Calculate used days from approved leave requests
        foreach ($leaveRequests->where('status', 'approved') as $leave) {
            if (isset($leaveTypes[$leave->leave_type])) {
                $leaveTypes[$leave->leave_type]['used'] += $leave->days;
            }
        }

        $leaveBalance = [];
        foreach ($leaveTypes as $type => $data) {
            $leaveBalance[] = [
                'type' => $type,
                'total' => $data['total'],
                'used' => $data['used'],
                'remaining' => max(0, $data['total'] - $data['used']),
                'percentage' => $data['total'] > 0 ? round(($data['used'] / $data['total']) * 100, 1) : 0,
            ];
        }

        // Calculate statistics
        $totalTaken = $leaveRequests->where('status', 'approved')->sum('days');
        $totalAllocated = array_sum(array_column($leaveTypes, 'total'));
        $totalRemaining = max(0, $totalAllocated - $totalTaken);
        $pendingRequests = $leaveRequests->where('status', 'pending')->count();

        // Find most used leave type
        $mostUsed = collect($leaveBalance)->sortByDesc('used')->first();

        $statistics = [
            'total_taken' => $totalTaken,
            'total_remaining' => $totalRemaining,
            'total_allocated' => $totalAllocated,
            'pending_requests' => $pendingRequests,
            'most_used_type' => $mostUsed && $mostUsed['used'] > 0 ? $mostUsed['type'] : 'None',
        ];

        $data = [
            'balance' => $leaveBalance,
            'statistics' => $statistics,
            'history' => $leaveRequests->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'leave_type' => $leave->leave_type,
                    'from_date' => Carbon::parse($leave->from_date)->format('M d, Y'),
                    'to_date' => Carbon::parse($leave->to_date)->format('M d, Y'),
                    'days' => $leave->days,
                    'reason' => $leave->reason ?? '-',
                    'status' => $leave->status,
                    'applied_on' => Carbon::parse($leave->created_at)->format('M d, Y'),
                ];
            }),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function exportPdf($id)
    {
        try {
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Helper function to check if file is image
            $isImage = function($url) {
                if (!$url) return false;
                $imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
                foreach ($imageExtensions as $ext) {
                    if (stripos($url, $ext) !== false) {
                        return true;
                    }
                }
                return false;
            };

            // Add full URLs for files
            $employee->profile_image_url = $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null;
            $employee->aadhar_file_url = $employee->aadhar_file ? config('constants.file_path') . $employee->aadhar_file : null;
            $employee->pancard_file_url = $employee->pancard_file ? config('constants.file_path') . $employee->pancard_file : null;
            $employee->experience_certificate_url = $employee->experience_certificate ? config('constants.file_path') . $employee->experience_certificate : null;
            $employee->other_document_url = $employee->other_document ? config('constants.file_path') . $employee->other_document : null;

            // Check which files are images
            $employee->aadhar_is_image = $isImage($employee->aadhar_file_url);
            $employee->pancard_is_image = $isImage($employee->pancard_file_url);
            $employee->experience_is_image = $isImage($employee->experience_certificate_url);
            $employee->other_is_image = $isImage($employee->other_document_url);

            $pdf = PDF::loadView('pdf.employee-details', compact('employee'));

            return $pdf->download('employee_' . $employee->employee_id . '.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
