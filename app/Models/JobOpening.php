<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOpening extends Model
{
    protected $guarded = [];

    protected $primaryKey = 'id';
    protected $table = 'job_openings';

    // Status constants
    const ACTIVE = 1;
    const INACTIVE = 0;


    // Scope for active job openings
    public function scopeActive($query)
    {
        return $query->where('status', self::ACTIVE);
    }

    // Check if job opening is active
    public function isActive()
    {
        return $this->status == self::ACTIVE;
    }

    // Relationships
    public function jobCategory()
    {
        return $this->belongsTo(JobCategory::class, 'job_category_id');
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class, 'job_designation_id');
    }

    // Validation rules for creation
    public static function createRules()
    {
        return [
            'job_title' => 'required|string|max:255',
            'job_category_id' => 'nullable|integer|exists:job_category,id',
            'job_designation_id' => 'nullable|integer|exists:designations,id',
            'job_location' => 'nullable|string|max:255',
            'job_description' => 'nullable|string',
            'job_closing_date' => 'nullable|date',
            'job_details' => 'nullable|string',
        ];
    }

    // Validation rules for updates
    public static function updateRules($id)
    {
        return [
            'job_title' => 'required|string|max:255',
            'job_category_id' => 'nullable|integer|exists:job_category,id',
            'job_designation_id' => 'nullable|integer|exists:designations,id',
            'job_location' => 'nullable|string|max:255',
            'job_description' => 'nullable|string',
            'job_closing_date' => 'nullable|date',
            'job_details' => 'nullable|string',
        ];
    }
}
