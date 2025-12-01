<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $guarded = [];
    protected $table = 'attendances';

    // Status constants
    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_ON_LEAVE = 'on_leave';
    const STATUS_HALF_DAY = 'half_day';

    // Validation rules for creating attendance
    public static function createRules()
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'attendance_date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'status' => 'required|in:present,absent,on_leave,half_day',
            'remarks' => 'nullable|string|max:500',
        ];
    }

    // Validation rules for updating attendance
    public static function updateRules($id)
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'attendance_date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'status' => 'required|in:present,absent,on_leave,half_day',
            'remarks' => 'nullable|string|max:500',
        ];
    }

    // Relationship with Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Calculate hours worked
    public function calculateHours()
    {
        if ($this->check_in && $this->check_out) {
            $checkIn = \Carbon\Carbon::parse($this->check_in);
            $checkOut = \Carbon\Carbon::parse($this->check_out);
            return round($checkOut->diffInMinutes($checkIn) / 60, 2);
        }
        return null;
    }

    // Scope for filtering by date
    public function scopeForDate($query, $date)
    {
        return $query->where('attendance_date', $date);
    }

    // Scope for filtering by status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
