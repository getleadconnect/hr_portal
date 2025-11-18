<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $primaryKey = 'id';
    protected $table = 'departments';

    // Status constants
    const ACTIVE = 1;
    const INACTIVE = 0;

    // Validation rules
    public static function rules()
    {
        return [
            'department_name' => 'required|string|max:255|unique:departments,department_name',
        ];
    }

    public static function updateRules($id)
    {
        return [
            'department_name' => 'required|string|max:255|unique:departments,department_name,' . $id,
        ];
    }

    // Scope for active departments
    public function scopeActive($query)
    {
        return $query->where('status', self::ACTIVE);
    }

    // Check if department is active
    public function isActive()
    {
        return $this->status == self::ACTIVE;
    }

    // Relationship with creator
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
