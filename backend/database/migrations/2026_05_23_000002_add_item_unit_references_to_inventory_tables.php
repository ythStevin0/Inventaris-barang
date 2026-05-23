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
        Schema::table('borrowing_items', function (Blueprint $table) {
            $table->foreignId('item_unit_id')
                ->nullable()
                ->after('item_id')
                ->constrained('item_units')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });

        Schema::table('maintenance_logs', function (Blueprint $table) {
            $table->foreignId('item_unit_id')
                ->nullable()
                ->after('item_id')
                ->constrained('item_units')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('item_unit_id')
                ->nullable()
                ->after('item_id')
                ->constrained('item_units')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('item_unit_id');
        });

        Schema::table('maintenance_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('item_unit_id');
        });

        Schema::table('borrowing_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('item_unit_id');
        });
    }
};
