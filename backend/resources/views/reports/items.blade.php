<!DOCTYPE html>
<html>
<head>
    <title>Laporan Daftar Barang</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h2 { margin: 0; }
        .header p { margin: 5px 0; color: #555; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Daftar Barang (Inventaris)</h2>
        <p>Dicetak pada: {{ date('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Tipe</th>
                <th>Stok Total</th>
                <th>Stok Tersedia</th>
                <th>Stok Rusak/Hilang</th>
                <th>Satuan</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->item_code }}</td>
                <td><strong>{{ $item->name }}</strong></td>
                <td>{{ $item->category ? $item->category->name : '-' }}</td>
                <td>{{ $item->type === 'durable' ? 'Barang Tahan Lama' : 'Barang Habis Pakai' }}</td>
                <td>{{ $item->stock_total }}</td>
                <td>{{ $item->stock_available }}</td>
                <td>{{ $item->stock_damaged }}</td>
                <td>{{ $item->unit }}</td>
                <td>{{ $item->is_active ? 'Aktif' : 'Nonaktif' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" style="text-align: center;">Tidak ada data barang.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
