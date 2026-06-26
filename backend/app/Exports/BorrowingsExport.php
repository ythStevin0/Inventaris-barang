<?php

namespace App\Exports;

use App\Models\Borrowing;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BorrowingsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $startDate;
    protected $endDate;
    protected $status;

    public function __construct($startDate, $endDate, $status)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->status = $status;
    }

    public function collection()
    {
        $query = Borrowing::with(['user', 'borrowingItems.item'])
            ->orderBy('created_at', 'desc');

        if ($this->startDate && $this->endDate) {
            $query->whereBetween('borrow_date', [$this->startDate, $this->endDate]);
        }

        if ($this->status) {
            $query->where('status', $this->status);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Peminjam',
            'NIM/NIP',
            'Barang',
            'Tgl Pinjam',
            'Tgl Kembali',
            'Tenggat Waktu',
            'Status',
            'Denda',
            'Catatan'
        ];
    }

    public function map($borrowing): array
    {
        // Gabungkan semua nama barang yang dipinjam
        $items = $borrowing->borrowingItems->map(function ($item) {
            return $item->item->name . ' (' . $item->quantity . ' ' . $item->item->unit . ')';
        })->implode(', ');

        return [
            $borrowing->id,
            $borrowing->borrower_name,
            $borrowing->user->nim_nip ?? '-',
            $items,
            $borrowing->borrow_date ? $borrowing->borrow_date->format('Y-m-d') : '-',
            $borrowing->return_date ? $borrowing->return_date->format('Y-m-d') : '-',
            $borrowing->due_date ? $borrowing->due_date->format('Y-m-d') : '-',
            ucfirst($borrowing->status),
            $borrowing->total_fine > 0 ? $borrowing->total_fine : '-',
            $borrowing->notes ?? '-',
        ];
    }
}
