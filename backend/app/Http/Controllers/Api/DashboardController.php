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
    /**
     * Display dashboard stats.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = in_array($user->role, ['admin', 'pengurus']);

        return response()->json([
            'stats' => $this->getStats(),
            'recentBorrowings' => $this->getRecentBorrowings($isAdmin, $user),
            'categories' => $this->getCategoryStats(),
            'notifications' => $this->getNotifications($isAdmin, $user),
            'calendarEvents' => $this->getCalendarEvents($isAdmin, $user)
        ]);
    }

    private function getStats()
    {
        $totalBarang = Item::sum('stock_total');
        $totalKategori = Category::count();

        $barangDipinjam = DB::table('borrowing_items')
            ->join('borrowings', 'borrowing_items.borrowing_id', '=', 'borrowings.id')
            ->whereIn('borrowings.status', ['approved', 'borrowed'])
            ->sum('borrowing_items.quantity');

        $peminjamanAktif = Borrowing::whereIn('status', ['pending', 'approved', 'borrowed'])->count();
        $barangRusak = Item::sum('stock_damaged');

        return [
            'totalBarang' => (int) $totalBarang,
            'totalKategori' => $totalKategori,
            'barangDipinjam' => (int) $barangDipinjam,
            'peminjamanAktif' => $peminjamanAktif,
            'barangRusak' => $barangRusak,
        ];
    }

    private function getRecentBorrowings($isAdmin, $user)
    {
        $recentBorrowingsQuery = Borrowing::with(['user', 'borrowingItems.item'])
            ->orderBy('created_at', 'desc')
            ->take(5);

        if (!$isAdmin) {
            $recentBorrowingsQuery->where('user_id', $user->id);
        }

        return $recentBorrowingsQuery->get()->map(function ($borrowing) {
            $itemNames = $borrowing->borrowingItems->map(function ($bi) {
                return $bi->item ? $bi->item->name : 'Unknown';
            })->join(', ');

            $statusMap = [
                'pending' => 'Menunggu',
                'approved' => 'Disetujui',
                'borrowed' => 'Dipinjam',
                'returned' => 'Dikembalikan',
                'rejected' => 'Ditolak'
            ];

            $tglKembali = $borrowing->return_date 
                ? Carbon::parse($borrowing->return_date)->translatedFormat('d M Y') 
                : ($borrowing->due_date ? Carbon::parse($borrowing->due_date)->translatedFormat('d M Y') : '-');

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
    }

    private function getCategoryStats()
    {
        return Cache::remember('dashboard_categories_chart', 300, function () {
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
            })->values()->toArray();
        });
    }

    private function getNotifications($isAdmin, $user)
    {
        $notifications = [];

        $pendingQuery = Borrowing::where('status', 'pending')->with('user');
        if (!$isAdmin) {
            $pendingQuery->where('user_id', $user->id);
        }
        
        foreach ($pendingQuery->get() as $borrowing) {
            $name = $borrowing->user ? $borrowing->user->name : $borrowing->borrower_name;
            $notifications[] = [
                'id' => 'p_' . $borrowing->id,
                'type' => 'pending',
                'title' => 'Peminjaman Menunggu',
                'message' => $isAdmin ? "Ada permintaan peminjaman dari {$name}." : "Permintaan peminjaman Anda sedang menunggu persetujuan.",
                'time' => $borrowing->created_at->diffForHumans(),
                'link' => '/borrowings'
            ];
        }

        $activeQuery = Borrowing::where('status', 'borrowed')->with('user');
        if (!$isAdmin) {
            $activeQuery->where('user_id', $user->id);
        }
        
        foreach ($activeQuery->get() as $borrowing) {
            if ($borrowing->due_date) {
                $dueDate = Carbon::parse($borrowing->due_date);
                $now = Carbon::now();
                $daysLeft = $now->copy()->startOfDay()->diffInDays($dueDate->copy()->startOfDay(), false);
                $name = $borrowing->user ? $borrowing->user->name : $borrowing->borrower_name;
                
                if ($daysLeft < 0) {
                    $notifications[] = [
                        'id' => 'o_' . $borrowing->id,
                        'type' => 'overdue',
                        'title' => 'Terlambat Dikembalikan',
                        'message' => $isAdmin ? "Peminjaman {$name} melewati batas waktu!" : "Barang pinjaman Anda telah melewati batas waktu!",
                        'time' => $dueDate->diffForHumans(),
                        'link' => '/borrowings'
                    ];
                } else if ($daysLeft <= 3) {
                    $notifications[] = [
                        'id' => 'u_' . $borrowing->id,
                        'type' => 'upcoming',
                        'title' => 'Pengembalian Segera',
                        'message' => $isAdmin ? "Peminjaman {$name} jatuh tempo dalam {$daysLeft} hari." : "Waktu pengembalian barang Anda tersisa {$daysLeft} hari lagi.",
                        'time' => $dueDate->diffForHumans(),
                        'link' => '/borrowings'
                    ];
                }
            }
        }

        return $notifications;
    }

    private function getCalendarEvents($isAdmin, $user)
    {
        $calendarQuery = Borrowing::whereIn('status', ['approved', 'borrowed'])->with('user');
        if (!$isAdmin) {
            $calendarQuery->where('user_id', $user->id);
        }
        
        return $calendarQuery->get()->map(function ($borrowing) {
            return [
                'id' => $borrowing->id,
                'name' => $borrowing->user ? $borrowing->user->name : $borrowing->borrower_name,
                'user' => $borrowing->user,
                'borrow_date' => $borrowing->borrow_date,
                'due_date' => $borrowing->due_date,
                'return_date' => $borrowing->return_date,
                'status' => $borrowing->status,
            ];
        });
    }
}
