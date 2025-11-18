<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Facades\Storage;
use Validator;
use PDF;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = Employee::orderBy('id', 'DESC');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                    ->orWhere('employee_id', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('mobile_number', 'LIKE', "%{$search}%");
            });
        }

        $employees = $query->paginate($perPage);

        // Transform data
        $employees->getCollection()->transform(function ($employee) {
            return [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'employee_id' => $employee->employee_id,
                'mobile_number' => $employee->mobile_number,
                'email' => $employee->email,
                'job_title' => $employee->job_title,
                'department' => $employee->department,
                'status' => $employee->status,
                'profile_image_url' => $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null,
                'created_at' => $employee->created_at->format('d-m-Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Employee::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $data = [
                // Personal Information
                'full_name' => $request->full_name,
                'employee_id' => $request->employee_id,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'marital_status' => $request->marital_status,
                'qualification_id' => $request->qualification_id,
                'technology_stack' => $request->technology_stack,
                'join_date' => $request->join_date,
                'releaving_date' => $request->releaving_date,

                // Contact Information
                'mobile_number' => $request->mobile_number,
                'alternative_number_1' => $request->alternative_number_1,
                'alternative_number_2' => $request->alternative_number_2,
                'email' => $request->email,
                'address' => $request->address,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_number' => $request->emergency_contact_number,
                'relationship' => $request->relationship,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,

                // Employment Details
                'job_title' => $request->job_title,
                'department_id' => $request->department_id,
                'designation_id' => $request->designation_id,
                'date_of_hire' => $request->date_of_hire,
                'work_location' => $request->work_location,
                'starting_salary' => $request->starting_salary,

                // Additional Details
                'aadhar_number' => $request->aadhar_number,
                'pancard_number' => $request->pancard_number,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'ifsc_code' => $request->ifsc_code,

                'status' => Employee::ACTIVE,
            ];

            // Handle file uploads
            $files = ['profile_image', 'aadhar_file', 'pancard_file', 'experience_certificate', 'other_document'];

            foreach ($files as $fileField) {
                if ($request->hasFile($fileField)) {
                    $file = $request->file($fileField);
                    $fileName = time() . '_' . $fileField . '_' . $file->getClientOriginalName();
                    $filePath = 'Resume-Getlead/employees/' . $fileName;
                    Storage::disk('spaces')->put($filePath, file_get_contents($file), 'public');
                    $data[$fileField] = $filePath;
                }
            }

            $employee = Employee::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'data' => $employee
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
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $data = [
            'id' => $employee->id,
            'full_name' => $employee->full_name,
            'employee_id' => $employee->employee_id,
            'date_of_birth' => $employee->date_of_birth,
            'gender' => $employee->gender,
            'marital_status' => $employee->marital_status,
            'qualification_id' => $employee->qualification_id,
            'technology_stack' => $employee->technology_stack,
            'join_date' => $employee->join_date,
            'releaving_date' => $employee->releaving_date,
            'mobile_number' => $employee->mobile_number,
            'alternative_number_1' => $employee->alternative_number_1,
            'alternative_number_2' => $employee->alternative_number_2,
            'email' => $employee->email,
            'address' => $employee->address,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_number' => $employee->emergency_contact_number,
            'relationship' => $employee->relationship,
            'city' => $employee->city,
            'state' => $employee->state,
            'country' => $employee->country,
            'job_title' => $employee->job_title,
            'department_id' => $employee->department_id,
            'designation_id' => $employee->designation_id,
            'date_of_hire' => $employee->date_of_hire,
            'work_location' => $employee->work_location,
            'starting_salary' => $employee->starting_salary,
            'aadhar_number' => $employee->aadhar_number,
            'pancard_number' => $employee->pancard_number,
            'bank_name' => $employee->bank_name,
            'account_number' => $employee->account_number,
            'ifsc_code' => $employee->ifsc_code,
            'status' => $employee->status,
            'profile_image_url' => $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null,
            'aadhar_file_url' => $employee->aadhar_file ? config('constants.file_path') . $employee->aadhar_file : null,
            'pancard_file_url' => $employee->pancard_file ? config('constants.file_path') . $employee->pancard_file : null,
            'experience_certificate_url' => $employee->experience_certificate ? config('constants.file_path') . $employee->experience_certificate : null,
            'other_document_url' => $employee->other_document ? config('constants.file_path') . $employee->other_document : null,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), Employee::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $data = [
                // Personal Information
                'full_name' => $request->full_name,
                'employee_id' => $request->employee_id,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'marital_status' => $request->marital_status,
                'qualification_id' => $request->qualification_id,
                'technology_stack' => $request->technology_stack,
                'join_date' => $request->join_date,
                'releaving_date' => $request->releaving_date,

                // Contact Information
                'mobile_number' => $request->mobile_number,
                'alternative_number_1' => $request->alternative_number_1,
                'alternative_number_2' => $request->alternative_number_2,
                'email' => $request->email,
                'address' => $request->address,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_number' => $request->emergency_contact_number,
                'relationship' => $request->relationship,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,

                // Employment Details
                'job_title' => $request->job_title,
                'department_id' => $request->department_id,
                'designation_id' => $request->designation_id,
                'date_of_hire' => $request->date_of_hire,
                'work_location' => $request->work_location,
                'starting_salary' => $request->starting_salary,

                // Additional Details
                'aadhar_number' => $request->aadhar_number,
                'pancard_number' => $request->pancard_number,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'ifsc_code' => $request->ifsc_code,
            ];

            // Handle file uploads
            $files = ['profile_image', 'aadhar_file', 'pancard_file', 'experience_certificate', 'other_document'];

            foreach ($files as $fileField) {
                if ($request->hasFile($fileField)) {
                    // Delete old file if exists
                    if ($employee->$fileField) {
                        Storage::disk('spaces')->delete($employee->$fileField);
                    }

                    $file = $request->file($fileField);
                    $fileName = time() . '_' . $fileField . '_' . $file->getClientOriginalName();
                    $filePath = 'Resume-Getlead/employees/' . $fileName;
                    Storage::disk('spaces')->put($filePath, file_get_contents($file), 'public');
                    $data[$fileField] = $filePath;
                }
            }

            $employee->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'data' => $employee
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
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Optional: Delete files from storage
            // if ($employee->profile_image) {
            //     Storage::disk('spaces')->delete($employee->profile_image);
            // }

            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully'
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
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            $newStatus = $employee->status == 1 ? 0 : 1;
            $employee->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Employee status updated successfully',
                'data' => ['status' => $newStatus]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function exportPdf($id)
    {
        try {
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            // Helper function to check if file is image
            $isImage = function($url) {
                if (!$url) return false;
                $imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
                foreach ($imageExtensions as $ext) {
                    if (stripos($url, $ext) !== false) {
                        return true;
                    }
                }
                return false;
            };

            // Add full URLs for files
            $employee->profile_image_url = $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null;
            $employee->aadhar_file_url = $employee->aadhar_file ? config('constants.file_path') . $employee->aadhar_file : null;
            $employee->pancard_file_url = $employee->pancard_file ? config('constants.file_path') . $employee->pancard_file : null;
            $employee->experience_certificate_url = $employee->experience_certificate ? config('constants.file_path') . $employee->experience_certificate : null;
            $employee->other_document_url = $employee->other_document ? config('constants.file_path') . $employee->other_document : null;

            // Check which files are images
            $employee->aadhar_is_image = $isImage($employee->aadhar_file_url);
            $employee->pancard_is_image = $isImage($employee->pancard_file_url);
            $employee->experience_is_image = $isImage($employee->experience_certificate_url);
            $employee->other_is_image = $isImage($employee->other_document_url);

            $pdf = PDF::loadView('pdf.employee-details', compact('employee'));

            return $pdf->download('employee_' . $employee->employee_id . '.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
