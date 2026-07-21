import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import SlideOver from '../ui/SlideOver';
import { getImageUrl } from '../../utils/imageUtils';
import ImageModal from '../ui/ImageModal';

export default function ItemQRDrawer({ isOpen, onClose, item }) {
  const qrRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(false);

  if (!isOpen || !item) return null;

  // URL yang akan dibuka jika discan oleh kamera bawaan HP
  const qrValue = `${window.location.origin}/borrowings?item_id=${item.id}`;

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    const qrImage = canvas.toDataURL('image/png');
    
    // Buka jendela baru khusus untuk print
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

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Detail & QR Code">
      <div className="flex flex-col items-center">
        {/* Foto Barang */}
        <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-slate-200">
          {item.image ? (
            <img 
              src={getImageUrl(item.image)}
              alt={item.name}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setPreviewImage(true)}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/400x400?text=No+Image';
              }}
            />
          ) : (
            <div className="text-slate-400 flex flex-col items-center">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Tidak ada foto</span>
            </div>
          )}
        </div>

        {/* Info & QR Code */}
        <div className="w-full bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center mb-6 text-center">
          <h3 className="font-bold text-xl text-secondary-900 mb-1">{item.name}</h3>
          <p className="text-sm text-slate-500 font-mono mb-6">{item.item_code}</p>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-block" ref={qrRef}>
            <QRCodeCanvas 
              value={qrValue} 
              size={180} 
              level={"H"}
              includeMargin={false}
              bgColor={"#ffffff"}
              fgColor={"#0f172a"}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex gap-3 mt-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 cursor-pointer"
          >
            Cetak QR Code
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
      
      <ImageModal 
        isOpen={previewImage} 
        onClose={() => setPreviewImage(false)} 
        imageUrl={getImageUrl(item.image)} 
        altText={item.name} 
      />
    </SlideOver>
  );
}
