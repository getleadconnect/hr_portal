<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ApplicationController;
use App\Http\Controllers\Api\Admin\EmployeeController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\JobCategoryController;
use App\Http\Controllers\Api\Admin\DepartmentController;
use App\Http\Controllers\Api\Admin\DesignationController;
use App\Http\Controllers\Api\Admin\QualificationController;
use App\Http\Controllers\Api\Admin\JobOpeningController;
use App\Http\Controllers\Api\Admin\AttendanceController;
use App\Http\Controllers\Api\Admin\LeaveRequestController;
use App\Http\Controllers\Api\Admin\NotificationSettingController;
use App\Http\Controllers\Api\Admin\LeaveSettingController;
use App\Http\Controllers\Api\Admin\UserDashboardController;
use App\Http\Controllers\Api\Admin\EmployeeDocumentController;
use App\Http\Controllers\Api\Admin\PayrollController;
use App\Http\Controllers\Api\Admin\AllowanceController;

// Public routes
Route::post('/admin/login', [AuthController::class, 'login']);

// Protected admin routes
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Applications
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);
    Route::patch('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

    // Employees
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}/export-pdf', [EmployeeController::class, 'exportPdf']);
    Route::get('/employees/{id}/attendance', [EmployeeController::class, 'getAttendanceHistory']);
    Route::get('/employees/{id}/leaves', [EmployeeController::class, 'getLeaveHistory']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::post('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
    Route::patch('/employees/{id}/toggle-status', [EmployeeController::class, 'toggleStatus']);

    // Employee Documents
    Route::get('/employees/{employeeId}/documents', [EmployeeDocumentController::class, 'index']);
    Route::post('/employees/{employeeId}/documents', [EmployeeDocumentController::class, 'store']);
    Route::delete('/employees/{employeeId}/documents/{documentId}', [EmployeeDocumentController::class, 'destroy']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/employees-dropdown', [UserController::class, 'getEmployeesDropdown']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);

    // Job Categories
    Route::get('/job-categories', [JobCategoryController::class, 'index']);
    Route::post('/job-categories', [JobCategoryController::class, 'store']);
    Route::get('/job-categories/{id}', [JobCategoryController::class, 'show']);
    Route::put('/job-categories/{id}', [JobCategoryController::class, 'update']);
    Route::delete('/job-categories/{id}', [JobCategoryController::class, 'destroy']);
    Route::patch('/job-categories/{id}/toggle-status', [JobCategoryController::class, 'toggleStatus']);

    // Departments
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::put('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);
    Route::patch('/departments/{id}/toggle-status', [DepartmentController::class, 'toggleStatus']);

    // Designations
    Route::get('/designations', [DesignationController::class, 'index']);
    Route::post('/designations', [DesignationController::class, 'store']);
    Route::get('/designations/{id}', [DesignationController::class, 'show']);
    Route::put('/designations/{id}', [DesignationController::class, 'update']);
    Route::delete('/designations/{id}', [DesignationController::class, 'destroy']);
    Route::patch('/designations/{id}/toggle-status', [DesignationController::class, 'toggleStatus']);

    // Qualifications
    Route::get('/qualifications', [QualificationController::class, 'index']);
    Route::post('/qualifications', [QualificationController::class, 'store']);
    Route::get('/qualifications/{id}', [QualificationController::class, 'show']);
    Route::put('/qualifications/{id}', [QualificationController::class, 'update']);
    Route::delete('/qualifications/{id}', [QualificationController::class, 'destroy']);
    Route::patch('/qualifications/{id}/toggle-status', [QualificationController::class, 'toggleStatus']);

    // Job Openings
    Route::get('/job-openings', [JobOpeningController::class, 'index']);
    Route::post('/job-openings', [JobOpeningController::class, 'store']);
    Route::get('/job-openings/{id}', [JobOpeningController::class, 'show']);
    Route::put('/job-openings/{id}', [JobOpeningController::class, 'update']);
    Route::delete('/job-openings/{id}', [JobOpeningController::class, 'destroy']);
    Route::patch('/job-openings/{id}/toggle-status', [JobOpeningController::class, 'toggleStatus']);

    // Attendance
    Route::get('/attendances', [AttendanceController::class, 'index']);
    Route::post('/attendances', [AttendanceController::class, 'store']);
    Route::get('/attendances/employees', [AttendanceController::class, 'getEmployeesForAttendance']);
    Route::get('/attendances/export', [AttendanceController::class, 'exportReport']);
    Route::post('/attendances/bulk', [AttendanceController::class, 'markBulk']);
    Route::get('/attendances/{id}', [AttendanceController::class, 'show']);
    Route::put('/attendances/{id}', [AttendanceController::class, 'update']);
    Route::delete('/attendances/{id}', [AttendanceController::class, 'destroy']);

    // Leave Requests
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::get('/leave-requests/employees', [LeaveRequestController::class, 'getEmployees']);
    Route::get('/leave-requests/{id}', [LeaveRequestController::class, 'show']);
    Route::put('/leave-requests/{id}', [LeaveRequestController::class, 'update']);
    Route::delete('/leave-requests/{id}', [LeaveRequestController::class, 'destroy']);
    Route::patch('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve']);
    Route::patch('/leave-requests/{id}/reject', [LeaveRequestController::class, 'reject']);

    // Notification Settings
    Route::get('/notification-settings', [NotificationSettingController::class, 'index']);
    Route::put('/notification-settings/{id}', [NotificationSettingController::class, 'update']);
    Route::post('/notification-settings/toggle', [NotificationSettingController::class, 'toggle']);

    // Leave Settings
    Route::get('/leave-settings', [LeaveSettingController::class, 'index']);
    Route::get('/leave-settings/available-types', [LeaveSettingController::class, 'getAvailableTypes']);
    Route::post('/leave-settings', [LeaveSettingController::class, 'store']);
    Route::get('/leave-settings/{id}', [LeaveSettingController::class, 'show']);
    Route::put('/leave-settings/{id}', [LeaveSettingController::class, 'update']);
    Route::delete('/leave-settings/{id}', [LeaveSettingController::class, 'destroy']);
    Route::patch('/leave-settings/{id}/toggle-status', [LeaveSettingController::class, 'toggleStatus']);

    // Allowances
    Route::get('/allowances', [AllowanceController::class, 'index']);
    Route::post('/allowances', [AllowanceController::class, 'store']);
    Route::get('/allowances/{id}', [AllowanceController::class, 'show']);
    Route::put('/allowances/{id}', [AllowanceController::class, 'update']);
    Route::delete('/allowances/{id}', [AllowanceController::class, 'destroy']);
    Route::patch('/allowances/{id}/toggle-status', [AllowanceController::class, 'toggleStatus']);

    // Payroll
    Route::get('/payrolls', [PayrollController::class, 'index']);
    Route::get('/payrolls/months', [PayrollController::class, 'getMonths']);
    Route::get('/payrolls/employees', [PayrollController::class, 'getEmployeesForSalary']);
    Route::post('/payrolls/process', [PayrollController::class, 'processPayroll']);
    Route::post('/payrolls/salary', [PayrollController::class, 'storeSalary']);
    Route::get('/payrolls/salary/{employeeId}', [PayrollController::class, 'getSalaryHistory']);
    Route::get('/payrolls/{id}', [PayrollController::class, 'show']);
    Route::put('/payrolls/{id}', [PayrollController::class, 'update']);
    Route::patch('/payrolls/{id}/approve', [PayrollController::class, 'approve']);
    Route::delete('/payrolls/{id}', [PayrollController::class, 'destroy']);

    // Get countries for dropdown
    Route::get('/countries', function () {
        return response()->json(\App\Models\Country::all());
    });

    // User Dashboard Routes (for staff users)
    Route::get('/user/dashboard-stats', [UserDashboardController::class, 'getDashboardStats']);
    Route::get('/user/profile', [UserDashboardController::class, 'getProfile']);
    Route::get('/user/attendance', [UserDashboardController::class, 'getAttendance']);
    Route::get('/user/attendance/calendar', [UserDashboardController::class, 'getCalendarAttendance']);
    Route::post('/user/attendance/check-in', [UserDashboardController::class, 'checkIn']);
    Route::post('/user/attendance/check-out', [UserDashboardController::class, 'checkOut']);
    Route::get('/user/leave-requests', [UserDashboardController::class, 'getLeaveRequests']);
    Route::post('/user/leave-requests', [UserDashboardController::class, 'createLeaveRequest']);
    Route::delete('/user/leave-requests/{id}', [UserDashboardController::class, 'deleteLeaveRequest']);
    Route::post('/user/change-password', [UserDashboardController::class, 'changePassword']);
});
