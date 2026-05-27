import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ItemForm from '../../components/items/ItemForm';
import { initialItemForm } from '../../components/items/itemFormDefaults';
import ItemsTable from '../../components/items/ItemsTable';
import Alert from '../../components/ui/Alert';
import { getCategories } from '../../services/categoriesService';
import { createItem, getItems } from '../../services/itemsService';
import useAuthStore from '../../store/authStore';
import { canManageInventory } from '../../utils/permissions';
import { validateItemForm } from '../../utils/validateItemForm';

export default function ItemsPage() {
  const navigate = useNavigate();
  const { user, logout, getMe } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialItemForm);

  const canManageItems = canManageInventory(user);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const currentUser = user ?? (await getMe());

        const [categoriesResponse, itemsResponse] = await Promise.all([
          getCategories(),
          getItems(),
        ]);

        setCategories(categoriesResponse);
        setItems(itemsResponse);
        if (!currentUser) {
          setError('Gagal memuat data pengguna.');
        }
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
  }, [getMe, user]);

  const clientError = useMemo(() => validateItemForm(form), [form]);

  const refreshItems = async () => {
    const response = await getItems();
    setItems(response);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => {
      const nextForm = {
        ...currentForm,
        [name]:
          name === 'stock_total' ||
          name === 'stock_available' ||
          name === 'stock_damaged'
            ? Number(value)
            : value,
      };

      if (name === 'type' && value === 'consumable' && currentForm.unit === 'unit') {
        nextForm.unit = 'pcs';
      }

      return nextForm;
    });
  };

  const handleSubmit = async (event) => {
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

      const response = await createItem(payload);

      setSuccess(response.message ?? 'Barang berhasil dibuat.');
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
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-base text-slate-600">
        Memuat data inventaris...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8">
      <PageHeader
        eyebrow="Inventaris Barang"
        title="Kelola Barang Inventaris"
        description={`Login sebagai ${user?.name ?? 'Pengguna'}${user?.role ? ` (${user.role})` : ''}.`}
        actions={
          <>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
            Kembali ke Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
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
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">Daftar Barang</h2>
              <p className="text-sm text-slate-500">
                Data diambil langsung dari endpoint <code>/api/items</code>.
              </p>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-bold text-sky-800">
              {items.length} barang
            </span>
          </div>

          <ItemsTable items={items} />
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">Tambah Barang Baru</h2>
          <p className="mb-5 text-sm text-slate-500">
            Form ini akan mengirim request ke backend melalui <code>POST /api/items</code>.
          </p>

          {!canManageItems ? (
            <Alert tone="warning">
              Role kamu saat ini tidak memiliki izin untuk menambah barang. Login sebagai
              admin atau pengurus untuk mencoba form ini.
            </Alert>
          ) : (
            <ItemForm
              categories={categories}
              clientError={clientError}
              form={form}
              submitting={submitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </section>
    </div>
  );
}
