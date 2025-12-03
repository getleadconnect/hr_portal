<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveSetting;
use Illuminate\Http\Request;
use Validator;

class LeaveSettingController extends Controller
{
    /**
     * Get all leave settings with pagination and search
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = LeaveSetting::orderBy('id', 'DESC');

        if ($search) {
            $query->where('leave_type', 'LIKE', "%{$search}%");
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
     * Get available leave types that haven't been added yet
     */
    public function getAvailableTypes()
    {
        $usedTypes = LeaveSetting::pluck('leave_type')->toArray();
        $allTypes = LeaveSetting::getLeaveTypes();
        $availableTypes = array_diff($allTypes, $usedTypes);

        return response()->json([
            'success' => true,
            'data' => array_values($availableTypes)
        ]);
    }

    /**
     * Store a new leave setting
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), LeaveSetting::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $leaveSetting = LeaveSetting::create([
                'leave_type' => $request->leave_type,
                'no_of_days' => $request->no_of_days,
                'created_by' => auth()->id(),
                'status' => 1,
            ]);

            $leaveSetting->load('creator:id,user_name');

            return response()->json([
                'success' => true,
                'message' => 'Leave setting created successfully',
                'data' => $leaveSetting
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single leave setting
     */
    public function show($id)
    {
        $leaveSetting = LeaveSetting::with('creator:id,user_name')->find($id);

        if (!$leaveSetting) {
            return response()->json([
                'success' => false,
                'message' => 'Leave setting not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $leaveSetting
        ]);
    }

    /**
     * Update a leave setting
     */
    public function update(Request $request, $id)
    {
        $leaveSetting = LeaveSetting::find($id);

        if (!$leaveSetting) {
            return response()->json([
                'success' => false,
                'message' => 'Leave setting not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), LeaveSetting::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $leaveSetting->update([
                'leave_type' => $request->leave_type,
                'no_of_days' => $request->no_of_days,
            ]);

            $leaveSetting->load('creator:id,user_name');

            return response()->json([
                'success' => true,
                'message' => 'Leave setting updated successfully',
                'data' => $leaveSetting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a leave setting
     */
    public function destroy($id)
    {
        try {
            $leaveSetting = LeaveSetting::find($id);

            if (!$leaveSetting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leave setting not found'
                ], 404);
            }

            $leaveSetting->delete();

            return response()->json([
                'success' => true,
                'message' => 'Leave setting deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle status of a leave setting
     */
    public function toggleStatus($id)
    {
        try {
            $leaveSetting = LeaveSetting::find($id);

            if (!$leaveSetting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leave setting not found'
                ], 404);
            }

            $newStatus = $leaveSetting->status == 1 ? 0 : 1;
            $leaveSetting->update(['status' => $newStatus]);

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
