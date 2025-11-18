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
        Schema::table('employees', function (Blueprint $table) {
            // Drop old ID columns if they exist
            if (Schema::hasColumn('employees', 'qualification_id')) {
                $table->dropColumn('qualification_id');
            }
            if (Schema::hasColumn('employees', 'department_id')) {
                $table->dropColumn('department_id');
            }
            if (Schema::hasColumn('employees', 'designation_id')) {
                $table->dropColumn('designation_id');
            }

            // Add string columns for storing names directly
            if (!Schema::hasColumn('employees', 'qualification')) {
                $table->string('qualification')->nullable()->after('marital_status');
            }
            if (!Schema::hasColumn('employees', 'department')) {
                $table->string('department')->nullable()->after('job_title');
            }
            if (!Schema::hasColumn('employees', 'designation')) {
                $table->string('designation')->nullable()->after('department');
            }

            // Add starting_salary column if not exists
            if (!Schema::hasColumn('employees', 'starting_salary')) {
                $table->decimal('starting_salary', 10, 2)->nullable()->after('work_location');
            }

            // Add verified_by, verification_date, verification_remarks if not exists
            if (!Schema::hasColumn('employees', 'verified_by')) {
                $table->string('verified_by')->nullable()->after('ifsc_code');
            }
            if (!Schema::hasColumn('employees', 'verification_date')) {
                $table->date('verification_date')->nullable()->after('verified_by');
            }
            if (!Schema::hasColumn('employees', 'verification_remarks')) {
                $table->text('verification_remarks')->nullable()->after('verification_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Restore ID columns
            $table->integer('qualification_id')->nullable();
            $table->integer('department_id')->nullable();
            $table->integer('designation_id')->nullable();

            // Drop string columns
            $table->dropColumn(['qualification', 'department', 'designation', 'starting_salary', 'verified_by', 'verification_date', 'verification_remarks']);
        });
    }
};
