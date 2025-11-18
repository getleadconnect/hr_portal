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
        Schema::create('job_openings', function (Blueprint $table) {
            $table->id();
            $table->string('job_title');
            $table->unsignedInteger('job_category_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->text('job_description')->nullable();
            $table->text('requirements')->nullable();
            $table->text('responsibilities')->nullable();
            $table->string('location')->nullable();
            $table->enum('employment_type', ['Full-time', 'Part-time', 'Contract', 'Internship'])->default('Full-time');
            $table->string('experience_required')->nullable();
            $table->string('salary_range')->nullable();
            $table->integer('number_of_positions')->default(1);
            $table->date('posting_date')->nullable();
            $table->date('closing_date')->nullable();
            $table->tinyInteger('status')->default(1)->comment('1=Active, 0=Inactive');
            $table->unsignedInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys (skip job_category_id due to type mismatch with existing table)
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_openings');
    }
};
