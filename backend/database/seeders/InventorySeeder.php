<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\ItemUnit;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Elektronik',
                'description' => 'Perangkat elektronik untuk kegiatan UKM dan himpunan.',
            ],
            [
                'name' => 'Furnitur',
                'description' => 'Perabot dan perlengkapan ruang sekretariat.',
            ],
            [
                'name' => 'ATK',
                'description' => 'Alat tulis kantor dan perlengkapan administrasi.',
            ],
            [
                'name' => 'Konsumsi',
                'description' => 'Barang habis pakai untuk kebutuhan konsumsi.',
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::updateOrCreate(
                ['name' => $categoryData['name']],
                $categoryData
            );
        }

        $elektronik = Category::where('name', 'Elektronik')->firstOrFail();
        $furnitur = Category::where('name', 'Furnitur')->firstOrFail();
        $atk = Category::where('name', 'ATK')->firstOrFail();
        $konsumsi = Category::where('name', 'Konsumsi')->firstOrFail();

        $items = [
            [
                'lookup' => ['item_code' => 'PRJ'],
                'data' => [
                    'category_id' => $elektronik->id,
                    'name' => 'Proyektor Epson',
                    'description' => 'Proyektor utama untuk presentasi dan seminar.',
                    'type' => 'durable',
                    'unit' => 'unit',
                    'stock_total' => 2,
                    'stock_available' => 1,
                    'stock_damaged' => 0,
                    'location' => 'Lemari Elektronik',
                    'brand' => 'Epson',
                    'image' => null,
                ],
            ],
            [
                'lookup' => ['item_code' => 'KRS'],
                'data' => [
                    'category_id' => $furnitur->id,
                    'name' => 'Kursi Lipat',
                    'description' => 'Kursi lipat untuk rapat dan kegiatan internal.',
                    'type' => 'durable',
                    'unit' => 'unit',
                    'stock_total' => 5,
                    'stock_available' => 4,
                    'stock_damaged' => 1,
                    'location' => 'Gudang Utama',
                    'brand' => 'Krisbow',
                    'image' => null,
                ],
            ],
            [
                'lookup' => ['item_code' => 'MIC'],
                'data' => [
                    'category_id' => $elektronik->id,
                    'name' => 'Mic Wireless',
                    'description' => 'Mikrofon wireless untuk acara dan dokumentasi.',
                    'type' => 'durable',
                    'unit' => 'unit',
                    'stock_total' => 2,
                    'stock_available' => 2,
                    'stock_damaged' => 0,
                    'location' => 'Lemari Elektronik',
                    'brand' => 'Sony',
                    'image' => null,
                ],
            ],
            [
                'lookup' => ['item_code' => 'TINTA'],
                'data' => [
                    'category_id' => $atk->id,
                    'name' => 'Tinta Printer',
                    'description' => 'Tinta cadangan untuk printer sekretariat.',
                    'type' => 'consumable',
                    'unit' => 'botol',
                    'stock_total' => 12,
                    'stock_available' => 10,
                    'stock_damaged' => 0,
                    'location' => 'Rak ATK',
                    'brand' => 'Epson',
                    'image' => null,
                ],
            ],
            [
                'lookup' => ['item_code' => 'GALON'],
                'data' => [
                    'category_id' => $konsumsi->id,
                    'name' => 'Galon Air',
                    'description' => 'Stok galon air minum untuk sekretariat.',
                    'type' => 'consumable',
                    'unit' => 'galon',
                    'stock_total' => 8,
                    'stock_available' => 6,
                    'stock_damaged' => 0,
                    'location' => 'Area Dapur',
                    'brand' => 'Aqua',
                    'image' => null,
                ],
            ],
            [
                'lookup' => ['item_code' => 'SPD'],
                'data' => [
                    'category_id' => $atk->id,
                    'name' => 'Spidol Whiteboard',
                    'description' => 'Spidol untuk papan tulis ruang rapat.',
                    'type' => 'consumable',
                    'unit' => 'pcs',
                    'stock_total' => 20,
                    'stock_available' => 18,
                    'stock_damaged' => 0,
                    'location' => 'Rak ATK',
                    'brand' => 'Snowman',
                    'image' => null,
                ],
            ],
        ];

        foreach ($items as $itemData) {
            Item::updateOrCreate(
                $itemData['lookup'],
                $itemData['data']
            );
        }

        $projector = Item::where('item_code', 'PRJ')->firstOrFail();
        $chairs = Item::where('item_code', 'KRS')->firstOrFail();
        $microphone = Item::where('item_code', 'MIC')->firstOrFail();

        $itemUnits = [
            [
                'lookup' => ['unit_code' => 'PRJ-0001'],
                'data' => [
                    'item_id' => $projector->id,
                    'qr_code' => 'QR-PRJ-0001',
                    'condition' => 'baik',
                    'status' => 'borrowed',
                    'notes' => 'Sedang dipinjam untuk presentasi kegiatan.',
                    'last_borrowed_at' => '2026-05-21 09:00:00',
                ],
            ],
            [
                'lookup' => ['unit_code' => 'PRJ-0002'],
                'data' => [
                    'item_id' => $projector->id,
                    'qr_code' => 'QR-PRJ-0002',
                    'condition' => 'baik',
                    'status' => 'available',
                    'notes' => 'Siap dipinjam.',
                    'last_borrowed_at' => null,
                ],
            ],
            [
                'lookup' => ['unit_code' => 'KRS-0001'],
                'data' => [
                    'item_id' => $chairs->id,
                    'qr_code' => 'QR-KRS-0001',
                    'condition' => 'baik',
                    'status' => 'available',
                    'notes' => null,
                    'last_borrowed_at' => null,
                ],
            ],
            [
                'lookup' => ['unit_code' => 'KRS-0002'],
                'data' => [
                    'item_id' => $chairs->id,
                    'qr_code' => 'QR-KRS-0002',
                    'condition' => 'baik',
                    'status' => 'available',
                    'notes' => null,
                    'last_borrowed_at' => null,
                ],
            ],
            [
                'lookup' => ['unit_code' => 'KRS-0003'],
                'data' => [
                    'item_id' => $chairs->id,
                    'qr_code' => 'QR-KRS-0003',
                    'condition' => 'rusak',
                    'status' => 'maintenance',
                    'notes' => 'Kaki kursi retak, menunggu perbaikan.',
                    'last_borrowed_at' => '2026-05-13 15:00:00',
                ],
            ],
            [
                'lookup' => ['unit_code' => 'KRS-0004'],
                'data' => [
                    'item_id' => $chairs->id,
                    'qr_code' => 'QR-KRS-0004',
                    'condition' => 'baik',
                    'status' => 'available',
                    'notes' => null,
                    'last_borrowed_at' => null,
                ],
            ],
            [
                'lookup' => ['unit_code' => 'KRS-0005'],
                'data' => [
                    'item_id' => $chairs->id,
                    'qr_code' => 'QR-KRS-0005',
                    'condition' => 'baik',
                    'status' => 'available',
                    'notes' => null,
                    'last_borrowed_at' => null,
                ],
            ],
            [
                'lookup' => ['unit_code' => 'MIC-0001'],
                'data' => [
                    'item_id' => $microphone->id,
                    'qr_code' => 'QR-MIC-0001',
                    'condition' => 'baik',
                    'status' => 'available',
                    'notes' => null,
                    'last_borrowed_at' => null,
                ],
            ],
            [
                'lookup' => ['unit_code' => 'MIC-0002'],
                'data' => [
                    'item_id' => $microphone->id,
                    'qr_code' => 'QR-MIC-0002',
                    'condition' => 'baik',
                    'status' => 'available',
                    'notes' => null,
                    'last_borrowed_at' => null,
                ],
            ],
        ];

        foreach ($itemUnits as $itemUnitData) {
            ItemUnit::updateOrCreate(
                $itemUnitData['lookup'],
                $itemUnitData['data']
            );
        }
    }
}
