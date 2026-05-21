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
            $table->enum('role', ['admin', 'pengurus', 'anggota'])->default('anggota')->after('email');
            $table->string('nim_nip')->nullable()->after('role');
            $table->string('no_hp')->nullable()->after('nim_nip');
            $table->boolean('is_active')->default(true)->after('no_hp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'nim_nip', 'no_hp', 'is_active']);
        });
    }
};
