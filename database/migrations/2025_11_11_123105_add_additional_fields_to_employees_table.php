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
            if (!Schema::hasColumn('employees', 'technology_stack')) {
                $table->text('technology_stack')->nullable()->after('qualification');
            }
            if (!Schema::hasColumn('employees', 'join_date')) {
                $table->date('join_date')->nullable()->after('technology_stack');
            }
            if (!Schema::hasColumn('employees', 'releaving_date')) {
                $table->date('releaving_date')->nullable()->after('join_date');
            }
            if (!Schema::hasColumn('employees', 'experience_certificate')) {
                $table->string('experience_certificate')->nullable()->after('pancard_file');
            }
            if (!Schema::hasColumn('employees', 'other_document')) {
                $table->string('other_document')->nullable()->after('experience_certificate');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['technology_stack', 'join_date', 'releaving_date', 'experience_certificate', 'other_document']);
        });
    }
};
