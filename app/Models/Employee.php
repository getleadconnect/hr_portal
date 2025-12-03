<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $primaryKey = 'id';
    protected $table = 'employees';

    // Status constants
    const ACTIVE = 1;
    const INACTIVE = 0;

    // Validation rules for creating employee
    public static function createRules()
    {
        return [
            'full_name' => 'required|string|max:255',
            'employee_id' => 'required|string|unique:employees,employee_id',
            'mobile_number' => 'required|string|max:15',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:Male,Female,Other',
            'email' => 'nullable|email|max:255',
            'hra' => 'nullable|numeric|min:0|max:100',
            'ta' => 'nullable|numeric|min:0|max:100',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'aadhar_file' => 'nullable|mimes:pdf,jpeg,png,jpg|max:2048',
            'pancard_file' => 'nullable|mimes:pdf,jpeg,png,jpg|max:2048',
        ];
    }

    // Validation rules for updating employee
    public static function updateRules($id)
    {
        return [
            'full_name' => 'sometimes|required|string|max:255',
            'employee_id' => 'sometimes|required|string|unique:employees,employee_id,' . $id,
            'mobile_number' => 'sometimes|required|string|max:15',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:Male,Female,Other',
            'email' => 'nullable|email|max:255',
            'hra' => 'nullable|numeric|min:0|max:100',
            'ta' => 'nullable|numeric|min:0|max:100',
            'salary' => 'nullable|numeric|min:0',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:50',
            'ifsc_code' => 'nullable|string|max:20',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'aadhar_file' => 'nullable|mimes:pdf,jpeg,png,jpg|max:2048',
            'pancard_file' => 'nullable|mimes:pdf,jpeg,png,jpg|max:2048',
        ];
    }

    // Scope for active employees
    public function scopeActive($query)
    {
        return $query->where('status', self::ACTIVE);
    }

    // Check if employee is active
    public function isActive()
    {
        return $this->status == self::ACTIVE;
    }

    // Relationship with Department
    public function departmentRelation()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    // Relationship with Designation
    public function designationRelation()
    {
        return $this->belongsTo(Designation::class, 'designation_id');
    }

    // Relationship with Attendance
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    // Relationship with Leave Requests
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
