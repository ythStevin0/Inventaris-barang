import { useState } from 'react';

function getInitialForm(initialData) {
  if (!initialData) {
    return {
      item_id: '',
      type: 'kerusakan',
      description: '',
      status: 'reported',
      cost: '',
      maintenance_date: '',
      resolved_date: '',
      resolution_notes: '',
    };
  }
  return {
    item_id: initialData.item_id || '',
    type: initialData.type || 'kerusakan',
    description: initialData.description || '',
    status: initialData.status || 'reported',
    cost: initialData.cost || '',
    maintenance_date: initialData.maintenance_date ? String(initialData.maintenance_date).split('T')[0] : '',
    resolved_date: initialData.resolved_date ? String(initialData.resolved_date).split('T')[0] : '',
    resolution_notes: initialData.resolution_notes || '',
  };
}

export default function MaintenanceFormModal({ isOpen, onClose, onSubmit, initialData, items }) {
  const [form, setForm] = useState(() => getInitialForm(initialData));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.item_id) {
      setFormError('Silakan pilih barang terlebih dahulu.');
      return;
    }
    if (!form.description.trim()) {
      setFormError('Deskripsi kendala wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch {
      setFormError('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-secondary-900">
            {initialData ? 'Edit Data Kerusakan' : 'Lapor Kerusakan/Maintenance'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {formError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Kolom Kiri - Data Laporan */}
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Pilih Barang</label>
                <select
                  name="item_id"
                  value={form.item_id}
                  onChange={handleChange}
                  disabled={!!initialData}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:bg-accent-100"
                >
                  <option value="">-- Pilih Barang --</option>
                  {(items || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_code} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Jenis Laporan</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                >
                  <option value="kerusakan">Kerusakan</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="kehilangan">Kehilangan</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Tgl Kejadian/Maintenance</label>
                <input
                  type="date"
                  name="maintenance_date"
                  value={form.maintenance_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Deskripsi Kendala</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ceritakan detail kerusakan/kendala..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* Kolom Kanan - Tindak Lanjut */}
            <div className="space-y-5 rounded-xl bg-accent-50 p-4 border border-slate-100">
              <h3 className="text-sm font-bold text-secondary-800 border-b border-slate-200 pb-2 mb-3">Bagian Tindak Lanjut</h3>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Status Perbaikan</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                >
                  <option value="reported">Dilaporkan (Menunggu)</option>
                  <option value="in_progress">Sedang Diproses/Diperbaiki</option>
                  <option value="resolved">Selesai</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Tgl Selesai Perbaikan</label>
                <input
                  type="date"
                  name="resolved_date"
                  value={form.resolved_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Biaya Perbaikan (Rp)</label>
                <input
                  type="number"
                  name="cost"
                  value={form.cost}
                  onChange={handleChange}
                  placeholder="Misal: 150000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-secondary-700">Catatan Penyelesaian</label>
                <textarea
                  name="resolution_notes"
                  value={form.resolution_notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Catatan setelah diperbaiki..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-accent-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-secondary-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-secondary-800 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
