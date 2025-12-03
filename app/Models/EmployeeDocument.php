<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeDocument extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    protected $table = 'employee_documents';

    // Validation rules for creating document
    public static function createRules()
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'document_name' => 'required|string|max:255',
            'file' => 'required|file|max:10240', // 10MB max
        ];
    }

    // Relationship with Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Relationship with User (uploaded_by)
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // Get formatted file size
    public function getFormattedFileSizeAttribute()
    {
        $bytes = $this->file_size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 0) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}
