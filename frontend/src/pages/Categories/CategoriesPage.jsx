import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../../components/ui/Alert';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import SlideOver from '../../components/ui/SlideOver';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoriesService';
import useAuthStore from '../../store/authStore';
import { canManageInventory } from '../../utils/permissions';

const initialForm = { name: '', description: '' };

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { user, logout, getMe } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  
  const [showForm, setShowForm] = useState(false);

  const canManage = canManageInventory(user);

  useEffect(() => {
    const loadPage = async () => {
      try {
        if (!user) await getMe();
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(
          err.response?.data?.message ?? 'Gagal memuat data kategori.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const response = await updateCategory(editingId, form);
        setSuccess(response.message ?? 'Kategori berhasil diperbarui.');
        setEditingId(null);
      } else {
        const response = await createCategory(form);
        setSuccess(response.message ?? 'Kategori berhasil dibuat.');
      }

      setForm(initialForm);
      await refreshCategories();
      setShowForm(false);
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors
        ? Object.values(errors).flat()[0]
        : err.response?.data?.message;

      setError(firstError ?? 'Gagal menyimpan kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || '',
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setError('');
    setSuccess('');
    // Delay clearing the form so it doesn't look empty during the exit animation
    setTimeout(() => {
      setEditingId(null);
      setForm(initialForm);
    }, 300);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    try {
      const response = await deleteCategory(id);
      setSuccess(response.message ?? 'Kategori berhasil dihapus.');
      if (editingId === id) {
        handleCancelEdit();
      }
      await refreshCategories();
    } catch (err) {
      const message =
        err.response?.data?.message || 'Gagal menghapus kategori.';
      setError(message);
    }
  };

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
              Kelola Kategori Inventaris
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

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {success ? <Alert tone="success">{success}</Alert> : null}
      </div>

      <section className="mx-auto mt-6 w-full max-w-7xl">
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-4 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#11224E]/10 text-[#11224E] shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
              <div>
                <h2 className="mb-1 text-2xl font-bold tracking-tight text-[#11224E]">Kelola Kategori</h2>
                <p className="text-sm text-slate-500 font-medium">
                  Dashboard / <span className="text-[#F87B1B]">Kategori</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-bold text-sky-800 whitespace-nowrap">
                {categories.length} kategori
              </span>
              {canManage && (
                <button 
                  onClick={() => {
                    handleCancelEdit(); // reset form
                    setShowForm(true);
                  }}
                  className="rounded-xl bg-[#F87B1B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#F87B1B]/90 transition flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Tambah Kategori
              </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/50 text-slate-500 mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Belum ada kategori</h3>
                <p className="mt-1 text-sm text-slate-500">Mulai dengan menambahkan kategori baru.</p>
                {canManage && (
                  <button 
                    onClick={() => { handleCancelEdit(); setShowForm(true); }}
                    className="mt-4 text-sm font-medium text-[#F87B1B] hover:text-[#e06912] transition-colors"
                  >
                    + Tambah Kategori
                  </button>
                )}
              </div>
            ) : (
              categories.map((category) => {
                const themes = [
                  { card: 'bg-teal-50/60 border-teal-100', avatar: 'bg-teal-100 text-teal-700' },
                  { card: 'bg-rose-50/60 border-rose-100', avatar: 'bg-rose-100 text-rose-700' },
                  { card: 'bg-sky-50/60 border-sky-100', avatar: 'bg-sky-100 text-sky-700' },
                  { card: 'bg-amber-50/60 border-amber-100', avatar: 'bg-amber-100 text-amber-700' },
                  { card: 'bg-indigo-50/60 border-indigo-100', avatar: 'bg-indigo-100 text-indigo-700' },
                  { card: 'bg-fuchsia-50/60 border-fuchsia-100', avatar: 'bg-fuchsia-100 text-fuchsia-700' },
                ];
                const theme = themes[category.id % themes.length];
                
                return (
                  <div
                    key={category.id}
                    className={`group relative flex flex-col justify-between rounded-[24px] border ${theme.card} p-4 transition-all hover:-translate-y-1 hover:shadow-md`}
                  >
                    <div>
                      {/* Top Header: Avatar + Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${theme.avatar} shadow-sm font-bold text-lg`}>
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="text-sm font-bold text-slate-800 truncate">{category.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-slate-500">
                            <span className="font-bold">ID</span>
                            <span>{category.id.toString().padStart(3, '0')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed h-8">
                        {category.description || 'Tidak ada deskripsi.'}
                      </p>
                    </div>

                    <div className="mt-3">
                      <hr className="border-t border-dashed border-slate-200/80 mb-3" />
                      
                      {/* Footer: Actions */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Kategori
                        </span>
                        
                        {canManage && (
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleEdit(category)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* SlideOver Form */}
      <SlideOver
          isOpen={showForm}
          title={editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          onClose={handleCancelEdit}
        >
          <div className="p-1">
            {!canManage ? (
              <Alert tone="warning">
                Role kamu saat ini tidak memiliki izin untuk mengelola kategori.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <label className="flex flex-col gap-2">
                  <span className={`text-sm font-bold ${editingId ? 'text-indigo-900' : 'text-[#11224E]'}`}>
                    Nama Kategori
                  </span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-secondary-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${editingId ? 'focus:border-indigo-400 focus:ring-indigo-50' : 'focus:border-[#F87B1B] focus:ring-orange-50'}`}
                    placeholder="Contoh: Elektronik"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className={`text-sm font-bold ${editingId ? 'text-indigo-900' : 'text-[#11224E]'}`}>
                    Deskripsi <span className="font-normal text-slate-400">(opsional)</span>
                  </span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-secondary-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${editingId ? 'focus:border-indigo-400 focus:ring-indigo-50' : 'focus:border-[#F87B1B] focus:ring-orange-50'}`}
                    placeholder="Deskripsi singkat kategori"
                  />
                </label>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto shadow-sm"
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto gap-2 ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#F87B1B] hover:bg-[#F87B1B]/90'}`}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="animate-pulse">Menyimpan...</span>
                    ) : editingId ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Simpan Perubahan
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Simpan Kategori Baru
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </SlideOver>

      <LoadingOverlay isLoading={loading} />
      </div>
    </div>
  );
}
