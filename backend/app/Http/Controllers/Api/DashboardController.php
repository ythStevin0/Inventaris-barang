<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\Category;
use App\Models\Item;
use App\Models\MaintenanceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = in_array($user->role, ['admin', 'pengurus']);

        // Base queries
        $itemsQuery = Item::query();
        $borrowingsQuery = Borrowing::query();
        $maintenanceQuery = MaintenanceLog::query();
        $categoriesQuery = Category::query();

        // Stats
        $stats = Cache::remember("dashboard_stats", 300, function () {
            $totalBarang = Item::sum('stock_total');
            $totalKategori = Category::count();
            
            // Barang Dipinjam (Quantity of items currently borrowed)
            $barangDipinjam = DB::table('borrowing_items')
                ->join('borrowings', 'borrowing_items.borrowing_id', '=', 'borrowings.id')
                ->where('borrowings.status', 'borrowed')
                ->sum('borrowing_items.quantity');
                
            // Peminjaman Aktif (Number of active borrowing requests)
            $peminjamanAktif = Borrowing::where('status', 'borrowed')->count();
            
            // Barang Rusak (Total damaged stock across all items)
            $barangRusak = Item::sum('stock_damaged');
            
            return [
                'totalBarang' => (int) $totalBarang,
                'totalKategori' => $totalKategori,
                'barangDipinjam' => (int) $barangDipinjam,
                'peminjamanAktif' => $peminjamanAktif,
                'barangRusak' => $barangRusak,
            ];
        });

        // Recent Borrowings
        $recentBorrowingsQuery = Borrowing::with(['user', 'borrowingItems.item'])
            ->orderBy('created_at', 'desc')
            ->take(5);
            
        if (!$isAdmin) {
            $recentBorrowingsQuery->where('user_id', $user->id);
        }
        
        $recentBorrowingsRaw = $recentBorrowingsQuery->get();
        
        // Format recent borrowings for frontend
        $recentBorrowings = $recentBorrowingsRaw->map(function ($borrowing) {
            $itemNames = $borrowing->borrowingItems->map(function ($bi) {
                return $bi->item ? $bi->item->name : 'Unknown';
            })->join(', ');
            
            // Map status
            $statusMap = [
                'pending' => 'Menunggu',
                'approved' => 'Disetujui',
                'borrowed' => 'Dipinjam',
                'returned' => 'Dikembalikan',
                'rejected' => 'Ditolak'
            ];
            
            $tglKembali = $borrowing->return_date ? Carbon::parse($borrowing->return_date)->translatedFormat('d M Y') : ($borrowing->due_date ? Carbon::parse($borrowing->due_date)->translatedFormat('d M Y') : '-');
            
            return [
                'id' => $borrowing->id,
                'nama' => $borrowing->user ? $borrowing->user->name : $borrowing->borrower_name,
                'barang' => $itemNames,
                'tglPinjam' => $borrowing->borrow_date ? Carbon::parse($borrowing->borrow_date)->translatedFormat('d M Y') : '-',
                'tglKembali' => $tglKembali,
                'status' => $statusMap[$borrowing->status] ?? $borrowing->status,
                'raw_status' => $borrowing->status
            ];
        });
        
        // Category distribution for Donut Chart
        $categoryStats = Cache::remember('dashboard_categories_chart', 300, function () {
            $categories = Category::withCount('items')->get();
            $totalItemsCount = $categories->sum('items_count');
            
            $colors = ['#8B1A1A', '#C0392B', '#E74C3C', '#D4A574', '#F1C40F', '#95a5a6', '#34495e', '#2ecc71', '#3498db', '#9b59b6'];
            
            return $categories->map(function ($cat, $index) use ($totalItemsCount, $colors) {
                $percent = $totalItemsCount > 0 ? round(($cat->items_count / $totalItemsCount) * 100) : 0;
                return [
                    'name' => $cat->name,
                    'percent' => $percent,
                    'color' => $colors[$index % count($colors)]
                ];
            })->filter(function ($cat) {
                return $cat['percent'] > 0;
            })->values();
        });

        return response()->json([
            'stats' => $stats,
            'recentBorrowings' => $recentBorrowings,
            'categories' => $categoryStats
        ]);
    }
}
