<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Qualification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class QualificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');

        $query = Qualification::with('creator:id,user_name')->orderBy('id', 'DESC');

        if ($search) {
            $query->where('qualification', 'LIKE', "%{$search}%");
        }

        $qualifications = $query->paginate($perPage);

        $qualifications->getCollection()->transform(function ($qualification) {
            return [
                'id' => $qualification->id,
                'qualification' => $qualification->qualification,
                'status' => $qualification->status,
                'created_by' => $qualification->creator->user_name ?? 'N/A',
                'created_at' => $qualification->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Qualifications retrieved successfully',
            'data' => $qualifications
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Qualification::rules());

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $qualification = Qualification::create([
            'qualification' => $request->qualification,
            'created_by' => Auth::id(),
            'status' => 1,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Qualification created successfully',
            'data' => $qualification
        ], 201);
    }

    public function show($id)
    {
        $qualification = Qualification::with('creator:id,user_name')->find($id);

        if (!$qualification) {
            return response()->json([
                'status' => false,
                'message' => 'Qualification not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Qualification retrieved successfully',
            'data' => [
                'id' => $qualification->id,
                'qualification' => $qualification->qualification,
                'status' => $qualification->status,
                'created_by' => $qualification->creator->user_name ?? 'N/A',
                'created_at' => $qualification->created_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $qualification = Qualification::find($id);

        if (!$qualification) {
            return response()->json([
                'status' => false,
                'message' => 'Qualification not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Qualification::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $qualification->update([
            'qualification' => $request->qualification,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Qualification updated successfully',
            'data' => $qualification
        ]);
    }

    public function destroy($id)
    {
        $qualification = Qualification::find($id);

        if (!$qualification) {
            return response()->json([
                'status' => false,
                'message' => 'Qualification not found'
            ], 404);
        }

        $qualification->delete();

        return response()->json([
            'status' => true,
            'message' => 'Qualification deleted successfully'
        ]);
    }

    public function toggleStatus($id)
    {
        $qualification = Qualification::find($id);

        if (!$qualification) {
            return response()->json([
                'status' => false,
                'message' => 'Qualification not found'
            ], 404);
        }

        $qualification->update([
            'status' => $qualification->status == 1 ? 0 : 1
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Qualification status updated successfully',
            'data' => $qualification
        ]);
    }
}
