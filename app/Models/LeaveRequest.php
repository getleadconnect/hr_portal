<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveRequest extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    protected $table = 'leave_requests';

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    // Leave type constants
    const TYPE_ANNUAL = 'Annual Leave';
    const TYPE_SICK = 'Sick Leave';
    const TYPE_CASUAL = 'Casual Leave';

    // Validation rules for creating leave request
    public static function createRules()
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|in:Annual Leave,Sick Leave,Casual Leave',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'days' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:1000',
        ];
    }

    // Validation rules for updating leave request
    public static function updateRules($id)
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|in:Annual Leave,Sick Leave,Casual Leave',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'days' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:1000',
        ];
    }

    // Relationship with Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Relationship with User (approved_by)
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scope for filtering by status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope for filtering by employee
    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    // Scope for filtering by leave type
    public function scopeByLeaveType($query, $leaveType)
    {
        return $query->where('leave_type', $leaveType);
    }
}
