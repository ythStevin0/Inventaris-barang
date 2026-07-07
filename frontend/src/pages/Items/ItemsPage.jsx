import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ItemForm from '../../components/items/ItemForm';
import { initialItemForm } from '../../components/items/itemFormDefaults';
import ItemsTable from '../../components/items/ItemsTable';
import ItemQRDrawer from '../../components/items/ItemQRDrawer';
import SlideOver from '../../components/ui/SlideOver';
import ImportItemsModal from '../../components/items/ImportItemsModal';
import Alert from '../../components/ui/Alert';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import { getCategories } from '../../services/categoriesService';
import { createItem, getItems, updateItem, deleteItem, importItems } from '../../services/itemsService';
import useAuthStore from '../../store/authStore';
import { canManageInventory } from '../../utils/permissions';
import { validateItemForm } from '../../utils/validateItemForm';

export default function ItemsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getMe } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialItemForm);
  const [editingItemId, setEditingItemId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [meta, setMeta] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // State for QR Code
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedItemForQR, setSelectedItemForQR] = useState(null);

  // State for Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);

  const canManageItems = canManageInventory(user);
  const itemFilters = useMemo(() => {
    const filters = { page: currentPage };
    if (activeFilter === 'active') {
      filters.is_active = 1;
    } else if (activeFilter === 'inactive') {
      filters.is_active = 0;
    }
    
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    }

    return filters;
  }, [activeFilter, currentPage, debouncedSearch]);

  useEffect(() => {
    const loadPage = async () => {
      try {
        if (!user) await getMe();

        let categoriesResponse = [];
        let itemsResponse = [];

        if (canManageInventory(user)) {
          [categoriesResponse, itemsResponse] = await Promise.all([
            getCategories(),
            getItems(itemFilters),
          ]);
        } else {
          itemsResponse = await getItems(itemFilters);
        }

        setCategories(categoriesResponse);
        setItems(itemsResponse.data || []);
        setMeta(itemsResponse.meta || null);
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ??
            'Gagal memuat data barang dan kategori.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemFilters]);

  useEffect(() => {
    if (location.state?.editItemId && items.length > 0) {
      const itemToEdit = items.find(i => i.id === location.state.editItemId);
      if (itemToEdit) {
        setTimeout(() => {
          setEditingItemId(itemToEdit.id);
          setForm({
            item_code: itemToEdit.item_code,
            name: itemToEdit.name,
            category_id: itemToEdit.category_id,
            type: itemToEdit.type,
            unit: itemToEdit.unit,
            stock_total: itemToEdit.stock_total,
            stock_available: itemToEdit.stock_available,
            stock_damaged: itemToEdit.stock_damaged,
            description: itemToEdit.description || '',
            location: itemToEdit.location || '',
            brand: itemToEdit.brand || '',
            image: itemToEdit.image || null,
          });
          // Clear state to avoid infinite loops or repeating triggers on reload
          navigate(location.pathname, { replace: true, state: {} });
        }, 0);
      }
    }
  }, [location.state, items, navigate, location.pathname]);

  const clientError = useMemo(() => validateItemForm(form), [form]);

  const refreshItems = useCallback(async () => {
    const response = await getItems(itemFilters);
    setItems(response.data || []);
    setMeta(response.meta || null);
  }, [itemFilters]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    setForm((currentForm) => {
      let finalValue = value;
      if (event.target.type === 'file') {
        finalValue = event.target.files[0] || null;
      } else if (name === 'stock_total' || name === 'stock_available' || name === 'stock_damaged') {
        finalValue = Number(value);
      }

      const nextForm = {
        ...currentForm,
        [name]: finalValue,
      };

      if (name === 'type' && value === 'consumable' && currentForm.unit === 'unit') {
        nextForm.unit = 'pcs';
      }

      return nextForm;
    });
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (clientError) {
      setError(clientError);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        image: form.image || null,
      };

      if (editingItemId) {
        const response = await updateItem(editingItemId, payload);
        setSuccess(response.message ?? 'Barang berhasil diperbarui.');
        setEditingItemId(null);
      } else {
        const response = await createItem(payload);
        setSuccess(response.message ?? 'Barang berhasil dibuat.');
      }

      setForm(initialItemForm);
      await refreshItems();
    } catch (submitError) {
      const errors = submitError.response?.data?.errors;
      const firstError = errors
        ? Object.values(errors).flat()[0]
        : submitError.response?.data?.message;

      setError(firstError ?? 'Gagal menyimpan barang.');
    } finally {
      setSubmitting(false);
    }
  }, [clientError, form, editingItemId, refreshItems]);

  const handleEdit = useCallback((item) => {
    setEditingItemId(item.id);
    setForm({
      item_code: item.item_code,
      name: item.name,
      category_id: item.category_id,
      type: item.type,
      unit: item.unit,
      stock_total: item.stock_total,
      stock_available: item.stock_available,
      stock_damaged: item.stock_damaged,
      description: item.description || '',
      location: item.location || '',
      brand: item.brand || '',
      image: item.image || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingItemId(null);
    setForm(initialItemForm);
    setError('');
    setSuccess('');
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (
      !window.confirm(
        'Hapus permanen hanya untuk barang yang belum punya riwayat atau unit fisik. Lanjutkan hapus barang ini?'
      )
    ) {
      return;
    }

    try {
      const response = await deleteItem(id);
      setSuccess(response.message ?? 'Barang berhasil dihapus.');
      if (editingItemId === id) {
        handleCancelEdit();
      }
      await refreshItems();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Gagal menghapus barang. Jika barang sudah punya riwayat, gunakan Nonaktifkan.';
      setError(message);
    }
  }, [editingItemId, handleCancelEdit, refreshItems]);

  const handleToggleActive = useCallback(async (item) => {
    const nextIsActive = !item.is_active;
    const actionLabel = nextIsActive ? 'mengaktifkan' : 'menonaktifkan';

    if (!window.confirm(`Apakah Anda yakin ingin ${actionLabel} barang ini?`)) {
      return;
    }

    try {
      const response = await updateItem(item.id, {
        item_code: item.item_code,
        name: item.name,
        category_id: item.category_id,
        type: item.type,
        unit: item.unit,
        stock_total: item.stock_total,
        stock_available: item.stock_available,
        stock_damaged: item.stock_damaged,
        description: item.description || '',
        location: item.location || '',
        brand: item.brand || '',
        image: item.image || null,
        is_active: nextIsActive,
      });

      setSuccess(
        response.message ??
          `Barang berhasil ${nextIsActive ? 'diaktifkan' : 'dinonaktifkan'}.`
      );

      if (editingItemId === item.id) {
        handleCancelEdit();
      }

      await refreshItems();
    } catch (err) {
      const message =
        err.response?.data?.message ??
        `Gagal ${nextIsActive ? 'mengaktifkan' : 'menonaktifkan'} barang.`;
      setError(message);
    }
  }, [editingItemId, handleCancelEdit, refreshItems]);

  const handleImport = useCallback(async (file) => {
    setImporting(true);
    setError('');
    setSuccess('');
    try {
      const response = await importItems(file);
      setSuccess(response.message || 'Barang berhasil diimport.');
      setShowImportModal(false);
      await refreshItems();
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Gagal mengimport barang.';
      if (err.response?.data?.errors?.file) {
        errorMessage = err.response.data.errors.file.join('\n');
      }
      setError(errorMessage);
    } finally {
      setImporting(false);
    }
  }, [refreshItems]);

  const handleShowQR = useCallback((item) => {
    setSelectedItemForQR(item);
    setShowQRModal(true);
  }, []);



  return (
    <div className="min-h-screen relative bg-slate-50 overflow-hidden pb-10">
      {/* Background Decorations (Natural Waves / Semangat) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-end">

        {/* Layered Fluid Waves */}
        <svg className="w-full absolute bottom-0 left-0" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '45vh', minHeight: '350px' }}>
          {/* Orange Wave Background */}
          <path fill="#F87B1B" fillOpacity="0.9" d="M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,170.7C672,160,768,192,864,208C960,224,1056,224,1152,197.3C1248,171,1344,117,1392,85.3L1440,53L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          
          {/* Blue Wave Foreground */}
          <path fill="#11224E" fillOpacity="1" d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,202.7C672,224,768,256,864,250.7C960,245,1056,203,1152,181.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="relative z-10 px-5 pt-8">
            <header className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-5 mb-8">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F87B1B]">
            INVENTARIS BARANG
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#11224E] sm:text-4xl">
            Kelola Barang Inventaris
          </h1>
          <p className="text-sm text-slate-500">
            Login sebagai <span className="font-medium">{user?.name ?? 'Pengguna'}</span>{user?.role ? ` (${user.role})` : ''}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali ke Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-xl bg-[#11224E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#11224E]/90 gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </header>
      

      <div className="mx-auto mt-6 flex w-full max-w-7xl flex-col gap-4">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {success ? <Alert tone="success">{success}</Alert> : null}
      </div>

      <section className="mx-auto mt-6 w-full max-w-7xl">
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-4 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#11224E]/10 text-[#11224E] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div>
                <h2 className="mb-1 text-2xl font-bold tracking-tight text-[#11224E]">Daftar Barang</h2>
                <p className="text-sm text-slate-500 font-medium">
                  Dashboard / <span className="text-[#F87B1B]">Kelola Barang</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-bold text-sky-800 whitespace-nowrap">
                {items.length} barang
              </span>
              {canManageItems && (
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => setEditingItemId(null) || setShowForm(true)}
                    className="rounded-xl bg-[#F87B1B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#F87B1B]/90 transition flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Tambah Barang
                  </button>
                  <button 
                    onClick={() => setShowImportModal(true)}
                    className="rounded-xl border border-[#F87B1B] bg-white px-4 py-2 text-sm font-semibold text-[#F87B1B] hover:bg-orange-50 transition flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Import Excel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.value);
                    setCurrentPage(1);
                  }}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold transition border whitespace-nowrap flex-1 sm:flex-none ${
                    activeFilter === filter.value
                      ? 'bg-[#11224E] text-white border-[#11224E]'
                      : 'bg-white text-[#11224E] border-slate-200 hover:border-[#11224E]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text"
                        placeholder="Cari nama atau kode barang..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#11224E] text-sm w-full sm:w-[260px] text-slate-700"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition whitespace-nowrap shrink-0">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="hidden sm:inline">Filter</span>
                </button>
            </div>
          </div>

          <ItemsTable 
            items={items} 
            meta={meta}
            onPageChange={setCurrentPage}
            canManageItems={canManageItems} 
            onEdit={(item) => {
              handleEdit(item);
              setShowForm(true);
            }} 
            onDelete={handleDelete} 
            onToggleActive={handleToggleActive}
            onShowQR={handleShowQR}
          />
        </div>
      </section>

      {canManageItems && (
        <SlideOver 
          isOpen={showForm} 
          onClose={() => {
            setShowForm(false);
            handleCancelEdit();
          }} 
          title={editingItemId ? 'Edit Barang' : 'Tambah Barang Baru'}
          width="max-w-xl"
        >
          <div className="mb-4">
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
              Form ini akan mengirim request ke backend melalui <code>{editingItemId ? `PUT /api/items/${editingItemId}` : 'POST /api/items'}</code>.
            </p>
          </div>
          <ItemForm
            categories={categories}
            clientError={clientError}
            form={form}
            submitting={submitting}
            onChange={handleChange}
            onSubmit={async (e) => {
              const success = await handleSubmit(e);
              if (success) {
                setShowForm(false);
              }
            }}
            isEditing={!!editingItemId}
            onCancelEdit={() => {
              setShowForm(false);
              handleCancelEdit();
            }}
          />
        </SlideOver>
      )}

      <ItemQRDrawer 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)} 
        item={selectedItemForQR} 
      />

      <ImportItemsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        submitting={importing}
      />
      <LoadingOverlay isLoading={loading} />
    </div>
    </div>
  );
}

const statusFilters = [
  { label: 'Aktif', value: 'active' },
  { label: 'Nonaktif', value: 'inactive' },
  { label: 'Semua', value: 'all' },
];
