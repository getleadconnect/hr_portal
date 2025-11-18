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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            // Personal Information
            $table->string('profile_image')->nullable();
            $table->string('full_name');
            $table->string('employee_id')->unique();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->string('marital_status')->nullable();
            $table->string('qualification')->nullable();

            // Contact Information
            $table->string('mobile_number');
            $table->string('alternative_number_1')->nullable();
            $table->string('alternative_number_2')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_number')->nullable();
            $table->string('relationship')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();

            // Employment Details
            $table->string('job_title')->nullable();
            $table->string('department')->nullable();
            $table->date('date_of_hire')->nullable();
            $table->string('work_location')->nullable();

            // Additional Details
            $table->string('aadhar_number')->nullable();
            $table->string('aadhar_file')->nullable();
            $table->string('pancard_number')->nullable();
            $table->string('pancard_file')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code')->nullable();

            // Verification
            $table->string('verified_by')->nullable();
            $table->date('verification_date')->nullable();
            $table->text('verification_remarks')->nullable();

            // Status
            $table->tinyInteger('status')->default(1)->comment('1=Active, 0=Inactive');

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
