import { useState } from 'react';

export default function BorrowingForm({ items, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    borrow_date: new Date().toISOString().split('T')[0],
    due_date: '',
    purpose: '',
    notes: '',
  });
  const [selectedItems, setSelectedItems] = useState([{ item_id: '', quantity: 1, notes: '' }]);

  const availableItems = items.filter((item) => item.is_active && item.stock_available > 0);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setSelectedItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: field === 'quantity' ? Math.max(1, Number(value)) : value };
      return next;
    });
  };

  const addItemRow = () => {
    setSelectedItems((prev) => [...prev, { item_id: '', quantity: 1, notes: '' }]);
  };

  const removeItemRow = (index) => {
    if (selectedItems.length <= 1) return;
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      items: selectedItems
        .filter((si) => si.item_id)
        .map((si) => ({
          item_id: Number(si.item_id),
          quantity: Number(si.quantity),
          notes: si.notes || null,
        })),
    };
    onSubmit(payload);
  };

  const getMaxQuantity = (itemId) => {
    const item = items.find((i) => i.id === Number(itemId));
    return item ? item.stock_available : 999;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tanggal Pinjam */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="borrow_date" className="mb-1 block text-sm font-semibold text-slate-700">
            Tanggal Pinjam <span className="text-red-500">*</span>
          </label>
          <input
            id="borrow_date"
            type="date"
            name="borrow_date"
            value={form.borrow_date}
            onChange={handleFormChange}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div>
          <label htmlFor="due_date" className="mb-1 block text-sm font-semibold text-slate-700">
            Tanggal Tenggat Kembali <span className="text-red-500">*</span>
          </label>
          <input
            id="due_date"
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleFormChange}
            min={form.borrow_date}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>

      {/* Tujuan */}
      <div>
        <label htmlFor="purpose" className="mb-1 block text-sm font-semibold text-slate-700">
          Tujuan Peminjaman <span className="text-red-500">*</span>
        </label>
        <textarea
          id="purpose"
          name="purpose"
          value={form.purpose}
          onChange={handleFormChange}
          required
          rows={3}
          placeholder="Jelaskan tujuan peminjaman..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      {/* Catatan */}
      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-semibold text-slate-700">
          Catatan (opsional)
        </label>
        <input
          id="notes"
          type="text"
          name="notes"
          value={form.notes}
          onChange={handleFormChange}
          placeholder="Catatan tambahan..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      {/* Daftar barang yang akan dipinjam */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">
            Barang yang Dipinjam <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addItemRow}
            className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            + Tambah Barang
          </button>
        </div>

        <div className="space-y-3">
          {selectedItems.map((si, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
            >
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-xs font-medium text-slate-600">Pilih Barang</label>
                <select
                  value={si.item_id}
                  onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">-- Pilih barang --</option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.item_code}) — tersedia: {item.stock_available}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="mb-1 block text-xs font-medium text-slate-600">Jumlah</label>
                <input
                  type="number"
                  min={1}
                  max={getMaxQuantity(si.item_id)}
                  value={si.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="min-w-[140px] flex-1">
                <label className="mb-1 block text-xs font-medium text-slate-600">Catatan</label>
                <input
                  type="text"
                  value={si.notes}
                  onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                  placeholder="Opsional..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {selectedItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-sky-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          {submitting ? 'Mengirim...' : 'Ajukan Peminjaman'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
