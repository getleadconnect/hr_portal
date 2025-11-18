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
            // Add job_category_id column
            if (!Schema::hasColumn('job_openings', 'job_category_id')) {
                $table->unsignedInteger('job_category_id')->nullable()->after('job_title');
            }

            // Add job_designation_id column
            if (!Schema::hasColumn('job_openings', 'job_designation_id')) {
                $table->unsignedBigInteger('job_designation_id')->nullable()->after('job_category_id');
            }

            // Drop old job_position column if it exists
            if (Schema::hasColumn('job_openings', 'job_position')) {
                $table->dropColumn('job_position');
            }

            // Add foreign key constraints
            $table->foreign('job_category_id')->references('id')->on('job_category')->onDelete('set null');
            $table->foreign('job_designation_id')->references('id')->on('designations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_openings', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['job_category_id']);
            $table->dropForeign(['job_designation_id']);

            // Drop columns
            if (Schema::hasColumn('job_openings', 'job_category_id')) {
                $table->dropColumn('job_category_id');
            }
            if (Schema::hasColumn('job_openings', 'job_designation_id')) {
                $table->dropColumn('job_designation_id');
            }

            // Add back job_position column
            if (!Schema::hasColumn('job_openings', 'job_position')) {
                $table->string('job_position')->nullable()->after('job_title');
            }
        });
    }
};
