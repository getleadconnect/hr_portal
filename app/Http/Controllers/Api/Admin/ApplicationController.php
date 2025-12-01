<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use App\Models\NotificationSetting;
use Illuminate\Support\Facades\Storage;
use App\Services\TelegramService;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $jobCategoryId = $request->input('job_category_id');

        $query = Application::select('applications.*', 'job_category.category_name')
            ->leftJoin('job_category', 'applications.job_category_id', '=', 'job_category.id')
            ->orderBy('applications.id', 'DESC');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('applications.name', 'LIKE', "%{$search}%")
                    ->orWhere('applications.email', 'LIKE', "%{$search}%")
                    ->orWhere('applications.mobile', 'LIKE', "%{$search}%");
            });
        }

        // Apply job category filter
        if ($jobCategoryId) {
            $query->where('applications.job_category_id', $jobCategoryId);
        }

        $applications = $query->paginate($perPage);

        // Transform data
        $applications->getCollection()->transform(function ($app) {
            return [
                'id' => $app->id,
                'name' => $app->name,
                'email' => $app->email,
                'mobile' => $app->countrycode . $app->mobile,
                'job_category' => $app->category_name,
                'date_of_birth' => $app->dob,
                'experience' => $app->experience,
                'experience_years' => $app->experience_years,
                'last_drawn_salary' => $app->last_drawn_salary,
                'expected_salary' => $app->expected_salary,
                'photo_url' => $app->photo ? config('constants.file_path') . $app->photo : null,
                'cv_url' => $app->cv_file ? config('constants.file_path') . $app->cv_file : null,
                'created_at' => $app->created_at->format('d-m-Y'),
                'status' => $app->status ?? 'New',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    public function show($id)
    {
        $application = Application::select('applications.*', 'job_category.category_name')
            ->leftJoin('job_category', 'applications.job_category_id', '=', 'job_category.id')
            ->where('applications.id', $id)
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found'
            ], 404);
        }

        $data = [
            'id' => $application->id,
            'name' => $application->name,
            'email' => $application->email,
            'mobile' => $application->countrycode . $application->mobile,
            'date_of_birth' => $application->dob,
            'gender' => $application->gender,
            'marital_status' => $application->marital_status,
            'father_name' => $application->father_name,
            'address' => $application->address,
            'pincode' => $application->pincode,
            'state' => $application->state,
            'district' => $application->district,
            'job_category' => $application->category_name,
            'qualification' => $application->qualification,
            'technology_stack' => $application->technology_stack,
            'experience' => $application->experience,
            'experience_years' => $application->experience_years,
            'previous_employer' => $application->previous_employer,
            'last_drawn_salary' => $application->last_drawn_salary,
            'expected_salary' => $application->expected_salary,
            'why_changing_job' => $application->why_changing_job,
            'why_getlead' => $application->why_getlead,
            'photo_url' => $application->photo ? config('constants.file_path') . $application->photo : null,
            'cv_url' => $application->cv_file ? config('constants.file_path') . $application->cv_file : null,
            'created_at' => $application->created_at->format('d-m-Y H:i:s'),
            'status' => $application->status ?? 'New',
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function destroy($id)
    {
        try {
            $application = Application::find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            // Optional: Delete files from storage
            // if ($application->photo) {
            //     Storage::disk('spaces')->delete($application->photo);
            // }
            // if ($application->cv_file) {
            //     Storage::disk('spaces')->delete($application->cv_file);
            // }

            $application->delete();

            return response()->json([
                'success' => true,
                'message' => 'Application deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $application = Application::find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            $validStatuses = Application::$statuses;

            if (!in_array($request->status, $validStatuses)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status value'
                ], 422);
            }

            $application->update(['status' => $request->status]);

            // Send Telegram notification (except for "New" status) if enabled
            if ($request->status !== 'New' && NotificationSetting::isStatusChangeNotificationEnabled()) {
                $applicationWithCategory = Application::select('applications.*', 'job_category.category_name')
                    ->leftJoin('job_category', 'applications.job_category_id', '=', 'job_category.id')
                    ->where('applications.id', $id)
                    ->first();

                $telegramService = new TelegramService();
                $telegramService->sendStatusChangeNotification($applicationWithCategory, $request->status);
            }

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => ['status' => $application->status]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
