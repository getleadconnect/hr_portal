<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Department;
use Illuminate\Support\Facades\Auth;
use Validator;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = Department::with('creator:id,user_name')->orderBy('id', 'DESC');

        if ($search) {
            $query->where('department_name', 'LIKE', "%{$search}%");
        }

        $departments = $query->paginate($perPage);

        // Transform data
        $departments->getCollection()->transform(function ($department) {
            return [
                'id' => $department->id,
                'department_name' => $department->department_name,
                'created_by' => $department->creator?->user_name ?? 'N/A',
                'status' => $department->status,
                'created_at' => $department->created_at->format('d-m-Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $departments
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Department::rules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $department = Department::create([
                'department_name' => $request->department_name,
                'created_by' => Auth::id(),
                'status' => 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'data' => $department
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
        $department = Department::with('creator:id,user_name')->find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $department->id,
                'department_name' => $department->department_name,
                'created_by' => $department->creator?->user_name ?? 'N/A',
                'status' => $department->status,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Department::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $department->update([
                'department_name' => $request->department_name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully',
                'data' => $department
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
            $department = Department::find($id);

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found'
                ], 404);
            }

            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'Department deleted successfully'
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
            $department = Department::find($id);

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found'
                ], 404);
            }

            $newStatus = $department->status == 1 ? 0 : 1;
            $department->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Department status updated successfully',
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
