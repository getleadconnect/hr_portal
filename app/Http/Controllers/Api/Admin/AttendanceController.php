<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Employee;
use Validator;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $departmentId = $request->input('department_id', '');
        $status = $request->input('status', '');

        $query = Attendance::with(['employee'])
            ->where('attendance_date', $date)
            ->orderBy('id', 'DESC');

        // Search by employee name or employee_id
        if ($search) {
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                    ->orWhere('employee_id', 'LIKE', "%{$search}%");
            });
        }

        // Filter by department
        if ($departmentId) {
            $query->whereHas('employee', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        $attendances = $query->paginate($perPage);

        // Transform data
        $attendances->getCollection()->transform(function ($attendance) {
            return [
                'id' => $attendance->id,
                'employee_id' => $attendance->employee_id,
                'employee_code' => $attendance->employee->employee_id ?? 'N/A',
                'employee_name' => $attendance->employee->full_name ?? 'N/A',
                'employee_initials' => $this->getInitials($attendance->employee->full_name ?? ''),
                'department' => $attendance->employee->department ?? 'N/A',
                'department_id' => $attendance->employee->department_id,
                'attendance_date' => $attendance->attendance_date,
                'check_in' => $attendance->check_in ? Carbon::parse($attendance->check_in)->format('h:i A') : '--:--',
                'check_out' => $attendance->check_out ? Carbon::parse($attendance->check_out)->format('h:i A') : '--:--',
                'hours' => $attendance->hours ?? '--',
                'status' => $attendance->status,
                'remarks' => $attendance->remarks,
                'created_at' => $attendance->created_at->format('d-m-Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $attendances
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Attendance::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Check if attendance already exists for this employee on this date
        $exists = Attendance::where('employee_id', $request->employee_id)
            ->where('attendance_date', $request->attendance_date)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance already marked for this employee on this date'
            ], 422);
        }

        try {
            $data = [
                'employee_id' => $request->employee_id,
                'attendance_date' => $request->attendance_date,
                'check_in' => $request->check_in,
                'check_out' => $request->check_out,
                'status' => $request->status,
                'remarks' => $request->remarks,
            ];

            // Calculate hours if both check_in and check_out are provided
            if ($request->check_in && $request->check_out) {
                $checkIn = Carbon::parse($request->check_in);
                $checkOut = Carbon::parse($request->check_out);
                $data['hours'] = round($checkOut->diffInMinutes($checkIn) / 60, 2);
            }

            $attendance = Attendance::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Attendance marked successfully',
                'data' => $attendance
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
        $attendance = Attendance::with('employee')->find($id);

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found'
            ], 404);
        }

        $data = [
            'id' => $attendance->id,
            'employee_id' => $attendance->employee_id,
            'employee_name' => $attendance->employee->full_name ?? 'N/A',
            'employee_code' => $attendance->employee->employee_id ?? 'N/A',
            'department' => $attendance->employee->department ?? 'N/A',
            'attendance_date' => $attendance->attendance_date,
            'check_in' => $attendance->check_in,
            'check_out' => $attendance->check_out,
            'hours' => $attendance->hours,
            'status' => $attendance->status,
            'remarks' => $attendance->remarks,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance record not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Attendance::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Check for duplicate if employee_id or date is being changed
        if ($request->employee_id != $attendance->employee_id || $request->attendance_date != $attendance->attendance_date) {
            $exists = Attendance::where('employee_id', $request->employee_id)
                ->where('attendance_date', $request->attendance_date)
                ->where('id', '!=', $id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance already marked for this employee on this date'
                ], 422);
            }
        }

        try {
            $data = [
                'employee_id' => $request->employee_id,
                'attendance_date' => $request->attendance_date,
                'check_in' => $request->check_in,
                'check_out' => $request->check_out,
                'status' => $request->status,
                'remarks' => $request->remarks,
            ];

            // Calculate hours if both check_in and check_out are provided
            if ($request->check_in && $request->check_out) {
                $checkIn = Carbon::parse($request->check_in);
                $checkOut = Carbon::parse($request->check_out);
                $data['hours'] = round($checkOut->diffInMinutes($checkIn) / 60, 2);
            } else {
                $data['hours'] = null;
            }

            $attendance->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Attendance updated successfully',
                'data' => $attendance
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
            $attendance = Attendance::find($id);

            if (!$attendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance record not found'
                ], 404);
            }

            $attendance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Mark attendance for multiple employees (bulk)
    public function markBulk(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'attendance_date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.employee_id' => 'required|exists:employees,id',
            'attendances.*.status' => 'required|in:present,absent,on_leave,half_day',
            'attendances.*.check_in' => 'nullable|date_format:H:i',
            'attendances.*.check_out' => 'nullable|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $date = $request->attendance_date;
            $created = 0;
            $updated = 0;

            foreach ($request->attendances as $attendanceData) {
                $hours = null;
                if (!empty($attendanceData['check_in']) && !empty($attendanceData['check_out'])) {
                    $checkIn = Carbon::parse($attendanceData['check_in']);
                    $checkOut = Carbon::parse($attendanceData['check_out']);
                    $hours = round($checkOut->diffInMinutes($checkIn) / 60, 2);
                }

                $attendance = Attendance::updateOrCreate(
                    [
                        'employee_id' => $attendanceData['employee_id'],
                        'attendance_date' => $date,
                    ],
                    [
                        'check_in' => $attendanceData['check_in'] ?? null,
                        'check_out' => $attendanceData['check_out'] ?? null,
                        'status' => $attendanceData['status'],
                        'hours' => $hours,
                        'remarks' => $attendanceData['remarks'] ?? null,
                    ]
                );

                if ($attendance->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Attendance marked: {$created} created, {$updated} updated",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get employees for marking attendance (with their attendance status for a date)
    public function getEmployeesForAttendance(Request $request)
    {
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $departmentId = $request->input('department_id', '');

        $query = Employee::where('status', Employee::ACTIVE)->orderBy('full_name');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $employees = $query->get();

        // Get existing attendance for this date
        $existingAttendance = Attendance::where('attendance_date', $date)
            ->whereIn('employee_id', $employees->pluck('id'))
            ->get()
            ->keyBy('employee_id');

        $data = $employees->map(function ($employee) use ($existingAttendance) {
            $attendance = $existingAttendance->get($employee->id);
            return [
                'id' => $employee->id,
                'employee_id' => $employee->employee_id,
                'full_name' => $employee->full_name,
                'department' => $employee->department,
                'department_id' => $employee->department_id,
                'initials' => $this->getInitials($employee->full_name),
                'attendance_id' => $attendance->id ?? null,
                'check_in' => $attendance->check_in ?? null,
                'check_out' => $attendance->check_out ?? null,
                'status' => $attendance->status ?? null,
                'hours' => $attendance->hours ?? null,
                'remarks' => $attendance->remarks ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // Export attendance report
    public function exportReport(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::today()->format('Y-m-d'));
        $departmentId = $request->input('department_id', '');

        $query = Attendance::with('employee')
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->orderBy('attendance_date')
            ->orderBy('employee_id');

        if ($departmentId) {
            $query->whereHas('employee', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        $attendances = $query->get();

        $data = $attendances->map(function ($attendance) {
            return [
                'Date' => Carbon::parse($attendance->attendance_date)->format('d-m-Y'),
                'Employee ID' => $attendance->employee->employee_id ?? 'N/A',
                'Employee Name' => $attendance->employee->full_name ?? 'N/A',
                'Department' => $attendance->employee->department ?? 'N/A',
                'Check In' => $attendance->check_in ? Carbon::parse($attendance->check_in)->format('h:i A') : '--:--',
                'Check Out' => $attendance->check_out ? Carbon::parse($attendance->check_out)->format('h:i A') : '--:--',
                'Hours' => $attendance->hours ?? '--',
                'Status' => ucfirst(str_replace('_', ' ', $attendance->status)),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    private function getInitials($name)
    {
        $words = explode(' ', trim($name));
        $initials = '';
        foreach (array_slice($words, 0, 2) as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
        }
        return $initials ?: 'NA';
    }
}
