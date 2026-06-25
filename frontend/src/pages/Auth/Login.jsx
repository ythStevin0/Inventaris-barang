import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div 
            className="min-h-screen relative flex flex-col bg-no-repeat bg-[#0a0a0a]"
            style={{ 
                // Background alam/hutan untuk tema MAPALA
                backgroundImage: `url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWY0dG43MjlxajNvbGE0YXgwZW13a2g5eWs1M2Fsam51MjRoNG1yNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l1J3tqlqSwfLAg5u8/giphy.gif')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Dark overlay yang lebih transparan agar background lebih terlihat */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

            {/* Header (Absolute Top) */}
            <div className="absolute top-0 left-0 w-full p-8 md:px-12 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-2xl tracking-widest drop-shadow-md">SIBOS</span>
                </div>
                <div className="text-gray-200 text-xs tracking-wider hidden md:block drop-shadow-md">
                    Inventory Management System
                </div>
            </div>

            {/* Main Content (Container) */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex-1 flex flex-col lg:flex-row justify-between pb-12 lg:pb-24 pt-24 lg:pt-32 gap-10 lg:gap-0">
                
                {/* Left Side: Typography (Ditaruh lebih ke bawah dengan self-end) */}
                <div className="flex-1 text-left max-w-xl flex flex-col justify-start lg:justify-end self-start lg:self-end mb-4 lg:mb-8 w-full mt-4 lg:mt-0">
                    <h1 className="text-white text-3xl md:text-4xl xl:text-5xl font-semibold leading-tight mb-3 lg:mb-4 drop-shadow-lg tracking-tight">
                        Kelola inventaris <br className="hidden md:block" /> dengan cerdas.
                    </h1>
                    <p className="text-gray-200 text-sm md:text-base mb-4 lg:mb-5 drop-shadow-md max-w-md">
                        Platform inventaris barang organisasi — <br className="hidden md:block" />
                        dirancang untuk efisiensi dan kemudahan pengurus.
                    </p>
                    <div className="text-yellow-400 font-medium tracking-wider text-[10px] md:text-xs drop-shadow-md flex flex-wrap items-center">
                        <span className="text-yellow-400 mr-2">•</span> 
                        Pendataan <span className="mx-2 text-white/50">·</span> 
                        Peminjaman <span className="mx-2 text-white/50">·</span> 
                        Laporan <span className="mx-2 text-white/50">·</span> 
                        Otomatis
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="w-full lg:w-auto flex flex-col justify-center lg:justify-end lg:mb-4">
                    <div className="w-full max-w-[360px] md:max-w-[400px] lg:w-[400px] bg-black/30 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl mx-auto lg:mx-0">
                        <div className="mb-6">
                            <h3 className="text-yellow-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5">
                                Selamat Datang
                            </h3>
                            <h2 className="text-white text-2xl font-semibold mb-1 tracking-tight">
                                Masuk ke Akun
                            </h2>
                            <p className="text-gray-400 text-xs">
                                Masukkan kredensial Anda untuk melanjutkan
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-2.5 rounded-md mb-5 text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label className="block text-gray-400 text-[10px] tracking-widest mb-1.5 uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({...form, email: e.target.value})}
                                    placeholder="admin@sibos.id"
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder-gray-400"
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-gray-400 text-[10px] tracking-widest mb-1.5 uppercase">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(e) => setForm({...form, password: e.target.value})}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg pl-3.5 pr-10 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder-gray-400"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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
                                className="w-full bg-[#f5a623] hover:bg-[#e0961b] text-black text-sm font-semibold rounded-lg px-4 py-2.5 mt-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(245,166,35,0.2)]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        Masuk
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-5 border-t border-white/10">
                            <p className="text-center text-[#52525b] text-[10px]">
                                © 2026 SIBOS & Inventaris MAPALA. <br className="md:hidden" /> All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}