<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'reported_by',
        'type',
        'description',
        'status',
        'maintenance_date',
        'resolved_date',
        'resolution_notes',
    ];

    protected function casts(): array
    {
        return [
            'maintenance_date' => 'date',
            'resolved_date' => 'date',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
