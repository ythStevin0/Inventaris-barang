export default function ItemsTable({
  items,
  canManageItems,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-500">
            <th className="px-3 py-3 font-semibold">Kode</th>
            <th className="px-3 py-3 font-semibold">Nama</th>
            <th className="px-3 py-3 font-semibold">Kategori</th>
            <th className="px-3 py-3 font-semibold">Tipe</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 font-semibold">Stok</th>
            {canManageItems && <th className="px-3 py-3 font-semibold text-right">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const canDelete = Number(item.item_units_count ?? 0) === 0;

            return (
              <tr key={item.id} className="border-b border-slate-100 align-top">
                <td className="px-3 py-4 font-semibold text-slate-800">{item.item_code}</td>
                <td className="px-3 py-4 text-slate-800">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.brand || '-'}</p>
                </td>
                <td className="px-3 py-4 text-slate-700">{item.category?.name ?? '-'}</td>
                <td className="px-3 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                    {item.type}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-3 py-4 text-slate-800">
                  <p className="font-semibold">
                    {item.stock_available}/{item.stock_total}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">rusak: {item.stock_damaged}</p>
                </td>
                {canManageItems && (
                  <td className="px-3 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      ) : (
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-500">
                          Tidak bisa hapus
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleActive(item)}
                        className={`rounded-lg border px-3 py-1 text-sm font-medium transition ${
                          item.is_active
                            ? 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
                            : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
