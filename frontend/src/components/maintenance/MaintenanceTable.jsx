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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 text-[10px] font-bold tracking-wider text-[#11224E] uppercase">
            <tr>
              <th className="px-4 py-4">ID / Tgl Lapor</th>
              <th className="px-4 py-4">Barang</th>
              <th className="px-4 py-4">Pelapor</th>
              <th className="px-4 py-4">Jenis</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Belum ada data riwayat kerusakan.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 last:border-0 border-l-4 border-l-[#F87B1B] bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-[#11224E]">#{log.id}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{new Date(log.created_at).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-secondary-900">{log.item?.name}</div>
                    <div className="text-xs text-slate-500">{log.item?.item_code}</div>
                  </td>
                  <td className="px-4 py-3">{log.reporter?.name}</td>
                  <td className="px-4 py-3">{getTypeBadge(log.type)}</td>
                  <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Detail"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={() => onEdit(log)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => onDelete(log.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </div>
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
