import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getItem } from '../../services/itemsService';
import { QRCodeCanvas } from 'qrcode.react';
import Alert from '../../components/ui/Alert';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { getImageUrl } from '../../utils/imageUtils';
import ImageModal from '../../components/ui/ImageModal';

export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(false);
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
          <title>Cetak QR Code - ${item?.name}</title>
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
            <h2>${item?.name}</h2>
            <p>${item?.brand || 'Inventaris SIBOS'}</p>
            <img src="${qrImage}" />
            <div class="code">${item?.item_code}</div>
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



  if (!loading && (error || !item)) {
    return (
      <div className="min-h-screen px-5 py-8 bg-transparent">
        <div className="mx-auto max-w-7xl">
          <Alert tone="error">{error || 'Barang tidak ditemukan.'}</Alert>
          <Link to="/items" className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:underline">
            Kembali ke Kelola Barang
          </Link>
        </div>
      </div>
    );
  }

  const qrValue = item ? `${window.location.origin}/borrowings?item_id=${item?.id}` : '';
  const totalBorrowed = item ? (item?.stock_total - item?.stock_available - item?.stock_damaged) : 0;

  return (
    <div className="min-h-screen px-5 py-8 bg-transparent">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <Link to="/items" className="hover:text-teal-600">Barang</Link>
          <span>&gt;</span>
          <span className="text-emerald-900">Detail Barang</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-emerald-900">{item?.name}</h1>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-900">
              Kode: {item?.item_code}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/items"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-slate-50 transition"
            >
              Kembali
            </Link>

            <button
              onClick={handlePrintQR}
              className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 transition cursor-pointer"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200">
                {item?.image ? (
                  <img
                    src={getImageUrl(item?.image)}
                    alt={item?.name}
                    className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewImage(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold">Tidak ada foto</span>
                  </div>
                )}
                

              </div>
            </div>

            {/* QR Code Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
              <h3 className="mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Barcode / QR Code</h3>
              <div className="flex justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200" ref={qrRef}>
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
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Tersedia</span>
                <span className="text-2xl font-bold text-emerald-900">{item?.stock_available}</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Dipinjam</span>
                <span className="text-2xl font-bold text-teal-600">{totalBorrowed}</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Rusak</span>
                <span className="text-2xl font-bold text-red-600">{item?.stock_damaged}</span>
              </div>
            </div>

            {/* Basic Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-md font-bold text-emerald-900">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informasi Dasar
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Nama Barang</span>
                  <span className="font-semibold text-emerald-900">{item?.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Lokasi</span>
                  <span className="font-semibold text-emerald-900">{item?.location || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Kategori</span>
                  <span className="font-semibold text-emerald-900">{item?.category?.name ?? '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Kode</span>
                  <span className="font-semibold text-emerald-900">{item?.item_code}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Merek</span>
                  <span className="font-semibold text-emerald-900">{item?.brand || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">Satuan</span>
                  <span className="font-semibold text-emerald-900">{item?.unit}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs font-semibold text-slate-400">Tipe</span>
                  <span className="font-semibold text-emerald-900 capitalize">{item?.type === 'durable' ? 'Durable' : item?.type === 'consumable' ? 'Consumable' : item?.type}</span>
                </div>
              </div>
            </div>

            {/* Inventory History Plans */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-md font-bold text-emerald-900">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Riwayat Pemeliharaan
              </h3>
              
              {item?.maintenance_logs && item?.maintenance_logs.length > 0 ? (
                <div className="space-y-4">
                  {item?.maintenance_logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
                      <div>
                        <p className="font-semibold text-emerald-900">{log.description || 'Laporan Kerusakan'}</p>
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
      <LoadingOverlay isLoading={loading} />
      <ImageModal 
        isOpen={previewImage} 
        onClose={() => setPreviewImage(false)} 
        imageUrl={getImageUrl(item?.image)} 
        altText={item?.name} 
      />
    </div>
  );
}
