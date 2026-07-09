import useAuthStore from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { canManageInventory } from '../../utils/permissions';
import { getDashboardStats } from '../../services/dashboardService';

// Warna tema utama: Biru pekat sesuai referensi gambar
const THEME = {
    primary: '#11224E',
    primaryLight: '#11224E',
    primaryDark: '#11224E',
    primaryBg: 'rgba(42, 53, 130, 0.10)',
    primaryBorder: 'rgba(42, 53, 130, 0.25)',
};

// Komponen Donut Chart sederhana menggunakan SVG
function DonutChart({ data }) {
    const size = 180;
    const strokeWidth = 38;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {data.map((segment, index) => {
                const cumulativePercent = data
                    .slice(0, index)
                    .reduce((sum, item) => sum + item.percent, 0);
                    
                const targetLength = (segment.percent / 100) * circumference;
                const strokeDasharray = `${targetLength} ${circumference}`;
                const initialDasharray = `0 ${circumference}`;
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
                        strokeDasharray={animated ? strokeDasharray : initialDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="butt"
                        style={{ transition: 'stroke-dasharray 1s ease-out' }}
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
    
    // State API
    const [stats, setStats] = useState({
        totalBarang: 0,
        totalKategori: 0,
        barangDipinjam: 0,
        peminjamanAktif: 0,
        barangRusak: 0,
    });
    const [recentBorrowings, setRecentBorrowings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                if (!user) await getMe();
                
                const data = await getDashboardStats();
                setStats(data.stats);
                setRecentBorrowings(data.recentBorrowings);
                setCategories(data.categories);
                setNotifications(data.notifications || []);
            } catch (error) {
                console.error("Gagal memuat data dashboard:", error);
            }
        };

        loadDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 relative overflow-x-hidden z-0">
            {/* ============ COLORED HEADER SECTION ============ */}
            <div className="relative" style={{ backgroundColor: THEME.primary }}>
                {/* Header Batik Background */}
                <div 
                    className="absolute inset-0 opacity-100 pointer-events-none"
                    style={{
                        backgroundImage: "url('https://i.pinimg.com/originals/00/70/51/007051685f86f5dcc3fb6afab66dc8f1.jpg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'multiply'
                    }}
                ></div>

                <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-8 md:pt-10 pb-24 md:pb-28">
                    
                    {/* ---- Hero / Welcome Section ---- */}
                    <div className="relative z-50 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-1.5 text-[#ffffff]/60">
                                DASHBOARD SIBOS
                            </h3>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight text-[#F87B1B]">
                                Inventaris MAPALA
                            </h1>
                            <p className="text-[#ffffff]/70 text-sm md:text-base">
                                Selamat datang kembali, <strong className="text-[#ffffff]">{user?.name}</strong>
                                {user?.role ? <span className="text-[#ffffff]/50 font-normal"> ({user.role})</span> : ''}
                            </p>
                        </div>

                        {/* Tanggal & Pengingat */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                {/* Ikon Kalender */}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#ffffff]/50">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                <span className="text-sm font-medium text-[#ffffff]/80">
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            
                            {/* Notifikasi Lonceng */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-1.5 hover:bg-[#ffffff]/10 rounded-full transition-colors z-20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#ffffff]/70">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                    </svg>
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse border border-[#ffffff]"></span>
                                    )}
                                </button>
                                
                                {/* Dropdown Notifikasi */}
                                <div className={`absolute right-0 mt-2 w-72 sm:w-80 bg-[#F87B1B] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#F87B1B] overflow-hidden z-50 transform origin-top-right transition-all duration-200 ease-out ${showNotifications ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
                                        <div className="p-3 border-b border-white/20 flex justify-between items-center bg-white/10">
                                            <h3 className="text-white font-bold text-xs tracking-wider">NOTIFIKASI</h3>
                                            <span className="text-[10px] font-bold bg-white text-[#F87B1B] px-2 py-0.5 rounded-full">
                                                {notifications.length} Baru
                                            </span>
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="py-8 px-4 text-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 mx-auto text-white/50 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                                                    <p className="text-white/70 text-xs">Belum ada notifikasi baru.</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <Link key={notif.id} to={notif.link} className="flex gap-3 p-3 border-b border-white/10 hover:bg-white/10 transition-colors last:border-0">
                                                        <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center bg-white/20 text-white">
                                                            {notif.type === 'pending' ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            ) : notif.type === 'overdue' ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15z" /></svg>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-white font-semibold text-xs mb-0.5">{notif.title}</p>
                                                            <p className="text-white/80 text-[10px] line-clamp-2 leading-relaxed">{notif.message}</p>
                                                            <p className="text-white/60 text-[9px] font-medium mt-1.5">{notif.time}</p>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>

                    {/* ---- Menu Cards (di dalam area berwarna) ---- */}
                    {canManageInventory(user) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                {/* Kelola Barang */}
                                <div className="rounded-xl px-4 py-4 bg-linear-to-br from-[#ffffff] to-[#ffffff] hover:from-[#F87B1B] hover:to-orange-500 border border-gray-200 hover:border-transparent shadow-sm transition-all duration-500 ease-out group flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#F87B1B]/10 group-hover:bg-white/20 transition-colors duration-500 ease-out">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#F87B1B] group-hover:text-white transition-colors duration-500 ease-out">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-gray-900 group-hover:text-white font-semibold text-sm mb-0.5 transition-colors duration-300">Kelola Barang</h2>
                                            <p className="text-gray-500 group-hover:text-white/80 text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300">Tambah, ubah, atau hapus data inventaris.</p>
                                        </div>
                                    </div>
                                    <Link to="/items" className="mt-auto text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-500 ease-out text-[#F87B1B] group-hover:text-white">
                                        Kelola sekarang →
                                    </Link>
                                </div>

                                {/* Kelola Kategori */}
                                <div className="rounded-xl px-4 py-4 bg-linear-to-br from-[#ffffff] to-[#ffffff] hover:from-[#F87B1B] hover:to-orange-500 border border-gray-200 hover:border-transparent shadow-sm transition-all duration-500 ease-out group flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#F87B1B]/10 group-hover:bg-white/20 transition-colors duration-500 ease-out">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#F87B1B] group-hover:text-white transition-colors duration-500 ease-out">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-gray-900 group-hover:text-white font-semibold text-sm mb-0.5 transition-colors duration-300">Kelola Kategori</h2>
                                            <p className="text-gray-500 group-hover:text-white/80 text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300">Klasifikasikan barang berdasarkan fungsinya.</p>
                                        </div>
                                    </div>
                                    <Link to="/categories" className="mt-auto text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-500 ease-out text-[#F87B1B] group-hover:text-white">
                                        Kelola sekarang →
                                    </Link>
                                </div>

                                {/* Peminjaman */}
                                <div className="rounded-xl px-4 py-4 bg-linear-to-br from-[#ffffff] to-[#ffffff] hover:from-[#F87B1B] hover:to-orange-500 border border-gray-200 hover:border-transparent shadow-sm transition-all duration-500 ease-out group flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#F87B1B]/10 group-hover:bg-white/20 transition-colors duration-500 ease-out">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#F87B1B] group-hover:text-white transition-colors duration-500 ease-out">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-gray-900 group-hover:text-white font-semibold text-sm mb-0.5 transition-colors duration-300">Kelola Peminjaman</h2>
                                            <p className="text-gray-500 group-hover:text-white/80 text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300">Pantau dan kelola persetujuan peminjaman.</p>
                                        </div>
                                    </div>
                                    <Link to="/borrowings" className="mt-auto text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-500 ease-out text-[#F87B1B] group-hover:text-white">
                                        Kelola sekarang →
                                    </Link>
                                </div>

                                {/* Riwayat Kerusakan (Admin) */}
                                <div className="rounded-xl px-4 py-4 bg-linear-to-br from-[#ffffff] to-[#ffffff] hover:from-[#F87B1B] hover:to-orange-500 border border-gray-200 hover:border-transparent shadow-sm transition-all duration-500 ease-out group flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#F87B1B]/10 group-hover:bg-white/20 transition-colors duration-500 ease-out">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#F87B1B] group-hover:text-white transition-colors duration-500 ease-out">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-gray-900 group-hover:text-white font-semibold text-sm mb-0.5 transition-colors duration-300">Kelola Kerusakan</h2>
                                            <p className="text-gray-500 group-hover:text-white/80 text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300">Catat riwayat perbaikan dan kerusakan.</p>
                                        </div>
                                    </div>
                                    <Link to="/maintenance" className="mt-auto text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-500 ease-out text-[#F87B1B] group-hover:text-white">
                                        Kelola sekarang →
                                    </Link>
                                </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 w-full">
                            {/* Daftar Barang (Anggota) */}
                            <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] rounded-xl px-4 py-4 bg-linear-to-br from-[#ffffff] to-[#ffffff] hover:from-[#F87B1B] hover:to-orange-500 border border-gray-200 hover:border-transparent shadow-sm transition-all duration-500 ease-out group flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#F87B1B]/10 group-hover:bg-white/20 transition-colors duration-500 ease-out">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#F87B1B] group-hover:text-white transition-colors duration-500 ease-out">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-gray-900 group-hover:text-white font-semibold text-sm mb-0.5 transition-colors duration-300">Daftar Barang</h2>
                                            <p className="text-gray-500 group-hover:text-white/80 text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300">Lihat ketersediaan dan spesifikasi alat.</p>
                                        </div>
                                    </div>
                                    <Link to="/items" className="mt-auto text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-500 ease-out text-[#F87B1B] group-hover:text-white">
                                        Lihat daftar barang →
                                    </Link>
                                </div>

                            {/* Riwayat Peminjaman (Anggota) */}
                            <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] rounded-xl px-4 py-4 bg-linear-to-br from-[#ffffff] to-[#ffffff] hover:from-[#F87B1B] hover:to-orange-500 border border-gray-200 hover:border-transparent shadow-sm transition-all duration-500 ease-out group flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#F87B1B]/10 group-hover:bg-white/20 transition-colors duration-500 ease-out">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#F87B1B] group-hover:text-white transition-colors duration-500 ease-out">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-gray-900 group-hover:text-white font-semibold text-sm mb-0.5 transition-colors duration-300">Riwayat Peminjaman</h2>
                                            <p className="text-gray-500 group-hover:text-white/80 text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300">Ajukan dan pantau status peminjaman.</p>
                                        </div>
                                    </div>
                                    <Link to="/borrowings" className="mt-auto text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-500 ease-out text-[#F87B1B] group-hover:text-white">
                                        Pantau peminjaman →
                                    </Link>
                                </div>

                            {/* Riwayat Kerusakan (Anggota) */}
                            <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] rounded-xl px-4 py-4 bg-linear-to-br from-[#ffffff] to-[#ffffff] hover:from-[#F87B1B] hover:to-orange-500 border border-gray-200 hover:border-transparent shadow-sm transition-all duration-500 ease-out group flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#F87B1B]/10 group-hover:bg-white/20 transition-colors duration-500 ease-out">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#F87B1B] group-hover:text-white transition-colors duration-500 ease-out">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-gray-900 group-hover:text-white font-semibold text-sm mb-0.5 transition-colors duration-300">Riwayat Kerusakan</h2>
                                            <p className="text-gray-500 group-hover:text-white/80 text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300">Lihat catatan kerusakan dan perbaikan.</p>
                                        </div>
                                    </div>
                                    <Link to="/maintenance" className="mt-auto text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-500 ease-out text-[#F87B1B] group-hover:text-white">
                                        Lihat sekarang →
                                    </Link>
                                </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ============ STAT CARDS (Overlapping the boundary) ============ */}
            <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 -mt-14 relative z-20">
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {/* Total Barang */}
                    <div className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)] bg-[#ffffff] border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-black/5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Total Barang</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{stats.totalBarang}</p>
                        </div>
                    </div>

                    {/* Total Kategori */}
                    <div className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)] bg-[#ffffff] border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-black/5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Total Kategori</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{stats.totalKategori}</p>
                        </div>
                    </div>

                    {/* Barang Dipinjam */}
                    <div className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)] bg-[#ffffff] border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-black/5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Barang Dipinjam</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{stats.barangDipinjam}</p>
                        </div>
                    </div>

                    {/* Peminjaman Aktif */}
                    <div className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)] bg-[#ffffff] border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-black/5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg, color: THEME.primary }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Peminjaman Aktif</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{stats.peminjamanAktif}</p>
                        </div>
                    </div>

                    {/* Barang Rusak */}
                    <div className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)] bg-[#ffffff] border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-black/5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Barang Rusak</p>
                            <p className="text-gray-900 text-2xl font-bold leading-none">{stats.barangRusak}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ WHITE CONTENT AREA ============ */}
            <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-8">

                {/* ---- Bottom: Riwayat Peminjaman + Donut Chart ---- */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
                    
                    {/* Riwayat Peminjaman Terbaru (3/5 width) */}
                    <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
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
                                    {recentBorrowings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500 text-xs">Belum ada peminjaman.</td>
                                        </tr>
                                    ) : recentBorrowings.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.primaryBg }}>
                                                        <span className="text-[10px] font-bold" style={{ color: THEME.primary }}>{item.nama.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-gray-900 text-xs font-medium">{item.nama}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-600 text-xs">{item.barang}</td>
                                            <td className="py-3 pr-4 text-gray-500 text-xs">{item.tglPinjam}</td>
                                            <td className="py-3 pr-4 text-gray-500 text-xs">{item.tglKembali}</td>
                                            <td className="py-3">
                                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                                                    ['Dipinjam', 'Menunggu'].includes(item.status) 
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                                                        : item.status === 'Ditolak'
                                                        ? 'bg-red-50 text-red-600 border border-red-200'
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
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col">
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
                                {categories.length > 0 ? (
                                    <DonutChart data={categories} />
                                ) : (
                                    <div className="w-[180px] h-[180px] rounded-full border-8 border-gray-100 flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">No Data</span>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-col gap-2.5 w-full">
                                {(!Array.isArray(categories) || categories.length === 0) ? (
                                    <p className="text-gray-500 text-xs">Belum ada kategori / barang.</p>
                                ) : categories.map((cat, index) => (
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

            {/* Click outside to close user menu or notifications */}
            {(showUserMenu || showNotifications) && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => {
                        setShowUserMenu(false);
                        setShowNotifications(false);
                    }}
                ></div>
            )}
        </div>
    );
}
