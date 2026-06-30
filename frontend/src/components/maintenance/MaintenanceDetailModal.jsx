export default function MaintenanceDetailModal({ log, onClose }) {
  if (!log) return null;

  const getStatusText = (status) => {
    switch (status) {
      case 'reported': return 'Dilaporkan (Menunggu)';
      case 'in_progress': return 'Sedang Diproses/Diperbaiki';
      case 'resolved': return 'Selesai';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'kerusakan': return 'Kerusakan';
      case 'kehilangan': return 'Kehilangan';
      case 'maintenance': return 'Maintenance Rutin';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-secondary-900">Detail Kerusakan/Maintenance</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          <div className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-secondary-700">Barang</span>
            <span className="col-span-2 font-medium text-secondary-900">{log.item?.name} ({log.item?.item_code})</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-secondary-700">Pelapor</span>
            <span className="col-span-2">{log.reporter?.name}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-secondary-700">Jenis</span>
            <span className="col-span-2">{getTypeText(log.type)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-secondary-700">Status</span>
            <span className="col-span-2">{getStatusText(log.status)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-secondary-700">Tgl Lapor/Kejadian</span>
            <span className="col-span-2">{log.maintenance_date ? new Date(log.maintenance_date).toLocaleDateString('id-ID') : '-'}</span>
          </div>

          <div className="grid grid-cols-1 gap-1 border-b border-slate-100 pb-4">
            <span className="font-semibold text-secondary-700">Deskripsi Kendala</span>
            <div className="rounded-lg bg-accent-50 p-3 text-secondary-700 whitespace-pre-wrap">{log.description}</div>
          </div>

          {/* Bagian Penyelesaian */}
          <h3 className="font-bold text-secondary-800 pt-2">Tindak Lanjut & Penyelesaian</h3>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-secondary-700">Tgl Selesai</span>
            <span className="col-span-2">{log.resolved_date ? new Date(log.resolved_date).toLocaleDateString('id-ID') : '-'}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-secondary-700">Biaya (Rp)</span>
            <span className="col-span-2 font-medium text-secondary-900">
              {log.cost ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(log.cost) : '-'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 pt-1">
            <span className="font-semibold text-secondary-700">Catatan Penyelesaian</span>
            <div className="rounded-lg bg-accent-50 p-3 text-secondary-700 whitespace-pre-wrap">
              {log.resolution_notes || '-'}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-accent-100 px-6 py-2.5 text-sm font-bold text-secondary-700 transition hover:bg-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
