<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JobCategory;
use Validator;

class JobCategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = JobCategory::orderBy('id', 'DESC');

        if ($search) {
            $query->where('category_name', 'LIKE', "%{$search}%");
        }

        $categories = $query->paginate($perPage);

        // Transform data
        $categories->getCollection()->transform(function ($category) {
            return [
                'id' => $category->id,
                'category_name' => $category->category_name,
                'status' => $category->status,
                'created_at' => $category->created_at->format('d-m-Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), JobCategory::$jcRule, JobCategory::$jcMessage);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $category = JobCategory::create([
                'category_name' => $request->category_name,
                'status' => 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Job category created successfully',
                'data' => $category
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
        $category = JobCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Job category not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $category->id,
                'category_name' => $category->category_name,
                'status' => $category->status,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = JobCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Job category not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), JobCategory::$jcRule, JobCategory::$jcMessage);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $category->update([
                'category_name' => $request->category_name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Job category updated successfully',
                'data' => $category
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
            $category = JobCategory::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job category not found'
                ], 404);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Job category deleted successfully'
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
            $category = JobCategory::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job category not found'
                ], 404);
            }

            $newStatus = $category->status == 1 ? 0 : 1;
            $category->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Job category status updated successfully',
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
