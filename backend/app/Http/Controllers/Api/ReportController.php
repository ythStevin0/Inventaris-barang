<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BorrowingsExport;

class ReportController extends Controller
{
    private function getFilteredBorrowings(Request $request)
    {
        $query = Borrowing::with(['user', 'borrowingItems.item'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('borrow_date', [$request->start_date, $request->end_date]);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query->get();
    }

    public function exportBorrowingsPdf(Request $request)
    {
        $borrowings = $this->getFilteredBorrowings($request);

        $pdf = Pdf::loadView('reports.borrowings', [
            'borrowings' => $borrowings,
            'startDate'  => $request->start_date,
            'endDate'    => $request->end_date,
            'status'     => $request->status,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('laporan-peminjaman.pdf');
    }

    public function exportBorrowingsExcel(Request $request)
    {
        return Excel::download(
            new BorrowingsExport($request->start_date, $request->end_date, $request->status), 
            'laporan-peminjaman.xlsx'
        );
    }

    public function exportItemsPdf(Request $request)
    {
        $query = \App\Models\Item::with('category')->orderBy('name', 'asc');
        
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $items = $query->get();

        $pdf = Pdf::loadView('reports.items', [
            'items' => $items,
            'category_id' => $request->category_id,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('laporan-inventaris-barang.pdf');
    }

    public function exportItemsExcel(Request $request)
    {
        return Excel::download(
            new \App\Exports\ItemsExport($request->category_id), 
            'laporan-inventaris-barang.xlsx'
        );
    }
}
