export default function ItemsTable({ items }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-500">
            <th className="px-3 py-3 font-semibold">Kode</th>
            <th className="px-3 py-3 font-semibold">Nama</th>
            <th className="px-3 py-3 font-semibold">Kategori</th>
            <th className="px-3 py-3 font-semibold">Tipe</th>
            <th className="px-3 py-3 font-semibold">Stok</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
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
              <td className="px-3 py-4 text-slate-800">
                <p className="font-semibold">
                  {item.stock_available}/{item.stock_total}
                </p>
                <p className="mt-1 text-sm text-slate-500">rusak: {item.stock_damaged}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
