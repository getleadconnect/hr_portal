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

    // Employees
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}/export-pdf', [EmployeeController::class, 'exportPdf']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::post('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
    Route::patch('/employees/{id}/toggle-status', [EmployeeController::class, 'toggleStatus']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
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

    // Get countries for dropdown
    Route::get('/countries', function () {
        return response()->json(\App\Models\Country::all());
    });
});
