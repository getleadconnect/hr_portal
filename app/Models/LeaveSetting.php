<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveSetting extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    protected $table = 'leave_settings';

    // Leave type constants
    const TYPE_ANNUAL = 'Annual Leave';
    const TYPE_SICK = 'Sick Leave';
    const TYPE_CASUAL = 'Casual Leave';

    // Status constants
    const ACTIVE = 1;
    const INACTIVE = 0;

    // Get available leave types
    public static function getLeaveTypes()
    {
        return [
            self::TYPE_ANNUAL,
            self::TYPE_SICK,
            self::TYPE_CASUAL,
        ];
    }

    // Validation rules for creation
    public static function createRules()
    {
        return [
            'leave_type' => 'required|in:Annual Leave,Sick Leave,Casual Leave|unique:leave_settings,leave_type,NULL,id,deleted_at,NULL',
            'no_of_days' => 'required|integer|min:0',
        ];
    }

    // Validation rules for updates
    public static function updateRules($id)
    {
        return [
            'leave_type' => 'required|in:Annual Leave,Sick Leave,Casual Leave|unique:leave_settings,leave_type,' . $id . ',id,deleted_at,NULL',
            'no_of_days' => 'required|integer|min:0',
        ];
    }

    // Scope for active leave settings
    public function scopeActive($query)
    {
        return $query->where('status', self::ACTIVE);
    }

    // Relationship with creator
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Get leave days by type
    public static function getDaysByType($leaveType)
    {
        $setting = self::where('leave_type', $leaveType)->active()->first();
        return $setting ? $setting->no_of_days : 0;
    }
}
