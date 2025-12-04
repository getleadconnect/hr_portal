<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Allowance;
use Illuminate\Http\Request;
use Validator;

class AllowanceController extends Controller
{
    /**
     * Get all allowances with pagination and search
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = Allowance::orderBy('id', 'DESC');

        if ($search) {
            $query->where('allowance_type', 'LIKE', "%{$search}%");
        }

        // Include creator name
        $query->with('creator:id,user_name');

        $data = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Store a new allowance
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Allowance::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $allowance = Allowance::create([
                'allowance_type' => $request->allowance_type,
                'percentage' => $request->percentage,
                'created_by' => auth()->id(),
                'status' => 1,
            ]);

            $allowance->load('creator:id,user_name');

            return response()->json([
                'success' => true,
                'message' => 'Allowance created successfully',
                'data' => $allowance
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single allowance
     */
    public function show($id)
    {
        $allowance = Allowance::with('creator:id,user_name')->find($id);

        if (!$allowance) {
            return response()->json([
                'success' => false,
                'message' => 'Allowance not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $allowance
        ]);
    }

    /**
     * Update an allowance
     */
    public function update(Request $request, $id)
    {
        $allowance = Allowance::find($id);

        if (!$allowance) {
            return response()->json([
                'success' => false,
                'message' => 'Allowance not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Allowance::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $allowance->update([
                'allowance_type' => $request->allowance_type,
                'percentage' => $request->percentage,
            ]);

            $allowance->load('creator:id,user_name');

            return response()->json([
                'success' => true,
                'message' => 'Allowance updated successfully',
                'data' => $allowance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an allowance
     */
    public function destroy($id)
    {
        try {
            $allowance = Allowance::find($id);

            if (!$allowance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Allowance not found'
                ], 404);
            }

            $allowance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Allowance deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle status of an allowance
     */
    public function toggleStatus($id)
    {
        try {
            $allowance = Allowance::find($id);

            if (!$allowance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Allowance not found'
                ], 404);
            }

            $newStatus = $allowance->status == 1 ? 0 : 1;
            $allowance->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
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
