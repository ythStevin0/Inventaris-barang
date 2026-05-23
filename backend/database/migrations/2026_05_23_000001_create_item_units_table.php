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
        Schema::create('item_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('unit_code')->unique();
            $table->string('qr_code')->nullable()->unique();
            $table->enum('condition', ['baik', 'rusak', 'perbaikan', 'hilang'])->default('baik');
            $table->enum('status', ['available', 'borrowed', 'maintenance', 'lost'])->default('available');
            $table->text('notes')->nullable();
            $table->timestamp('last_borrowed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_units');
    }
};
