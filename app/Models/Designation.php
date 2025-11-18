<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Designation extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $primaryKey = 'id';
    protected $table = 'designations';

    // Status constants
    const ACTIVE = 1;
    const INACTIVE = 0;

    // Validation rules
    public static function rules()
    {
        return [
            'designation_name' => 'required|string|max:255|unique:designations,designation_name',
        ];
    }

    public static function updateRules($id)
    {
        return [
            'designation_name' => 'required|string|max:255|unique:designations,designation_name,' . $id,
        ];
    }

    // Scope for active designations
    public function scopeActive($query)
    {
        return $query->where('status', self::ACTIVE);
    }

    // Check if designation is active
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
