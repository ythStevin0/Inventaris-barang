import useAuthStore from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Dashboard() {
    const { user, logout, getMe } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        getMe();
    }, [getMe]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen px-5 py-8">
            <div className="mx-auto w-full max-w-3xl rounded-[28px] border border-white/60 bg-white/85 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-700">Dashboard</p>
                <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">Inventaris Barang</h1>
                <p className="mb-6 text-slate-600">
                    Selamat datang, <strong>{user?.name}</strong>
                    {user?.role ? ` (${user.role})` : ''}!
                </p>

                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/items"
                        className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-sky-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                        Kelola Barang
                    </Link>
                    <Link
                        to="/categories"
                        className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                    >
                        Kelola Kategori
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
