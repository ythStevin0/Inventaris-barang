<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBorrowingRequest;
use App\Models\Borrowing;
use App\Models\BorrowingItem;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BorrowingController extends Controller
{
    /**
     * Daftar peminjaman.
     * - Anggota: hanya melihat peminjaman miliknya sendiri.
     * - Admin/Pengurus: melihat semua peminjaman.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min($request->integer('per_page', 10), 100));
        $user = $request->user();

        $query = Borrowing::query()
            ->with(['user:id,name,email,nim_nip', 'approver:id,name', 'borrowingItems.item:id,name,item_code,unit'])
            ->latest();

        // Anggota hanya bisa melihat peminjaman sendiri
        if ($user->hasRole('anggota')) {
            $query->where('user_id', $user->id);
        }

        // Filter opsional berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        // Filter opsional berdasarkan pencarian nama peminjam
        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('borrower_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $borrowings = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'status'  => 'success',
            'message' => 'Daftar peminjaman berhasil diambil.',
            'data'    => $borrowings->items(),
            'meta'    => [
                'current_page' => $borrowings->currentPage(),
                'total'        => $borrowings->total(),
                'per_page'     => $borrowings->perPage(),
                'last_page'    => $borrowings->lastPage(),
            ],
        ]);
    }

    /**
     * Detail peminjaman.
     * Anggota hanya boleh melihat peminjaman miliknya sendiri.
     */
    public function show(Request $request, Borrowing $borrowing): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('anggota') && $borrowing->user_id !== $user->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Anda tidak memiliki akses ke peminjaman ini.',
            ], 403);
        }

        $borrowing->load([
            'user:id,name,email,nim_nip,no_hp',
            'approver:id,name',
            'borrowingItems.item:id,name,item_code,unit,stock_available',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Detail peminjaman berhasil diambil.',
            'data'    => $borrowing,
        ]);
    }

    /**
     * Buat pengajuan peminjaman baru (oleh Anggota).
     * Status awal: 'pending'. Stok belum dikurangi sampai disetujui.
     */
    public function store(StoreBorrowingRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $borrowing = DB::transaction(function () use ($validated, $user) {
            // Validasi stok setiap item yang ingin dipinjam
            $itemsData = [];
            foreach ($validated['items'] as $entry) {
                $item = Item::lockForUpdate()->find($entry['item_id']);

                if (! $item) {
                    throw new \RuntimeException("Barang dengan ID {$entry['item_id']} tidak ditemukan.");
                }

                if ($entry['quantity'] > $item->stock_available) {
                    throw new \RuntimeException(
                        "Stok barang \"{$item->name}\" tidak mencukupi. Tersedia: {$item->stock_available}, diminta: {$entry['quantity']}."
                    );
                }

                $itemsData[] = [
                    'item_id'          => $item->id,
                    'quantity'         => $entry['quantity'],
                    'condition_before' => 'baik',
                    'notes'            => $entry['notes'] ?? null,
                ];
            }

            // Buat record borrowing
            $borrowing = Borrowing::create([
                'user_id'       => $user->id,
                'borrower_name' => $validated['borrower_name'],
                'borrow_date'   => $validated['borrow_date'],
                'due_date'      => $validated['due_date'],
                'status'        => 'pending',
                'purpose'       => $validated['purpose'],
                'notes'         => $validated['notes'] ?? null,
            ]);

            // Buat record borrowing_items
            foreach ($itemsData as $itemData) {
                $borrowing->borrowingItems()->create($itemData);
            }

            return $borrowing->load([
                'user:id,name,email,nim_nip',
                'borrowingItems.item:id,name,item_code,unit',
            ]);
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengajuan peminjaman berhasil dibuat. Menunggu persetujuan.',
            'data'    => $borrowing,
        ], 201);
    }

    /**
     * Setujui pengajuan peminjaman (oleh Admin/Pengurus).
     * Stok tersedia dikurangi saat disetujui.
     */
    public function approve(Request $request, Borrowing $borrowing): JsonResponse
    {
        if ($borrowing->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Hanya peminjaman berstatus "pending" yang dapat disetujui.',
            ], 422);
        }

        DB::transaction(function () use ($request, $borrowing) {
            // Kurangi stok tersedia untuk setiap item
            foreach ($borrowing->borrowingItems as $borrowingItem) {
                $item = Item::lockForUpdate()->find($borrowingItem->item_id);

                if ($borrowingItem->quantity > $item->stock_available) {
                    throw new \RuntimeException(
                        "Stok barang \"{$item->name}\" tidak lagi mencukupi. Tersedia: {$item->stock_available}, dibutuhkan: {$borrowingItem->quantity}."
                    );
                }

                $item->decrement('stock_available', $borrowingItem->quantity);
            }

            $borrowing->update([
                'status'      => 'approved',
                'approved_by' => $request->user()->id,
            ]);
        });

        $borrowing->load([
            'user:id,name,email,nim_nip',
            'approver:id,name',
            'borrowingItems.item:id,name,item_code,unit,stock_available',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Peminjaman berhasil disetujui.',
            'data'    => $borrowing,
        ]);
    }

    /**
     * Tolak pengajuan peminjaman (oleh Admin/Pengurus).
     */
    public function reject(Request $request, Borrowing $borrowing): JsonResponse
    {
        if ($borrowing->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Hanya peminjaman berstatus "pending" yang dapat ditolak.',
            ], 422);
        }

        $borrowing->update([
            'status'      => 'rejected',
            'approved_by' => $request->user()->id,
            'notes'       => $request->input('notes', $borrowing->notes),
        ]);

        $borrowing->load([
            'user:id,name,email,nim_nip',
            'approver:id,name',
            'borrowingItems.item:id,name,item_code,unit',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Peminjaman berhasil ditolak.',
            'data'    => $borrowing,
        ]);
    }

    /**
     * Pengajuan pengembalian oleh Anggota.
     * Hanya mengubah status dari 'approved' menjadi 'return_requested'.
     * Tidak ada perubahan stok — menunggu Admin untuk verifikasi fisik.
     */
    public function requestReturn(Request $request, Borrowing $borrowing): JsonResponse
    {
        $user = $request->user();

        // Anggota hanya boleh mengajukan pengembalian miliknya sendiri
        if ($user->hasRole('anggota') && $borrowing->user_id !== $user->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Anda tidak memiliki hak untuk mengajukan pengembalian peminjaman ini.',
            ], 403);
        }

        if ($borrowing->status !== 'approved') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Hanya peminjaman berstatus "approved" yang dapat diajukan pengembaliannya.',
            ], 422);
        }

        $borrowing->update([
            'status' => 'return_requested',
        ]);

        $borrowing->load([
            'user:id,name,email,nim_nip',
            'approver:id,name',
            'borrowingItems.item:id,name,item_code,unit',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengajuan pengembalian berhasil. Menunggu pengecekan oleh pengurus.',
            'data'    => $borrowing,
        ]);
    }

    /**
     * Proses finalisasi pengembalian barang (oleh Admin/Pengurus).
     * Admin bisa memproses dari status 'return_requested' (normal flow)
     * maupun langsung dari status 'approved' (bypass jika anggota lupa).
     * Stok tersedia ditambahkan kembali untuk barang yang kondisinya baik.
     * Barang rusak masuk ke stock_damaged.
     */
    public function returnBorrowing(Request $request, Borrowing $borrowing): JsonResponse
    {
        if (!in_array($borrowing->status, ['approved', 'return_requested'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Hanya peminjaman berstatus "approved" atau "return_requested" yang dapat diproses pengembaliannya.',
            ], 422);
        }

        $request->validate([
            'return_date'                    => ['required', 'date'],
            'items'                          => ['required', 'array', 'min:1'],
            'items.*.borrowing_item_id'      => ['required', 'integer', 'exists:borrowing_items,id'],
            'items.*.condition_after'        => ['required', 'in:baik,rusak,perbaikan'],
            'items.*.quantity_damaged'       => ['nullable', 'integer', 'min:0'],
            'items.*.fine_amount'            => ['nullable', 'numeric', 'min:0'],
            'items.*.damage_notes'           => ['nullable', 'string', 'max:500'],
            'return_proof_image'             => ['nullable', 'image', 'max:2048'],
        ]);

        $validated = $request->all();

        if ($request->hasFile('return_proof_image')) {
            $path = $request->file('return_proof_image')->store('returns', 'public');
            $validated['return_proof_image'] = Storage::url($path);
        }

        DB::transaction(function () use ($validated, $borrowing) {
            $totalFine = 0;

            foreach ($validated['items'] as $entry) {
                $borrowingItem = BorrowingItem::lockForUpdate()->find($entry['borrowing_item_id']);

                // Pastikan borrowing_item ini milik borrowing yang benar
                if ($borrowingItem->borrowing_id !== $borrowing->id) {
                    throw new \RuntimeException('Item peminjaman tidak sesuai.');
                }

                $quantityDamaged = (int) ($entry['quantity_damaged'] ?? 0);
                $fineAmount = (float) ($entry['fine_amount'] ?? 0);

                if ($quantityDamaged > $borrowingItem->quantity) {
                    throw new \RuntimeException(
                        "Jumlah rusak ({$quantityDamaged}) tidak boleh melebihi jumlah dipinjam ({$borrowingItem->quantity})."
                    );
                }

                // Update kondisi borrowing_item
                $borrowingItem->update([
                    'condition_after'  => $entry['condition_after'],
                    'quantity_damaged' => $quantityDamaged,
                    'fine_amount'      => $fineAmount,
                    'damage_notes'     => $entry['damage_notes'] ?? null,
                ]);

                // Update stok barang
                $item = Item::lockForUpdate()->find($borrowingItem->item_id);
                $quantityReturned = $borrowingItem->quantity - $quantityDamaged;

                // Kembalikan stok yang baik ke stock_available
                $item->increment('stock_available', $quantityReturned);

                // Tambahkan stok rusak
                if ($quantityDamaged > 0) {
                    $item->increment('stock_damaged', $quantityDamaged);
                }

                $totalFine += $fineAmount;
            }

            $borrowing->update([
                'status'             => 'returned',
                'return_date'        => $validated['return_date'],
                'total_fine'         => $totalFine,
                'return_proof_image' => $validated['return_proof_image'] ?? null,
            ]);
        });

        $borrowing->load([
            'user:id,name,email,nim_nip',
            'approver:id,name',
            'borrowingItems.item:id,name,item_code,unit,stock_available,stock_damaged',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengembalian barang berhasil diproses.',
            'data'    => $borrowing,
        ]);
    }
}
