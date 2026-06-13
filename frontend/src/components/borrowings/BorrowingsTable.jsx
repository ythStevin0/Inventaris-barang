import { getStatusBadge } from '../../utils/borrowingHelpers';

export default function BorrowingsTable({
  borrowings,
  isStaff,
  onShowDetail,
  onApprove,
  onShowReject,
  onShowReturn,
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

                  {isStaff && borrowing.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => onShowReturn(borrowing)}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Kembalikan
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
