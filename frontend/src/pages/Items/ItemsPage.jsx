import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const initialForm = {
  category_id: '',
  item_code: '',
  name: '',
  description: '',
  type: 'durable',
  unit: 'unit',
  stock_total: 1,
  stock_available: 1,
  stock_damaged: 0,
  location: '',
  brand: '',
  image: '',
};

export default function ItemsPage() {
  const navigate = useNavigate();
  const { user, logout, getMe } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialForm);

  const canManageItems = user?.role === 'admin' || user?.role === 'pengurus';

  useEffect(() => {
    const loadPage = async () => {
      try {
        if (!user) {
          await getMe();
        }

        const [categoriesResponse, itemsResponse] = await Promise.all([
          api.get('/categories'),
          api.get('/items'),
        ]);

        setCategories(categoriesResponse.data.data ?? []);
        setItems(itemsResponse.data.data ?? []);
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

  const refreshItems = async () => {
    const response = await api.get('/items');
    setItems(response.data.data ?? []);
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
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        image: form.image || null,
      };

      const response = await api.post('/items', payload);

      setSuccess(response.data.message ?? 'Barang berhasil dibuat.');
      setForm(initialForm);
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
    return <div style={styles.state}>Memuat data inventaris...</div>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Inventaris Barang</p>
          <h1 style={styles.title}>Kelola Barang Inventaris</h1>
          <p style={styles.subtitle}>
            Login sebagai <strong>{user?.name ?? 'Pengguna'}</strong>
            {user?.role ? ` (${user.role})` : ''}.
          </p>
        </div>

        <div style={styles.actions}>
          <Link to="/dashboard" style={styles.secondaryButton}>
            Kembali ke Dashboard
          </Link>
          <button type="button" onClick={handleLogout} style={styles.secondaryButton}>
            Logout
          </button>
        </div>
      </header>

      {error && <div style={styles.errorBanner}>{error}</div>}
      {success && <div style={styles.successBanner}>{success}</div>}

      <section style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Daftar Barang</h2>
              <p style={styles.panelText}>
                Data diambil langsung dari endpoint <code>/api/items</code>.
              </p>
            </div>
            <span style={styles.badge}>{items.length} barang</span>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Kode</th>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>Tipe</th>
                  <th style={styles.th}>Stok</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.item_code}</td>
                    <td style={styles.td}>
                      <strong>{item.name}</strong>
                      <div style={styles.mutedText}>{item.brand || '-'}</div>
                    </td>
                    <td style={styles.td}>{item.category?.name ?? '-'}</td>
                    <td style={styles.td}>{item.type}</td>
                    <td style={styles.td}>
                      {item.stock_available}/{item.stock_total}
                      <div style={styles.mutedText}>
                        rusak: {item.stock_damaged}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Tambah Barang Baru</h2>
          <p style={styles.panelText}>
            Form ini akan mengirim request ke backend melalui <code>POST /api/items</code>.
          </p>

          {!canManageItems ? (
            <div style={styles.notice}>
              Role kamu saat ini tidak memiliki izin untuk menambah barang. Login sebagai
              admin atau pengurus untuk mencoba form ini.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Kategori</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Kode Barang</label>
                  <input
                    name="item_code"
                    value={form.item_code}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Contoh: LPT"
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Nama Barang</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Laptop Asus"
                    required
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Tipe</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="durable">Durable</option>
                    <option value="consumable">Consumable</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Satuan</label>
                  <input
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="unit / pcs / rim"
                    required
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Stok Total</label>
                  <input
                    type="number"
                    name="stock_total"
                    min="0"
                    value={form.stock_total}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Stok Tersedia</label>
                  <input
                    type="number"
                    name="stock_available"
                    min="0"
                    value={form.stock_available}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Stok Rusak</label>
                  <input
                    type="number"
                    name="stock_damaged"
                    min="0"
                    value={form.stock_damaged}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="4"
                  placeholder="Deskripsi singkat barang"
                />
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Lokasi</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Lemari Elektronik"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Brand</label>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Asus / Epson / Snowman"
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Image URL (opsional)</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="https://..."
                />
              </div>

              <button type="submit" style={styles.primaryButton} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan Barang'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #eef4ff 0%, #f8fafc 50%, #ffffff 100%)',
    padding: '32px 20px 48px',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  state: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    fontSize: '1.1rem',
    background: '#f8fafc',
  },
  header: {
    width: 'min(1200px, 100%)',
    margin: '0 auto 24px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  eyebrow: {
    margin: '0 0 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontSize: '0.82rem',
    color: '#2563eb',
    fontWeight: 700,
  },
  title: {
    margin: '0 0 8px',
    color: '#0f172a',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    color: '#475569',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  grid: {
    width: 'min(1200px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  panel: {
    background: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #dbe5f0',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
    backdropFilter: 'blur(8px)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px',
  },
  panelTitle: {
    margin: '0 0 8px',
    color: '#0f172a',
    fontSize: '1.5rem',
  },
  panelText: {
    margin: 0,
    color: '#64748b',
  },
  badge: {
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 10px',
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  td: {
    padding: '14px 10px',
    borderBottom: '1px solid #edf2f7',
    verticalAlign: 'top',
    color: '#0f172a',
  },
  mutedText: {
    marginTop: '4px',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  notice: {
    padding: '16px',
    background: '#fff7ed',
    border: '1px solid #fdba74',
    color: '#9a3412',
    borderRadius: '16px',
    lineHeight: 1.5,
  },
  form: {
    display: 'grid',
    gap: '16px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  fieldGroup: {
    display: 'grid',
    gap: '8px',
  },
  label: {
    color: '#334155',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '12px 14px',
    fontSize: '0.98rem',
    boxSizing: 'border-box',
    background: '#ffffff',
  },
  textarea: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '12px 14px',
    fontSize: '0.98rem',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '16px',
    padding: '14px 18px',
    fontSize: '1rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #2563eb 0%, #0f766e 100%)',
    color: '#ffffff',
    cursor: 'pointer',
  },
  secondaryButton: {
    textDecoration: 'none',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '12px 16px',
    background: '#ffffff',
    color: '#0f172a',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    width: 'min(1200px, 100%)',
    margin: '0 auto 18px',
    padding: '14px 16px',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '16px',
  },
  successBanner: {
    width: 'min(1200px, 100%)',
    margin: '0 auto 18px',
    padding: '14px 16px',
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    borderRadius: '16px',
  },
};
