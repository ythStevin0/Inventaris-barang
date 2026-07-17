import useAuthStore from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
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
    const [showCalendar, setShowCalendar] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [calendarEvents, setCalendarEvents] = useState([]);
    
    // Refs for clicking outside
    const calendarRef = useRef(null);
    const notificationRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    // Calendar logic
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    const calendarDays = Array.from({ length: firstDay }).fill(null).concat(
        Array.from({ length: daysInMonth }, (_, i) => i + 1)
    );
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const handlePrevMonth = (e) => {
        e.stopPropagation();
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
        setSelectedDate(null);
    };
    const handleNextMonth = (e) => {
        e.stopPropagation();
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
        setSelectedDate(null);
    };
    // Helper to check if a date has events
    const getEventsForDate = (day) => {
        if (!day) return [];
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return calendarEvents.filter(event => {
            const borrowDate = event.borrow_date ? event.borrow_date.split('T')[0] : null;
            const dueDate = event.due_date ? event.due_date.split('T')[0] : null;
            const returnDate = event.return_date ? event.return_date.split('T')[0] : null;
            const endDate = returnDate || dueDate;
            if (borrowDate && endDate) {
                return dateStr >= borrowDate && dateStr <= endDate;
            } else if (borrowDate) {
                return dateStr === borrowDate;
            }
            return false;
        });
    };
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                if (!user) await getMe();
                
                const data = await getDashboardStats();
                setStats(data.stats);
                setRecentBorrowings(data.recentBorrowings);
                setCategories(data.categories);
                setNotifications(data.notifications || []);
                setCalendarEvents(data.calendarEvents || []);
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
        <div className="min-h-screen flex flex-col relative overflow-x-hidden z-0 font-sans bg-transparent">
            {/* ============ SIDEBAR / DRAWER ============ */}
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-blue-950/20 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            
            {/* Sidebar Container */}
            <div 
                className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-xl">
                            S
                        </div>
                        <div>
                            <h2 className="font-extrabold text-gray-900 text-lg leading-tight">SIBOS</h2>
                            <p className="text-gray-500 text-[10px] font-semibold tracking-wider">INVENTARIS MAPALA</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
                    <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold">
                        Dashboard
                    </Link>
                    <Link to="/items" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                        Data Barang
                    </Link>
                    <Link to="/borrowings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                        Peminjaman
                    </Link>
                </div>
                
                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        Logout
                    </button>
                </div>
            </div>
            {/* ============ COLORED HEADER SECTION ============ */}
            <div className="relative z-10">
                <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-8 md:pt-12 pb-16 z-10">
                    
                    {/* ---- Hero / Welcome Section ---- */}
                    <div className="relative z-50 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                {/* Hamburger Menu Button */}
                                <button 
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 bg-white/60 backdrop-blur-md rounded-xl border border-white hover:bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all text-emerald-900 group"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                </button>
                                
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/5 border border-emerald-900/10">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-emerald-800">
                                        DASHBOARD SIBOS
                                    </h3>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-3 tracking-tight text-emerald-950 drop-shadow-sm">
                                Inventaris MAPALA
                            </h1>
                            <p className="text-emerald-800/80 text-base md:text-lg max-w-2xl leading-relaxed font-medium">
                                Selamat datang kembali, <strong className="text-emerald-900 font-bold">{user?.name}</strong>
                                {user?.role ? <span className="text-emerald-700/60 font-normal"> ({user.role})</span> : ''}
                            </p>
                        </div>
                        {/* Tanggal & Pengingat */}
                        <div className="flex items-center gap-3">
                            <div className="relative" ref={calendarRef}>
                                <button 
                                    onClick={() => {
                                        setShowCalendar(!showCalendar);
                                        if (!showCalendar) setShowNotifications(false);
                                    }}
                                    className="flex items-center gap-2 hover:bg-white/10 p-1.5 -ml-1.5 rounded-xl transition-colors z-20 relative cursor-pointer"
                                >
                                    {/* Ikon Kalender */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#ffffff]/50">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                    </svg>
                                    <span className="text-sm font-medium text-[#ffffff]/80">
                                        {today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </button>
                                {/* Dropdown Kalender */}
                                <div className={`absolute right-[-50px] sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all duration-200 ease-out ${showCalendar ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
                                    <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-2">
                                            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700 cursor-pointer z-10">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                            </button>
                                            <h3 className="text-emerald-900 font-bold text-sm text-center min-w-[100px]">{monthNames[currentMonth]} {currentYear}</h3>
                                            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700 cursor-pointer z-10">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                            </button>
                                        </div>
                                        <button onClick={() => setShowCalendar(false)} className="p-1 bg-transparent hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="p-3">
                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                                <div key={day} className="text-[10px] font-bold text-gray-400">{day}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center">
                                            {calendarDays.map((day, index) => {
                                                const dayEvents = getEventsForDate(day);
                                                const hasEvents = dayEvents.length > 0;
                                                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                                                const isSelected = day !== null && selectedDate === day;
                                                return (
                                                    <div 
                                                        key={index} 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (day) setSelectedDate(isSelected ? null : day);
                                                        }}
                                                        className={`relative h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium ${
                                                            isToday
                                                                ? 'bg-teal-500 text-white shadow-md shadow-orange-500/20' 
                                                                : isSelected
                                                                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                                                                    : day 
                                                                        ? 'text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors' 
                                                                        : 'text-transparent cursor-default'
                                                        }`}
                                                    >
                                                        {day || ''}
                                                        {day && hasEvents && !isToday && (
                                                            <span className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full"></span>
                                                        )}
                                                        {day && hasEvents && isToday && (
                                                            <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Tampilan Detail / List */}
                                        {selectedDate && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                                <h4 className="text-xs font-bold text-gray-700 mb-2">
                                                    Keterangan {selectedDate} {monthNames[currentMonth]} {currentYear}:
                                                </h4>
                                                {getEventsForDate(selectedDate).length === 0 ? (
                                                    <p className="text-xs text-gray-500 italic">Tidak ada jadwal.</p>
                                                ) : (
                                                    <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                        {getEventsForDate(selectedDate).map(ev => {
                                                            const bDateStr = ev.borrow_date ? new Date(ev.borrow_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'}) : '-';
                                                            const rDateStr = ev.return_date ? new Date(ev.return_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'}) : (ev.due_date ? new Date(ev.due_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'}) : '-');
                                                            return (
                                                                <li key={ev.id} className="text-[11px] bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                    <div className="font-semibold text-emerald-900">{ev.name}</div>
                                                                    <div className="text-gray-500 mt-0.5">
                                                                        {bDateStr} - {rDateStr}
                                                                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${ev.status === 'borrowed' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                            {ev.status === 'borrowed' ? 'Dipinjam' : 'Disetujui'}
                                                                        </span>
                                                                    </div>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notifikasi Lonceng */}
                            <div className="relative" ref={notificationRef}>
                                <button 
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        if (!showNotifications) setShowCalendar(false);
                                    }}
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
                                <div className={`absolute left-[-150px] sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 bg-teal-500 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-teal-500 overflow-hidden z-50 transform origin-top sm:origin-top-right transition-all duration-200 ease-out ${showNotifications ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
                                        <div className="p-3 border-b border-white/20 flex justify-between items-center bg-white/10 relative">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-bold text-xs tracking-wider">NOTIFIKASI</h3>
                                                <span className="text-[10px] font-bold bg-white text-teal-600 px-2 py-0.5 rounded-full">
                                                    {notifications.length} Baru
                                                </span>
                                            </div>
                                            <button onClick={() => setShowNotifications(false)} className="p-1 bg-transparent hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white cursor-pointer z-10">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
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
                    {/* ---- Menu Cards (Sleek Glassmorphic Icons) ---- */}
                    {canManageInventory(user) ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mx-auto">
                            {/* Kelola Barang */}
                            <Link to="/items" className="group flex flex-col items-center justify-center p-5 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                </div>
                                <span className="font-bold text-emerald-950 text-sm tracking-wide">Barang</span>
                            </Link>
                            {/* Kelola Kategori */}
                            <Link to="/categories" className="group flex flex-col items-center justify-center p-5 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30 mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
                                </div>
                                <span className="font-bold text-emerald-950 text-sm tracking-wide">Kategori</span>
                            </Link>
                            {/* Kelola Peminjaman */}
                            <Link to="/borrowings" className="group flex flex-col items-center justify-center p-5 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-lime-500/30 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                                </div>
                                <span className="font-bold text-emerald-950 text-sm tracking-wide">Riwayat Pinjam</span>
                            </Link>
                            {/* Kelola Kerusakan */}
                            <Link to="/maintenance" className="group flex flex-col items-center justify-center p-5 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30 mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
                                </div>
                                <span className="font-bold text-emerald-950 text-sm tracking-wide">Kerusakan</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
                            {/* Daftar Barang */}
                            <Link to="/items" className="group flex flex-col items-center justify-center p-5 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                                </div>
                                <span className="font-bold text-emerald-950 text-sm tracking-wide text-center">Daftar Barang</span>
                            </Link>
                            {/* Riwayat Peminjaman */}
                            <Link to="/borrowings" className="group flex flex-col items-center justify-center p-5 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-lime-500/30 mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" /></svg>
                                </div>
                                <span className="font-bold text-emerald-950 text-sm tracking-wide text-center">Peminjaman</span>
                            </Link>
                            {/* Riwayat Kerusakan */}
                            <Link to="/maintenance" className="group flex flex-col items-center justify-center p-5 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30 mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
                                </div>
                                <span className="font-bold text-emerald-950 text-sm tracking-wide text-center">Catatan Rusak</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            {/* ============ STAT CARDS (Overlapping the boundary) ============ */}
            <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 -mt-8 relative z-20">
                <div className="flex flex-wrap justify-center gap-3 md:gap-5 mb-10">
                    {/* Total Barang */}
                    <div className="flex-1 min-w-[140px] max-w-[200px] bg-white/40 backdrop-blur-3xl border border-white/40 border-t-white/80 border-l-white/60 rounded-[2rem] p-5 flex flex-col items-center text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:bg-white/50 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 mb-3 shadow-inner border border-emerald-50 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 drop-shadow-sm"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                        </div>
                        <p className="text-emerald-900/70 text-[10px] uppercase tracking-widest font-bold mb-1">Barang</p>
                        <p className="text-emerald-950 text-3xl font-black drop-shadow-sm">{stats.totalBarang}</p>
                    </div>
                    {/* Total Kategori */}
                    <div className="flex-1 min-w-[140px] max-w-[200px] bg-white/40 backdrop-blur-3xl border border-white/40 border-t-white/80 border-l-white/60 rounded-[2rem] p-5 flex flex-col items-center text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:bg-white/50 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 mb-3 shadow-inner border border-teal-50 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 drop-shadow-sm"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                        </div>
                        <p className="text-teal-900/70 text-[10px] uppercase tracking-widest font-bold mb-1">Kategori</p>
                        <p className="text-teal-950 text-3xl font-black drop-shadow-sm">{stats.totalKategori}</p>
                    </div>
                    {/* Barang Dipinjam */}
                    <div className="flex-1 min-w-[140px] max-w-[200px] bg-white/40 backdrop-blur-3xl border border-white/40 border-t-white/80 border-l-white/60 rounded-[2rem] p-5 flex flex-col items-center text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:bg-white/50 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-lime-100 to-lime-200 text-lime-700 mb-3 shadow-inner border border-lime-50 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 drop-shadow-sm"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                        </div>
                        <p className="text-lime-900/70 text-[10px] uppercase tracking-widest font-bold mb-1">Dipinjam</p>
                        <p className="text-lime-950 text-3xl font-black drop-shadow-sm">{stats.barangDipinjam}</p>
                    </div>
                    {/* Peminjaman Aktif */}
                    <div className="flex-1 min-w-[140px] max-w-[200px] bg-white/40 backdrop-blur-3xl border border-white/40 border-t-white/80 border-l-white/60 rounded-[2rem] p-5 flex flex-col items-center text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:bg-white/50 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 mb-3 shadow-inner border border-blue-50 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 drop-shadow-sm"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-blue-900/70 text-[10px] uppercase tracking-widest font-bold mb-1">Aktif</p>
                        <p className="text-blue-950 text-3xl font-black drop-shadow-sm">{stats.peminjamanAktif}</p>
                    </div>
                    {/* Barang Rusak */}
                    <div className="flex-1 min-w-[140px] max-w-[200px] bg-white/40 backdrop-blur-3xl border border-white/40 border-t-white/80 border-l-white/60 rounded-[2rem] p-5 flex flex-col items-center text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:bg-white/50 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-rose-100 to-rose-200 text-rose-700 mb-3 shadow-inner border border-rose-50 group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 drop-shadow-sm"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                        </div>
                        <p className="text-rose-900/70 text-[10px] uppercase tracking-widest font-bold mb-1">Rusak</p>
                        <p className="text-rose-950 text-3xl font-black drop-shadow-sm">{stats.barangRusak}</p>
                    </div>
                </div>
            </div>
            {/* ============ WHITE CONTENT AREA ============ */}
            <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-8">
                {/* Decorative blob behind the glass cards */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 relative z-10">
                    
                    {/* Riwayat Peminjaman Terbaru (2/3 width) - LIQUID GLASS */}
                    <div className="lg:col-span-2 relative group rounded-[2.5rem] overflow-hidden bg-white/30 backdrop-blur-3xl border border-white/40 border-t-white/80 border-l-white/60 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-500 hover:bg-white/40 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                        <div className="relative p-7 sm:p-9 h-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 drop-shadow-sm">
                                        <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        Riwayat Peminjaman
                                    </h3>
                                    <p className="text-[11px] text-gray-600 font-semibold mt-1.5 ml-12 uppercase tracking-widest opacity-80">Aktivitas Terbaru</p>
                                </div>
                                <Link to="/borrowings" className="group/btn flex items-center gap-2 px-5 py-2.5 bg-white/50 hover:bg-white backdrop-blur-md text-gray-700 hover:text-blue-600 rounded-2xl text-xs font-bold transition-all duration-300 shadow-sm border border-white/60">
                                    Lihat Semua
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="flex flex-col gap-3">
                                {recentBorrowings.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white/60">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" /></svg>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">Belum ada aktivitas</p>
                                        <p className="text-xs text-gray-500 mt-1">Data peminjaman akan muncul di sini</p>
                                    </div>
                                ) : recentBorrowings.map((item, idx) => (
                                    <div key={item.id || idx} className="group/item flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/40 hover:bg-white/70 backdrop-blur-md rounded-[1.2rem] border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all duration-300 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shrink-0 border border-white shadow-sm group-hover/item:scale-105 group-hover/item:-rotate-3 transition-transform duration-300">
                                                    <span className="text-lg font-black text-gray-800">{item.nama.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white/80 shadow-sm ${
                                                    item.status === 'Selesai' ? 'bg-emerald-400' :
                                                    item.status === 'Ditolak' ? 'bg-rose-500' : 'bg-amber-400'
                                                }`}></div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 drop-shadow-sm">{item.nama}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-gray-600 bg-white/60 border border-white/50 px-2 py-0.5 rounded-lg backdrop-blur-sm">{item.barang}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between sm:justify-end gap-5 sm:w-auto w-full border-t border-white/30 sm:border-t-0 pt-3 sm:pt-0">
                                            <div className="flex flex-col sm:items-end">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 opacity-60"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                                    {item.tglPinjam}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5 font-medium">
                                                    hingga {item.tglKembali}
                                                </div>
                                            </div>
                                            
                                            <div className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-white/50 flex items-center justify-center min-w-[85px] backdrop-blur-md ${
                                                ['Dipinjam', 'Menunggu'].includes(item.status) 
                                                    ? 'bg-amber-100/80 text-amber-800' 
                                                    : item.status === 'Ditolak'
                                                    ? 'bg-rose-100/80 text-rose-800'
                                                    : 'bg-emerald-100/80 text-emerald-800'
                                            }`}>
                                                {item.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Kategori Barang (1/3 width) - LIQUID GLASS */}
                    <div className="relative group rounded-[2.5rem] overflow-hidden bg-white/30 backdrop-blur-3xl border border-white/40 border-t-white/80 border-l-white/60 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-500 hover:bg-white/40 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] h-full">
                        <div className="absolute inset-0 bg-gradient-to-bl from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                        <div className="relative p-7 sm:p-9 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 drop-shadow-sm">
                                        <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                                        </div>
                                        Kategori
                                    </h3>
                                    <p className="text-[11px] text-gray-600 font-semibold mt-1.5 ml-12 uppercase tracking-widest opacity-80">Rasio Barang</p>
                                </div>
                                <Link to="/categories" className="p-2.5 bg-white/50 hover:bg-white backdrop-blur-md text-gray-700 hover:text-teal-600 rounded-2xl transition-all duration-300 shadow-sm border border-white/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                </Link>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
                                {/* Liquid glow behind chart */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/60 rounded-full blur-[30px] pointer-events-none mix-blend-overlay"></div>
                                
                                <div className="relative z-10 hover:scale-105 transition-transform duration-500 ease-out drop-shadow-md">
                                    {categories.length > 0 ? (
                                        <div className="relative">
                                            <DonutChart data={categories} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-4xl font-black text-gray-800 drop-shadow-sm">{stats.totalKategori}</span>
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Total</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-[180px] h-[180px] rounded-full border-[6px] border-white/40 bg-white/20 backdrop-blur-md shadow-inner flex flex-col items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" /></svg>
                                            <span className="text-gray-500 text-xs font-semibold">Kosong</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3.5">
                                {(!Array.isArray(categories) || categories.length === 0) ? (
                                    <div className="text-center p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50">
                                        <p className="text-gray-600 text-xs font-semibold">Belum ada kategori yang terdaftar</p>
                                    </div>
                                ) : categories.slice(0, 4).map((cat, index) => (
                                    <div key={index} className="group/cat flex items-center justify-between p-3 hover:bg-white/60 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-white/40 hover:border-white/80 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-9 h-9 rounded-[10px] flex items-center justify-center shadow-sm border border-white/60 bg-white/80">
                                                <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                                                <div className="absolute inset-0 rounded-[10px] opacity-0 group-hover/cat:opacity-100 transition-opacity" style={{ boxShadow: `inset 0 0 10px ${cat.color}20` }}></div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-extrabold text-gray-800 drop-shadow-sm">{cat.name}</p>
                                                <div className="w-28 h-1.5 bg-gray-200/50 backdrop-blur-sm rounded-full mt-1.5 overflow-hidden border border-black/5 shadow-inner">
                                                    <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_5px_rgba(255,255,255,0.5)]" style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-gray-900 block drop-shadow-sm">{cat.percent}%</span>
                                        </div>
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
                        ┬⌐ 2025 SIBOS & Inventaris MAPALA. All Rights Reserved.
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
 
 