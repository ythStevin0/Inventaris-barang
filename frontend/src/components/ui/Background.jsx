import React from 'react';

export default function Background() {
    return (
        <>
            {/* 1. Subtle Topographic SVG Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply fixed z-[0]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'100\'%25 height=\'100\'%25 xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.01\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'matrix\' values=\'1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.5 0\' /%3E%3C/filter%3E%3Crect width=\'100\'%25 height=\'100\'%25 filter=\'url(%23noise)\'/%3E%3C/svg%3E')" }}></div>
            
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
            </div>
        </>
    );
}
