import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Alert from '../../components/ui/Alert';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import MaintenanceTable from '../../components/maintenance/MaintenanceTable';
import MaintenanceFormModal from '../../components/maintenance/MaintenanceFormModal';
import { getMaintenanceLogs, createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog } from '../../services/maintenanceService';
import { getItems } from '../../services/itemsService';
import useAuthStore from '../../store/authStore';
import { canManageInventory } from '../../utils/permissions';

export default function MaintenancePage() {
  const navigate = useNavigate();
  const { user, logout, getMe } = useAuthStore();
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        if (!user) await getMe();

        const logsData = await getMaintenanceLogs();
        setLogs(logsData);

        // Coba ambil items jika admin/pengurus
        try {
          const itemsData = await getItems();
          setItems(itemsData.data || []);
        } catch {
          // Anggota mungkin tidak punya akses items penuh, abaikan saja
          setItems([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data riwayat kerusakan.');
      } finally {
        setLoading(false);
      }
    };
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canManage = canManageInventory(user);

  const refreshLogs = async () => {
    try {
      const logsData = await getMaintenanceLogs();
      setLogs(logsData);
    } catch {
      // silent
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAdd = () => {
    setSelectedLog(null);
    setIsModalOpen(true);
  };

  const handleEdit = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data riwayat ini?')) return;
    try {
      await deleteMaintenanceLog(id);
      setSuccess('Riwayat kerusakan berhasil dihapus.');
      setError('');
      refreshLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus data riwayat.');
    }
  };

  const handleSubmitForm = async (data) => {
    setError('');
    setSuccess('');
    try {
      if (selectedLog) {
        await updateMaintenanceLog(selectedLog.id, data);
        setSuccess('Riwayat kerusakan berhasil diperbarui.');
      } else {
        await createMaintenanceLog(data);
        setSuccess('Riwayat kerusakan berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      refreshLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
    }
  };



  return (
    <div className="min-h-screen px-5 py-8">
      <PageHeader
        eyebrow="Riwayat Kerusakan"
        title={canManage ? "Kelola Riwayat Kerusakan & Perbaikan" : "Daftar Kerusakan Barang"}
        description={`Login sebagai ${user?.name || 'Pengguna'}${user?.role ? ` (${user.role})` : ''}.`}
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

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-6">
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-secondary-900">Data Riwayat</h2>
              <p className="text-sm text-slate-500">Semua laporan kerusakan, perbaikan, dan kehilangan barang.</p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-xl bg-secondary-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-secondary-800"
              >
                + Tambah Laporan
              </button>
            )}
          </div>

          <MaintenanceTable
            logs={logs}
            canManage={canManage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </section>

      {isModalOpen ? (
        <MaintenanceFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={selectedLog}
          items={items}
        />
      ) : null}
      
      <LoadingOverlay isLoading={loading} />
    </div>
  );
}
