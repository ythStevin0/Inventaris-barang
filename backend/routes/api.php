<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BorrowingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ItemController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (semua user yang login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);

    // Dashboard Stats
    Route::get('/dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index']);

    Route::get('/items', [ItemController::class, 'index']);
    Route::get('/items/{item}', [ItemController::class, 'show']);

    // Peminjaman — semua user bisa lihat & ajukan
    Route::get('/borrowings', [BorrowingController::class, 'index']);
    Route::get('/borrowings/{borrowing}', [BorrowingController::class, 'show']);
    Route::post('/borrowings', [BorrowingController::class, 'store']);

    // Pengajuan pengembalian — anggota bisa mengajukan pengembalian barang
    Route::post('/borrowings/{borrowing}/request-return', [BorrowingController::class, 'requestReturn']);

    // Maintenance (Read-only untuk Anggota, tapi bisa juga diakses Admin)
    Route::get('/maintenance', [\App\Http\Controllers\Api\MaintenanceController::class, 'index']);
    Route::get('/maintenance/{id}', [\App\Http\Controllers\Api\MaintenanceController::class, 'show']);
});

// Admin & Pengurus only
Route::middleware(['auth:sanctum', 'role:admin,pengurus'])->group(function () {
    Route::apiResource('categories', CategoryController::class);
    Route::post('/items', [ItemController::class, 'store']);
    Route::post('/items/import', [ItemController::class, 'import']);
    Route::put('/items/{item}', [ItemController::class, 'update']);
    Route::patch('/items/{item}', [ItemController::class, 'update']);
    Route::delete('/items/{item}', [ItemController::class, 'destroy']);

    // Peminjaman — persetujuan, penolakan, dan finalisasi pengembalian
    Route::post('/borrowings/{borrowing}/approve', [BorrowingController::class, 'approve']);
    Route::post('/borrowings/{borrowing}/reject', [BorrowingController::class, 'reject']);
    Route::post('/borrowings/{borrowing}/return', [BorrowingController::class, 'returnBorrowing']);

    // Laporan Peminjaman
    Route::get('/reports/borrowings/pdf', [\App\Http\Controllers\Api\ReportController::class, 'exportBorrowingsPdf']);
    Route::get('/reports/borrowings/excel', [\App\Http\Controllers\Api\ReportController::class, 'exportBorrowingsExcel']);

    // Maintenance (Full CRUD untuk Admin/Pengurus)
    Route::post('/maintenance', [\App\Http\Controllers\Api\MaintenanceController::class, 'store']);
    Route::put('/maintenance/{id}', [\App\Http\Controllers\Api\MaintenanceController::class, 'update']);
    Route::patch('/maintenance/{id}', [\App\Http\Controllers\Api\MaintenanceController::class, 'update']);
    Route::delete('/maintenance/{id}', [\App\Http\Controllers\Api\MaintenanceController::class, 'destroy']);
});
