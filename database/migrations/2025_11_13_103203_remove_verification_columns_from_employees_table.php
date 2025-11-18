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
            // Drop verification columns
            if (Schema::hasColumn('employees', 'verified_by')) {
                $table->dropColumn('verified_by');
            }
            if (Schema::hasColumn('employees', 'verification_date')) {
                $table->dropColumn('verification_date');
            }
            if (Schema::hasColumn('employees', 'verification_remarks')) {
                $table->dropColumn('verification_remarks');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Restore verification columns
            $table->string('verified_by')->nullable();
            $table->date('verification_date')->nullable();
            $table->text('verification_remarks')->nullable();
        });
    }
};
