import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Alert from '../../components/ui/Alert';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setError('');
    setSuccess('');
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
    <div className="min-h-screen px-5 py-8">
      <PageHeader
        eyebrow="Inventaris Barang"
        title="Kelola Kategori"
        description={`Login sebagai ${user?.name ?? 'Pengguna'}${user?.role ? ` (${user.role})` : ''}.`}
        actions={
          <>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-secondary-800 transition hover:bg-accent-50"
            >
              Kembali ke Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-secondary-800 transition hover:bg-accent-50"
            >
              Logout
            </button>
          </>
        }
      />

      <div className="mx-auto mt-6 flex w-full max-w-7xl flex-col gap-4">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {success ? <Alert tone="success">{success}</Alert> : null}
      </div>

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-6 xl:grid-cols-[1.35fr_1fr]">
        {/* Tabel Daftar Kategori */}
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-secondary-900">
                Daftar Kategori
              </h2>
              <p className="text-sm text-slate-500">
                Data diambil langsung dari endpoint{' '}
                <code>/api/categories</code>.
              </p>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-bold text-sky-800">
              {categories.length} kategori
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-3 py-3 font-semibold">Nama</th>
                  <th className="px-3 py-3 font-semibold">Deskripsi</th>
                  {canManage && (
                    <th className="px-3 py-3 font-semibold text-right">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManage ? 3 : 2}
                      className="px-3 py-8 text-center text-sm text-slate-400"
                    >
                      Belum ada kategori. Silakan tambahkan kategori baru.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-slate-100 align-top"
                    >
                      <td className="px-3 py-4 font-semibold text-secondary-800">
                        {category.name}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">
                        {category.description || '-'}
                      </td>
                      {canManage && (
                        <td className="px-3 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(category)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-secondary-700 transition hover:bg-accent-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              className="rounded-lg border border-red-200 bg-white px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Tambah / Edit Kategori */}
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-secondary-900">
            {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            Form ini akan mengirim request ke backend melalui{' '}
            <code>
              {editingId
                ? `PUT /api/categories/${editingId}`
                : 'POST /api/categories'}
            </code>
            .
          </p>

          {!canManage ? (
            <Alert tone="warning">
              Role kamu saat ini tidak memiliki izin untuk mengelola kategori.
              Login sebagai admin atau pengurus untuk mencoba form ini.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-secondary-700">
                  Nama Kategori
                </span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-secondary-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="Contoh: Elektronik"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-secondary-700">
                  Deskripsi (opsional)
                </span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full min-h-20 resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-secondary-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="Deskripsi singkat kategori"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-secondary-700 transition hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    disabled={submitting}
                  >
                    Batal Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-secondary-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Menyimpan...'
                    : editingId
                      ? 'Simpan Perubahan'
                      : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
      <LoadingOverlay isLoading={loading} />
    </div>
  );
}
