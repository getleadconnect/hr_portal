<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use App\Models\Employee;
use App\Models\User;
use App\Models\JobCategory;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        $today = Carbon::today()->toDateString();
        $totalEmployees = Employee::where('status', 1)->count();

        // Today's attendance stats
        $presentToday = Attendance::forDate($today)->byStatus(Attendance::STATUS_PRESENT)->count();
        $absentToday = Attendance::forDate($today)->byStatus(Attendance::STATUS_ABSENT)->count();

        // On Leave Today - count approved leave requests where today falls within the leave period
        $onLeaveToday = LeaveRequest::where('status', LeaveRequest::STATUS_APPROVED)
            ->where('from_date', '<=', $today)
            ->where('to_date', '>=', $today)
            ->count();

        // Pending leave requests
        $pendingRequests = LeaveRequest::byStatus(LeaveRequest::STATUS_PENDING)->count();

        // Recent leave requests (pending only, latest 5)
        $recentLeaveRequests = LeaveRequest::with('employee')
            ->byStatus(LeaveRequest::STATUS_PENDING)
            ->orderBy('created_at', 'DESC')
            ->limit(5)
            ->get()
            ->map(function ($request) {
                $employeeName = $request->employee->full_name ?? 'Unknown';
                return [
                    'id' => $request->id,
                    'employee_name' => $employeeName,
                    'employee_initials' => $this->getInitials($employeeName),
                    'leave_type' => $request->leave_type,
                    'from_date' => Carbon::parse($request->from_date)->format('M d'),
                    'to_date' => Carbon::parse($request->to_date)->format('d'),
                    'days' => $request->days,
                ];
            });

        $stats = [
            'total_employees' => $totalEmployees,
            'present_today' => $presentToday,
            'on_leave_today' => $onLeaveToday,
            'absent_today' => $absentToday,
            'pending_requests' => $pendingRequests,
            'attendance_percentage' => $totalEmployees > 0 ? round(($presentToday / $totalEmployees) * 100) : 0,
            'recent_leave_requests' => $recentLeaveRequests,
            // Keep old stats for backward compatibility
            'applications' => [
                'total' => Application::totalCount(),
                'this_week' => Application::thisWeekCount(),
                'this_month' => Application::thisMonthCount(),
                'this_year' => Application::thisYearCount(),
            ],
            'employees' => [
                'total' => Employee::count(),
                'active' => Employee::where('status', 1)->count(),
                'inactive' => Employee::where('status', 0)->count(),
            ],
            'users' => [
                'total' => User::count(),
                'active' => User::where('status', 1)->count(),
            ],
            'job_categories' => [
                'total' => JobCategory::count(),
                'active' => JobCategory::where('status', 1)->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
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
}
