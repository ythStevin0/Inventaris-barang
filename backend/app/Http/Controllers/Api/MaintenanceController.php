<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceLog;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index()
    {
        $logs = MaintenanceLog::with(['item', 'itemUnit', 'reporter'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'item_unit_id' => 'nullable|exists:item_units,id',
            'type' => 'required|in:maintenance,kerusakan,kehilangan',
            'description' => 'required|string',
            'maintenance_date' => 'nullable|date',
            'cost' => 'nullable|numeric',
        ]);

        $validated['reported_by'] = $request->user()->id;
        $validated['status'] = 'reported';

        $log = MaintenanceLog::create($validated);

        return response()->json([
            'message' => 'Laporan berhasil dibuat.',
            'data' => $log->load(['item', 'itemUnit', 'reporter']),
        ], 201);
    }

    public function show(string $id)
    {
        $log = MaintenanceLog::with(['item', 'itemUnit', 'reporter'])->findOrFail($id);

        return response()->json($log);
    }

    public function update(Request $request, string $id)
    {
        $log = MaintenanceLog::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:reported,in_progress,resolved',
            'resolution_notes' => 'nullable|string',
            'resolved_date' => 'nullable|date',
            'cost' => 'nullable|numeric',
            'type' => 'sometimes|in:maintenance,kerusakan,kehilangan',
            'description' => 'sometimes|string',
            'maintenance_date' => 'nullable|date',
        ]);

        $log->update($validated);

        return response()->json([
            'message' => 'Laporan berhasil diperbarui.',
            'data' => $log->load(['item', 'itemUnit', 'reporter']),
        ]);
    }

    public function destroy(string $id)
    {
        $log = MaintenanceLog::findOrFail($id);
        $log->delete();

        return response()->json([
            'message' => 'Laporan berhasil dihapus.',
        ]);
    }
}
