<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\Item;
use App\Models\ItemUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $query = Item::query()
            ->with('category')
            ->withCount('itemUnits')
            ->latest();

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));

            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('item_code', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $items = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'status' => 'success',
            'message' => 'Daftar barang berhasil diambil.',
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'last_page' => $items->lastPage(),
            ],
        ]);
    }

    public function store(StoreItemRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $stockTotal = (int) $validated['stock_total'];
        $stockDamaged = (int) ($validated['stock_damaged'] ?? 0);
        $stockAvailable = (int) ($validated['stock_available'] ?? ($stockTotal - $stockDamaged));

        if ($stockDamaged > $stockTotal) {
            return $this->stockValidationError('Jumlah stok rusak tidak boleh melebihi stok total.');
        }

        if ($stockAvailable > $stockTotal) {
            return $this->stockValidationError('Jumlah stok tersedia tidak boleh melebihi stok total.');
        }

        if ($stockAvailable + $stockDamaged > $stockTotal) {
            return $this->stockValidationError('Kombinasi stok tersedia dan stok rusak tidak boleh melebihi stok total.');
        }

        $validated['stock_damaged'] = $stockDamaged;
        $validated['stock_available'] = $stockAvailable;

        $item = DB::transaction(function () use ($validated, $stockDamaged): Item {
            $item = Item::create($validated);

            if ($item->type === 'durable' && $item->stock_total > 0) {
                $this->syncDurableUnits($item, $stockDamaged);
            }

            return $item->load(['category', 'itemUnits']);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Barang berhasil dibuat.',
            'data' => $item,
        ], 201);
    }

    public function show(Item $item): JsonResponse
    {
        $item->load(['category', 'itemUnits', 'maintenanceLogs', 'stockMovements']);

        return response()->json([
            'status' => 'success',
            'message' => 'Detail barang berhasil diambil.',
            'data' => $item,
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item): JsonResponse
    {
        $validated = $request->validated();
        $stockTotal = (int) $validated['stock_total'];
        $stockDamaged = (int) ($validated['stock_damaged'] ?? 0);
        $stockAvailable = (int) ($validated['stock_available'] ?? ($stockTotal - $stockDamaged));

        if ($stockDamaged > $stockTotal) {
            return $this->stockValidationError('Jumlah stok rusak tidak boleh melebihi stok total.');
        }

        if ($stockAvailable > $stockTotal) {
            return $this->stockValidationError('Jumlah stok tersedia tidak boleh melebihi stok total.');
        }

        if ($stockAvailable + $stockDamaged > $stockTotal) {
            return $this->stockValidationError('Kombinasi stok tersedia dan stok rusak tidak boleh melebihi stok total.');
        }

        if ($item->itemUnits()->exists() && $item->type === 'durable' && $validated['type'] === 'consumable') {
            return response()->json([
                'status' => 'error',
                'message' => 'Barang durable yang sudah memiliki unit fisik tidak dapat diubah menjadi consumable.',
                'errors' => [
                    'type' => ['Ubah atau hapus unit barang terlebih dahulu.'],
                ],
            ], 422);
        }

        $validated['stock_damaged'] = $stockDamaged;
        $validated['stock_available'] = $stockAvailable;

        $updatedItem = DB::transaction(function () use ($item, $validated, $stockDamaged): Item|JsonResponse {
            $currentUnitCount = $item->itemUnits()->count();

            if ($validated['type'] === 'durable' && $validated['stock_total'] < $currentUnitCount) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stok total durable tidak boleh lebih kecil dari jumlah unit fisik yang sudah terdaftar.',
                    'errors' => [
                        'stock_total' => ['Kurangi unit fisik terlebih dahulu sebelum menurunkan stok total.'],
                    ],
                ], 422);
            }

            $item->update($validated);

            if ($item->type === 'durable') {
                $this->syncDurableUnits($item, $stockDamaged);
            }

            return $item->load(['category', 'itemUnits']);
        });

        if ($updatedItem instanceof JsonResponse) {
            return $updatedItem;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Barang berhasil diperbarui.',
            'data' => $updatedItem,
        ]);
    }

    public function destroy(Item $item): JsonResponse
    {
        if (
            $item->borrowingItems()->exists() ||
            $item->itemUnits()->exists() ||
            $item->maintenanceLogs()->exists() ||
            $item->stockMovements()->exists()
        ) {
            return response()->json([
                'status' => 'error',
                'message' => 'Barang tidak dapat dihapus karena sudah memiliki data transaksi atau unit terkait.',
                'errors' => [
                    'item' => ['Hapus atau arsipkan relasi terkait terlebih dahulu.'],
                ],
            ], 422);
        }

        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Barang berhasil dihapus.',
            'data' => null,
        ]);
    }

    private function syncDurableUnits(Item $item, int $stockDamaged): void
    {
        $existingCount = $item->itemUnits()->count();

        if ($item->stock_total > $existingCount) {
            for ($index = $existingCount + 1; $index <= $item->stock_total; $index++) {
                ItemUnit::create([
                    'item_id' => $item->id,
                    'unit_code' => sprintf('%s-%04d', $item->item_code, $index),
                    'qr_code' => null,
                    'condition' => $index <= $stockDamaged ? 'rusak' : 'baik',
                    'status' => $index <= $stockDamaged ? 'maintenance' : 'available',
                    'notes' => null,
                    'last_borrowed_at' => null,
                ]);
            }
        }
    }

    private function stockValidationError(string $message): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'errors' => [
                'stock' => [$message],
            ],
        ], 422);
    }
}
