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
  const fieldClassName = `w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-secondary-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${isEditing ? 'focus:border-indigo-400 focus:ring-indigo-50' : 'focus:border-[#F87B1B] focus:ring-orange-50'}`;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 p-1">
      {clientError ? <Alert tone="warning">{clientError}</Alert> : null}

      <FormField label="Kategori" isEditing={isEditing}>
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
        <FormField label="Kode Barang" isEditing={isEditing}>
          <input
            name="item_code"
            value={form.item_code}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Contoh: LPT"
            required
          />
        </FormField>

        <FormField label="Nama Barang" isEditing={isEditing}>
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
        <FormField label="Tipe" isEditing={isEditing}>
          <select
            name="type"
            value={form.type}
            onChange={onChange}
            className={fieldClassName}
          >
            <option value="durable">Durable (Barang Tahan Lama)</option>
            <option value="consumable">Consumable (Barang Habis Pakai)</option>
          </select>
        </FormField>

        <FormField label="Satuan" isEditing={isEditing}>
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
        <FormField label="Stok Total" isEditing={isEditing}>
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

        <FormField label="Stok Tersedia" isEditing={isEditing}>
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

        <FormField label="Stok Rusak" isEditing={isEditing}>
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

      <FormField label="Deskripsi (opsional)" isEditing={isEditing}>
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
        <FormField label="Lokasi (opsional)" isEditing={isEditing}>
          <input
            name="location"
            value={form.location}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Lemari Elektronik"
          />
        </FormField>

        <FormField label="Brand (opsional)" isEditing={isEditing}>
          <input
            name="brand"
            value={form.brand}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Asus / Epson / Snowman"
          />
        </FormField>
      </div>

      <FormField label="Foto Barang (opsional)" isEditing={isEditing}>
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
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />
        </div>
      </FormField>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto shadow-sm"
            disabled={submitting}
          >
            Batal Edit
          </button>
        )}
        <button
          type="submit"
          className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto gap-2 ${isEditing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#F87B1B] hover:bg-[#F87B1B]/90'}`}
          disabled={submitting || Boolean(clientError)}
        >
          {submitting ? (
            <span className="animate-pulse">Menyimpan...</span>
          ) : isEditing ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Simpan Perubahan
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Simpan Barang Baru
            </>
          )}
        </button>
      </div>
    </form>
  );
});

export default ItemForm;

function FormField({ label, children, isEditing }) {
  return (
    <label className="flex flex-col gap-2">
      <span className={`text-sm font-bold ${isEditing ? 'text-indigo-900' : 'text-[#11224E]'}`}>{label}</span>
      {children}
    </label>
  );
}
