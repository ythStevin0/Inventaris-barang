<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BorrowingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrowing_id',
        'item_id',
        'quantity',
        'quantity_damaged',
        'fine_amount',
        'condition_before',
        'condition_after',
        'damage_notes',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'quantity_damaged' => 'integer',
            'fine_amount' => 'decimal:2',
        ];
    }

    public function borrowing(): BelongsTo
    {
        return $this->belongsTo(Borrowing::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
