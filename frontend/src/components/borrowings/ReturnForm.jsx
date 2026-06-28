import { useState } from 'react';

export default function ReturnForm({ borrowing, submitting, onSubmit, onCancel }) {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnProofImage, setReturnProofImage] = useState(null);
  const [returnItems, setReturnItems] = useState(
    (borrowing?.borrowingItems ?? borrowing?.borrowing_items ?? []).map((bi) => ({
      borrowing_item_id: bi.id,
      item_name: bi.item?.name ?? '-',
      item_code: bi.item?.item_code ?? '-',
      quantity: bi.quantity,
      condition_after: 'baik',
      quantity_damaged: 0,
      fine_amount: 0,
      damage_notes: '',
    }))
  );

  const handleItemChange = (index, field, value) => {
    setReturnItems((prev) => {
      const next = [...prev];
      if (field === 'quantity_damaged' || field === 'fine_amount') {
        next[index] = { ...next[index], [field]: Math.max(0, Number(value)) };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      return_date: returnDate,
      items: returnItems.map((ri) => ({
        borrowing_item_id: ri.borrowing_item_id,
        condition_after: ri.condition_after,
        quantity_damaged: Number(ri.quantity_damaged),
        fine_amount: Number(ri.fine_amount),
        damage_notes: ri.damage_notes || null,
      })),
      return_proof_image: returnProofImage,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="return_date" className="mb-1 block text-sm font-semibold text-slate-700">
          Tanggal Pengembalian <span className="text-red-500">*</span>
        </label>
        <input
          id="return_date"
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Foto Bukti Pengembalian <span className="text-slate-400 font-normal">(Opsional)</span>
        </label>
        <div className="flex flex-col gap-2">
          {returnProofImage && (
            <img src={URL.createObjectURL(returnProofImage)} alt="Preview" className="h-32 w-32 object-cover rounded-xl border border-slate-200" />
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setReturnProofImage(e.target.files[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-slate-700">Detail Pengembalian per Barang</label>

        <div className="space-y-3">
          {returnItems.map((ri, index) => (
            <div key={ri.borrowing_item_id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                  {ri.item_code}
                </span>
                <span className="text-sm font-semibold text-slate-800">{ri.item_name}</span>
                <span className="text-xs text-slate-500">— dipinjam: {ri.quantity}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Kondisi Akhir</label>
                  <select
                    value={ri.condition_after}
                    onChange={(e) => handleItemChange(index, 'condition_after', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="baik">Baik</option>
                    <option value="rusak">Rusak</option>
                    <option value="perbaikan">Perlu Perbaikan</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Jumlah Rusak</label>
                  <input
                    type="number"
                    min={0}
                    max={ri.quantity}
                    value={ri.quantity_damaged}
                    onChange={(e) => handleItemChange(index, 'quantity_damaged', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Denda (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={ri.fine_amount}
                    onChange={(e) => handleItemChange(index, 'fine_amount', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Catatan Kerusakan</label>
                  <input
                    type="text"
                    value={ri.damage_notes}
                    onChange={(e) => handleItemChange(index, 'damage_notes', e.target.value)}
                    placeholder="Opsional..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          {submitting ? 'Memproses...' : 'Proses Pengembalian'}
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
