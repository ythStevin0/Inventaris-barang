export default function ItemForm({
  categories,
  form,
  submitting,
  onChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Kategori">
        <select
          name="category_id"
          value={form.category_id}
          onChange={onChange}
          className={fieldClassName}
          required
        >
          <option value="">Pilih kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Kode Barang">
          <input
            name="item_code"
            value={form.item_code}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Contoh: LPT"
            required
          />
        </FormField>

        <FormField label="Nama Barang">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Laptop Asus"
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Tipe">
          <select
            name="type"
            value={form.type}
            onChange={onChange}
            className={fieldClassName}
          >
            <option value="durable">Durable</option>
            <option value="consumable">Consumable</option>
          </select>
        </FormField>

        <FormField label="Satuan">
          <input
            name="unit"
            value={form.unit}
            onChange={onChange}
            className={fieldClassName}
            placeholder="unit / pcs / rim"
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="Stok Total">
          <input
            type="number"
            name="stock_total"
            min="0"
            value={form.stock_total}
            onChange={onChange}
            className={fieldClassName}
            required
          />
        </FormField>

        <FormField label="Stok Tersedia">
          <input
            type="number"
            name="stock_available"
            min="0"
            value={form.stock_available}
            onChange={onChange}
            className={fieldClassName}
            required
          />
        </FormField>

        <FormField label="Stok Rusak">
          <input
            type="number"
            name="stock_damaged"
            min="0"
            value={form.stock_damaged}
            onChange={onChange}
            className={fieldClassName}
            required
          />
        </FormField>
      </div>

      <FormField label="Deskripsi">
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows="4"
          className={`${fieldClassName} min-h-28 resize-y`}
          placeholder="Deskripsi singkat barang"
        />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Lokasi">
          <input
            name="location"
            value={form.location}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Lemari Elektronik"
          />
        </FormField>

        <FormField label="Brand">
          <input
            name="brand"
            value={form.brand}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Asus / Epson / Snowman"
          />
        </FormField>
      </div>

      <FormField label="Image URL (opsional)">
        <input
          name="image"
          value={form.image}
          onChange={onChange}
          className={fieldClassName}
          placeholder="https://..."
        />
      </FormField>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={submitting}
      >
        {submitting ? 'Menyimpan...' : 'Simpan Barang'}
      </button>
    </form>
  );
}

function FormField({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const fieldClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100';
