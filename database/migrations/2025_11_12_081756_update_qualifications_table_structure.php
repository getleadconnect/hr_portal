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
        Schema::table('qualifications', function (Blueprint $table) {
            // Add missing fields
            $table->unsignedBigInteger('created_by')->nullable()->after('qualification');
            $table->tinyInteger('status')->default(1)->after('created_by');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qualifications', function (Blueprint $table) {
            // Remove added fields
            $table->dropColumn(['created_by', 'status']);
            $table->dropSoftDeletes();
        });
    }
};
