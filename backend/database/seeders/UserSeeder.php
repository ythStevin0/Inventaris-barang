<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        User::updateOrCreate(
            ['email' => 'admin@inventaris.test'],
            [
                'name' => 'Admin Inventaris',
                'role' => 'admin',
                'nim_nip' => 'ADM001',
                'no_hp' => '081200000001',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => $password,
            ]
        );

        User::updateOrCreate(
            ['email' => 'pengurus@inventaris.test'],
            [
                'name' => 'Pengurus UKM',
                'role' => 'pengurus',
                'nim_nip' => 'PNG001',
                'no_hp' => '081200000002',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => $password,
            ]
        );

        User::updateOrCreate(
            ['email' => 'anggota@inventaris.test'],
            [
                'name' => 'Anggota Demo',
                'role' => 'anggota',
                'nim_nip' => 'AGT001',
                'no_hp' => '081200000003',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => $password,
            ]
        );

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'role' => 'anggota',
                'nim_nip' => 'TST001',
                'no_hp' => '081200000004',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => $password,
            ]
        );
    }
}
