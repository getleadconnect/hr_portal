<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\LeaveSetting;
use App\Models\Employee;
use Carbon\Carbon;
use Auth;

class UserDashboardController extends Controller
{
    /**
     * Get dashboard statistics for the logged-in staff user
     */
    public function getDashboardStats()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not linked to this user'
            ], 404);
        }

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Calculate working days (excluding weekends)
        $workingDays = 0;
        $currentDay = $startOfMonth->copy();
        while ($currentDay <= $now) {
            if ($currentDay->isWeekday()) {
                $workingDays++;
            }
            $currentDay->addDay();
        }

        // Get attendance data for this month
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('attendance_date', [$startOfMonth->format('Y-m-d'), $now->format('Y-m-d')])
            ->get();

        $daysPresent = $attendances->where('status', 'present')->count();
        $totalHours = $attendances->sum('hours');

        // Get leave balance
        $leaveSettings = LeaveSetting::where('status', 1)->get();
        $totalLeave = $leaveSettings->sum('no_of_days');

        $leaveTaken = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereYear('from_date', $now->year)
            ->sum('days');

        // Get pending requests count
        $pendingRequests = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'days_present' => $daysPresent,
                'working_days' => $workingDays,
                'leave_taken' => $leaveTaken,
                'total_leave' => $totalLeave,
                'hours_this_month' => abs(round($totalHours)),
                'pending_requests' => $pendingRequests,
            ]
        ]);
    }

    /**
     * Get user profile with employee details
     */
    public function getProfile()
    {
        $user = Auth::user();
        $employee = $user->employee;

        $profileData = [
            'id' => $user->id,
            'user_name' => $user->user_name,
            'email' => $user->email,
            'countrycode' => $user->countrycode,
            'mobile' => $user->mobile,
            'employee' => null,
        ];

        if ($employee) {
            $profileData['employee'] = [
                'id' => $employee->id,
                'employee_id' => $employee->employee_id,
                'full_name' => $employee->full_name,
                'email' => $employee->email,
                'mobile_number' => $employee->mobile_number,
                'date_of_birth' => $employee->date_of_birth,
                'gender' => $employee->gender,
                'marital_status' => $employee->marital_status,
                'join_date' => $employee->join_date,
                'work_location' => $employee->work_location,
                'department' => $employee->departmentRelation?->department_name,
                'designation' => $employee->designationRelation?->designation_name,
                'profile_image' => $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $profileData
        ]);
    }

    /**
     * Get attendance records for the logged-in user
     */
    public function getAttendance(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not linked to this user'
            ], 404);
        }

        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        // Get attendance records
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('attendance_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->orderBy('attendance_date', 'desc')
            ->get();

        // Calculate summary
        $workingDays = 0;
        $currentDay = $startDate->copy();
        $today = Carbon::now();
        $compareDate = $endDate < $today ? $endDate : $today;

        while ($currentDay <= $compareDate) {
            if ($currentDay->isWeekday()) {
                $workingDays++;
            }
            $currentDay->addDay();
        }

        $present = $attendances->where('status', 'present')->count();
        $absent = $attendances->where('status', 'absent')->count();
        $leave = $attendances->where('status', 'leave')->count();
        $totalHours = abs(round($attendances->sum('hours')));

        // Get today's attendance
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->where('attendance_date', Carbon::today()->format('Y-m-d'))
            ->first();

        $todayData = null;
        if ($todayAttendance) {
            $todayData = [
                'check_in' => $todayAttendance->check_in ? Carbon::parse($todayAttendance->check_in)->format('h:i A') : null,
                'check_out' => $todayAttendance->check_out ? Carbon::parse($todayAttendance->check_out)->format('h:i A') : null,
                'status' => $todayAttendance->status,
                'hours' => $todayAttendance->hours ? abs(floor($todayAttendance->hours)) . 'h ' . abs(round(($todayAttendance->hours - floor($todayAttendance->hours)) * 60)) . 'm' : null,
            ];
        }

        // Format records
        $records = $attendances->map(function ($attendance) {
            return [
                'date' => $attendance->attendance_date,
                'check_in' => $attendance->check_in ? Carbon::parse($attendance->check_in)->format('h:i A') : null,
                'check_out' => $attendance->check_out ? Carbon::parse($attendance->check_out)->format('h:i A') : null,
                'status' => $attendance->status,
                'hours' => $attendance->hours ? abs(floor($attendance->hours)) . 'h ' . abs(round(($attendance->hours - floor($attendance->hours)) * 60)) . 'm' : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'today' => $todayData,
                'summary' => [
                    'working_days' => $workingDays,
                    'present' => $present,
                    'absent' => $absent,
                    'leave' => $leave,
                    'total_hours' => $totalHours,
                ],
                'records' => $records,
            ]
        ]);
    }

    /**
     * Check in for today
     */
    public function checkIn()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not linked to this user'
            ], 404);
        }

        $now = Carbon::now('Asia/Kolkata');
        $today = $now->format('Y-m-d');
        $currentTime = $now->format('H:i');

        // Check if already checked in
        $existing = Attendance::where('employee_id', $employee->id)
            ->where('attendance_date', $today)
            ->first();

        if ($existing && $existing->check_in) {
            return response()->json([
                'success' => false,
                'message' => 'Already checked in for today'
            ], 422);
        }

        if ($existing) {
            $existing->update([
                'check_in' => $currentTime,
                'status' => 'present',
            ]);
        } else {
            Attendance::create([
                'employee_id' => $employee->id,
                'attendance_date' => $today,
                'check_in' => $currentTime,
                'status' => 'present',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Checked in successfully at ' . $now->format('h:i A'),
        ]);
    }

    /**
     * Check out for today
     */
    public function checkOut()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not linked to this user'
            ], 404);
        }

        $now = Carbon::now('Asia/Kolkata');
        $today = $now->format('Y-m-d');

        // Check if checked in
        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('attendance_date', $today)
            ->first();

        if (!$attendance || !$attendance->check_in) {
            return response()->json([
                'success' => false,
                'message' => 'Please check in first'
            ], 422);
        }

        if ($attendance->check_out) {
            return response()->json([
                'success' => false,
                'message' => 'Already checked out for today'
            ], 422);
        }

        // Calculate hours
        $checkIn = Carbon::parse($today . ' ' . $attendance->check_in, 'Asia/Kolkata');
        $hours = $checkIn->diffInMinutes($now) / 60;

        $attendance->update([
            'check_out' => $now->format('H:i'),
            'hours' => round($hours, 2),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Checked out successfully at ' . $now->format('h:i A'),
        ]);
    }

    /**
     * Get leave requests for the logged-in user
     */
    public function getLeaveRequests()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not linked to this user'
            ], 404);
        }

        $now = Carbon::now();

        // Get leave requests
        $requests = LeaveRequest::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'leave_type' => $request->leave_type,
                    'from_date' => $request->from_date,
                    'to_date' => $request->to_date,
                    'days' => $request->days,
                    'reason' => $request->reason,
                    'status' => $request->status,
                    'created_at' => $request->created_at->format('d-m-Y'),
                ];
            });

        // Calculate leave balance from leave_settings table
        $leaveSettings = LeaveSetting::where('status', 1)->get();

        $balance = [
            'annual' => ['allowed' => 0, 'taken' => 0, 'remaining' => 0],
            'sick' => ['allowed' => 0, 'taken' => 0, 'remaining' => 0],
            'casual' => ['allowed' => 0, 'taken' => 0, 'remaining' => 0],
            'total' => ['allowed' => 0, 'taken' => 0, 'remaining' => 0],
        ];

        foreach ($leaveSettings as $setting) {
            $taken = LeaveRequest::where('employee_id', $employee->id)
                ->where('leave_type', $setting->leave_type)
                ->where('status', 'approved')
                ->whereYear('from_date', $now->year)
                ->sum('days');

            $allowed = $setting->no_of_days;
            $remaining = max(0, $allowed - $taken);

            switch ($setting->leave_type) {
                case 'Annual Leave':
                    $balance['annual'] = ['allowed' => $allowed, 'taken' => $taken, 'remaining' => $remaining];
                    break;
                case 'Sick Leave':
                    $balance['sick'] = ['allowed' => $allowed, 'taken' => $taken, 'remaining' => $remaining];
                    break;
                case 'Casual Leave':
                    $balance['casual'] = ['allowed' => $allowed, 'taken' => $taken, 'remaining' => $remaining];
                    break;
            }
            $balance['total']['allowed'] += $allowed;
            $balance['total']['taken'] += $taken;
            $balance['total']['remaining'] += $remaining;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'requests' => $requests,
                'balance' => $balance,
            ]
        ]);
    }

    /**
     * Create a new leave request
     */
    public function createLeaveRequest(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not linked to this user'
            ], 404);
        }

        $validator = \Validator::make($request->all(), [
            'leave_type' => 'required|in:Annual Leave,Sick Leave,Casual Leave',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Calculate days
        $fromDate = Carbon::parse($request->from_date);
        $toDate = Carbon::parse($request->to_date);
        $days = $fromDate->diffInDays($toDate) + 1;

        // Check for overlapping leave requests
        $overlap = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', '!=', 'rejected')
            ->where(function ($query) use ($request) {
                $query->whereBetween('from_date', [$request->from_date, $request->to_date])
                    ->orWhereBetween('to_date', [$request->from_date, $request->to_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('from_date', '<=', $request->from_date)
                            ->where('to_date', '>=', $request->to_date);
                    });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a leave request for these dates'
            ], 422);
        }

        try {
            $leaveRequest = LeaveRequest::create([
                'employee_id' => $employee->id,
                'leave_type' => $request->leave_type,
                'from_date' => $request->from_date,
                'to_date' => $request->to_date,
                'days' => $days,
                'reason' => $request->reason,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Leave request submitted successfully',
                'data' => $leaveRequest
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a leave request (only pending ones)
     */
    public function deleteLeaveRequest($id)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not linked to this user'
            ], 404);
        }

        $leaveRequest = LeaveRequest::where('id', $id)
            ->where('employee_id', $employee->id)
            ->first();

        if (!$leaveRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request not found'
            ], 404);
        }

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending leave requests can be cancelled'
            ], 422);
        }

        try {
            $leaveRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Leave request cancelled successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get calendar attendance data for the logged-in user
     */
    public function getCalendarAttendance(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not linked to this user'
            ], 404);
        }

        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        // Get attendance records for the month
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('attendance_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->keyBy('attendance_date');

        // Get leave requests for the month
        $leaveRequests = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('from_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->orWhereBetween('to_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('from_date', '<=', $startDate->format('Y-m-d'))
                            ->where('to_date', '>=', $endDate->format('Y-m-d'));
                    });
            })
            ->get();

        // Build leave dates array
        $leaveDates = [];
        foreach ($leaveRequests as $leave) {
            $leaveStart = Carbon::parse($leave->from_date);
            $leaveEnd = Carbon::parse($leave->to_date);
            while ($leaveStart <= $leaveEnd) {
                $leaveDates[$leaveStart->format('Y-m-d')] = $leave->leave_type;
                $leaveStart->addDay();
            }
        }

        // Build calendar data
        $calendarData = [];
        $currentDay = $startDate->copy();
        $today = Carbon::today();

        while ($currentDay <= $endDate) {
            $dateStr = $currentDay->format('Y-m-d');
            $isWeekend = $currentDay->isWeekend();
            $isFuture = $currentDay > $today;

            $status = null;
            if (!$isFuture && !$isWeekend) {
                if (isset($attendances[$dateStr])) {
                    $status = $attendances[$dateStr]->status;
                } elseif (isset($leaveDates[$dateStr])) {
                    $status = 'leave';
                } elseif ($currentDay < $today) {
                    $status = 'absent';
                }
            }

            $calendarData[] = [
                'date' => $dateStr,
                'day' => $currentDay->day,
                'is_weekend' => $isWeekend,
                'is_future' => $isFuture,
                'is_today' => $currentDay->isSameDay($today),
                'status' => $status,
            ];

            $currentDay->addDay();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'month' => (int)$month,
                'year' => (int)$year,
                'days' => $calendarData,
            ]
        ]);
    }

    /**
     * Change password for the logged-in user (without current password)
     */
    public function changePassword(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $user = Auth::user();
            $user->update([
                'password' => bcrypt($request->new_password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
