import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { canManageInventory } from '../../utils/permissions';
import logoImg from '../../assets/logoSibos.png';

export default function Navbar({ notifications = [], showNotifications, setShowNotifications, notificationRef }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
        )},
        { name: 'Barang', path: '/items', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
        )},
        { name: 'Peminjaman', path: '/borrowings', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
        )},
        ...(canManageInventory(user) ? [{ name: 'Kategori', path: '/categories', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg>
        )}] : []),
        { name: 'Kerusakan', path: '/maintenance', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
        )}
    ];

    return (
        <nav className="w-full flex items-center justify-between px-6 lg:px-10 py-4 z-50 border-b border-white/10">
            {/* Logo area */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 mr-4 sm:mr-8">
                <img src={logoImg} alt="SIBOS Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-2xl shadow-sm bg-white" />
                <div className="flex flex-col justify-center items-center sm:items-start mt-0.5 sm:mt-0 text-center sm:text-left">
                    <h1 className="font-extrabold text-white text-[13px] sm:text-2xl tracking-tight leading-none sm:mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        SIBOS
                    </h1>
                    <p className="text-emerald-400 font-bold text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] leading-none uppercase mt-0.5 sm:mt-0">
                        Inventory System
                    </p>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center justify-center gap-2 flex-1">
                {navLinks.map(link => {
                    const isActive = location.pathname.startsWith(link.path);
                    return (
                        <Link 
                            key={link.path} 
                            to={link.path} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive ? 'bg-white/20 text-white shadow-inner border border-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className={isActive ? 'text-white' : 'text-white/50'}>{link.icon}</span>
                            {link.name}
                        </Link>
                    )
                })}
            </div>

            {/* Right side (Settings, Notification, User) */}
            <div className="flex items-center gap-4">
                {/* Notification */}
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                        {notifications?.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full"></span>
                        )}
                    </button>
                    
                    {/* Dropdown Notifikasi */}
                    <div className={`absolute right-[-4rem] sm:right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-200 overflow-hidden transform origin-top-right sm:origin-top-right transition-all duration-200 ease-out ${showNotifications ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`} style={{ zIndex: 9999 }}>
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 relative">
                            <div className="flex items-center gap-2">
                                <h3 className="text-gray-800 font-bold text-xs tracking-wider">NOTIFIKASI</h3>
                                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                    {notifications?.length || 0} Baru
                                </span>
                            </div>
                            <button onClick={() => setShowNotifications(false)} className="p-1 bg-transparent hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700 cursor-pointer z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="max-h-320px overflow-y-auto custom-scrollbar">
                            {!notifications || notifications.length === 0 ? (
                                <div className="py-8 px-4 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 mx-auto text-gray-300 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                                    <p className="text-gray-500 text-xs">Belum ada notifikasi baru.</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className="flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0 cursor-pointer">
                                        <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center bg-[#0F4C3A]/10 text-[#0F4C3A]">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-800 font-bold leading-relaxed">{n.title}</p>
                                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="relative" ref={profileMenuRef}>
                    <div 
                        className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-full sm:rounded-xl transition-colors"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold overflow-hidden border-2 border-white/20">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="hidden sm:block pr-2">
                            <p className="text-white font-semibold text-sm leading-tight">{user?.name}</p>
                            <p className="text-white/60 text-[10px]">{user?.role || 'User'}</p>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className={`absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden transform origin-top-right transition-all duration-200 ease-out z-50 ${showProfileMenu ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
                        <div className="p-3 border-b border-gray-100 bg-gray-50/50 sm:hidden">
                            <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
                            <p className="text-gray-500 text-xs truncate">{user?.role || 'User'}</p>
                        </div>
                        <div className="p-2">
                            <button 
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    navigate('/profile');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                Profil Saya
                            </button>
                            <button 
                                onClick={async () => {
                                    setShowProfileMenu(false);
                                    setIsLoggingOut(true);
                                    try {
                                        await logout();
                                        navigate('/login');
                                    } catch (error) {
                                        console.error('Logout error:', error);
                                        setIsLoggingOut(false);
                                    }
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Loading Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm bg-slate-50/50">
                    <svg className="animate-spin h-14 w-14 text-emerald-900 drop-shadow-md" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="mt-4 font-bold text-emerald-900 tracking-wider animate-pulse drop-shadow-sm">KELUAR...</span>
                </div>
            )}
        </nav>
    );
}
