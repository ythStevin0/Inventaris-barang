import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Alert from '../../components/ui/Alert';
import BorrowingForm from '../../components/borrowings/BorrowingForm';
import ReturnForm from '../../components/borrowings/ReturnForm';
import BorrowingsTable from '../../components/borrowings/BorrowingsTable';
import BorrowingDetailModal from '../../components/borrowings/BorrowingDetailModal';
import RejectBorrowingModal from '../../components/borrowings/RejectBorrowingModal';
import {
  getBorrowings,
  createBorrowing,
  approveBorrowing,
  rejectBorrowing,
  returnBorrowing,
} from '../../services/borrowingsService';
import { getItems } from '../../services/itemsService';
import useAuthStore from '../../store/authStore';
import { canManageInventory } from '../../utils/permissions';

export default function BorrowingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const getMe = useAuthStore((state) => state.getMe);

  const [borrowings, setBorrowings] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals / forms state
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Reject notes
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const isStaff = canManageInventory(user);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const currentUser = user ?? (await getMe());
        const [borrowingsData, itemsData] = await Promise.all([
          getBorrowings(),
          getItems({ is_active: 1 }),
        ]);
        setBorrowings(borrowingsData.data ?? borrowingsData);
        setItems(itemsData);
        if (!currentUser) {
          setError('Gagal memuat data pengguna.');
        }
      } catch (err) {
        setError(err.response?.data?.message ?? 'Gagal memuat data peminjaman.');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [getMe, user]);

  const refreshData = async () => {
    try {
      const [borrowingsData, itemsData] = await Promise.all([
        getBorrowings(),
        getItems({ is_active: 1 }),
      ]);
      setBorrowings(borrowingsData.data ?? borrowingsData);
      setItems(itemsData);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memuat data peminjaman.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateBorrowing = async (payload) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const formattedPayload = {
        ...payload,
        borrower_name: user?.name ?? payload.borrower_name,
      };
      const response = await createBorrowing(formattedPayload);
      setSuccess(response.message ?? 'Pengajuan peminjaman berhasil dibuat.');
      setShowBorrowModal(false);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal membuat pengajuan peminjaman.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Setujui pengajuan peminjaman ini?')) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await approveBorrowing(id);
      setSuccess(response.message ?? 'Peminjaman disetujui.');
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menyetujui peminjaman.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBorrowing) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await rejectBorrowing(selectedBorrowing.id, rejectNotes);
      setSuccess(response.message ?? 'Peminjaman berhasil ditolak.');
      setShowRejectModal(false);
      setSelectedBorrowing(null);
      setRejectNotes('');
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menolak peminjaman.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBorrowing = async (payload) => {
    if (!selectedBorrowing) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await returnBorrowing(selectedBorrowing.id, payload);
      setSuccess(response.message ?? 'Pengembalian berhasil diproses.');
      setShowReturnModal(false);
      setSelectedBorrowing(null);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memproses pengembalian.');
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-base text-slate-600">
        Memuat data peminjaman...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8">
      <PageHeader
        eyebrow="Peminjaman Barang"
        title="Daftar & Pengajuan Peminjaman"
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

      <div className="mx-auto mt-6 w-full max-w-7xl">
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat Peminjaman</h2>
              <p className="text-sm text-slate-500">
                {isStaff ? 'Daftar semua pengajuan peminjaman barang oleh anggota.' : 'Daftar pengajuan peminjaman barang Anda.'}
              </p>
            </div>
            
            {/* Tombol Ajukan Peminjaman */}
            <button
              type="button"
              onClick={() => setShowBorrowModal(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-sky-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Ajukan Peminjaman Baru
            </button>
          </div>

          <BorrowingsTable
            borrowings={borrowings}
            isStaff={isStaff}
            onShowDetail={(borrowing) => {
              setSelectedBorrowing(borrowing);
              setShowDetailModal(true);
            }}
            onApprove={handleApprove}
            onShowReject={(borrowing) => {
              setSelectedBorrowing(borrowing);
              setShowRejectModal(true);
            }}
            onShowReturn={(borrowing) => {
              setSelectedBorrowing(borrowing);
              setShowReturnModal(true);
            }}
          />
        </div>
      </div>

      {/* Modal Ajukan Peminjaman */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-[28px] border border-white bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Form Pengajuan Peminjaman</h3>
              <button
                type="button"
                onClick={() => setShowBorrowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <BorrowingForm
              items={items}
              submitting={submitting}
              onSubmit={handleCreateBorrowing}
              onCancel={() => setShowBorrowModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Detail Peminjaman */}
      {showDetailModal && selectedBorrowing && (
        <BorrowingDetailModal
          borrowing={selectedBorrowing}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBorrowing(null);
          }}
        />
      )}

      {/* Modal Tolak Peminjaman */}
      {showRejectModal && selectedBorrowing && (
        <RejectBorrowingModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedBorrowing(null);
            setRejectNotes('');
          }}
          onSubmit={handleRejectSubmit}
          submitting={submitting}
          rejectNotes={rejectNotes}
          setRejectNotes={setRejectNotes}
        />
      )}

      {/* Modal Proses Pengembalian */}
      {showReturnModal && selectedBorrowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-[28px] border border-white bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Form Pengembalian Barang</h3>
              <button
                type="button"
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedBorrowing(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <ReturnForm
              borrowing={selectedBorrowing}
              submitting={submitting}
              onSubmit={handleReturnBorrowing}
              onCancel={() => {
                setShowReturnModal(false);
                setSelectedBorrowing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
