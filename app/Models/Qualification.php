<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Qualification extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $primaryKey = 'id';
    protected $table = 'qualifications';

   
    // Validation rules
    public static function rules()
    {
        return [
            'qualification' => 'required|string|max:255|unique:qualifications,qualification',
        ];
    }

    public static function updateRules($id)
    {
        return [
            'qualification' => 'required|string|max:255|unique:qualifications,qualification,' . $id,
        ];
    }

    // Relationship with creator
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
