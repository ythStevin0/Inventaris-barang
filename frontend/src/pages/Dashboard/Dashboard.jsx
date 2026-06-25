import useAuthStore from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { canManageInventory } from '../../utils/permissions';

// Warna tema utama: Maroon (#8B1A1A) sesuai tema Pancasila
const THEME = {
    primary: '#8B1A1A',
    primaryLight: '#A52525',
    primaryBg: 'rgba(139, 26, 26, 0.08)',
    primaryBorder: 'rgba(139, 26, 26, 0.2)',
};

// Dummy data untuk statistik dashboard
const dummyStats = {
    totalBarang: 128,
    totalKategori: 12,
    barangDipinjam: 8,
    peminjamanAktif: 5,
    barangRusak: 3,
};

// Dummy data riwayat peminjaman terbaru
const dummyBorrowings = [
    { id: 1, nama: 'Andi Pratama', barang: 'Tenda Dome 4P', tglPinjam: '20 Mei 2024', tglKembali: '27 Mei 2024', status: 'Dipinjam' },
    { id: 2, nama: 'Siti Rahma', barang: 'Carrier 60L', tglPinjam: '19 Mei 2024', tglKembali: '26 Mei 2024', status: 'Dipinjam' },
    { id: 3, nama: 'Dimas Saputra', barang: 'Kompor Portable', tglPinjam: '18 Mei 2024', tglKembali: '25 Mei 2024', status: 'Dikembalikan' },
    { id: 4, nama: 'Rina Amelia', barang: 'Headlamp', tglPinjam: '17 Mei 2024', tglKembali: '20 Mei 2024', status: 'Dikembalikan' },
    { id: 5, nama: 'Fajar Nugroho', barang: 'Sleeping Bag', tglPinjam: '16 Mei 2024', tglKembali: '19 Mei 2024', status: 'Dikembalikan' },
];

// Dummy data kategori barang untuk donut chart
const dummyCategories = [
    { name: 'Perlengkapan Camping', percent: 40, color: '#8B1A1A' },
    { name: 'Alat Masak', percent: 25, color: '#C0392B' },
    { name: 'Navigasi', percent: 15, color: '#E74C3C' },
    { name: 'Panjat Tebing', percent: 10, color: '#D4A574' },
    { name: 'P3K', percent: 5, color: '#F1C40F' },
    { name: 'Lainnya', percent: 5, color: '#95a5a6' },
];

// Komponen Donut Chart sederhana menggunakan SVG
function DonutChart({ data }) {
    const size = 180;
    const strokeWidth = 38;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {data.map((segment, index) => {
                const cumulativePercent = data
                    .slice(0, index)
                    .reduce((sum, item) => sum + item.percent, 0);
                    
                const strokeDasharray = `${(segment.percent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                
                return (
                    <circle
                        key={index}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="butt"
                    />
                );
            })}
        </svg>
    );
}

export default function Dashboard() {
    const { user, logout, getMe } = useAuthStore();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        getMe();
    }, [getMe]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">

            {/* ============ MAIN CONTENT ============ */}
            <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-8 md:py-10">
                
                {/* ---- Hero / Welcome Section ---- */}
                <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: THEME.primary }}>
                            DASHBOARD SIBOS
                        </h3>
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight" style={{ color: THEME.primary }}>
                            Inventaris MAPALA
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base">
                            Selamat datang kembali, <strong style={{ color: THEME.primary }}>{user?.name}</strong>
                            {user?.role ? <span className="text-gray-400 font-normal"> ({user.role})</span> : ''}
                        </p>
                    </div>

                    {/* Tanggal & Pengingat */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {/* Ikon Kalender */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <button className="relative p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            {/* Ikon Lonceng */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                            {/* Titik Merah Notifikasi Aktif */}
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
                        </button>
                    </div>
                </div>

                {/* ---- 3 Menu Cards (Admin) / 2 Menu Cards (Anggota) ---- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {canManageInventory(user) ? (
                        <>
                            {/* Kelola Barang */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-[#8B1A1A]/30 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-gray-900 font-semibold text-base mb-0.5">Kelola Barang</h2>
                                        <p className="text-gray-500 text-xs leading-relaxed">Tambah, ubah, atau hapus data inventaris alat-alat alam bebas.</p>
                                    </div>
                                </div>
                                <Link to="/items" className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: THEME.primary }}>
                                    Kelola sekarang
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Kelola Kategori */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-[#8B1A1A]/30 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-gray-900 font-semibold text-base mb-0.5">Kelola Kategori</h2>
                                        <p className="text-gray-500 text-xs leading-relaxed">Klasifikasikan barang berdasarkan fungsinya (Navigasi, Panjat, dll).</p>
                                    </div>
                                </div>
                                <Link to="/categories" className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: THEME.primary }}>
                                    Kelola sekarang
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Peminjaman */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-[#8B1A1A]/30 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-gray-900 font-semibold text-base mb-0.5">Kelola Peminjaman</h2>
                                        <p className="text-gray-500 text-xs leading-relaxed">Pantau riwayat peminjaman anggota dan kelola persetujuan (acc/reject) barang.</p>
                                    </div>
                                </div>
                                <Link to="/borrowings" className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: THEME.primary }}>
                                    Kelola sekarang
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Daftar Barang (Anggota) */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-[#8B1A1A]/30 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-gray-900 font-semibold text-base mb-0.5">Daftar Barang</h2>
                                        <p className="text-gray-500 text-xs leading-relaxed">Lihat ketersediaan barang dan spesifikasi alat sebelum meminjam.</p>
                                    </div>
                                </div>
                                <Link to="/items" className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: THEME.primary }}>
                                    Lihat sekarang
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Riwayat Peminjaman (Anggota) */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-[#8B1A1A]/30 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-gray-900 font-semibold text-base mb-0.5">Riwayat Peminjaman</h2>
                                        <p className="text-gray-500 text-xs leading-relaxed">Ajukan peminjaman baru dan pantau status peminjaman Anda.</p>
                                    </div>
                                </div>
                                <Link to="/borrowings" className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: THEME.primary }}>
                                    Lihat sekarang
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* ---- 5 Stat Cards ---- */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {/* Total Barang */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Total Barang</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{dummyStats.totalBarang}</p>
                            <p className="text-gray-400 text-[10px]">Barang</p>
                        </div>
                    </div>

                    {/* Total Kategori */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Total Kategori</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{dummyStats.totalKategori}</p>
                            <p className="text-gray-400 text-[10px]">Kategori</p>
                        </div>
                    </div>

                    {/* Barang Dipinjam */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Barang Dipinjam</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{dummyStats.barangDipinjam}</p>
                            <p className="text-gray-400 text-[10px]">Barang</p>
                        </div>
                    </div>

                    {/* Peminjaman Aktif */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Peminjaman Aktif</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{dummyStats.peminjamanAktif}</p>
                            <p className="text-gray-400 text-[10px]">Peminjaman</p>
                        </div>
                    </div>

                    {/* Barang Rusak */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Barang Rusak</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{dummyStats.barangRusak}</p>
                            <p className="text-gray-400 text-[10px]">Barang</p>
                        </div>
                    </div>
                </div>

                {/* ---- Bottom: Riwayat Peminjaman + Donut Chart ---- */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
                    
                    {/* Riwayat Peminjaman Terbaru (3/5 width) */}
                    <div className="lg:col-span-3 bg-gray-50 border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-gray-900 font-semibold text-sm">Riwayat Peminjaman Terbaru</h3>
                            <Link to="/borrowings" className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: THEME.primary }}>
                                Lihat semua
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="pb-3 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Nama Peminjam</th>
                                        <th className="pb-3 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Barang</th>
                                        <th className="pb-3 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Tanggal Pinjam</th>
                                        <th className="pb-3 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Tanggal Kembali</th>
                                        <th className="pb-3 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dummyBorrowings.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-100/50 transition-colors">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg }}>
                                                        <span className="text-[10px] font-bold" style={{ color: THEME.primary }}>{item.nama.charAt(0)}</span>
                                                    </div>
                                                    <span className="text-gray-900 text-xs font-medium">{item.nama}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-600 text-xs">{item.barang}</td>
                                            <td className="py-3 pr-4 text-gray-500 text-xs">{item.tglPinjam}</td>
                                            <td className="py-3 pr-4 text-gray-500 text-xs">{item.tglKembali}</td>
                                            <td className="py-3">
                                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                                                    item.status === 'Dipinjam' 
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Kategori Barang - Donut Chart (2/5 width) */}
                    <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-gray-900 font-semibold text-sm">Kategori Barang</h3>
                            <Link to="/categories" className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: THEME.primary }}>
                                Lihat semua
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Donut */}
                            <div className="shrink-0">
                                <DonutChart data={dummyCategories} />
                            </div>

                            {/* Legend */}
                            <div className="flex flex-col gap-2.5 w-full">
                                {dummyCategories.map((cat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                                            <span className="text-gray-600 text-xs">{cat.name}</span>
                                        </div>
                                        <span className="text-gray-900 text-xs font-bold">{cat.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ============ FOOTER ============ */}
            <footer className="relative z-10 border-t border-gray-200 bg-white">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-gray-400 text-[10px] text-center sm:text-left">
                        © 2025 SIBOS & Inventaris MAPALA. All Rights Reserved.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-xs font-semibold"
                        style={{ 
                            backgroundColor: THEME.primaryBg, 
                            color: THEME.primary, 
                            border: `1px solid ${THEME.primaryBorder}` 
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Logout
                    </button>
                </div>
            </footer>

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
            )}
        </div>
    );
}
