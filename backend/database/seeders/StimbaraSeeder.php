<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StimbaraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Seed Categories
        $categories = [
            ['name' => 'Tenda & Shelter', 'description' => 'Perlengkapan untuk mendirikan tempat bernaung atau tidur di alam bebas.'],
            ['name' => 'Alat Masak & Logistik', 'description' => 'Peralatan memasak dan perlengkapan logistik lapangan.'],
            ['name' => 'Alat Panjat (Climbing)', 'description' => 'Perlengkapan safety dan teknis untuk aktivitas panjat tebing.'],
            ['name' => 'Navigasi & Komunikasi', 'description' => 'Alat bantu navigasi darat dan komunikasi tim.'],
            ['name' => 'Tas & Carrier', 'description' => 'Ransel gunung, carrier, daypack, dan tas perlengkapan lainnya.'],
        ];

        $categoryIds = [];
        foreach ($categories as $cat) {
            $categoryIds[$cat['name']] = DB::table('categories')->insertGetId([
                'name' => $cat['name'],
                'description' => $cat['description'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Seed Items
        $items = [
            [
                'category_id' => $categoryIds['Tenda & Shelter'],
                'item_code' => 'TND-001',
                'name' => 'Tenda Dome 4 Orang (Consina)',
                'description' => 'Tenda dome double layer kapasitas 4 orang, warna oren.',
                'type' => 'durable',
                'unit' => 'Set',
                'stock_total' => 5,
                'stock_available' => 5,
                'stock_damaged' => 0,
                'location' => 'Gudang Utama - Rak A1',
                'brand' => 'Consina',
            ],
            [
                'category_id' => $categoryIds['Tenda & Shelter'],
                'item_code' => 'TND-002',
                'name' => 'Flysheet 3x4 Meter',
                'description' => 'Flysheet waterproof untuk atap tambahan bivak/tenda.',
                'type' => 'durable',
                'unit' => 'Pcs',
                'stock_total' => 10,
                'stock_available' => 9,
                'stock_damaged' => 1,
                'location' => 'Gudang Utama - Rak A2',
                'brand' => 'Eiger',
            ],
            [
                'category_id' => $categoryIds['Alat Masak & Logistik'],
                'item_code' => 'MSK-001',
                'name' => 'Nesting Bulat (Cooking Set)',
                'description' => 'Cooking set lengkap isi 3 panci bulat bahan aluminium.',
                'type' => 'durable',
                'unit' => 'Set',
                'stock_total' => 8,
                'stock_available' => 8,
                'stock_damaged' => 0,
                'location' => 'Gudang Utama - Rak B1',
                'brand' => 'DS',
            ],
            [
                'category_id' => $categoryIds['Alat Masak & Logistik'],
                'item_code' => 'MSK-002',
                'name' => 'Kompor Portable Mawar',
                'description' => 'Kompor lapangan gas kaleng portabel tipe mawar (windproof).',
                'type' => 'durable',
                'unit' => 'Pcs',
                'stock_total' => 12,
                'stock_available' => 10,
                'stock_damaged' => 2,
                'location' => 'Gudang Utama - Rak B1',
                'brand' => 'Kovar',
            ],
            [
                'category_id' => $categoryIds['Alat Panjat (Climbing)'],
                'item_code' => 'PJT-001',
                'name' => 'Tali Karmantel Statis 50m',
                'description' => 'Tali statis 10.5mm panjang 50 meter warna putih strip merah.',
                'type' => 'durable',
                'unit' => 'Roll',
                'stock_total' => 3,
                'stock_available' => 3,
                'stock_damaged' => 0,
                'location' => 'Lemari Besi 1',
                'brand' => 'Beal',
            ],
            [
                'category_id' => $categoryIds['Alat Panjat (Climbing)'],
                'item_code' => 'PJT-002',
                'name' => 'Carabiner Screw Gate',
                'description' => 'Carabiner alloy dengan pengunci screw.',
                'type' => 'durable',
                'unit' => 'Pcs',
                'stock_total' => 20,
                'stock_available' => 20,
                'stock_damaged' => 0,
                'location' => 'Lemari Besi 1',
                'brand' => 'Petzl',
            ],
            [
                'category_id' => $categoryIds['Alat Panjat (Climbing)'],
                'item_code' => 'PJT-003',
                'name' => 'Harness Full Body',
                'description' => 'Sabuk pengaman panjat tebing full body.',
                'type' => 'durable',
                'unit' => 'Pcs',
                'stock_total' => 5,
                'stock_available' => 5,
                'stock_damaged' => 0,
                'location' => 'Lemari Besi 1',
                'brand' => 'Camp',
            ],
            [
                'category_id' => $categoryIds['Navigasi & Komunikasi'],
                'item_code' => 'NVK-001',
                'name' => 'HT (Handy Talky) Baofeng',
                'description' => 'HT Baofeng UV-5R Dual Band lengkap dengan charger.',
                'type' => 'durable',
                'unit' => 'Unit',
                'stock_total' => 6,
                'stock_available' => 6,
                'stock_damaged' => 0,
                'location' => 'Laci Meja Piket',
                'brand' => 'Baofeng',
            ],
            [
                'category_id' => $categoryIds['Navigasi & Komunikasi'],
                'item_code' => 'NVK-002',
                'name' => 'Kompas Bidik Prisma',
                'description' => 'Kompas bidik militer warna hijau olive.',
                'type' => 'durable',
                'unit' => 'Pcs',
                'stock_total' => 10,
                'stock_available' => 9,
                'stock_damaged' => 1,
                'location' => 'Laci Meja Piket',
                'brand' => 'Suunto',
            ],
            [
                'category_id' => $categoryIds['Tas & Carrier'],
                'item_code' => 'TAS-001',
                'name' => 'Carrier 60L',
                'description' => 'Ransel gunung kapasitas 60 liter warna hitam.',
                'type' => 'durable',
                'unit' => 'Pcs',
                'stock_total' => 4,
                'stock_available' => 4,
                'stock_damaged' => 0,
                'location' => 'Gudang Utama - Rak C1',
                'brand' => 'Arei',
            ],
        ];

        foreach ($items as $item) {
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
            DB::table('items')->insert($item);
        }
    }
}
