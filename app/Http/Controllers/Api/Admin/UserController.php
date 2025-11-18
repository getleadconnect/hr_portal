<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Validator;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = User::orderBy('id', 'DESC');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('mobile', 'LIKE', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        // Transform data
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'user_name' => $user->user_name,
                'email' => $user->email,
                'mobile' => $user->mobile,
                'role_id' => $user->role_id,
                'status' => $user->status,
                'last_login' => $user->datetime_last_login,
                'created_at' => $user->created_at->format('d-m-Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), User::$userRule);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $user = User::create([
                'user_name' => $request->user_name,
                'email' => $request->email,
                'countrycode' => $request->countrycode ?? '+91',
                'mobile' => $request->mobile,
                'password' => Hash::make($request->password),
                'role_id' => $request->role_id ?? User::USERS,
                'status' => User::ACTIVATE,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user
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
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'user_name' => $user->user_name,
                'email' => $user->email,
                'countrycode' => $user->countrycode,
                'mobile' => $user->mobile,
                'role_id' => $user->role_id,
                'status' => $user->status,
                'last_login' => $user->datetime_last_login,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $rules = [
            'user_name' => 'required|max:25',
            'email' => 'required|email|unique:users,email,' . $id,
            'mobile' => 'required|numeric|digits_between:8,15|unique:users,mobile,' . $id,
        ];

        if ($request->filled('password')) {
            $rules['password'] = 'min:6';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $data = [
                'user_name' => $request->user_name,
                'email' => $request->email,
                'countrycode' => $request->countrycode ?? '+91',
                'mobile' => $request->mobile,
                'role_id' => $request->role_id ?? $user->role_id,
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user
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
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
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
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $newStatus = $user->status == 1 ? 0 : 1;
            $user->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'User status updated successfully',
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
