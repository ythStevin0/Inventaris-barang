import { memo } from 'react';
import Alert from '../ui/Alert';

const ItemForm = memo(function ItemForm({
  categories,
  clientError,
  form,
  submitting,
  onChange,
  onSubmit,
  isEditing,
  onCancelEdit,
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {clientError ? <Alert tone="warning">{clientError}</Alert> : null}

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

      <FormField label="Foto Barang (opsional)">
        <div className="flex flex-col gap-2">
          {form.image && typeof form.image === 'string' && (
            <img src={form.image} alt="Preview" className="h-32 w-32 object-cover rounded-xl border border-slate-200" />
          )}
          {form.image && form.image instanceof File && (
            <img src={URL.createObjectURL(form.image)} alt="Preview" className="h-32 w-32 object-cover rounded-xl border border-slate-200" />
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            name="image"
            onChange={onChange}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />
        </div>
      </FormField>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-secondary-700 transition hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            disabled={submitting}
          >
            Batal Edit
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-secondary-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          disabled={submitting || Boolean(clientError)}
        >
          {submitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan Barang')}
        </button>
      </div>
    </form>
  );
});

export default ItemForm;

function FormField({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-secondary-700">{label}</span>
      {children}
    </label>
  );
}

const fieldClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-secondary-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100';
