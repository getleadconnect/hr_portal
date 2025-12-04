<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Allowance extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    protected $table = 'allowances';

    // Status constants
    const ACTIVE = 1;
    const INACTIVE = 0;

    // Validation rules for creation
    public static function createRules()
    {
        return [
            'allowance_type' => 'required|string|max:255|unique:allowances,allowance_type,NULL,id,deleted_at,NULL',
            'percentage' => 'required|numeric|min:0|max:100',
        ];
    }

    // Validation rules for updates
    public static function updateRules($id)
    {
        return [
            'allowance_type' => 'required|string|max:255|unique:allowances,allowance_type,' . $id . ',id,deleted_at,NULL',
            'percentage' => 'required|numeric|min:0|max:100',
        ];
    }

    // Scope for active allowances
    public function scopeActive($query)
    {
        return $query->where('status', self::ACTIVE);
    }

    // Relationship with creator
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
