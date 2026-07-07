import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';
import ImageModal from '../ui/ImageModal';

const ItemsTable = memo(function ItemsTable({
  items,
  meta,
  onPageChange,
  canManageItems,
  onEdit,
  onDelete,
  onToggleActive,
  onShowQR,
}) {
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-[#11224E] font-bold">
              <th className="px-4 py-4">KODE</th>
              <th className="px-4 py-4">NAMA BARANG</th>
              <th className="px-4 py-4">KATEGORI</th>
              <th className="px-4 py-4">TIPE</th>
              <th className="px-4 py-4">STATUS</th>
              <th className="px-4 py-4">STOK</th>
              {canManageItems && <th className="px-4 py-4 text-right">AKSI</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const canDelete = Number(item.item_units_count ?? 0) === 0;

              return (
                <tr key={item.id} className="bg-white border-b border-slate-100/80 align-middle transition-colors">
                  <td className="px-4 py-4 font-bold text-[#11224E] text-sm relative">
                    {/* Orange Indicator */}
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#F87B1B] rounded-r-md"></div>
                    {item.item_code}
                  </td>
                  <td className="px-4 py-4 text-secondary-800 flex items-center gap-3">
                    {item.image ? (
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.name} 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => setPreviewImage({ url: getImageUrl(item.image), name: item.name })}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/items/${item.id}`}
                        className="font-bold text-[#11224E] hover:text-[#F87B1B] transition text-sm text-left block"
                      >
                        {item.name}
                      </Link>
                      <div className="text-xs text-slate-500 font-medium">
                        {item.brand || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-600">
                    {item.category?.name || '-'}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[#F1EDEA] px-3 py-1 text-[11px] font-bold capitalize text-[#344C86]">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                        item.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-[#F1EDEA] text-slate-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#11224E]">
                        {item.stock_available}/{item.stock_total}
                      </span>
                      {item.stock_damaged > 0 && (
                        <span className="text-xs text-rose-500 font-medium">
                          rusak: {item.stock_damaged}
                        </span>
                      )}
                    </div>
                  </td>
                  {canManageItems && (
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onShowQR(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Lihat QR Code"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onToggleActive(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.is_active 
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={item.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {item.is_active ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Barang"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          disabled={!canDelete}
                          className={`p-1.5 rounded-lg transition-colors ${
                            canDelete 
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' 
                              : 'text-slate-300 cursor-not-allowed opacity-50'
                          }`}
                          title={canDelete ? "Hapus Barang" : "Tidak bisa dihapus (sudah ada riwayat/unit)"}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            
            {items.length === 0 && (
              <tr>
                <td colSpan={canManageItems ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm">Belum ada data barang</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-4 bg-white rounded-b-xl">
          <div className="hidden sm:block">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-bold text-[#11224E]">{meta.from || 0}</span> sampai <span className="font-bold text-[#11224E]">{meta.to || 0}</span> dari <span className="font-bold text-[#11224E]">{meta.total}</span> hasil
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end gap-2">
            <button
              onClick={() => onPageChange(meta.current_page - 1)}
              disabled={meta.current_page === 1}
              className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#11224E] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => onPageChange(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page}
              className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#11224E] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      <ImageModal 
        isOpen={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        imageUrl={previewImage?.url} 
        altText={previewImage?.name} 
      />
    </>
  );
});

export default ItemsTable;
