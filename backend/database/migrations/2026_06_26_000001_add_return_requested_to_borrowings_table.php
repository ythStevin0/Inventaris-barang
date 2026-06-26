<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * PostgreSQL menyimpan enum Laravel sebagai varchar + CHECK constraint.
     * Kita perlu drop constraint lama dan buat ulang dengan value baru.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE borrowings DROP CONSTRAINT borrowings_status_check");
        DB::statement("ALTER TABLE borrowings ADD CONSTRAINT borrowings_status_check CHECK (status::text = ANY (ARRAY['pending', 'approved', 'rejected', 'return_requested', 'returned']::text[]))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE borrowings DROP CONSTRAINT borrowings_status_check");
        DB::statement("ALTER TABLE borrowings ADD CONSTRAINT borrowings_status_check CHECK (status::text = ANY (ARRAY['pending', 'approved', 'rejected', 'returned']::text[]))");
    }
};
