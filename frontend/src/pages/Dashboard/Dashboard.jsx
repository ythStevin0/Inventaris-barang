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
        <div style={styles.page}>
            <div style={styles.card}>
                <p style={styles.eyebrow}>Dashboard</p>
                <h1 style={styles.title}>Inventaris Barang</h1>
                <p style={styles.text}>
                    Selamat datang, <strong>{user?.name}</strong>
                    {user?.role ? ` (${user.role})` : ''}!
                </p>

                <div style={styles.actions}>
                    <Link to="/items" style={styles.primaryLink}>
                        Kelola Barang
                    </Link>
                    <button onClick={handleLogout} style={styles.secondaryButton}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: 'linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%)',
        boxSizing: 'border-box',
    },
    card: {
        width: 'min(100%, 640px)',
        background: '#fff',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.1)',
        textAlign: 'left',
    },
    eyebrow: {
        margin: '0 0 8px',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#2563eb',
        fontWeight: 700,
        fontSize: '0.82rem',
    },
    title: {
        margin: '0 0 12px',
        color: '#0f172a',
        fontSize: '2rem',
    },
    text: {
        margin: '0 0 24px',
        color: '#475569',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    primaryLink: {
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 18px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #2563eb 0%, #0f766e 100%)',
        color: '#fff',
        fontWeight: 700,
    },
    secondaryButton: {
        border: '1px solid #cbd5e1',
        borderRadius: '14px',
        background: '#fff',
        color: '#0f172a',
        padding: '12px 18px',
        cursor: 'pointer',
        fontWeight: 600,
    },
};
