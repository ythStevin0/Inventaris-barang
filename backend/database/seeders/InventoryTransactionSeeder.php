<?php

namespace Database\Seeders;

use App\Models\Borrowing;
use App\Models\BorrowingItem;
use App\Models\Item;
use App\Models\ItemUnit;
use App\Models\MaintenanceLog;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventoryTransactionSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@inventaris.test')->firstOrFail();
        $pengurus = User::where('email', 'pengurus@inventaris.test')->firstOrFail();
        $anggota = User::where('email', 'anggota@inventaris.test')->firstOrFail();

        $projector = Item::where('item_code', 'PRJ')->firstOrFail();
        $chairs = Item::where('item_code', 'KRS')->firstOrFail();
        $ink = Item::where('item_code', 'TINTA')->firstOrFail();
        $water = Item::where('item_code', 'GALON')->firstOrFail();

        $projectorUnit = ItemUnit::where('unit_code', 'PRJ-0001')->firstOrFail();
        $chairUnit = ItemUnit::where('unit_code', 'KRS-0003')->firstOrFail();

        $activeBorrowing = Borrowing::updateOrCreate(
            [
                'user_id' => $anggota->id,
                'borrow_date' => '2026-05-21',
                'borrower_name' => 'Anggota Demo',
            ],
            [
                'due_date' => '2026-05-25',
                'return_date' => null,
                'status' => 'approved',
                'purpose' => 'Presentasi proposal kegiatan UKM.',
                'notes' => 'Dipakai di ruang rapat utama.',
                'approved_by' => $admin->id,
                'total_fine' => 0,
            ]
        );

        $returnedBorrowing = Borrowing::updateOrCreate(
            [
                'user_id' => $pengurus->id,
                'borrow_date' => '2026-05-13',
                'borrower_name' => 'Pengurus UKM',
            ],
            [
                'due_date' => '2026-05-14',
                'return_date' => '2026-05-15',
                'status' => 'returned',
                'purpose' => 'Rapat koordinasi panitia acara.',
                'notes' => 'Barang dikembalikan dengan kerusakan pada kaki kursi.',
                'approved_by' => $admin->id,
                'total_fine' => 75000,
            ]
        );

        $activeBorrowingItem = BorrowingItem::updateOrCreate(
            [
                'borrowing_id' => $activeBorrowing->id,
                'item_id' => $projector->id,
                'item_unit_id' => $projectorUnit->id,
            ],
            [
                'quantity' => 1,
                'quantity_damaged' => 0,
                'fine_amount' => 0,
                'condition_before' => 'baik',
                'condition_after' => null,
                'damage_notes' => null,
                'notes' => 'Proyektor dipinjam bersama remote dan kabel HDMI.',
            ]
        );

        $returnedBorrowingItem = BorrowingItem::updateOrCreate(
            [
                'borrowing_id' => $returnedBorrowing->id,
                'item_id' => $chairs->id,
                'item_unit_id' => $chairUnit->id,
            ],
            [
                'quantity' => 1,
                'quantity_damaged' => 1,
                'fine_amount' => 75000,
                'condition_before' => 'baik',
                'condition_after' => 'rusak',
                'damage_notes' => 'Kaki kursi retak saat digunakan.',
                'notes' => 'Perlu tindak lanjut perbaikan atau penggantian.',
            ]
        );

        MaintenanceLog::updateOrCreate(
            [
                'item_id' => $chairs->id,
                'item_unit_id' => $chairUnit->id,
                'reported_by' => $pengurus->id,
                'type' => 'kerusakan',
            ],
            [
                'description' => 'Kursi lipat rusak setelah dipakai pada rapat panitia.',
                'status' => 'in_progress',
                'maintenance_date' => '2026-05-16',
                'resolved_date' => null,
                'resolution_notes' => 'Menunggu pengecekan teknisi internal.',
            ]
        );

        $movements = [
            [
                'lookup' => [
                    'item_id' => $projector->id,
                    'item_unit_id' => null,
                    'created_by' => $admin->id,
                    'borrowing_item_id' => null,
                    'type' => 'initial',
                    'notes' => 'Stok awal proyektor.',
                ],
                'data' => [
                    'quantity' => 2,
                    'stock_before' => 0,
                    'stock_after' => 2,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $projector->id,
                    'item_unit_id' => $projectorUnit->id,
                    'created_by' => $admin->id,
                    'borrowing_item_id' => $activeBorrowingItem->id,
                    'type' => 'borrow',
                    'notes' => 'Peminjaman proyektor untuk presentasi proposal.',
                ],
                'data' => [
                    'quantity' => -1,
                    'stock_before' => 2,
                    'stock_after' => 1,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $chairs->id,
                    'item_unit_id' => null,
                    'created_by' => $admin->id,
                    'borrowing_item_id' => null,
                    'type' => 'initial',
                    'notes' => 'Stok awal kursi lipat.',
                ],
                'data' => [
                    'quantity' => 5,
                    'stock_before' => 0,
                    'stock_after' => 5,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $chairs->id,
                    'item_unit_id' => $chairUnit->id,
                    'created_by' => $admin->id,
                    'borrowing_item_id' => $returnedBorrowingItem->id,
                    'type' => 'borrow',
                    'notes' => 'Peminjaman kursi untuk rapat koordinasi.',
                ],
                'data' => [
                    'quantity' => -1,
                    'stock_before' => 5,
                    'stock_after' => 4,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $chairs->id,
                    'item_unit_id' => $chairUnit->id,
                    'created_by' => $admin->id,
                    'borrowing_item_id' => $returnedBorrowingItem->id,
                    'type' => 'return',
                    'notes' => 'Pengembalian kursi setelah rapat koordinasi.',
                ],
                'data' => [
                    'quantity' => 1,
                    'stock_before' => 4,
                    'stock_after' => 5,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $chairs->id,
                    'item_unit_id' => $chairUnit->id,
                    'created_by' => $pengurus->id,
                    'borrowing_item_id' => $returnedBorrowingItem->id,
                    'type' => 'damage',
                    'notes' => 'Unit kursi dipindahkan ke status rusak setelah pengembalian.',
                ],
                'data' => [
                    'quantity' => -1,
                    'stock_before' => 5,
                    'stock_after' => 4,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $ink->id,
                    'item_unit_id' => null,
                    'created_by' => $admin->id,
                    'borrowing_item_id' => null,
                    'type' => 'initial',
                    'notes' => 'Stok awal tinta printer.',
                ],
                'data' => [
                    'quantity' => 12,
                    'stock_before' => 0,
                    'stock_after' => 12,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $ink->id,
                    'item_unit_id' => null,
                    'created_by' => $pengurus->id,
                    'borrowing_item_id' => null,
                    'type' => 'consume',
                    'notes' => 'Pemakaian tinta printer untuk cetak proposal kegiatan.',
                ],
                'data' => [
                    'quantity' => -2,
                    'stock_before' => 12,
                    'stock_after' => 10,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $water->id,
                    'item_unit_id' => null,
                    'created_by' => $admin->id,
                    'borrowing_item_id' => null,
                    'type' => 'initial',
                    'notes' => 'Stok awal galon air.',
                ],
                'data' => [
                    'quantity' => 8,
                    'stock_before' => 0,
                    'stock_after' => 8,
                ],
            ],
            [
                'lookup' => [
                    'item_id' => $water->id,
                    'item_unit_id' => null,
                    'created_by' => $pengurus->id,
                    'borrowing_item_id' => null,
                    'type' => 'consume',
                    'notes' => 'Pemakaian galon air untuk kebutuhan sekretariat.',
                ],
                'data' => [
                    'quantity' => -2,
                    'stock_before' => 8,
                    'stock_after' => 6,
                ],
            ],
        ];

        foreach ($movements as $movement) {
            StockMovement::updateOrCreate(
                $movement['lookup'],
                $movement['data']
            );
        }
    }
}
