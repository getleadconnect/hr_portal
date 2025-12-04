<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\EmployeeSalary;
use Illuminate\Http\Request;
use Validator;
use Carbon\Carbon;

class PayrollController extends Controller
{
    /**
     * Get payroll list for a month
     */
    public function index(Request $request)
    {
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = Payroll::with('employee')
            ->byMonth($month)
            ->orderBy('id', 'DESC');

        if ($status) {
            $query->byStatus($status);
        }

        if ($search) {
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                    ->orWhere('employee_id', 'LIKE', "%{$search}%");
            });
        }

        $payrolls = $query->get()->map(function ($payroll) {
            return [
                'id' => $payroll->id,
                'employee_id' => $payroll->employee_id,
                'employee_name' => $payroll->employee->full_name ?? 'Unknown',
                'employee_code' => $payroll->employee->employee_id ?? '',
                'employee_initials' => $this->getInitials($payroll->employee->full_name ?? 'Unknown'),
                'profile_image_url' => $payroll->employee->profile_image ? config('constants.file_path') . $payroll->employee->profile_image : null,
                'month' => $payroll->month,
                'base_salary' => (float) $payroll->base_salary,
                'working_days' => $payroll->working_days,
                'present_days' => $payroll->present_days,
                'absent_days' => $payroll->absent_days,
                'leave_days' => $payroll->leave_days,
                'per_day_salary' => (float) $payroll->per_day_salary,
                'deduction' => (float) $payroll->deduction,
                'net_salary' => (float) $payroll->net_salary,
                'status' => $payroll->status,
            ];
        });

        // Calculate summary stats
        $totalPayroll = $payrolls->sum('net_salary');
        $employeesProcessed = $payrolls->whereIn('status', ['approved', 'paid'])->count();
        $pendingApproval = $payrolls->where('status', 'pending')->count();

        // Calculate average attendance
        $totalPresent = $payrolls->sum('present_days');
        $totalWorkingDays = $payrolls->sum('working_days');
        $avgAttendance = $totalWorkingDays > 0 ? round(($totalPresent / $totalWorkingDays) * 100) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'payrolls' => $payrolls,
                'summary' => [
                    'total_payroll' => $totalPayroll,
                    'employees_processed' => $employeesProcessed,
                    'pending_approval' => $pendingApproval,
                    'avg_attendance' => $avgAttendance,
                ]
            ]
        ]);
    }

    /**
     * Process payroll for a month - generates payroll for all active employees
     */
    public function processPayroll(Request $request)
    {
        $month = $request->input('month', Carbon::now()->format('Y-m'));

        try {
            $employees = Employee::where('status', 1)->get();
            $startDate = Carbon::parse($month)->startOfMonth();
            $endDate = Carbon::parse($month)->endOfMonth();

            // Calculate working days (excluding weekends)
            $workingDays = 0;
            $date = $startDate->copy();
            while ($date <= $endDate) {
                if (!$date->isWeekend()) {
                    $workingDays++;
                }
                $date->addDay();
            }

            $processed = 0;
            $skipped = 0;

            foreach ($employees as $employee) {
                // Check if payroll already exists for this employee and month
                $existingPayroll = Payroll::where('employee_id', $employee->id)
                    ->where('month', $month)
                    ->first();

                if ($existingPayroll) {
                    $skipped++;
                    continue;
                }

                // Get attendance data
                $presentDays = Attendance::where('employee_id', $employee->id)
                    ->whereBetween('attendance_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->where('status', 'present')
                    ->count();

                $halfDays = Attendance::where('employee_id', $employee->id)
                    ->whereBetween('attendance_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->where('status', 'half_day')
                    ->count();

                $leaveDays = LeaveRequest::where('employee_id', $employee->id)
                    ->where('status', 'approved')
                    ->where(function ($q) use ($startDate, $endDate) {
                        $q->whereBetween('from_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                            ->orWhereBetween('to_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
                    })
                    ->sum('days');

                $totalPresentDays = $presentDays + ($halfDays * 0.5);
                $absentDays = $workingDays - $totalPresentDays - $leaveDays;
                if ($absentDays < 0) $absentDays = 0;

                // Calculate salary
                $baseSalary = $employee->salary ?? 0;
                $perDaySalary = $workingDays > 0 ? $baseSalary / $workingDays : 0;
                $deduction = $perDaySalary * $absentDays;
                $netSalary = $baseSalary - $deduction;

                Payroll::create([
                    'employee_id' => $employee->id,
                    'month' => $month,
                    'base_salary' => $baseSalary,
                    'working_days' => $workingDays,
                    'present_days' => (int) $totalPresentDays,
                    'absent_days' => (int) $absentDays,
                    'leave_days' => (int) $leaveDays,
                    'per_day_salary' => round($perDaySalary, 2),
                    'deduction' => round($deduction, 2),
                    'net_salary' => round($netSalary, 2),
                    'status' => 'pending',
                ]);

                $processed++;
            }

            return response()->json([
                'success' => true,
                'message' => "Payroll processed successfully. {$processed} employees processed, {$skipped} skipped (already exists).",
                'data' => [
                    'processed' => $processed,
                    'skipped' => $skipped,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single payroll record
     */
    public function show($id)
    {
        $payroll = Payroll::with('employee')->find($id);

        if (!$payroll) {
            return response()->json([
                'success' => false,
                'message' => 'Payroll record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $payroll->id,
                'employee_id' => $payroll->employee_id,
                'employee_name' => $payroll->employee->full_name ?? 'Unknown',
                'employee_code' => $payroll->employee->employee_id ?? '',
                'profile_image_url' => $payroll->employee->profile_image ? config('constants.file_path') . $payroll->employee->profile_image : null,
                'month' => $payroll->month,
                'base_salary' => (float) $payroll->base_salary,
                'working_days' => $payroll->working_days,
                'present_days' => $payroll->present_days,
                'absent_days' => $payroll->absent_days,
                'leave_days' => $payroll->leave_days,
                'per_day_salary' => (float) $payroll->per_day_salary,
                'deduction' => (float) $payroll->deduction,
                'net_salary' => (float) $payroll->net_salary,
                'status' => $payroll->status,
                'remarks' => $payroll->remarks,
            ]
        ]);
    }

    /**
     * Update payroll record (e.g., update base salary, approve, etc.)
     */
    public function update(Request $request, $id)
    {
        $payroll = Payroll::find($id);

        if (!$payroll) {
            return response()->json([
                'success' => false,
                'message' => 'Payroll record not found'
            ], 404);
        }

        try {
            $data = [];

            // Update base salary and recalculate if provided
            if ($request->has('base_salary')) {
                $baseSalary = $request->base_salary;
                $perDaySalary = $payroll->working_days > 0 ? $baseSalary / $payroll->working_days : 0;
                $deduction = $perDaySalary * $payroll->absent_days;
                $netSalary = $baseSalary - $deduction;

                $data['base_salary'] = $baseSalary;
                $data['per_day_salary'] = round($perDaySalary, 2);
                $data['deduction'] = round($deduction, 2);
                $data['net_salary'] = round($netSalary, 2);
            }

            if ($request->has('status')) {
                $data['status'] = $request->status;
                if ($request->status === 'approved' || $request->status === 'paid') {
                    $data['processed_by'] = auth()->id();
                    $data['processed_at'] = now();
                }
            }

            if ($request->has('remarks')) {
                $data['remarks'] = $request->remarks;
            }

            $payroll->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Payroll updated successfully',
                'data' => $payroll
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve payroll
     */
    public function approve($id)
    {
        $payroll = Payroll::find($id);

        if (!$payroll) {
            return response()->json([
                'success' => false,
                'message' => 'Payroll record not found'
            ], 404);
        }

        $payroll->update([
            'status' => 'approved',
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payroll approved successfully'
        ]);
    }

    /**
     * Delete payroll record
     */
    public function destroy($id)
    {
        try {
            $payroll = Payroll::find($id);

            if (!$payroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record not found'
                ], 404);
            }

            $payroll->delete();

            return response()->json([
                'success' => true,
                'message' => 'Payroll record deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available months for dropdown
     */
    public function getMonths()
    {
        $months = [];
        $now = Carbon::now();

        for ($i = 0; $i < 12; $i++) {
            $date = $now->copy()->subMonths($i);
            $months[] = [
                'value' => $date->format('Y-m'),
                'label' => $date->format('F Y'),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $months
        ]);
    }

    /**
     * Get initials from name
     */
    private function getInitials($name)
    {
        $words = explode(' ', trim($name));
        $initials = '';
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }
        return substr($initials, 0, 2);
    }

    /**
     * Get employees for salary dropdown
     */
    public function getEmployeesForSalary()
    {
        $employees = Employee::where('status', 1)
            ->orderBy('full_name')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'full_name' => $employee->full_name,
                    'employee_id' => $employee->employee_id,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    /**
     * Store base salary for employee
     */
    public function storeSalary(Request $request)
    {
        $validator = Validator::make($request->all(), EmployeeSalary::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $salary = EmployeeSalary::create([
                'employee_id' => $request->employee_id,
                'base_salary' => $request->base_salary,
                'hra_percentage' => $request->hra_percentage ?? 0,
                'ta_percentage' => $request->ta_percentage ?? 0,
                'effective_from' => $request->effective_from,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            // Also update the employee's salary field
            Employee::where('id', $request->employee_id)->update([
                'salary' => $request->base_salary,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Base salary saved successfully',
                'data' => $salary
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get salary history for an employee
     */
    public function getSalaryHistory($employeeId)
    {
        $salaries = EmployeeSalary::where('employee_id', $employeeId)
            ->orderBy('effective_from', 'desc')
            ->get()
            ->map(function ($salary) {
                return [
                    'id' => $salary->id,
                    'base_salary' => (float) $salary->base_salary,
                    'hra_percentage' => (float) $salary->hra_percentage,
                    'ta_percentage' => (float) $salary->ta_percentage,
                    'effective_from' => $salary->effective_from->format('Y-m-d'),
                    'effective_from_formatted' => $salary->effective_from->format('d/m/Y'),
                    'notes' => $salary->notes,
                    'created_at' => $salary->created_at->format('d/m/Y'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $salaries
        ]);
    }
}
