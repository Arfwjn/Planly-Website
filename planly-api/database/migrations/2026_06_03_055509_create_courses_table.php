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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('course_code');
            $table->string('course_name');
            $table->integer('sks');
            $table->string('lecturer_name');
            $table->string('room');
            $table->string('day_of_week'); // 'Monday', 'Tuesday', etc.
            $table->string('start_time');  // format: "HH:MM"
            $table->string('end_time');    // format: "HH:MM"
            $table->string('color_hex')->default('#3498db');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
