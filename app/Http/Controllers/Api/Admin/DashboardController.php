<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use App\Models\Employee;
use App\Models\User;
use App\Models\JobCategory;

class DashboardController extends Controller
{
    public function getStats()
    {
        $stats = [
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
}
