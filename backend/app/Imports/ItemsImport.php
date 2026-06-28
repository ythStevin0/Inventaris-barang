<?php

namespace App\Imports;

use App\Models\Item;
use App\Models\Category;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ItemsImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Cari kategori berdasarkan nama (case-insensitive), atau buat baru
        $categoryId = null;
        if (!empty($row['kategori'])) {
            $category = Category::firstOrCreate(
                ['name' => trim($row['kategori'])],
                ['description' => 'Kategori hasil import', 'is_active' => true]
            );
            $categoryId = $category->id;
        }

        // Hitung stok
        $stockTotal = (int) ($row['stok_total'] ?? 0);
        $stockDamaged = (int) ($row['stok_rusak'] ?? 0);
        $stockAvailable = $stockTotal - $stockDamaged;

        // Tipe barang
        $type = strtolower(trim($row['tipe'] ?? 'durable'));
        if (!in_array($type, ['durable', 'consumable'])) {
            $type = 'durable';
        }

        return new Item([
            'item_code'       => $row['kode_barang'] ?? Str::upper(Str::random(6)),
            'name'            => $row['nama_barang'],
            'category_id'     => $categoryId,
            'type'            => $type,
            'unit'            => strtolower(trim($row['satuan'] ?? 'pcs')),
            'stock_total'     => $stockTotal,
            'stock_available' => $stockAvailable,
            'stock_damaged'   => $stockDamaged,
            'brand'           => $row['merek'] ?? null,
            'location'        => $row['lokasi'] ?? null,
            'description'     => $row['deskripsi'] ?? null,
            'is_active'       => true,
        ]);
    }

    public function rules(): array
    {
        return [
            'nama_barang' => 'required|string|max:255',
            'kode_barang' => 'nullable|string|unique:items,item_code',
            'stok_total'  => 'required|numeric|min:1',
            'tipe'        => 'nullable|string|in:durable,consumable,Durable,Consumable,equipment,Equipment',
        ];
    }
}
