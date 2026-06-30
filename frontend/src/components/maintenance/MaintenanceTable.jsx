import { useState } from 'react';
import MaintenanceDetailModal from './MaintenanceDetailModal';

export default function MaintenanceTable({ logs, canManage, onEdit, onDelete }) {
  const [selectedLog, setSelectedLog] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reported':
        return <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-red-800 uppercase">Dilaporkan</span>;
      case 'in_progress':
        return <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-800 uppercase">Diproses</span>;
      case 'resolved':
        return <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-800 uppercase">Selesai</span>;
      default:
        return <span className="inline-flex rounded-full bg-accent-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-secondary-800 uppercase">{status}</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'kerusakan':
        return <span className="text-red-600 font-medium">Kerusakan</span>;
      case 'kehilangan':
        return <span className="text-slate-600 font-medium">Kehilangan</span>;
      case 'maintenance':
        return <span className="text-primary-600 font-medium">Maintenance</span>;
      default:
        return <span>{type}</span>;
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-accent-50/50 text-xs font-semibold text-secondary-800">
            <tr>
              <th className="px-4 py-3">ID / Tgl Lapor</th>
              <th className="px-4 py-3">Barang</th>
              <th className="px-4 py-3">Pelapor</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Belum ada data riwayat kerusakan.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-accent-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-secondary-900">#{log.id}</div>
                    <div className="text-xs text-slate-500">{new Date(log.created_at).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-secondary-900">{log.item?.name}</div>
                    <div className="text-xs text-slate-500">{log.item?.item_code}</div>
                  </td>
                  <td className="px-4 py-3">{log.reporter?.name}</td>
                  <td className="px-4 py-3">{getTypeBadge(log.type)}</td>
                  <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                    >
                      Detail
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => onEdit(log)}
                          className="ml-2 inline-flex items-center justify-center rounded-lg bg-accent-100 px-3 py-1.5 text-xs font-bold text-secondary-700 transition hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(log.id)}
                          className="ml-2 inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <MaintenanceDetailModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}
    </>
  );
}
