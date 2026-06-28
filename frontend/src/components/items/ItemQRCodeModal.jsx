import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

export default function ItemQRCodeModal({ isOpen, onClose, item }) {
  const qrRef = useRef(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-[28px] border border-white bg-white p-6 shadow-2xl text-center">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">QR Code Barang</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4" ref={qrRef}>
            <QRCodeCanvas 
              value={qrValue} 
              size={200} 
              level={"H"}
              includeMargin={true}
              bgColor={"#ffffff"}
              fgColor={"#0f172a"}
            />
          </div>
          <h4 className="font-bold text-lg text-slate-800">{item.name}</h4>
          <p className="text-sm text-slate-500 font-mono mt-1">{item.item_code}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-sky-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Cetak QR
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
