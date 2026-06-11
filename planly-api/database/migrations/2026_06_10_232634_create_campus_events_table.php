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
        Schema::create('campus_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('event_name');
            $table->string('category');
            $table->text('description')->nullable();
            $table->date('event_date');
            $table->string('start_time');
            $table->string('end_time');
            $table->string('location');
            $table->string('organizer');
            $table->string('color_hex')->default('#6B7280');
            $table->boolean('is_important')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campus_events');
    }
};
