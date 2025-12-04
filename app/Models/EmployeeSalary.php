<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeSalary extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    protected $table = 'employee_salaries';

    protected $casts = [
        'effective_from' => 'date',
        'base_salary' => 'decimal:2',
    ];

    // Validation rules
    public static function createRules()
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'base_salary' => 'required|numeric|min:0',
            'hra_percentage' => 'nullable|numeric|min:0|max:100',
            'ta_percentage' => 'nullable|numeric|min:0|max:100',
            'effective_from' => 'required|date',
            'notes' => 'nullable|string',
        ];
    }

    // Relationship with Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Relationship with User (created_by)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Get current salary for an employee (latest effective)
    public static function getCurrentSalary($employeeId)
    {
        return self::where('employee_id', $employeeId)
            ->where('effective_from', '<=', now()->toDateString())
            ->orderBy('effective_from', 'desc')
            ->first();
    }
}
