import { useState } from 'react';

export default function ImportItemsModal({ isOpen, onClose, onImport, submitting }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        setError('Format file tidak didukung. Harap gunakan file .xlsx, .xls, atau .csv');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Pilih file terlebih dahulu');
      return;
    }
    await onImport(file);
    setFile(null);
  };

  const downloadTemplate = () => {
    const csvContent = "kode_barang,nama_barang,kategori,tipe,satuan,stok_total,stok_rusak,merek,lokasi,deskripsi\nBRG-001,Laptop ASUS,Elektronik,durable,pcs,10,0,ASUS,Ruang 1,Laptop operasional\nATK-001,Kertas HVS,ATK,consumable,rim,50,0,PaperOne,Gudang,Kertas HVS 70gsm";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_barang.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800">Import Data Barang</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed">
              <p className="font-semibold mb-2">Panduan Import:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gunakan file Excel (.xlsx) atau CSV (.csv)</li>
                <li>Baris pertama harus berupa <em>header</em> kolom</li>
                <li>Gunakan template untuk format yang tepat</li>
              </ul>
              <button
                type="button"
                onClick={downloadTemplate}
                className="mt-3 text-blue-600 font-semibold hover:text-blue-700 underline text-sm"
              >
                Unduh Template CSV
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                File Data Barang
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100 cursor-pointer"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!file || submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mengimport...
                </>
              ) : (
                'Import Data'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
