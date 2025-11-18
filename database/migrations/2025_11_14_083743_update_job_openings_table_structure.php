<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_openings', function (Blueprint $table) {
            // Drop foreign keys first if they exist
            if (Schema::hasColumn('job_openings', 'department_id')) {
                $table->dropForeign(['department_id']);
            }
            if (Schema::hasColumn('job_openings', 'created_by')) {
                $table->dropForeign(['created_by']);
            }

            // Drop old columns if they exist
            $columnsToRemove = [
                'job_category_id',
                'department_id',
                'requirements',
                'responsibilities',
                'location',
                'employment_type',
                'experience_required',
                'salary_range',
                'number_of_positions',
                'posting_date',
                'closing_date',
                'created_by'
            ];

            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('job_openings', $column)) {
                    $table->dropColumn($column);
                }
            }

            // Add new columns if they don't exist
            if (!Schema::hasColumn('job_openings', 'job_position')) {
                $table->string('job_position')->nullable()->after('job_title');
            }
            if (!Schema::hasColumn('job_openings', 'job_location')) {
                $table->string('job_location')->nullable()->after('job_position');
            }
            if (!Schema::hasColumn('job_openings', 'job_closing_date')) {
                $table->date('job_closing_date')->nullable()->after('job_description');
            }
            if (!Schema::hasColumn('job_openings', 'job_details')) {
                $table->text('job_details')->nullable()->after('job_closing_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_openings', function (Blueprint $table) {
            // Only remove the new columns added
            if (Schema::hasColumn('job_openings', 'job_position')) {
                $table->dropColumn('job_position');
            }
            if (Schema::hasColumn('job_openings', 'job_location')) {
                $table->dropColumn('job_location');
            }
            if (Schema::hasColumn('job_openings', 'job_closing_date')) {
                $table->dropColumn('job_closing_date');
            }
            if (Schema::hasColumn('job_openings', 'job_details')) {
                $table->dropColumn('job_details');
            }
        });
    }
};
