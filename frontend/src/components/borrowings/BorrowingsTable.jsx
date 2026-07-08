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
          <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-6">Peminjam</th>
            <th className="py-3 px-6">Tanggal Pinjam</th>
            <th className="py-3 px-6">Tenggat Kembali</th>
            <th className="py-3 px-6">Tujuan</th>
            <th className="py-3 px-6">Status</th>
            <th className="py-3 px-6 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
          {borrowings.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-12 text-center text-slate-400">
                Belum ada data peminjaman.
              </td>
            </tr>
          ) : (
            borrowings.map((borrowing) => (
              <tr key={borrowing.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="font-semibold text-slate-900">{borrowing.borrower_name}</div>
                  {isStaff && borrowing.user && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {borrowing.user.email} {borrowing.user.nim_nip ? `(${borrowing.user.nim_nip})` : ''}
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-slate-600">{borrowing.borrow_date}</td>
                <td className="py-4 px-6 text-slate-600">{borrowing.due_date}</td>
                <td className="py-4 px-6 text-slate-600 max-w-[200px] truncate" title={borrowing.purpose}>{borrowing.purpose}</td>
                <td className="py-4 px-6">{getStatusBadge(borrowing.status)}</td>
                <td className="py-4 px-6 text-right opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onShowDetail(borrowing)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Detail
                    </button>
                    
                    {/* === ADMIN/PENGURUS: Setujui & Tolak (hanya status pending) === */}
                    {isStaff && borrowing.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(borrowing.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => onShowReject(borrowing)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          Tolak
                        </button>
                      </>
                    )}

                    {/* === ANGGOTA: Ajukan Pengembalian (hanya status approved) === */}
                    {!isStaff && borrowing.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => onRequestReturn(borrowing)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-100 shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                        Kembalikan
                      </button>
                    )}

                    {/* === ADMIN/PENGURUS: Proses Pengembalian (status approved ATAU return_requested) === */}
                    {isStaff && (borrowing.status === 'approved' || borrowing.status === 'return_requested') && (
                      <button
                        type="button"
                        onClick={() => onShowReturn(borrowing)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100 shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        Proses Kembali
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:block">
            <p className="text-sm text-secondary-700">
              Menampilkan <span className="font-semibold">{meta.from || 0}</span> sampai <span className="font-semibold">{meta.to || 0}</span> dari <span className="font-semibold">{meta.total}</span> hasil
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end gap-2">
            <button
              onClick={() => onPageChange(meta.current_page - 1)}
              disabled={meta.current_page === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-accent-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => onPageChange(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-accent-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
