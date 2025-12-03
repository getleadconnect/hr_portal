<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Facades\FileUpload;

use App\Models\Employee;
use App\Models\Country;

use Validator;

use DataTables;
use Session;
use Auth;
use Log;
use DB;

class EmployeeController extends Controller
{
    public function __construct()
    {
        //$this->middleware('admin');
    }

    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $departmentId = $request->get('department_id');
            $designationId = $request->get('designation_id');

            $query = Employee::query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('employee_id', 'like', "%{$search}%")
                        ->orWhere('mobile_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('job_title', 'like', "%{$search}%")
                        ->orWhere('department', 'like', "%{$search}%");
                });
            }

            // Apply date range filter
            if ($startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            }

            if ($endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            }

            // Apply department filter
            if ($departmentId) {
                $query->where('department_id', $departmentId);
            }

            // Apply designation filter
            if ($designationId) {
                $query->where('designation_id', $designationId);
            }

            $employees = $query->orderBy('id', 'desc')->paginate($perPage);

            // Add URL paths for files
            $employees->getCollection()->transform(function ($employee) {
                $employee->profile_image_url = $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null;
                $employee->aadhar_file_url = $employee->aadhar_file ? config('constants.file_path') . $employee->aadhar_file : null;
                $employee->pancard_file_url = $employee->pancard_file ? config('constants.file_path') . $employee->pancard_file : null;
                $employee->experience_certificate_url = $employee->experience_certificate ? config('constants.file_path') . $employee->experience_certificate : null;
                $employee->other_document_url = $employee->other_document ? config('constants.file_path') . $employee->other_document : null;
                return $employee;
            });

            return response()->json([
                'status' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), Employee::createRules());

        \Log::info($validator->errors());
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
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
                    'qualification_id' => $request->qualification,
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
                    'department_id' => $request->department,
                    'designation_id' => $request->designation,
                    'date_of_hire' => $request->date_of_hire,
                    'work_location' => $request->work_location,
                    'salary' => $request->salary,

                    // Additional Details
                    'aadhar_number' => $request->aadhar_number,
                    'pancard_number' => $request->pancard_number,
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'ifsc_code' => $request->ifsc_code,

                    'status' => Employee::ACTIVE,
                ];

                // Handle profile image upload
                if ($request->hasFile('profile_image')) {
                    $profile_image = $request->file('profile_image');
                    $profile_image_name = time() . '_profile_' . $profile_image->getClientOriginalName();
                    $profile_image_path = 'Resume-Getlead/employees/' . $profile_image_name;
                    Storage::disk('spaces')->put($profile_image_path, file_get_contents($profile_image), 'public');
                    $data['profile_image'] = $profile_image_path;
                }

                // Handle Aadhar file upload
                if ($request->hasFile('aadhar_file')) {
                    $aadhar_file = $request->file('aadhar_file');
                    $aadhar_file_name = time() . '_aadhar_' . $aadhar_file->getClientOriginalName();
                    $aadhar_file_path = 'Resume-Getlead/employees/' . $aadhar_file_name;
                    Storage::disk('spaces')->put($aadhar_file_path, file_get_contents($aadhar_file), 'public');
                    $data['aadhar_file'] = $aadhar_file_path;
                }

                // Handle Pancard file upload
                if ($request->hasFile('pancard_file')) {
                    $pancard_file = $request->file('pancard_file');
                    $pancard_file_name = time() . '_pancard_' . $pancard_file->getClientOriginalName();
                    $pancard_file_path = 'Resume-Getlead/employees/' . $pancard_file_name;
                    Storage::disk('spaces')->put($pancard_file_path, file_get_contents($pancard_file), 'public');
                    $data['pancard_file'] = $pancard_file_path;
                }

                // Handle Experience Certificate file upload
                if ($request->hasFile('experience_certificate')) {
                    $experience_file = $request->file('experience_certificate');
                    $experience_file_name = time() . '_experience_' . $experience_file->getClientOriginalName();
                    $experience_file_path = 'Resume-Getlead/employees/' . $experience_file_name;
                    Storage::disk('spaces')->put($experience_file_path, file_get_contents($experience_file), 'public');
                    $data['experience_certificate'] = $experience_file_path;
                }

                // Handle Other Document file upload
                if ($request->hasFile('other_document')) {
                    $other_document_file = $request->file('other_document');
                    $other_document_file_name = time() . '_other_' . $other_document_file->getClientOriginalName();
                    $other_document_file_path = 'Resume-Getlead/employees/' . $other_document_file_name;
                    Storage::disk('spaces')->put($other_document_file_path, file_get_contents($other_document_file), 'public');
                    $data['other_document'] = $other_document_file_path;
                }

                $result = Employee::create($data);
                

                dd($result);


                \Log::info($result);

                return response()->json([
                    'status' => true,
                    'message' => 'Employee created successfully',
                    'data' => $result
                ], 201);

        } catch (\Exception $e) {

            \Log::info($e->getMessage());

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function viewEmployees()
    {
        $employees = Employee::orderby('id', 'Desc')->get();

        return Datatables::of($employees)
            ->addIndexColumn()
            ->addColumn('name', function ($row) {
                if ($row->full_name != null) {
                    return ucwords($row->full_name);
                } else {
                    return "--Nil--";
                }
            })
            ->addColumn('emp_id', function ($row) {
                return $row->employee_id;
            })
            ->addColumn('mobile', function ($row) {
                return $row->mobile_number;
            })
            ->addColumn('job_title', function ($row) {
                return $row->job_title ?? "--Nil--";
            })
            ->addColumn('department', function ($row) {
                return $row->department ?? "--Nil--";
            })
            ->addColumn('status', function ($row) {
                if ($row->status == 1) {
                    $status = '<span class="badge rounded-pill bg-success">Active</span>';
                } else {
                    $status = '<span class="badge rounded-pill bg-danger">Inactive</span>';
                }
                return $status;
            })
            ->addColumn('profile_image', function ($row) {
                if ($row->profile_image != '') {
                    return '<img src="' . config('constants.file_path') . $row->profile_image . '" width="50" height="50">';
                } else {
                    return "--Nil--";
                }
            })
            ->addColumn('action', function ($row) {
                if ($row->status == 1) {
                    $btn = '<li><a class="dropdown-item btn-act-deact" href="javascript:void(0)" id="' . $row->id . '" data-option="2" ><i class="lni lni-close"></i> Deactivate</a></li>';
                } else {
                    $btn = '<li><a class="dropdown-item btn-act-deact" href="javascript:void(0)" id="' . $row->id . '" data-option="1"><i class="lni lni-checkmark"></i> Activate</a></li>';
                }

                $action = '<div class="fs-5 ms-auto dropdown">
                              <div class="dropdown-toggle dropdown-toggle-nocaret cursor-pointer" data-bs-toggle="dropdown"><i class="fadeIn animated bx bx-dots-vertical"></i></div>
                                <ul class="dropdown-menu">
                                  <li><a class="dropdown-item edit-employee" href="javascript:void(0)" id="' . $row->id . '" data-bs-toggle="offcanvas" data-bs-target="#edit-employee"  ><i class="lni lni-pencil-alt"></i> Edit</a></li>
                                  <li><a class="dropdown-item delete-employee" href="javascript:void(0)" id="' . $row->id . '"><i class="lni lni-trash"></i> Delete</a></li>'
                    . $btn .
                    '</ul>
                            </div>';
                return $action;
            })
            ->rawColumns(['action', 'name', 'status', 'profile_image'])
            ->make(true);
    }

    public function edit($id)
    {
        $employee = Employee::where('id', $id)->first();
        $countries = Country::all();
        return view('admin.employee.edit_employee', compact('employee', 'countries'));
    }

    public function updateEmployee(Request $request)
    {
        $validator = Validator::make($request->all(), Employee::updateRules($request->employee_id_hidden));

        if ($validator->fails()) {
            return response()->json(['msg' => $validator->messages()->first(), 'status' => false]);
        } else {
            try {
                $employee_id = $request->employee_id_hidden;

                $data = [
                    // Personal Information
                    'full_name' => $request->full_name,
                    'employee_id' => $request->employee_id,
                    'date_of_birth' => $request->date_of_birth,
                    'gender' => $request->gender,
                    'marital_status' => $request->marital_status,
                    'qualification' => $request->qualification,
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
                    'department' => $request->department,
                    'designation' => $request->designation,
                    'date_of_hire' => $request->date_of_hire,
                    'work_location' => $request->work_location,
                    'salary' => $request->salary,

                    // Additional Details
                    'aadhar_number' => $request->aadhar_number,
                    'pancard_number' => $request->pancard_number,
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'ifsc_code' => $request->ifsc_code,
                ];

                $employee = Employee::find($employee_id);

                // Handle profile image upload
                if ($request->hasFile('profile_image')) {
                    // Delete old image if exists
                    if ($employee->profile_image) {
                        Storage::disk('spaces')->delete($employee->profile_image);
                    }
                    $profile_image = $request->file('profile_image');
                    $profile_image_name = time() . '_profile_' . $profile_image->getClientOriginalName();
                    $profile_image_path = 'Resume-Getlead/employees/' . $profile_image_name;
                    Storage::disk('spaces')->put($profile_image_path, file_get_contents($profile_image), 'public');
                    $data['profile_image'] = $profile_image_path;
                }

                // Handle Aadhar file upload
                if ($request->hasFile('aadhar_file')) {
                    // Delete old file if exists
                    if ($employee->aadhar_file) {
                        Storage::disk('spaces')->delete($employee->aadhar_file);
                    }
                    $aadhar_file = $request->file('aadhar_file');
                    $aadhar_file_name = time() . '_aadhar_' . $aadhar_file->getClientOriginalName();
                    $aadhar_file_path = 'Resume-Getlead/employees/' . $aadhar_file_name;
                    Storage::disk('spaces')->put($aadhar_file_path, file_get_contents($aadhar_file), 'public');
                    $data['aadhar_file'] = $aadhar_file_path;
                }

                // Handle Pancard file upload
                if ($request->hasFile('pancard_file')) {
                    // Delete old file if exists
                    if ($employee->pancard_file) {
                        Storage::disk('spaces')->delete($employee->pancard_file);
                    }
                    $pancard_file = $request->file('pancard_file');
                    $pancard_file_name = time() . '_pancard_' . $pancard_file->getClientOriginalName();
                    $pancard_file_path = 'Resume-Getlead/employees/' . $pancard_file_name;
                    Storage::disk('spaces')->put($pancard_file_path, file_get_contents($pancard_file), 'public');
                    $data['pancard_file'] = $pancard_file_path;
                }

                // Handle Experience Certificate file upload
                if ($request->hasFile('experience_certificate')) {
                    // Delete old file if exists
                    if ($employee->experience_certificate) {
                        Storage::disk('spaces')->delete($employee->experience_certificate);
                    }
                    $experience_file = $request->file('experience_certificate');
                    $experience_file_name = time() . '_experience_' . $experience_file->getClientOriginalName();
                    $experience_file_path = 'Resume-Getlead/employees/' . $experience_file_name;
                    Storage::disk('spaces')->put($experience_file_path, file_get_contents($experience_file), 'public');
                    $data['experience_certificate'] = $experience_file_path;
                }

                // Handle Other Document file upload
                if ($request->hasFile('other_document')) {
                    // Delete old file if exists
                    if ($employee->other_document) {
                        Storage::disk('spaces')->delete($employee->other_document);
                    }
                    $other_document_file = $request->file('other_document');
                    $other_document_file_name = time() . '_other_' . $other_document_file->getClientOriginalName();
                    $other_document_file_path = 'Resume-Getlead/employees/' . $other_document_file_name;
                    Storage::disk('spaces')->put($other_document_file_path, file_get_contents($other_document_file), 'public');
                    $data['other_document'] = $other_document_file_path;
                }

                $result = Employee::where('id', $employee_id)->update($data);

                if ($result) {
                    return response()->json(['msg' => 'Employee successfully updated.', 'status' => true]);
                } else {
                    return response()->json(['msg' => 'Something wrong, try again.', 'status' => false]);
                }
            } catch (\Exception $e) {
                return response()->json(['msg' => $e->getMessage(), 'status' => false]);
            }
        }
    }

    public function show($id)
    {
        try {
            $employee = Employee::findOrFail($id);

            // Add URL paths for files
            $employee->profile_image_url = $employee->profile_image ? config('constants.file_path') . $employee->profile_image : null;
            $employee->aadhar_file_url = $employee->aadhar_file ? config('constants.file_path') . $employee->aadhar_file : null;
            $employee->pancard_file_url = $employee->pancard_file ? config('constants.file_path') . $employee->pancard_file : null;
            $employee->experience_certificate_url = $employee->experience_certificate ? config('constants.file_path') . $employee->experience_certificate : null;
            $employee->other_document_url = $employee->other_document ? config('constants.file_path') . $employee->other_document : null;

            return response()->json([
                'status' => true,
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), Employee::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $employee = Employee::findOrFail($id);

            $data = [
                // Personal Information
                'full_name' => $request->full_name,
                'employee_id' => $request->employee_id,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'marital_status' => $request->marital_status,
                'qualification' => $request->qualification,
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
                'department' => $request->department,
                'designation' => $request->designation,
                'date_of_hire' => $request->date_of_hire,
                'work_location' => $request->work_location,
                'salary' => $request->salary,

                // Additional Details
                'aadhar_number' => $request->aadhar_number,
                'pancard_number' => $request->pancard_number,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'ifsc_code' => $request->ifsc_code,
            ];

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                if ($employee->profile_image) {
                    Storage::disk('spaces')->delete($employee->profile_image);
                }
                $profile_image = $request->file('profile_image');
                $profile_image_name = time() . '_profile_' . $profile_image->getClientOriginalName();
                $profile_image_path = 'Resume-Getlead/employees/' . $profile_image_name;
                Storage::disk('spaces')->put($profile_image_path, file_get_contents($profile_image), 'public');
                $data['profile_image'] = $profile_image_path;
            }

            // Handle Aadhar file upload
            if ($request->hasFile('aadhar_file')) {
                if ($employee->aadhar_file) {
                    Storage::disk('spaces')->delete($employee->aadhar_file);
                }
                $aadhar_file = $request->file('aadhar_file');
                $aadhar_file_name = time() . '_aadhar_' . $aadhar_file->getClientOriginalName();
                $aadhar_file_path = 'Resume-Getlead/employees/' . $aadhar_file_name;
                Storage::disk('spaces')->put($aadhar_file_path, file_get_contents($aadhar_file), 'public');
                $data['aadhar_file'] = $aadhar_file_path;
            }

            // Handle Pancard file upload
            if ($request->hasFile('pancard_file')) {
                if ($employee->pancard_file) {
                    Storage::disk('spaces')->delete($employee->pancard_file);
                }
                $pancard_file = $request->file('pancard_file');
                $pancard_file_name = time() . '_pancard_' . $pancard_file->getClientOriginalName();
                $pancard_file_path = 'Resume-Getlead/employees/' . $pancard_file_name;
                Storage::disk('spaces')->put($pancard_file_path, file_get_contents($pancard_file), 'public');
                $data['pancard_file'] = $pancard_file_path;
            }

            // Handle Experience Certificate file upload
            if ($request->hasFile('experience_certificate')) {
                if ($employee->experience_certificate) {
                    Storage::disk('spaces')->delete($employee->experience_certificate);
                }
                $experience_file = $request->file('experience_certificate');
                $experience_file_name = time() . '_experience_' . $experience_file->getClientOriginalName();
                $experience_file_path = 'Resume-Getlead/employees/' . $experience_file_name;
                Storage::disk('spaces')->put($experience_file_path, file_get_contents($experience_file), 'public');
                $data['experience_certificate'] = $experience_file_path;
            }

            // Handle Other Document file upload
            if ($request->hasFile('other_document')) {
                if ($employee->other_document) {
                    Storage::disk('spaces')->delete($employee->other_document);
                }
                $other_document_file = $request->file('other_document');
                $other_document_file_name = time() . '_other_' . $other_document_file->getClientOriginalName();
                $other_document_file_path = 'Resume-Getlead/employees/' . $other_document_file_name;
                Storage::disk('spaces')->put($other_document_file_path, file_get_contents($other_document_file), 'public');
                $data['other_document'] = $other_document_file_path;
            }

            $employee->update($data);

            return response()->json([
                'status' => true,
                'message' => 'Employee updated successfully',
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $employee = Employee::findOrFail($id);

            // Optional: Delete files from storage
            if ($employee->profile_image) {
                Storage::disk('spaces')->delete($employee->profile_image);
            }
            if ($employee->aadhar_file) {
                Storage::disk('spaces')->delete($employee->aadhar_file);
            }
            if ($employee->pancard_file) {
                Storage::disk('spaces')->delete($employee->pancard_file);
            }
            if ($employee->experience_certificate) {
                Storage::disk('spaces')->delete($employee->experience_certificate);
            }
            if ($employee->other_document) {
                Storage::disk('spaces')->delete($employee->other_document);
            }

            $employee->delete();

            return response()->json([
                'status' => true,
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $employee = Employee::findOrFail($id);
            $employee->status = $employee->status == 1 ? 0 : 1;
            $employee->save();

            return response()->json([
                'status' => true,
                'message' => 'Employee status updated successfully',
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function activateDeactivate($op, $id)
    {
        if ($op == 1) {
            $new = ['status' => 1];
        } else {
            $new = ['status' => 0];
        }

        $result = Employee::where('id', $id)->update($new);

        if ($result) {
            if ($op == 1)
                return response()->json(['msg' => 'Employee successfully activated!', 'status' => true]);
            else
                return response()->json(['msg' => 'Employee successfully deactivated!', 'status' => true]);
        } else {
            return response()->json(['msg' => 'Something wrong, try again!', 'status' => false]);
        }
    }
}
