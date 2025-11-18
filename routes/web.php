<?php

/*require __DIR__ . '/admin.php';*/

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\JobCategoryController;
use App\Http\Controllers\Admin\EmployeeController;

use App\Http\Controllers\HomeController;

use App\Models\JobCategory;

Route::get('/', function () {
	
	$job_cat=JobCategory::where('status',1)->get();
    return view('hr_form_new')->with('job_cat',$job_cat);
	//return  redirect('application');
});

Route::controller(HomeController::class)->group(function() {
	
	Route::get('/application', 'index')->name('application');
	Route::post('/save-application', 'store')->name('save-application');
	Route::get('/finish', 'finish')->name('finish');
	
});


// React Admin SPA - catch all admin routes
Route::prefix('admin')->group(function() {
	Route::get('/{any?}', function () {
		return view('admin');
	})->where('any', '.*');
});


// Old admin routes (Blade-based) - Commented out as now using React SPA
// Uncomment if you need to revert to the old admin panel
/*
Route::group(['prefix'=>'admin','as'=>'admin.','middleware' => 'authware'], function()
{
	Route::controller(DashboardController::class)->group(function() {
		Route::get('/dashboard', 'index')->name('dashboard');
	});

	Route::controller(ApplicationController::class)->group(function() {
		Route::get('/applications-list', 'index')->name('applications-list');
		Route::get('/view-applications', 'viewApplications')->name('view-applications');
		Route::get('/view-application-details/{id}', 'viewApplicationDetails')->name('view-application-details');
		Route::get('/delete-application/{id}', 'destroy')->name('delete-application');
	});

	Route::controller(UserController::class)->group(function() {
		Route::get('/users-list', 'index')->name('users-list');
		Route::post('/save-user', 'store')->name('save-user');
		Route::get('/view-users', 'viewUsers')->name('view-users');
		Route::get('/delete-user/{id}', 'destroy')->name('delete-user');
		Route::get('/edit-user/{id}', 'edit')->name('edit-user');
		Route::post('/update-user', 'updateUser')->name('update-user');
		Route::get('/act-deact-user/{op}/{id}', 'activateDeactivate')->name('act-deact-user');
	});

	Route::controller(JobCategoryController::class)->group(function() {
		Route::get('/job-categories', 'index')->name('job-categories');
		Route::post('/save-job-category', 'store')->name('save-job-category');
		Route::get('/view-job-categories', 'viewJobCategories')->name('view-job-categories');
		Route::get('/delete-job-category/{id}', 'destroy')->name('delete-job-category');
		Route::post('/update-job-category', 'updateJobCategory')->name('update-job-category');
		Route::get('/act-deact-job-category/{op}/{id}', 'activateDeactivate')->name('act-deact-job-category');
	});

	Route::controller(EmployeeController::class)->group(function() {
		Route::get('/employees-list', 'index')->name('employees-list');
		Route::post('/save-employee', 'store')->name('save-employee');
		Route::get('/view-employees', 'viewEmployees')->name('view-employees');
		Route::get('/delete-employee/{id}', 'destroy')->name('delete-employee');
		Route::get('/edit-employee/{id}', 'edit')->name('edit-employee');
		Route::post('/update-employee', 'updateEmployee')->name('update-employee');
		Route::get('/act-deact-employee/{op}/{id}', 'activateDeactivate')->name('act-deact-employee');
	});
});
*/
