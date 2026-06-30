import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  
  useEffect(() => {
    if (!isOpen) return;

    const html5QrCode = new Html5Qrcode("qr-reader");

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Stop scanning and pass the text
            html5QrCode.stop().then(() => {
              onScanSuccess(decodedText);
            }).catch(err => console.error("Failed to stop scanner", err));
          },
          (errorMessage) => {
            // ignore scan errors (it fires constantly when nothing is found)
          }
        );
        scannerRef.current = html5QrCode;
      } catch (err) {
        setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
        console.error(err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error(err));
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-6 shadow-2xl text-center">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-secondary-900">Scan QR Code Barang</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-accent-100 hover:text-secondary-700"
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl mb-4">
            {error}
          </div>
        ) : (
          <p className="text-sm text-slate-500 mb-4">
            Arahkan kamera ke QR Code yang tertempel di fisik barang.
          </p>
        )}

        <div className="overflow-hidden rounded-2xl bg-black mb-6">
          <div id="qr-reader" className="w-full"></div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-secondary-700 transition hover:bg-accent-50"
        >
          Batal Scan
        </button>
      </div>
    </div>
  );
}
