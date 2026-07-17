const fs = require('fs');
const file = 'src/pages/Dashboard/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change root to soft natural green and add Topographic + Leaves/Orbs background + Fireflies
const rootRegex = /<div className="min-h-screen flex flex-col bg-gray-100 relative overflow-x-hidden z-0">/g;
content = content.replace(rootRegex, 
    `<div className="min-h-screen flex flex-col bg-[#F4F8F5] relative overflow-x-hidden z-0 font-sans">
            {/* 1. Subtle Topographic SVG Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'100\\'%25 height=\\'100\\'%25 xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noise\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.01\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3CfeColorMatrix type=\\'matrix\\' values=\\'1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.5 0\\' /%3E%3C/filter%3E%3Crect width=\\'100\\'%25 height=\\'100\\'%25 filter=\\'url(%23noise)\\'/%3E%3C/svg%3E')" }}></div>
            
            {/* 2. Soft Nature Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed z-[0]">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[80%] rounded-[100%] bg-emerald-200/40 blur-[120px] mix-blend-multiply animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[70%] rounded-[100%] bg-lime-200/40 blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[60%] rounded-[100%] bg-green-200/30 blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>
            
            {/* 3. Animasi Kunang-Kunang (Fireflies) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1] fixed">
                {[...Array(35)].map((_, i) => (
                    <div key={i} 
                         className="absolute rounded-full bg-lime-300 shadow-[0_0_12px_4px_rgba(163,230,53,0.7)] animate-firefly"
                         style={{
                             width: Math.random() * 3 + 2 + 'px',
                             height: Math.random() * 3 + 2 + 'px',
                             left: Math.random() * 100 + '%',
                             top: Math.random() * 100 + '%',
                             animationDuration: Math.random() * 6 + 4 + 's',
                             animationDelay: Math.random() * -10 + 's'
                         }}>
                    </div>
                ))}
            </div>`
);

// 2. Remove the old solid colored header block entirely (making it seamless)
content = content.replace(
    '<div className="relative" style={{ backgroundColor: THEME.primary }}>',
    '<div className="relative z-10">'
);
const batikRegex = /\{\/\* Header Batik Background \*\/\}[\s\S]*?>\s*<\/div>/;
content = content.replace(batikRegex, '');

// 3. Fix the top spacing that was inside the old header wrapper
content = content.replace(
    '<div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 md:pt-16 pb-28 md:pb-32 z-10">',
    '<div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-8 md:pt-12 pb-16 z-10">'
);

// 4. Update Header Typography (from light/white text to elegant dark green)
content = content.replace(
    '<h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-1.5 text-[#ffffff]/60">\n                                DASHBOARD SIBOS\n                            </h3>',
    '<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/5 border border-emerald-900/10 mb-3">\n                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>\n                                <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-emerald-800">\n                                    DASHBOARD SIBOS\n                                </h3>\n                            </div>'
);

content = content.replace(
    '<h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight text-[#F87B1B]">',
    '<h1 className="text-4xl md:text-6xl font-extrabold mb-3 tracking-tight text-emerald-950 drop-shadow-sm">'
);

content = content.replace(
    '<p className="text-[#ffffff]/80 text-sm md:text-base max-w-2xl leading-relaxed">\n                                Selamat datang kembali, <strong className="text-white">{user?.name}</strong>',
    '<p className="text-emerald-800/80 text-base md:text-lg max-w-2xl leading-relaxed font-medium">\n                                Selamat datang kembali, <strong className="text-emerald-900 font-bold">{user?.name}</strong>'
);
content = content.replace(
    '<span className="text-[#ffffff]/60 font-normal"> ({user.role})</span>',
    '<span className="text-emerald-700/60 font-normal"> ({user.role})</span>'
);

// 5. Fix Calendar & Notification icons in header
content = content.replace(/text-\[#ffffff\]\/50/g, 'text-emerald-700/70');
content = content.replace(/text-\[#ffffff\]\/80/g, 'text-emerald-900');
content = content.replace(/text-\[#ffffff\]\/70/g, 'text-emerald-800');
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-emerald-900/5');
content = content.replace(/bg-white\/10/g, 'bg-emerald-900/5');

// 6. Fix "Overlapping" margin so cards don't overlap a non-existent block
content = content.replace(
    '<div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 -mt-14 relative z-20">',
    '<div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 relative z-20 mb-8">'
);

// 7. Make cards glassmorphic over the nature background
// For stats cards
content = content.replace(
    /bg-\[#ffffff\] border border-gray-200/g, 
    'bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
);
// For bottom section cards (Recent Borrowings, etc)
content = content.replace(
    /bg-white border border-gray-200 rounded-2xl p-5 shadow-sm/g, 
    'bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
);

// 8. Update Menu Cards (The colorful ones)
content = content.replace(
    /bg-linear-to-br from-\[#ffffff\] to-\[#ffffff\] hover:from-\[#F87B1B\] hover:to-orange-500 border border-transparent shadow-sm/g,
    'bg-linear-to-br from-white/80 to-white/40 backdrop-blur-md hover:from-emerald-50 hover:to-emerald-100 border border-white shadow-sm'
);

// Fix menu cards text colors
content = content.replace(
    /text-gray-900 group-hover:text-white/g,
    'text-emerald-950 group-hover:text-emerald-900'
);
content = content.replace(
    /text-gray-500 group-hover:text-white\/80/g,
    'text-emerald-700/80 group-hover:text-emerald-800'
);
content = content.replace(
    /text-\[#F87B1B\] group-hover:text-white/g,
    'text-emerald-600 group-hover:text-emerald-700'
);
content = content.replace(
    /bg-\[#F87B1B\]\/10 group-hover:bg-white\/20/g,
    'bg-emerald-100 group-hover:bg-emerald-200/60'
);
content = content.replace(
    /text-\[#F87B1B\]/g,
    'text-emerald-600'
);

// Text updates across the board
content = content.replace(/text-gray-900/g, 'text-emerald-950');
content = content.replace(/text-gray-600/g, 'text-emerald-800');
content = content.replace(/text-gray-500/g, 'text-emerald-700/70');
content = content.replace(/text-gray-400/g, 'text-emerald-600/60');
content = content.replace(/border-gray-100/g, 'border-emerald-900/5');
content = content.replace(/border-gray-200/g, 'border-emerald-900/10');
content = content.replace(/bg-gray-50/g, 'bg-emerald-50/50');
content = content.replace(/hover:bg-gray-50/g, 'hover:bg-emerald-50/80');

// Footer 
content = content.replace(
    '<footer className="relative z-10 border-t border-gray-200 bg-white">',
    '<footer className="relative z-10 border-t border-emerald-900/10 bg-transparent mt-12">'
);

fs.writeFileSync(file, content);
