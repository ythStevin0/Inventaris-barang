import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../../components/ui/Alert';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import MaintenanceTable from '../../components/maintenance/MaintenanceTable';
import MaintenanceFormModal from '../../components/maintenance/MaintenanceFormModal';
import { getMaintenanceLogs, createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog } from '../../services/maintenanceService';
import { getItems } from '../../services/itemsService';
import useAuthStore from '../../store/authStore';
import { canManageInventory } from '../../utils/permissions';
import Navbar from '../../components/Layout/Navbar';
import bgTexture from '../../assets/download (4).jpg';

export default function MaintenancePage() {
  const { user, getMe } = useAuthStore();
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
    <div className="min-h-screen flex flex-col font-sans bg-[#FDFBF7] pb-10">
      {/* TOP GREEN SECTION */}
      <div className="bg-[#0F4C3A] rounded-b-[40px] pb-32 relative shadow-lg">
        {/* Background Image Overlay */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-60 rounded-b-[40px] overflow-hidden"
            style={{
                backgroundImage: `url(${bgTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        ></div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300 mb-1">
              INVENTARIS BARANG
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {canManage ? "Kelola Riwayat Kerusakan & Perbaikan" : "Daftar Kerusakan Barang"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 gap-2 shadow-sm backdrop-blur"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 lg:px-10 -mt-20 relative z-10">
          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">{success}</Alert> : null}
        </div>

      <section className="mx-auto mt-4 w-full max-w-7xl px-6 lg:px-10">
          <div className="rounded-[28px] border border-white/60 bg-white/85 p-4 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-900 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <div>
                  <h2 className="mb-1 text-2xl font-bold tracking-tight text-emerald-900">Riwayat Kerusakan</h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Dashboard / <span className="text-teal-600">Riwayat</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-bold text-sky-800 whitespace-nowrap">
                  {logs.length} riwayat
                </span>
                {canManage && (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 transition flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Tambah Riwayat
                  </button>
                )}
              </div>
            </div>

          <MaintenanceTable
            logs={logs}
            canManage={canManage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </section>

      <MaintenanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={selectedLog}
        items={items}
      />
      
      <LoadingOverlay isLoading={loading} />
    </div>
  );
}
