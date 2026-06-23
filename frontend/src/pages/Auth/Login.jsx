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
            className="min-h-screen relative flex flex-col justify-center bg-cover bg-center bg-no-repeat"
            style={{ 
                // Menggunakan GIF perkotaan modern sebagai placeholder.
                // Anda bisa menggantinya dengan '/background.gif' jika punya file sendiri di folder public.
                backgroundImage: `url('https://media1.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif')` 
            }}
        >
            {/* Dark overlay untuk membuat teks lebih terbaca */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

            {/* Header (Absolute Top) */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 text-black font-bold text-xl w-10 h-10 flex items-center justify-center rounded">
                        SB
                    </div>
                    <span className="text-white font-semibold text-xl tracking-wide">SIBOS</span>
                </div>
                <div className="text-gray-300 text-sm hidden md:block">
                    Inventory Management System
                </div>
            </div>

            {/* Main Content (Container) */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col lg:flex-row justify-between items-center gap-12 mt-16 lg:mt-0">
                
                {/* Left Side: Typography */}
                <div className="flex-1 text-left max-w-2xl hidden lg:block">
                    <h1 className="text-white text-5xl xl:text-6xl font-bold leading-tight mb-6">
                        Kelola inventaris <br/> dengan cerdas.
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl mb-6">
                        Platform inventaris barang organisasi — <br/>
                        dirancang untuk efisiensi dan kemudahan pengurus.
                    </p>
                    <div className="text-yellow-500 font-medium tracking-wide">
                        <span className="mr-2">•</span> 
                        Pendataan <span className="mx-2">·</span> 
                        Peminjaman <span className="mx-2">·</span> 
                        Laporan <span className="mx-2">·</span> 
                        Otomatis
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="w-full max-w-md">
                    <div className="bg-[#18181b]/95 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="mb-8">
                            <h3 className="text-yellow-500 text-xs font-bold tracking-[0.2em] uppercase mb-2">
                                Selamat Datang
                            </h3>
                            <h2 className="text-white text-3xl font-semibold mb-2">
                                Masuk ke Akun
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Masukkan kredensial Anda untuk melanjutkan
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label className="block text-gray-400 text-xs tracking-wider mb-2 uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({...form, email: e.target.value})}
                                    placeholder="admin@sibos.id"
                                    className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-4 py-3.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder-gray-500"
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-gray-400 text-xs tracking-wider mb-2 uppercase">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(e) => setForm({...form, password: e.target.value})}
                                        placeholder="••••••••"
                                        className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg pl-4 pr-12 py-3.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder-gray-500"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
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
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg px-4 py-3.5 mt-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Memproses...' : 'Masuk'}
                                {!loading && (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-[#3f3f46]">
                            <p className="text-center text-[#71717a] text-xs">
                                © 2026 SIBOS & Inventaris. All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}