import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItem } from '../../services/itemsService';
import { QRCodeCanvas } from 'qrcode.react';
import Alert from '../../components/ui/Alert';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const qrRef = useRef(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await getItem(id);
        setItem(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat detail barang.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [id]);

  const handlePrintQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas || !item) return;
    
    const qrImage = canvas.toDataURL('image/png');
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak QR Code - ${item.name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .print-container { border: 2px dashed #ccc; padding: 20px; display: inline-block; margin-top: 50px; }
            h2 { margin: 0 0 5px 0; font-size: 18px; }
            p { margin: 0 0 15px 0; color: #555; font-size: 14px; }
            img { width: 200px; height: 200px; }
            .code { font-family: monospace; font-size: 16px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h2>${item.name}</h2>
            <p>${item.brand || 'Inventaris SIBOS'}</p>
            <img src="${qrImage}" />
            <div class="code">${item.item_code}</div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-base text-slate-600">
        Memuat detail barang...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <Alert tone="error">{error || 'Barang tidak ditemukan.'}</Alert>
          <Link to="/items" className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:underline">
            Kembali ke Kelola Barang
          </Link>
        </div>
      </div>
    );
  }

  const qrValue = `${window.location.origin}/borrowings?item_id=${item.id}`;
  const totalBorrowed = item.stock_total - item.stock_available - item.stock_damaged;

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <Link to="/items" className="hover:text-primary-600">Product</Link>
          <span>&gt;</span>
          <span className="text-secondary-800">Product Detail</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-secondary-900">{item.name}</h1>
            <span className="rounded-full border border-accent-300 bg-white px-3 py-1 text-xs font-semibold text-secondary-800">
              Code: {item.item_code}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/items"
              className="rounded-xl border border-accent-300 bg-white px-5 py-2.5 text-sm font-semibold text-secondary-800 hover:bg-accent-50 transition"
            >
              Kembali
            </Link>
            <button
              onClick={() => {
                // Navigate back to items and trigger edit mode by setting state?
                // For simplicity, we can pass state to /items or just edit direct
                navigate('/items', { state: { editItemId: item.id } });
              }}
              className="rounded-xl border border-accent-300 bg-white px-5 py-2.5 text-sm font-semibold text-secondary-800 hover:bg-accent-50 transition"
            >
              Edit
            </button>
            <button
              onClick={handlePrintQR}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition"
            >
              Cetak QR Code
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Kolom Kiri */}
          <div className="flex flex-col gap-6">
            {/* Foto Barang */}
            <div className="rounded-[28px] border border-white/60 bg-white p-6 shadow-md">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-accent-50 flex items-center justify-center border border-accent-200">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-accent-400">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold">Tidak ada foto</span>
                  </div>
                )}
                
                {/* Arrow indicator slide overlay just like design */}
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-4">
                  <button className="h-8 w-8 rounded-full bg-white/80 shadow-md text-slate-600 flex items-center justify-center hover:bg-white">&lt;</button>
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary-600"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                  </div>
                  <button className="h-8 w-8 rounded-full bg-white/80 shadow-md text-slate-600 flex items-center justify-center hover:bg-white">&gt;</button>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="rounded-[28px] border border-white/60 bg-white p-6 shadow-md text-center">
              <h3 className="mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Barcode / QR Code</h3>
              <div className="flex justify-center bg-accent-50 p-6 rounded-2xl border border-accent-200" ref={qrRef}>
                <QRCodeCanvas
                  value={qrValue}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="flex flex-col gap-6">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-[24px] border border-white/60 bg-white p-5 shadow-sm text-left">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">On hand</span>
                <span className="text-2xl font-bold text-secondary-900">{item.stock_available}</span>
              </div>
              <div className="rounded-[24px] border border-white/60 bg-white p-5 shadow-sm text-left">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">To be delivered</span>
                <span className="text-2xl font-bold text-primary-600">{totalBorrowed}</span>
              </div>
              <div className="rounded-[24px] border border-white/60 bg-white p-5 shadow-sm text-left">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">To be ordered (Damaged)</span>
                <span className="text-2xl font-bold text-red-600">{item.stock_damaged}</span>
              </div>
            </div>

            {/* Basic Information */}
            <div className="rounded-[28px] border border-white/60 bg-white p-6 shadow-md">
              <h3 className="mb-4 flex items-center gap-2 text-md font-bold text-secondary-900">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic information
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Product name</span>
                  <span className="font-semibold text-secondary-800">{item.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Location</span>
                  <span className="font-semibold text-secondary-800">{item.location || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Category</span>
                  <span className="font-semibold text-secondary-800">{item.category?.name ?? '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Code</span>
                  <span className="font-semibold text-secondary-800">{item.item_code}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Brand</span>
                  <span className="font-semibold text-secondary-800">{item.brand || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Unit</span>
                  <span className="font-semibold text-secondary-800">{item.unit}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs font-semibold text-slate-400">Type</span>
                  <span className="font-semibold text-secondary-800 capitalize">{item.type}</span>
                </div>
              </div>
            </div>

            {/* Inventory History Plans */}
            <div className="rounded-[28px] border border-white/60 bg-white p-6 shadow-md">
              <h3 className="mb-4 flex items-center gap-2 text-md font-bold text-secondary-900">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Inventory Logs / Maintenance
              </h3>
              
              {item.maintenance_logs && item.maintenance_logs.length > 0 ? (
                <div className="space-y-4">
                  {item.maintenance_logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between border-b border-accent-100 pb-3 text-sm">
                      <div>
                        <p className="font-semibold text-secondary-800">{log.description || 'Laporan Kerusakan'}</p>
                        <p className="text-xs text-slate-400">Tanggal: {log.created_at ? new Date(log.created_at).toLocaleDateString('id-ID') : '-'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          log.status === 'selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Belum ada riwayat pemeliharaan pada barang ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
