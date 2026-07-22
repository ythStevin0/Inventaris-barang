import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '../../components/ui/Alert';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import BorrowingForm from '../../components/borrowings/BorrowingForm';
import ReturnForm from '../../components/borrowings/ReturnForm';
import BorrowingsTable from '../../components/borrowings/BorrowingsTable';
import BorrowingDetailModal from '../../components/borrowings/BorrowingDetailModal';
import RejectBorrowingModal from '../../components/borrowings/RejectBorrowingModal';
import QRScannerModal from '../../components/borrowings/QRScannerModal';
import SlideOver from '../../components/ui/SlideOver';
import {
  getBorrowings,
  createBorrowing,
  approveBorrowing,
  rejectBorrowing,
  returnBorrowing,
  requestReturn,
} from '../../services/borrowingsService';
import { exportBorrowingsPdf, exportBorrowingsExcel } from '../../services/reportService';
import { getItems } from '../../services/itemsService';
import useAuthStore from '../../store/authStore';
import { canManageInventory } from '../../utils/permissions';
import Navbar from '../../components/Layout/Navbar';
import HeaderActions from '../../components/ui/HeaderActions';
import bgTexture from '../../assets/download (4).jpg';

export default function BorrowingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialItemId = searchParams.get('item_id');
  const user = useAuthStore((state) => state.user);
  const getMe = useAuthStore((state) => state.getMe);

  const [borrowings, setBorrowings] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Modals / forms state
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRequestReturnModal, setShowRequestReturnModal] = useState(false);
  
  // Scanner state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedItemId, setScannedItemId] = useState('');
  
  // Reject notes
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const isStaff = canManageInventory(user);

  useEffect(() => {
    const loadPage = async () => {
      try {
        if (!user) await getMe();
        const [borrowingsData, itemsData] = await Promise.all([
          getBorrowings({ page: currentPage }),
          getItems({ is_active: 1 }),
        ]);
        setBorrowings(borrowingsData.data ?? borrowingsData);
        setMeta(borrowingsData.meta || null);
        setItems(itemsData.data ?? itemsData);
      } catch (err) {
        setError(err.response?.data?.message ?? 'Gagal memuat data peminjaman.');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (initialItemId && !isStaff) {
      const timer = setTimeout(() => {
        setScannedItemId(initialItemId);
        setShowBorrowModal(true);
        setSearchParams({}); // Bersihkan parameter setelah ditangkap
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialItemId, isStaff, setSearchParams]);

  const handleScanSuccess = (decodedText) => {
    try {
      const url = new URL(decodedText);
      const itemId = url.searchParams.get('item_id');
      if (itemId) {
        setScannedItemId(itemId);
        setShowScannerModal(false);
        setShowBorrowModal(true);
      }
    } catch {
      if (!isNaN(decodedText)) {
        setScannedItemId(decodedText);
        setShowScannerModal(false);
        setShowBorrowModal(true);
      }
    }
  };

  const refreshData = async () => {
    try {
      const [borrowingsData, itemsData] = await Promise.all([
        getBorrowings({ page: currentPage }),
        getItems({ is_active: 1 }),
      ]);
      setBorrowings(borrowingsData.data ?? borrowingsData);
      setMeta(borrowingsData.meta || null);
      setItems(itemsData.data ?? itemsData);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memuat data peminjaman.');
    }
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

  const handleRequestReturnSubmit = async () => {
    if (!selectedBorrowing) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await requestReturn(selectedBorrowing.id);
      setSuccess(response.message ?? 'Pengajuan pengembalian berhasil. Menunggu pengecekan pengurus.');
      setShowRequestReturnModal(false);
      setSelectedBorrowing(null);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal mengajukan pengembalian.');
    } finally {
      setSubmitting(false);
    }
  };


  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportBorrowingsPdf();
    } catch {
      setError('Gagal mengunduh PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await exportBorrowingsExcel();
    } catch {
      setError('Gagal mengunduh Excel.');
    } finally {
      setExportingExcel(false);
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
              Kelola Peminjaman Inventaris
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <HeaderActions />
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                </div>
                <div>
                  <h2 className="mb-1 text-2xl font-bold tracking-tight text-emerald-900">Riwayat Peminjaman</h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Dashboard / <span className="text-teal-600">Peminjaman</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              {isStaff && (
                <>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={exportingPdf}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {exportingPdf ? 'Mengekspor...' : 'PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={exportingExcel}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {exportingExcel ? 'Mengekspor...' : 'Excel'}
                  </button>
                </>
              )}

              {/* Tombol Ajukan Peminjaman (Hanya untuk Anggota) */}
              {!isStaff && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScannerModal(true)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    Scan QR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScannedItemId('');
                      setShowBorrowModal(true);
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-[#e06912] transition-colors shadow-sm cursor-pointer"
                  >
                    + Ajukan Peminjaman
                  </button>
                </div>
              )}
            </div>
          </div>

          <BorrowingsTable
            borrowings={borrowings}
            meta={meta}
            onPageChange={setCurrentPage}
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
            onRequestReturn={(borrowing) => {
              setSelectedBorrowing(borrowing);
              setShowRequestReturnModal(true);
            }}
          />
        </div>
      </section>

      {/* Modal Ajukan Peminjaman */}
      <SlideOver
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        title="Form Pengajuan Peminjaman"
        width="max-w-3xl"
      >
        <div className="p-6 h-full overflow-y-auto">
          <BorrowingForm
            items={items}
            submitting={submitting}
            onSubmit={handleCreateBorrowing}
            onCancel={() => setShowBorrowModal(false)}
            initialItemId={scannedItemId}
          />
        </div>
      </SlideOver>

      {/* Modal Detail Peminjaman */}
      <BorrowingDetailModal
        isOpen={showDetailModal}
        borrowing={selectedBorrowing}
        onClose={() => {
          setShowDetailModal(false);
          // Don't set selectedBorrowing to null immediately so the data is still there during exit animation
          setTimeout(() => setSelectedBorrowing(null), 300);
        }}
      />

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

      {/* Modal Konfirmasi Ajukan Pengembalian (Untuk Anggota) */}
      {showRequestReturnModal && selectedBorrowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-secondary-900">Ajukan Pengembalian</h3>
              <button
                type="button"
                onClick={() => {
                  setShowRequestReturnModal(false);
                  setSelectedBorrowing(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-accent-100 hover:text-secondary-700"
              >
                ✕
              </button>
            </div>
            <p className="mb-6 text-slate-600">
              Yakin ingin mengajukan pengembalian untuk <strong>{selectedBorrowing.purpose}</strong>?
              <br /><br />
              Pastikan Anda telah menyerahkan barang fisik ke pengurus agar bisa segera diproses.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRequestReturnModal(false);
                  setSelectedBorrowing(null);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-secondary-700 transition hover:bg-accent-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleRequestReturnSubmit}
                className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? 'Memproses...' : 'Ya, Ajukan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Proses Pengembalian */}
      <SlideOver
        isOpen={!!(showReturnModal && selectedBorrowing)}
        onClose={() => {
          setShowReturnModal(false);
          setSelectedBorrowing(null);
        }}
        title="Form Pengembalian Barang"
        width="max-w-3xl"
      >
        {selectedBorrowing && (
          <ReturnForm
            borrowing={selectedBorrowing}
            submitting={submitting}
            onSubmit={handleReturnBorrowing}
            onCancel={() => {
              setShowReturnModal(false);
              setSelectedBorrowing(null);
            }}
          />
        )}
      </SlideOver>

      {/* Modal Scanner QR Code */}
      <QRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={handleScanSuccess}
      />
      
      <LoadingOverlay isLoading={loading} />
    </div>
  );
}
