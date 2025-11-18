<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Designation;
use Illuminate\Support\Facades\Auth;
use Validator;

class DesignationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = Designation::with('creator:id,user_name')->orderBy('id', 'DESC');

        if ($search) {
            $query->where('designation_name', 'LIKE', "%{$search}%");
        }

        $designations = $query->paginate($perPage);

        // Transform data
        $designations->getCollection()->transform(function ($designation) {
            return [
                'id' => $designation->id,
                'designation_name' => $designation->designation_name,
                'created_by' => $designation->creator?->user_name ?? 'N/A',
                'status' => $designation->status,
                'created_at' => $designation->created_at->format('d-m-Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $designations
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Designation::rules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $designation = Designation::create([
                'designation_name' => $request->designation_name,
                'created_by' => Auth::id(),
                'status' => 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Designation created successfully',
                'data' => $designation
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
        $designation = Designation::with('creator:id,user_name')->find($id);

        if (!$designation) {
            return response()->json([
                'success' => false,
                'message' => 'Designation not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $designation->id,
                'designation_name' => $designation->designation_name,
                'created_by' => $designation->creator?->user_name ?? 'N/A',
                'status' => $designation->status,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $designation = Designation::find($id);

        if (!$designation) {
            return response()->json([
                'success' => false,
                'message' => 'Designation not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Designation::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $designation->update([
                'designation_name' => $request->designation_name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Designation updated successfully',
                'data' => $designation
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
            $designation = Designation::find($id);

            if (!$designation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Designation not found'
                ], 404);
            }

            $designation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Designation deleted successfully'
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
            $designation = Designation::find($id);

            if (!$designation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Designation not found'
                ], 404);
            }

            $newStatus = $designation->status == 1 ? 0 : 1;
            $designation->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Designation status updated successfully',
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
