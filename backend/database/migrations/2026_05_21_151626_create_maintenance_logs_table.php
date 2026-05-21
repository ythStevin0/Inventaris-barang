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
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('reported_by')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->enum('type', ['maintenance', 'kerusakan', 'kehilangan']);
            $table->text('description');
            $table->enum('status', ['reported', 'in_progress', 'resolved'])->default('reported');
            $table->date('maintenance_date')->nullable();
            $table->date('resolved_date')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
