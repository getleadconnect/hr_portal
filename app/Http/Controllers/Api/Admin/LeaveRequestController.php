<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\Employee;
use Validator;
use Carbon\Carbon;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $status = $request->input('status', '');
        $leaveType = $request->input('leave_type', '');
        $departmentId = $request->input('department_id', '');

        $query = LeaveRequest::with(['employee', 'approver'])
            ->orderBy('id', 'DESC');

        // Search by employee name or employee_id
        if ($search) {
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                    ->orWhere('employee_id', 'LIKE', "%{$search}%");
            });
        }

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by leave type
        if ($leaveType) {
            $query->where('leave_type', $leaveType);
        }

        // Filter by department
        if ($departmentId) {
            $query->whereHas('employee', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        $leaveRequests = $query->paginate($perPage);

        // Transform data
        $leaveRequests->getCollection()->transform(function ($leaveRequest) {
            return [
                'id' => $leaveRequest->id,
                'employee_id' => $leaveRequest->employee_id,
                'employee_code' => $leaveRequest->employee->employee_id ?? 'N/A',
                'employee_name' => $leaveRequest->employee->full_name ?? 'N/A',
                'employee_initials' => $this->getInitials($leaveRequest->employee->full_name ?? ''),
                'department' => $leaveRequest->employee->department ?? 'N/A',
                'leave_type' => $leaveRequest->leave_type,
                'from_date' => Carbon::parse($leaveRequest->from_date)->format('d/m/Y'),
                'to_date' => Carbon::parse($leaveRequest->to_date)->format('d/m/Y'),
                'days' => $leaveRequest->days,
                'reason' => $leaveRequest->reason,
                'status' => $leaveRequest->status,
                'approved_by' => $leaveRequest->approver->user_name ?? null,
                'approved_at' => $leaveRequest->approved_at ? Carbon::parse($leaveRequest->approved_at)->format('d/m/Y H:i') : null,
                'created_at' => $leaveRequest->created_at->format('d/m/Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $leaveRequests
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), LeaveRequest::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Check for overlapping leave requests
        $overlap = LeaveRequest::where('employee_id', $request->employee_id)
            ->where('status', '!=', 'rejected')
            ->where(function ($q) use ($request) {
                $q->whereBetween('from_date', [$request->from_date, $request->to_date])
                    ->orWhereBetween('to_date', [$request->from_date, $request->to_date])
                    ->orWhere(function ($q2) use ($request) {
                        $q2->where('from_date', '<=', $request->from_date)
                            ->where('to_date', '>=', $request->to_date);
                    });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request overlaps with an existing request'
            ], 422);
        }

        try {
            $leaveRequest = LeaveRequest::create([
                'employee_id' => $request->employee_id,
                'leave_type' => $request->leave_type,
                'from_date' => $request->from_date,
                'to_date' => $request->to_date,
                'days' => $request->days,
                'reason' => $request->reason,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Leave request created successfully',
                'data' => $leaveRequest
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
        $leaveRequest = LeaveRequest::with(['employee', 'approver'])->find($id);

        if (!$leaveRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request not found'
            ], 404);
        }

        $data = [
            'id' => $leaveRequest->id,
            'employee_id' => $leaveRequest->employee_id,
            'employee_name' => $leaveRequest->employee->full_name ?? 'N/A',
            'employee_code' => $leaveRequest->employee->employee_id ?? 'N/A',
            'department' => $leaveRequest->employee->department ?? 'N/A',
            'leave_type' => $leaveRequest->leave_type,
            'from_date' => $leaveRequest->from_date,
            'to_date' => $leaveRequest->to_date,
            'days' => $leaveRequest->days,
            'reason' => $leaveRequest->reason,
            'status' => $leaveRequest->status,
            'approved_by' => $leaveRequest->approver->user_name ?? null,
            'approved_at' => $leaveRequest->approved_at,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $leaveRequest = LeaveRequest::find($id);

        if (!$leaveRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Leave request not found'
            ], 404);
        }

        // Only allow updates if status is pending
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update a leave request that has been approved or rejected'
            ], 422);
        }

        $validator = Validator::make($request->all(), LeaveRequest::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $leaveRequest->update([
                'employee_id' => $request->employee_id,
                'leave_type' => $request->leave_type,
                'from_date' => $request->from_date,
                'to_date' => $request->to_date,
                'days' => $request->days,
                'reason' => $request->reason,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Leave request updated successfully',
                'data' => $leaveRequest
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
            $leaveRequest = LeaveRequest::find($id);

            if (!$leaveRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leave request not found'
                ], 404);
            }

            $leaveRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Leave request deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        try {
            $leaveRequest = LeaveRequest::find($id);

            if (!$leaveRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leave request not found'
                ], 404);
            }

            if ($leaveRequest->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Leave request has already been processed'
                ], 422);
            }

            $leaveRequest->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => Carbon::now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Leave request approved successfully',
                'data' => $leaveRequest
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        try {
            $leaveRequest = LeaveRequest::find($id);

            if (!$leaveRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leave request not found'
                ], 404);
            }

            if ($leaveRequest->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Leave request has already been processed'
                ], 422);
            }

            $leaveRequest->update([
                'status' => 'rejected',
                'approved_by' => $request->user()->id,
                'approved_at' => Carbon::now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Leave request rejected successfully',
                'data' => $leaveRequest
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get active employees for dropdown
    public function getEmployees()
    {
        $employees = Employee::where('status', Employee::ACTIVE)
            ->orderBy('full_name')
            ->get(['id', 'employee_id', 'full_name', 'department_id']);

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    private function getInitials($name)
    {
        $words = explode(' ', trim($name));
        $initials = '';
        foreach (array_slice($words, 0, 2) as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
        }
        return $initials ?: 'NA';
    }
}
