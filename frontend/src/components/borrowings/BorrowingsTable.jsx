import { getStatusBadge } from '../../utils/borrowingHelpers';

export default function BorrowingsTable({
  borrowings,
  meta,
  onPageChange,
  isStaff,
  onShowDetail,
  onApprove,
  onShowReject,
  onShowReturn,
  onRequestReturn,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-4">Peminjam</th>
            <th className="py-3.5 px-4">Tanggal Pinjam</th>
            <th className="py-3.5 px-4">Tenggat Kembali</th>
            <th className="py-3.5 px-4">Tujuan</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {borrowings.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-slate-400">
                Belum ada data peminjaman.
              </td>
            </tr>
          ) : (
            borrowings.map((borrowing) => (
              <tr key={borrowing.id} className="hover:bg-slate-50/50 transition">
                <td className="py-4 px-4 font-semibold text-slate-900">
                  {borrowing.borrower_name}
                  {isStaff && borrowing.user && (
                    <span className="block text-xs font-normal text-slate-500">
                      {borrowing.user.email} {borrowing.user.nim_nip ? `(${borrowing.user.nim_nip})` : ''}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">{borrowing.borrow_date}</td>
                <td className="py-4 px-4">{borrowing.due_date}</td>
                <td className="py-4 px-4 max-w-xs truncate">{borrowing.purpose}</td>
                <td className="py-4 px-4">{getStatusBadge(borrowing.status)}</td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => onShowDetail(borrowing)}
                    className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Detail
                  </button>
                  
                  {/* === ADMIN/PENGURUS: Setujui & Tolak (hanya status pending) === */}
                  {isStaff && borrowing.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onApprove(borrowing.id)}
                        className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Setujui
                      </button>
                      <button
                        type="button"
                        onClick={() => onShowReject(borrowing)}
                        className="inline-flex items-center rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Tolak
                      </button>
                    </>
                  )}

                  {/* === ANGGOTA: Ajukan Pengembalian (hanya status approved) === */}
                  {!isStaff && borrowing.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => onRequestReturn(borrowing)}
                      className="inline-flex items-center rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                    >
                      Ajukan Pengembalian
                    </button>
                  )}

                  {/* === ADMIN/PENGURUS: Proses Pengembalian (status approved ATAU return_requested) === */}
                  {isStaff && (borrowing.status === 'approved' || borrowing.status === 'return_requested') && (
                    <button
                      type="button"
                      onClick={() => onShowReturn(borrowing)}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Proses Pengembalian
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:block">
            <p className="text-sm text-slate-700">
              Menampilkan <span className="font-semibold">{meta.from || 0}</span> sampai <span className="font-semibold">{meta.to || 0}</span> dari <span className="font-semibold">{meta.total}</span> hasil
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end gap-2">
            <button
              onClick={() => onPageChange(meta.current_page - 1)}
              disabled={meta.current_page === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => onPageChange(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
