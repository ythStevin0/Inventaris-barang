const fs = require('fs');
const file = 'src/pages/Dashboard/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add isSidebarOpen state
if (!content.includes('const [isSidebarOpen, setIsSidebarOpen] = useState(false);')) {
    content = content.replace(
        'const [showCalendar, setShowCalendar] = useState(false);',
        'const [showCalendar, setShowCalendar] = useState(false);\n    const [isSidebarOpen, setIsSidebarOpen] = useState(false);'
    );
}

// 2. Add Sidebar and Hamburger Menu
const headerMatch = '<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/5 border border-emerald-900/10 mb-3">';
const headerReplacement = `<div className="flex items-center gap-3 mb-3">
                                {/* Hamburger Menu Button */}
                                <button 
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 bg-white/60 backdrop-blur-md rounded-xl border border-white hover:bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all text-emerald-900 group"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                </button>
                                
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/5 border border-emerald-900/10">`;

content = content.replace(headerMatch, headerReplacement);
content = content.replace(
    '<h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-emerald-800">\n                                    DASHBOARD SIBOS\n                                </h3>\n                            </div>',
    '<h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-emerald-800">\n                                        DASHBOARD SIBOS\n                                    </h3>\n                                </div>\n                            </div>'
);

// 3. Inject Sidebar Component just inside the root div
const rootDivMatch = '<div className="min-h-screen flex flex-col bg-[#F4F8F5] relative overflow-x-hidden z-0 font-sans">';
const sidebarComponent = `
            {/* ============ SIDEBAR / DRAWER ============ */}
            {/* Overlay */}
            <div 
                className={\`fixed inset-0 bg-emerald-950/20 backdrop-blur-sm z-[100] transition-opacity duration-300 \${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}\`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            
            {/* Sidebar Container */}
            <div 
                className={\`fixed top-0 left-0 h-full w-72 bg-white/80 backdrop-blur-2xl shadow-2xl z-[101] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col border-r border-white \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}\`}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-emerald-900/10 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-600/30">
                            S
                        </div>
                        <div>
                            <h2 className="font-extrabold text-emerald-950 text-lg leading-tight">SIBOS</h2>
                            <p className="text-emerald-700/70 text-[10px] font-semibold tracking-wider">INVENTARIS MAPALA</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-emerald-50 rounded-full transition-colors text-emerald-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5 custom-scrollbar">
                    <p className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-widest px-4 mb-2">Menu Utama</p>
                    
                    <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.689z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" /></svg>
                        Dashboard
                    </Link>
                    
                    {canManageInventory(user) ? (
                        <>
                            <Link to="/items" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/50 text-emerald-950 font-medium transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg></div>
                                Kelola Barang
                            </Link>
                            <Link to="/categories" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/50 text-emerald-950 font-medium transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-600 flex items-center justify-center group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg></div>
                                Kelola Kategori
                            </Link>
                            <Link to="/borrowings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/50 text-emerald-950 font-medium transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" /></svg></div>
                                Kelola Peminjaman
                            </Link>
                            <Link to="/maintenance" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/50 text-emerald-950 font-medium transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63" /></svg></div>
                                Kelola Kerusakan
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/items" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/50 text-emerald-950 font-medium transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg></div>
                                Daftar Barang
                            </Link>
                            <Link to="/borrowings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/50 text-emerald-950 font-medium transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg></div>
                                Riwayat Peminjaman
                            </Link>
                        </>
                    )}
                </div>
                
                {/* User Profile Bottom */}
                <div className="p-4 border-t border-emerald-900/10 bg-emerald-50/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center text-white font-bold shadow-md">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-950 truncate max-w-[120px]">{user?.name}</p>
                                <p className="text-[10px] text-emerald-600 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-xl shadow-sm border border-emerald-900/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                        </button>
                    </div>
                </div>
            </div>`;

content = content.replace(rootDivMatch, rootDivMatch + sidebarComponent);

// 4. Remove the old 4 Menu Cards and replace with Visual Shortcuts
const oldCardsRegex = /\{\/\* ---- Menu Cards \(di dalam area berwarna\) ---- \*\/\}[\s\S]*?(?=\{\/\* ============ STAT CARDS)/;

const visualShortcuts = `{/* ---- Menu Shortcuts (Visual Quick Links) ---- */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 lg:gap-6 mb-2 mt-4 w-full">
                        {canManageInventory(user) ? (
                            <>
                                <Link to="/items" className="group flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] group-hover:border-emerald-300/50 transition-all duration-300">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-950">Barang</span>
                                </Link>
                                <Link to="/categories" className="group flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_12px_40px_rgba(132,204,22,0.15)] group-hover:border-lime-300/50 transition-all duration-300">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-lime-100 text-lime-600 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-950">Kategori</span>
                                </Link>
                                <Link to="/borrowings" className="group flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)] group-hover:border-blue-300/50 transition-all duration-300">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" /></svg>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-950">Peminjaman</span>
                                </Link>
                                <Link to="/maintenance" className="group flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_12px_40px_rgba(249,115,22,0.15)] group-hover:border-orange-300/50 transition-all duration-300">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63" /></svg>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-950">Kerusakan</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/items" className="group flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] group-hover:border-emerald-300/50 transition-all duration-300">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-950">Cari Barang</span>
                                </Link>
                                <Link to="/borrowings" className="group flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)] group-hover:border-blue-300/50 transition-all duration-300">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-950">Peminjaman</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ============ STAT CARDS (Overlapping the boundary) ============ */}`;

content = content.replace(oldCardsRegex, visualShortcuts);

fs.writeFileSync(file, content);
