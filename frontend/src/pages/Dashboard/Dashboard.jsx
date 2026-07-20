import useAuthStore from '../../store/authStore';
import { useEffect, useState, useRef } from 'react';
import { canManageInventory } from '../../utils/permissions';
import { getDashboardStats } from '../../services/dashboardService';
import { getBorrowings } from '../../services/borrowingsService';
import Navbar from '../../components/Layout/Navbar';
import bgTexture from '../../assets/download (4).jpg';

export default function Dashboard() {
    const { user, getMe } = useAuthStore();
    
    // State API
    const [stats, setStats] = useState({
        totalBarang: 0,
        totalKategori: 0,
        barangDipinjam: 0,
        peminjamanAktif: 0,
        barangRusak: 0,
    });
    const [recentBorrowings, setRecentBorrowings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // --- Restored Calendar Logic ---
    const [showCalendar, setShowCalendar] = useState(false);
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
    
    const notificationRef = useRef(null);
    const calendarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                if (!user) await getMe();
                const data = await getDashboardStats();
                setStats(data.stats);
                setNotifications(data.notifications || []);
                
                // Fetch real borrowings data
                try {
                    const borrowingsData = await getBorrowings();
                    if (borrowingsData && borrowingsData.data) {
                        setRecentBorrowings(borrowingsData.data);
                        setCalendarEvents(borrowingsData.data.filter(b => b.status === 'borrowed' || b.status === 'approved'));
                    } else {
                        setRecentBorrowings(data.recentBorrowings || []);
                        setCalendarEvents(data.calendarEvents || []);
                    }
                } catch (err) {
                    console.warn("Gagal fetch API borrowings, menggunakan data fallback:", err);
                    setRecentBorrowings(data.recentBorrowings || []);
                    setCalendarEvents(data.calendarEvents || []);
                }
            } catch (error) {
                console.error("Gagal memuat data dashboard:", error);
            }
        };
        loadDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Data calculations
    const totalBarang = stats.totalBarang || 0;
    const available = totalBarang - (stats.barangDipinjam || 0) - (stats.barangRusak || 0);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#FDFBF7]">
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
                <Navbar 
                    notifications={notifications}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    notificationRef={notificationRef}
                />
                
                {/* Hero */}
                <div className="max-w-1400px mx-auto px-6 lg:px-10 mt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-white/70 text-lg font-medium mb-1">Selamat Pagi,</p>
                        <h1 className="text-white text-4xl font-semibold tracking-tight">
                            {canManageInventory(user) ? 'Pengurus UKM Stimbara' : `${user?.name} UKM Stimbara`}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative z-50" ref={calendarRef}>
                            <button 
                                onClick={() => {
                                    setShowCalendar(!showCalendar);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors text-sm cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                                <span>{today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            </button>

                            {/* Dropdown Kalender */}
                            <div className={`absolute left-0 md:right-0 md:left-auto mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 overflow-hidden transform origin-top-left md:origin-top-right transition-all duration-200 ease-out ${showCalendar ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
                                <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700 cursor-pointer z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                        </button>
                                        <h3 className="text-[#11224E] font-bold text-sm text-center min-w-100px">{monthNames[currentMonth]} {currentYear}</h3>
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
                                                            ? 'bg-[#0F4C3A] text-white shadow-md' 
                                                            : isSelected
                                                                ? 'bg-emerald-100 text-[#0F4C3A] ring-2 ring-emerald-500'
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
                                                                <div className="font-semibold text-gray-900">{ev.item?.name || 'Peminjaman'}</div>
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
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT (Overlapping) */}
            <div className="max-w-1400px w-full mx-auto px-6 lg:px-10 -mt-20 relative z-20 pb-12">
                
                {/* Stat Cards Row */}
                <div className="flex flex-wrap lg:flex-nowrap justify-center gap-4 mb-6 max-w-5xl mx-auto">
                    {/* Card 1: Total Barang */}
                    <div className="flex-1 min-w-160px bg-white rounded-2xl p-4 shadow-sm relative group hover:-translate-y-1 transition-transform border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                        </div>
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full border border-gray-100 flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2 h-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                        </div>

                        <div className="flex items-end gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{stats.totalBarang}</h2>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">Total Barang</p>
                    </div>

                    {/* Card 2: Total Kategori */}
                    <div className="flex-1 min-w-160px bg-white rounded-2xl p-4 shadow-sm relative group hover:-translate-y-1 transition-transform border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z" /></svg>
                        </div>
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full border border-gray-100 flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2 h-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                        </div>

                        <div className="flex items-end gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{stats.totalKategori}</h2>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">Total Kategori</p>
                    </div>

                    {/* Card 3: Barang Dipinjam */}
                    <div className="flex-1 min-w-160px bg-white rounded-2xl p-4 shadow-sm relative group hover:-translate-y-1 transition-transform border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                        </div>
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full border border-gray-100 flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2 h-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                        </div>

                        <div className="flex items-end gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{stats.barangDipinjam}</h2>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">Barang Dipinjam</p>
                    </div>

                    {/* Card 4: Peminjaman Aktif */}
                    <div className="flex-1 min-w-160px bg-white rounded-2xl p-4 shadow-sm relative group hover:-translate-y-1 transition-transform border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="absolute top-4 right-4 w-4 h-4 rounded-full border border-gray-100 flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2 h-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                        </div>

                        <div className="flex items-end gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{stats.peminjamanAktif}</h2>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">Peminjaman Aktif</p>
                    </div>


                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* COL 1: Peminjaman Terbaru */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 h-400px overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-base">Peminjaman Terbaru</h3>
                                    <p className="text-gray-500 text-xs mt-0.5"><span className="text-gray-900 font-bold text-sm">{recentBorrowings.length}</span> Transaksi</p>
                                </div>
                                <div className="flex gap-1">
                                    <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg></button>
                                    <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></button>
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                {recentBorrowings.slice(0, 4).map(borrow => (
                                    <div key={borrow.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                                        <div className="w-10 h-10 rounded-xl bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 text-sm truncate">{borrow.item?.name}</h4>
                                            <p className="text-gray-500 text-xs truncate">{borrow.user?.name}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentBorrowings.length === 0 && (
                                    <div className="text-center py-6 text-gray-400 text-sm">Tidak ada transaksi</div>
                                )}
                            </div>
                        </div>

                    {/* COL 2: Jadwal Pengembalian */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 h-400px overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 text-base">Jadwal Pengembalian</h3>
                                <p className="text-gray-500 text-xs mt-0.5"><span className="text-gray-900 font-bold text-sm">{calendarEvents.length}</span> Jadwal</p>
                            </div>
                            <div className="flex gap-1">
                                <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg></button>
                                <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></button>
                            </div>
                        </div>
                        <div className="space-y-1 mt-6">
                            {calendarEvents.slice(0, 5).map(ev => {
                                const bDate = new Date(ev.expected_return_date || ev.return_date || ev.due_date);
                                const dateStr = bDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                const timeStr = bDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                const evName = ev.user?.name || ev.name || 'Peminjam';
                                return (
                                    <div key={ev.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 overflow-hidden flex items-center justify-center font-bold text-sm">
                                                {/* Fallback avatar */}
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(evName)}&background=random`} alt={evName} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">{evName}</h4>
                                                <p className="text-gray-500 text-xs">Peminjam</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-[10px] font-medium whitespace-nowrap">
                                            {dateStr} - {timeStr}
                                        </div>
                                    </div>
                                )
                            })}
                            {calendarEvents.length === 0 && (
                                <div className="text-center py-6 text-gray-400 text-sm">Tidak ada jadwal pengembalian</div>
                            )}
                        </div>
                    </div>

                    {/* COL 3: Status Inventaris */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 h-400px">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-gray-900 text-base">Status Inventaris</h3>
                            <button className="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg></button>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
                            <span>Total Barang</span>
                            <span className="text-gray-900 font-bold">{totalBarang}</span>
                        </div>
                        
                        {/* Progress Bars Stack */}
                        <div className="w-full h-4 rounded-full flex overflow-hidden mb-6 gap-0.5">
                            <div className="bg-[#0F4C3A] h-full transition-all duration-500" style={{ width: `${totalBarang ? (available/totalBarang)*100 : 0}%` }}></div>
                            <div className="bg-#14b8a6 h-full transition-all duration-500" style={{ width: `${totalBarang ? ((stats.barangDipinjam || 0)/totalBarang)*100 : 0}%` }}></div>
                            <div className="bg-gray-200 h-full transition-all duration-500" style={{ width: `${totalBarang ? ((stats.barangRusak || 0)/totalBarang)*100 : 0}%` }}></div>
                        </div>
                        
                        <div className="space-y-4 mt-8">
                            <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-[#0F4C3A]"></span>
                                    <span className="text-gray-600 font-medium">Tersedia</span>
                                </div>
                                <span className="font-bold text-gray-900">{available}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-#14b8a6"></span>
                                    <span className="text-gray-600 font-medium">Dipinjam</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.barangDipinjam || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 rounded-xl bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                                    <span className="text-gray-600 font-medium">Rusak</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.barangRusak || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}