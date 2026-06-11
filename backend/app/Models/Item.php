<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'item_code',
        'name',
        'description',
        'type',
        'unit',
        'stock_total',
        'stock_available',
        'stock_damaged',
        'location',
        'brand',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'stock_total' => 'integer',
            'stock_available' => 'integer',
            'stock_damaged' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function borrowingItems(): HasMany
    {
        return $this->hasMany(BorrowingItem::class);
    }

    public function itemUnits(): HasMany
    {
        return $this->hasMany(ItemUnit::class);
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
