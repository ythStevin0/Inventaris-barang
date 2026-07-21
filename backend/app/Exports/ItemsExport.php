<?php

namespace App\Exports;

use App\Models\Item;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ItemsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $categoryId;

    public function __construct($categoryId = null)
    {
        $this->categoryId = $categoryId;
    }

    public function collection()
    {
        $query = Item::with('category')->orderBy('name', 'asc');

        if ($this->categoryId) {
            $query->where('category_id', $this->categoryId);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Kode Barang',
            'Nama Barang',
            'Kategori',
            'Tipe',
            'Stok Total',
            'Stok Tersedia',
            'Stok Rusak/Hilang',
            'Satuan',
            'Status'
        ];
    }

    public function map($item): array
    {
        return [
            $item->id,
            $item->item_code,
            $item->name,
            $item->category ? $item->category->name : '-',
            $item->type === 'durable' ? 'Barang Tahan Lama' : 'Barang Habis Pakai',
            $item->stock_total,
            $item->stock_available,
            $item->stock_damaged,
            $item->unit,
            $item->is_active ? 'Aktif' : 'Nonaktif'
        ];
    }
}
