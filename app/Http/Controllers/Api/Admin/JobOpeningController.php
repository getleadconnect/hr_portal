<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JobOpening;
use Illuminate\Support\Facades\Auth;
use Validator;

class JobOpeningController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $jobCategoryId = $request->input('job_category_id');
        $jobDesignationId = $request->input('job_designation_id');

        $query = JobOpening::with(['jobCategory', 'designation'])->orderBy('id', 'DESC');

        // Apply date range filter
        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }

        // Apply category filter
        if ($jobCategoryId) {
            $query->where('job_category_id', $jobCategoryId);
        }

        // Apply designation filter
        if ($jobDesignationId) {
            $query->where('job_designation_id', $jobDesignationId);
        }

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('job_title', 'LIKE', "%{$search}%")
                    ->orWhere('job_location', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%")
                    ->orWhere('closing_date', 'LIKE', "%{$search}%")
                    ->orWhereHas('jobCategory', function ($q) use ($search) {
                        $q->where('category_name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('designation', function ($q) use ($search) {
                        $q->where('designation_name', 'LIKE', "%{$search}%");
                    });
            });
        }

        $jobOpenings = $query->paginate($perPage);

        // Transform data
        $jobOpenings->getCollection()->transform(function ($jobOpening) {
            return [
                'id' => $jobOpening->id,
                'job_title' => $jobOpening->job_title,
                'job_category_id' => $jobOpening->job_category_id,
                'job_category_name' => $jobOpening->jobCategory ? $jobOpening->jobCategory->category_name : 'N/A',
                'job_designation_id' => $jobOpening->job_designation_id,
                'designation_name' => $jobOpening->designation ? $jobOpening->designation->designation_name : 'N/A',
                'job_location' => $jobOpening->job_location ?? 'N/A',
                'job_description' => $jobOpening->job_description ? strip_tags($jobOpening->job_description) : 'N/A',
                'job_details' => $jobOpening->job_details ? strip_tags($jobOpening->job_details) : 'N/A',
                'job_closing_date' => $jobOpening->job_closing_date ? date('d-m-Y', strtotime($jobOpening->job_closing_date)) : 'N/A',
                'status' => $jobOpening->status,
                'created_at' => $jobOpening->created_at->format('d-m-Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $jobOpenings
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), JobOpening::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['status'] = JobOpening::ACTIVE;

            $jobOpening = JobOpening::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Job opening created successfully',
                'data' => $jobOpening
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
        $jobOpening = JobOpening::with(['jobCategory', 'designation'])->find($id);

        if (!$jobOpening) {
            return response()->json([
                'success' => false,
                'message' => 'Job opening not found'
            ], 404);
        }

        $data = [
            'id' => $jobOpening->id,
            'job_title' => $jobOpening->job_title,
            'job_category_id' => $jobOpening->job_category_id,
            'job_category_name' => $jobOpening->jobCategory ? $jobOpening->jobCategory->category_name : null,
            'job_designation_id' => $jobOpening->job_designation_id,
            'designation_name' => $jobOpening->designation ? $jobOpening->designation->designation_name : null,
            'job_location' => $jobOpening->job_location,
            'job_description' => $jobOpening->job_description,
            'job_closing_date' => $jobOpening->job_closing_date ? date('Y-m-d', strtotime($jobOpening->job_closing_date)) : null,
            'job_details' => $jobOpening->job_details,
            'status' => $jobOpening->status,
            'created_at' => $jobOpening->created_at->format('d-m-Y H:i:s'),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $jobOpening = JobOpening::find($id);

        if (!$jobOpening) {
            return response()->json([
                'success' => false,
                'message' => 'Job opening not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), JobOpening::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $jobOpening->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Job opening updated successfully',
                'data' => $jobOpening
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
            $jobOpening = JobOpening::find($id);

            if (!$jobOpening) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job opening not found'
                ], 404);
            }

            $jobOpening->delete();

            return response()->json([
                'success' => true,
                'message' => 'Job opening deleted successfully'
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
            $jobOpening = JobOpening::find($id);

            if (!$jobOpening) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job opening not found'
                ], 404);
            }

            $newStatus = $jobOpening->status == 1 ? 0 : 1;
            $jobOpening->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Job opening status updated successfully',
                'data' => ['status' => $newStatus]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
