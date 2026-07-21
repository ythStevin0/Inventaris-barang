import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import logoImg from '../../assets/logoSibos.png';

const INITIAL_PARTICLES = [...Array(12)].map(() => ({
    width: Math.random() * 6 + 2 + 'px',
    height: Math.random() * 6 + 2 + 'px',
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDuration: Math.random() * 10 + 10 + 's',
    animationDelay: Math.random() * 5 + 's',
}));

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Add simple mouse parallax effect
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch {
            setError('Email atau password salah.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
            
            {/* ===================== BACKGROUND LAYER ===================== */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute inset-0 bg-accent-50 z-0"></div>
                
                {/* Parallax Blobs */}
                <div 
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-300/40 rounded-full blur-[100px] mix-blend-multiply transition-transform duration-1000 ease-out z-0"
                    style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
                ></div>
                <div 
                    className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-teal-200/50 rounded-full blur-[120px] mix-blend-multiply transition-transform duration-1000 ease-out z-0"
                    style={{ transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)` }}
                ></div>
                <div 
                    className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-cyan-200/40 rounded-full blur-[90px] mix-blend-multiply animate-pulse z-0"
                ></div>
                
                {/* SVG Mountain Silhouette (MAPALA Vibe) */}
                <div className="absolute bottom-0 left-0 w-full opacity-10 z-0">
                    <svg viewBox="0 0 1440 320" className="w-full h-auto drop-shadow-2xl">
                        <path fill="#065f46" fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-full opacity-20 z-0">
                    <svg viewBox="0 0 1440 320" className="w-full h-auto drop-shadow-xl">
                        <path fill="#0f766e" fillOpacity="1" d="M0,192L60,202.7C120,213,240,235,360,213.3C480,192,600,128,720,128C840,128,960,192,1080,213.3C1200,235,1320,213,1380,202.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(241,245,249,0.9)_100%)] z-0 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-size-[40px_40px] z-0"></div>
                
                {/* Floating "Sun Motes" / Particles */}
                <div className="absolute inset-0 overflow-hidden z-0">
                    {INITIAL_PARTICLES.map((style, i) => (
                        <div key={i} className="absolute rounded-full bg-emerald-400/30 animate-float" style={style}></div>
                    ))}
                </div>
            </div>

            {/* ===================== HEADER ===================== */}
            <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.1),0_10px_20px_-2px_rgba(0,0,0,0.04)] flex items-center justify-center p-2.5">
                        <img src={logoImg} alt="Logo STIMBARA" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <span className="text-slate-800 font-black text-2xl md:text-3xl tracking-widest block leading-none mb-1">STIMBARA</span>
                        <p className="text-emerald-600 text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase opacity-80">Inventory System</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-slate-600 text-[10px] font-bold tracking-wider uppercase">System Online</span>
                </div>
            </div>

            {/* ===================== MAIN CONTENT ===================== */}
            <div className="relative z-20 w-full max-w-325 mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 pt-28 pb-20 lg:py-0">
                
                {/* Left Side: Dynamic Typography */}
                <div className="flex-1 text-center lg:text-left max-w-xl lg:max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-500/20 backdrop-blur-md mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all cursor-default">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-700 text-xs font-bold tracking-widest uppercase">Portal Eksekutif MAPALA</span>
                    </div>
                    
                    <h1 className="text-slate-800 text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 drop-shadow-sm tracking-tight">
                        Sirkulasi alat <br className="hidden lg:block" /> 
                        <div className="relative inline-block mt-2">
                            <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">
                                tanpa batas.
                            </span>
                            <div className="absolute bottom-1 left-0 w-full h-4 bg-emerald-200/50 -rotate-1 z-0"></div>
                        </div>
                    </h1>
                    
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-medium">
                        Platform manajemen logistik modern yang dirancang khusus untuk mengotomatisasi peminjaman dan pelacakan alat alam bebas STIMBARA secara <span className="italic">real-time</span>.
                    </p>
                    
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6">
                        <div className="flex flex-col items-center lg:items-start group">
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-2 group-hover:-translate-y-1 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-slate-700 text-[10px] font-bold tracking-widest uppercase">Real-time</span>
                        </div>
                        <div className="flex flex-col items-center lg:items-start group">
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-2 group-hover:-translate-y-1 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-cyan-500"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-slate-700 text-[10px] font-bold tracking-widest uppercase">Akurat</span>
                        </div>
                        <div className="flex flex-col items-center lg:items-start group">
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-2 group-hover:-translate-y-1 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-teal-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                            </div>
                            <span className="text-slate-700 text-[10px] font-bold tracking-widest uppercase">Terintegrasi</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Animated Floating Glass Card */}
                <div className="w-full max-w-105 shrink-0 lg:animate-float-card">
                    <div className="relative group rounded-[2.5rem] bg-white/70 backdrop-blur-3xl border border-white border-t-white p-8 lg:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,1)] transition-all duration-500 hover:shadow-[0_40px_70px_-15px_rgba(16,185,129,0.15)] overflow-hidden">
                        
                        {/* Dynamic Card Internal Glow */}
                        <div className="absolute -top-12.5 -right-12.5 w-32 h-32 bg-linear-to-br from-emerald-100 to-transparent rounded-full blur-2xl opacity-60 pointer-events-none"></div>
                        <div className="absolute -bottom-12.5 -left-12.5 w-32 h-32 bg-linear-to-tr from-cyan-100 to-transparent rounded-full blur-2xl opacity-60 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="mb-10 text-center">
                                <h2 className="text-slate-800 text-3xl font-black mb-2 tracking-tight">Otentikasi</h2>
                                <p className="text-slate-500 text-xs font-semibold tracking-wide">Silakan masuk dengan kredensial Anda</p>
                            </div>

                            {error && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-xl mb-6 text-center shadow-sm animate-fadeIn flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="block text-slate-700 text-[10px] font-bold tracking-[0.2em] uppercase ml-1">
                                        Alamat Email
                                    </label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({...form, email: e.target.value})}
                                            placeholder="pengurus@stimbara.ac.id"
                                            className="w-full bg-white/80 border-2 border-white/60 text-slate-800 text-sm font-bold rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label className="block text-slate-700 text-[10px] font-bold tracking-[0.2em] uppercase ml-1">
                                        Kata Sandi
                                    </label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={(e) => setForm({...form, password: e.target.value})}
                                            placeholder="••••••••"
                                            className="w-full bg-white/80 border-2 border-white/60 text-slate-800 text-sm font-bold rounded-2xl pl-11 pr-12 py-4 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors bg-white p-1 rounded-md shadow-sm border border-slate-100"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-black tracking-wide uppercase rounded-2xl px-4 py-4 mt-6 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(16,185,129,0.6)] hover:-translate-y-1 group/btn"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[slide-in-right_0.8s_ease-out]"></div>
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memverifikasi...
                                        </>
                                    ) : (
                                        <>
                                            Akses Sistem
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Minimalist Footer */}
            <div className="absolute bottom-6 w-full text-center z-20 pointer-events-none">
                <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase bg-white/40 backdrop-blur-md py-1.5 px-4 rounded-full inline-block shadow-sm">
                    © 2026 STIMBARA MAPALA
                </p>
            </div>
        </div>
    );
}