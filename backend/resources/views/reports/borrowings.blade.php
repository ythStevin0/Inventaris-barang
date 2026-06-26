<!DOCTYPE html>
<html>
<head>
    <title>Laporan Peminjaman Barang</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h2 { margin: 0; }
        .header p { margin: 5px 0; color: #555; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Peminjaman Barang</h2>
        @if($startDate && $endDate)
            <p>Periode: {{ $startDate }} s/d {{ $endDate }}</p>
        @else
            <p>Semua Periode</p>
        @endif
        @if($status)
            <p>Status: {{ ucfirst($status) }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Peminjam</th>
                <th>Barang</th>
                <th>Tgl Pinjam</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
                <th>Denda</th>
            </tr>
        </thead>
        <tbody>
            @forelse($borrowings as $index => $borrowing)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>
                    <strong>{{ $borrowing->borrower_name }}</strong><br>
                    <small>{{ $borrowing->user->nim_nip ?? '-' }}</small>
                </td>
                <td>
                    <ul style="margin: 0; padding-left: 15px;">
                    @foreach($borrowing->borrowingItems as $item)
                        <li>{{ $item->item->name }} ({{ $item->quantity }} {{ $item->item->unit }})</li>
                    @endforeach
                    </ul>
                </td>
                <td>{{ $borrowing->borrow_date ? $borrowing->borrow_date->format('d/m/Y') : '-' }}</td>
                <td>{{ $borrowing->return_date ? $borrowing->return_date->format('d/m/Y') : '-' }}</td>
                <td>{{ ucfirst($borrowing->status) }}</td>
                <td>Rp {{ number_format($borrowing->total_fine, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center;">Tidak ada data peminjaman</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
