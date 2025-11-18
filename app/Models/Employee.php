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
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'aadhar_file' => 'nullable|mimes:pdf,jpeg,png,jpg|max:2048',
            'pancard_file' => 'nullable|mimes:pdf,jpeg,png,jpg|max:2048',
        ];
    }

    // Validation rules for updating employee
    public static function updateRules($id)
    {
        return [
            'full_name' => 'required|string|max:255',
            'employee_id' => 'required|string|unique:employees,employee_id,' . $id,
            'mobile_number' => 'required|string|max:15',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:Male,Female,Other',
            'email' => 'nullable|email|max:255',
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
}
