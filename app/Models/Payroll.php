<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payroll extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    protected $table = 'payrolls';

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_PAID = 'paid';

    // Validation rules for creating payroll
    public static function createRules()
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'month' => 'required|string',
            'base_salary' => 'required|numeric|min:0',
        ];
    }

    // Validation rules for updating payroll
    public static function updateRules($id)
    {
        return [
            'base_salary' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,approved,paid',
        ];
    }

    // Relationship with Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Relationship with User (processed_by)
    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // Scope for filtering by month
    public function scopeByMonth($query, $month)
    {
        return $query->where('month', $month);
    }

    // Scope for filtering by status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
