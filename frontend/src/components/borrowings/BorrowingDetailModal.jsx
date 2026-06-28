import { getStatusBadge, formatCurrency } from '../../utils/borrowingHelpers';

export default function BorrowingDetailModal({
  borrowing,
  onClose,
}) {
  if (!borrowing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-[28px] border border-white bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Detail Peminjaman</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-sm">
            <div>
              <span className="block text-xs text-slate-500">Nama Peminjam</span>
              <span className="font-semibold text-slate-800">{borrowing.borrower_name}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Status</span>
              <span>{getStatusBadge(borrowing.status)}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Tanggal Pinjam</span>
              <span className="font-medium text-slate-800">{borrowing.borrow_date}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Tenggat Kembali</span>
              <span className="font-medium text-slate-800">{borrowing.due_date}</span>
            </div>
            {borrowing.return_date && (
              <div>
                <span className="block text-xs text-slate-500">Tanggal Pengembalian</span>
                <span className="font-medium text-slate-800">{borrowing.return_date}</span>
              </div>
            )}
            {borrowing.total_fine > 0 && (
              <div>
                <span className="block text-xs text-slate-500">Total Denda</span>
                <span className="font-bold text-red-600">{formatCurrency(borrowing.total_fine)}</span>
              </div>
            )}
          </div>

          <div>
            <span className="block text-xs text-slate-500 mb-1">Tujuan Peminjaman</span>
            <p className="rounded-2xl border border-slate-100 p-3 text-sm text-slate-700 bg-white shadow-xs">
              {borrowing.purpose}
            </p>
          </div>

          {borrowing.notes && (
            <div>
              <span className="block text-xs text-slate-500 mb-1">
                {borrowing.status === 'rejected' ? 'Catatan Penolakan' : 'Catatan Peminjaman'}
              </span>
              <p className="rounded-2xl border border-slate-100 p-3 text-sm text-slate-700 bg-white shadow-xs">
                {borrowing.notes}
              </p>
            </div>
          )}

          <div>
            <span className="block text-sm font-bold text-slate-800 mb-2">Daftar Barang</span>
            <div className="space-y-2">
              {(borrowing.borrowingItems ?? borrowing.borrowing_items ?? []).map((bi) => (
                <div key={bi.id} className="flex flex-col rounded-xl border border-slate-100 p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800">{bi.item?.name ?? 'Barang'}</span>
                      <span className="block text-xs text-slate-500">{bi.item?.item_code}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-slate-800">{bi.quantity} unit</span>
                      {bi.condition_after && (
                        <span className="block text-xs text-slate-500">
                          Kondisi akhir: <span className="font-semibold capitalize">{bi.condition_after}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Menampilkan catatan kerusakan saat pengembalian (jika ada) */}
                  {bi.damage_notes && (
                    <div className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-100">
                      <strong>Catatan Pengembalian:</strong> {bi.damage_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {borrowing.return_proof_image && (
            <div>
              <span className="block text-sm font-bold text-slate-800 mb-2">Foto Bukti Pengembalian</span>
              <div className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex justify-center p-2">
                <img 
                  src={borrowing.return_proof_image} 
                  alt="Bukti Pengembalian" 
                  className="max-h-64 object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
