<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('New', 'Short Listed', 'Appointed', 'Rejected', 'Not fit for this job', 'Not Interested', 'No vacancies now', 'Not Joined') DEFAULT 'New'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('New', 'Short Listed', 'Appointed', 'Rejected', 'Not fit for this job', 'Not Interested', 'No vacancies now') DEFAULT 'New'");
    }
};
