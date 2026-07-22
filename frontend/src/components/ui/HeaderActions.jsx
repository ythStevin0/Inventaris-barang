import { useState, useEffect, useRef } from 'react';
import { getDashboardStats } from '../../services/dashboardService';
import { getBorrowings } from '../../services/borrowingsService';

export default function HeaderActions() {
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    
    // State Calendar
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
    
    const calendarRef = useRef(null);

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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                const data = await getDashboardStats();
                if (!isMounted) return;
                setNotifications(data.notifications || []);
                
                try {
                    const borrowingsData = await getBorrowings();
                    if (borrowingsData && borrowingsData.data && isMounted) {
                        setCalendarEvents(borrowingsData.data.filter(b => b.status === 'borrowed' || b.status === 'approved'));
                    } else if (isMounted) {
                        setCalendarEvents(data.calendarEvents || []);
                    }
                } catch (error) {
                    console.warn("Failed to fetch borrowings:", error);
                    if (isMounted) {
                        setCalendarEvents(data.calendarEvents || []);
                    }
                }
            } catch (error) {
                console.error("Gagal memuat data HeaderActions:", error);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="flex items-center gap-3 w-full md:w-auto justify-start mt-4 md:mt-0">
            {/* Notification */}
            <div className="relative" ref={notificationRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                    {notifications?.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full"></span>
                    )}
                </button>
                
                {/* Dropdown Notifikasi */}
                <div className={`fixed left-4 right-4 sm:left-auto sm:right-4 md:absolute md:left-auto md:right-0 top-32 md:top-auto md:mt-2 sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-200 overflow-hidden transform origin-top md:origin-top-right transition-all duration-200 ease-out z-100 ${showNotifications ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
                    <div className="p-3 bg-[#0F4C3A] flex justify-between items-center relative">
                        <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold text-xs tracking-wider">NOTIFIKASI</h3>
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                {notifications?.length || 0} Baru
                            </span>
                        </div>
                        <button onClick={() => setShowNotifications(false)} className="p-1 bg-transparent hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white cursor-pointer z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="max-h-75 overflow-y-auto">
                        {notifications?.length > 0 ? (
                            notifications.map((notif, index) => (
                                <div key={index} className="p-3 border-b border-gray-50 hover:bg-emerald-50 transition-colors flex gap-3 group relative cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 relative z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-sm text-gray-800 font-medium leading-snug">{notif.message}</p>
                                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                            {notif.time || 'Baru saja'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2 text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                                </div>
                                <p className="text-sm text-gray-400">Tidak ada notifikasi baru</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Date Component */}
            <div className="relative" ref={calendarRef}>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowCalendar(!showCalendar);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors text-sm cursor-pointer whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <span>{today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>

                {/* Dropdown Kalender */}
                <div className={`fixed left-4 right-4 sm:left-auto sm:right-4 md:absolute md:left-auto md:right-0 top-32 md:top-auto md:mt-2 sm:w-80 z-100 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 overflow-hidden transform origin-top md:origin-top-right transition-all duration-200 ease-out ${showCalendar ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700 cursor-pointer z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <h3 className="text-[#11224E] font-bold text-sm text-center min-w-25">{monthNames[currentMonth]} {currentYear}</h3>
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
                                        onClick={() => day && setSelectedDate(day)}
                                        className={`
                                            relative h-8 w-full flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all
                                            ${!day ? 'invisible' : ''}
                                            ${isToday ? 'bg-emerald-500 text-white font-bold shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                                            ${isSelected && !isToday ? 'bg-emerald-100 text-emerald-700 font-bold' : ''}
                                            ${hasEvents && !isToday ? 'font-bold' : ''}
                                        `}
                                    >
                                        {day}
                                        {hasEvents && !isToday && (
                                            <span className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full"></span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {selectedDate && getEventsForDate(selectedDate).length > 0 && (
                        <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Jadwal pada {selectedDate} {monthNames[currentMonth]}</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {getEventsForDate(selectedDate).map((event, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex items-start gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${event.status === 'borrowed' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">{event.item?.name || 'Barang'}</p>
                                            <p className="text-[10px] text-gray-500">{event.borrower_name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
    );
}
