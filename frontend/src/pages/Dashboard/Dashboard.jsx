import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
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
        <div style={{ padding: '2rem' }}>
            <h1>Dashboard Inventaris</h1>
            <p>Selamat datang, <strong>{user?.name}</strong>!</p>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Logout
            </button>
        </div>
    );
}