<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Borrowing extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'borrower_name',
        'borrow_date',
        'due_date',
        'return_date',
        'status',
        'purpose',
        'notes',
        'approved_by',
        'total_fine',
    ];

    protected function casts(): array
    {
        return [
            'borrow_date' => 'date',
            'due_date' => 'date',
            'return_date' => 'date',
            'total_fine' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function borrowingItems(): HasMany
    {
        return $this->hasMany(BorrowingItem::class);
    }

    /**
     * Scope a query to only include active borrowings (currently borrowed).
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'borrowed');
    }

    /**
     * Scope a query to only include pending borrowing requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
