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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('gpa_current', 3, 2)->nullable()->after('profile_photo_url');
            $table->decimal('gpa_target', 3, 2)->nullable()->after('gpa_current');
            $table->integer('target_study_hours')->nullable()->after('gpa_target');
            $table->string('address', 500)->nullable()->after('target_study_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['gpa_current', 'gpa_target', 'target_study_hours', 'address']);
        });
    }
};
