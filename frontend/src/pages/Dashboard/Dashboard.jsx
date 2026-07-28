import useAuthStore from '../../store/authStore';
import { useEffect, useState } from 'react';
import { canManageInventory } from '../../utils/permissions';
import { getDashboardStats } from '../../services/dashboardService';
import { getBorrowings } from '../../services/borrowingsService';
import Navbar from '../../components/Layout/Navbar';
import HeaderActions from '../../components/ui/HeaderActions';
import bgTexture from '../../assets/download (4).jpg';
import { getImageUrl } from '../../utils/imageUtils';

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
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    
    const [pageRecent, setPageRecent] = useState(0);
    const [pageCalendar, setPageCalendar] = useState(0);

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
        <div className="min-h-screen flex flex-col font-sans bg-[#FDFBF7] overflow-x-hidden">
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
                
                {/* Hero */}
                <div className="max-w-1400px mx-auto px-6 lg:px-10 mt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-white/70 text-lg font-medium mb-1">Selamat Pagi,</p>
                        <h1 className="text-white text-4xl font-semibold tracking-tight">
                            {canManageInventory(user) ? 'Pengurus UKM Stimbara' : `${user?.name} UKM Stimbara`}
                        </h1>
                    </div>
                    
                    <HeaderActions 
                        notifications={notifications} 
                        calendarEvents={calendarEvents} 
                    />
                </div>
            </div>

            {/* MAIN CONTENT (Overlapping) */}
            <div className="max-w-1400px w-full mx-auto px-6 lg:px-10 -mt-20 relative z-20 pb-12">
                
                {/* Stat Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-w-5xl mx-auto">
                    {/* Card 1: Total Barang */}
                    <div className="w-full bg-white rounded-2xl p-4 shadow-sm relative group hover:-translate-y-1 transition-transform border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                        </div>


                        <div className="flex items-end gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{stats.totalBarang}</h2>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">Total Barang</p>
                    </div>

                    {/* Card 2: Total Kategori */}
                    <div className="w-full bg-white rounded-2xl p-4 shadow-sm relative group hover:-translate-y-1 transition-transform border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z" /></svg>
                        </div>


                        <div className="flex items-end gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{stats.totalKategori}</h2>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">Total Kategori</p>
                    </div>

                    {/* Card 3: Barang Dipinjam */}
                    <div className="w-full bg-white rounded-2xl p-4 shadow-sm relative group hover:-translate-y-1 transition-transform border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                        </div>


                        <div className="flex items-end gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{stats.barangDipinjam}</h2>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">Barang Dipinjam</p>
                    </div>

                    {/* Card 4: Peminjaman Aktif */}
                    <div className="w-full bg-white rounded-2xl p-4 shadow-sm relative group hover:-translate-y-1 transition-transform border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-medium text-gray-400 mr-2">
                                        Hal {pageRecent + 1} / {Math.max(1, Math.ceil(recentBorrowings.length / 4))}
                                    </span>
                                    <button 
                                        onClick={() => setPageRecent(Math.max(0, pageRecent - 1))}
                                        disabled={pageRecent === 0}
                                        className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-colors ${pageRecent === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 cursor-pointer'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => setPageRecent(pageRecent + 1)}
                                        disabled={(pageRecent + 1) * 4 >= recentBorrowings.length}
                                        className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-colors ${(pageRecent + 1) * 4 >= recentBorrowings.length ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 cursor-pointer'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                {recentBorrowings.slice(pageRecent * 4, (pageRecent + 1) * 4).map(borrow => {
                                    const bDate = new Date(borrow.borrow_date || borrow.created_at || new Date());
                                    const dateStr = bDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    const timeStr = bDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                    
                                    return (
                                        <div key={borrow.id} className="flex justify-between items-center py-3 px-3 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 text-sm truncate">{borrow.item?.name}</h4>
                                                    <p className="text-gray-500 text-xs truncate">{borrow.user?.name}</p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-[10px] font-medium whitespace-nowrap shrink-0">
                                                {dateStr} - {timeStr}
                                            </div>
                                        </div>
                                    );
                                })}
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
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-medium text-gray-400 mr-2">
                                    Hal {pageCalendar + 1} / {Math.max(1, Math.ceil(calendarEvents.length / 4))}
                                </span>
                                <button 
                                    onClick={() => setPageCalendar(Math.max(0, pageCalendar - 1))}
                                    disabled={pageCalendar === 0}
                                    className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-colors ${pageCalendar === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 cursor-pointer'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                                </button>
                                <button 
                                    onClick={() => setPageCalendar(pageCalendar + 1)}
                                    disabled={(pageCalendar + 1) * 4 >= calendarEvents.length}
                                    className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-colors ${(pageCalendar + 1) * 4 >= calendarEvents.length ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 cursor-pointer'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1 mt-6">
                            {calendarEvents.slice(pageCalendar * 4, (pageCalendar + 1) * 4).map(ev => {
                                const bDate = new Date(ev.expected_return_date || ev.return_date || ev.due_date);
                                const dateStr = bDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                const timeStr = bDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                const evName = ev.user?.name || ev.name || 'Peminjam';
                                return (
                                    <div key={ev.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 overflow-hidden flex items-center justify-center font-bold text-sm">
                                                {ev.user?.avatar ? (
                                                    <img src={getImageUrl(ev.user.avatar)} alt={evName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{evName.charAt(0).toUpperCase()}</span>
                                                )}
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
                            <div className="bg-secondary-500 h-full transition-all duration-500" style={{ width: `${totalBarang ? ((stats.barangDipinjam || 0)/totalBarang)*100 : 0}%` }}></div>
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
                                    <span className="w-3 h-3 rounded-full bg-secondary-500"></span>
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