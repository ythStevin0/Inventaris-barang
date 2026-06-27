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
        Schema::table('items', function (Blueprint $table) {
            $table->index('name');
            $table->index('type');
            $table->index('is_active');
            // item_code already has a unique index from the creation migration
        });

        Schema::table('borrowings', function (Blueprint $table) {
            $table->index('status');
            $table->index('borrower_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrowings', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['borrower_name']);
        });

        Schema::table('items', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['type']);
            $table->dropIndex(['is_active']);
        });
    }
};
