import { useState, useRef, useEffect } from 'react';
import { getDashboardStats } from '../../services/dashboardService';
import { getBorrowings } from '../../services/borrowingsService';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/Layout/Navbar';
import HeaderActions from '../../components/ui/HeaderActions';
import bgTexture from '../../assets/download (4).jpg';
export default function ProfilePage() {
    const { user, updateProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Form States
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    // Avatar States
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
    const fileInputRef = useRef(null);

    // User Borrowing History State
    const [userBorrowings, setUserBorrowings] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                await getDashboardStats();
                
                try {
                    const borrowingsData = await getBorrowings();
                    if (borrowingsData && borrowingsData.data) {
                        const allBorrowings = borrowingsData.data;
                        setUserBorrowings(allBorrowings.filter(b => b.user_id === user?.id || b.user?.email === user?.email));
                    }
                } catch {
                    // Ignore errors
                }
            } catch {
                console.error("Gagal memuat data:");
            }
        };
        loadData();
    }, [user?.email, user?.id]);

    // Calculate User Statistics
    const totalBorrowings = userBorrowings.length;
    const activeBorrowings = userBorrowings.filter(b => b.status === 'borrowed' || b.status === 'approved').length;
    const returnedBorrowings = userBorrowings.filter(b => b.status === 'returned').length;
    const rejectedBorrowings = userBorrowings.filter(b => b.status === 'rejected').length;

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        if (password && password !== passwordConfirmation) {
            return setMessage({ type: 'error', text: 'Kata sandi baru dan konfirmasi tidak cocok' });
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            
            if (password) {
                formData.append('password', password);
                formData.append('password_confirmation', passwordConfirmation);
            }
            
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await updateProfile(formData);
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            setPassword('');
            setPasswordConfirmation('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui profil' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#FDFBF7] pb-20">
            {/* TOP GREEN SECTION */}
            <div className="bg-[#0F4C3A] rounded-b-[40px] pb-32 relative shadow-lg">
                {/* Background Image Overlay */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-60 rounded-b-[40px] overflow-hidden"
                    style={{
                        backgroundImage: `url(${bgTexture})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>
                <Navbar />
                
                <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Profil Saya</h1>
                        <p className="text-white/70 mt-2">Kelola informasi pribadi dan keamanan akun Anda.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <HeaderActions />
                    </div>
                </div>
            </div>
            
            {/* MAIN CONTENT OVERLAPPING TOP SECTION */}
            <div className="max-w-3xl mx-auto px-6 lg:px-10 -mt-20 relative z-20 w-full">
                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 shadow-sm ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                        {message.type === 'error' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                        )}
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
                    <form onSubmit={handleSave} className="space-y-8">
                        
                        {/* Avatar Section */}
                        <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-gray-100">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#0F4C3A] text-white flex items-center justify-center text-3xl font-bold uppercase">
                                            {name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleAvatarChange} 
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">Foto Profil</h3>
                                <p className="text-gray-500 text-sm mt-1">Format gambar: JPG, PNG. Ukuran maksimal 2MB.</p>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 text-sm font-medium text-[#0F4C3A] hover:text-[#0a3628] transition-colors">
                                    Ganti Foto
                                </button>
                            </div>
                        </div>

                        {/* Personal Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 text-lg mb-6">Ubah Kata Sandi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kata Sandi Baru</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Biarkan kosong jika tidak ingin diubah"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Kata Sandi Baru</label>
                                    <input 
                                        type="password" 
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="Ulangi kata sandi baru"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F4C3A] focus:ring-1 focus:ring-[#0F4C3A] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="bg-[#0F4C3A] hover:bg-[#0a3628] text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* STATISTIK & RIWAYAT PEMINJAMAN SAYA (Hanya untuk Anggota) */}
                {user?.role === 'anggota' && (
                    <div className="max-w-3xl mx-auto px-6 lg:px-10 mt-8 mb-12">
                        <h2 className="text-xl font-bold text-[#11224E] mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                        Statistik & Riwayat Peminjaman
                    </h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Pinjam</span>
                            <span className="text-2xl font-bold text-[#11224E]">{totalBorrowings}</span>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
                            <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">Aktif</span>
                            <span className="text-2xl font-bold text-emerald-700">{activeBorrowings}</span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center">
                            <span className="text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">Dikembalikan</span>
                            <span className="text-2xl font-bold text-blue-700">{returnedBorrowings}</span>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
                            <span className="text-red-700 text-xs font-semibold uppercase tracking-wider mb-1">Ditolak</span>
                            <span className="text-2xl font-bold text-red-700">{rejectedBorrowings}</span>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-800 text-sm">Aktivitas Terkini</h3>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-90 overflow-y-auto custom-scrollbar">
                            {userBorrowings.length > 0 ? (
                                userBorrowings.map((borrowing) => (
                                    <div key={borrowing.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">
                                                {borrowing.item?.name || 'Barang Dihapus'}
                                                {borrowing.borrowingItems && borrowing.borrowingItems.length > 0 && ` (+${borrowing.borrowingItems.length - 1} lainnya)`}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                Dipinjam: {new Date(borrowing.borrow_date || borrowing.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                borrowing.status === 'returned' ? 'bg-blue-100 text-blue-700' :
                                                borrowing.status === 'borrowed' ? 'bg-orange-100 text-orange-700' :
                                                borrowing.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                borrowing.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {borrowing.status === 'returned' ? 'Dikembalikan' :
                                                 borrowing.status === 'borrowed' ? 'Dipinjam' :
                                                 borrowing.status === 'approved' ? 'Disetujui' :
                                                 borrowing.status === 'rejected' ? 'Ditolak' :
                                                 borrowing.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-12 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    </div>
                                    <p className="text-gray-500 font-medium text-sm">Belum ada riwayat peminjaman.</p>
                                    <p className="text-gray-400 text-xs mt-1">Peminjaman yang Anda lakukan akan muncul di sini.</p>
                                </div>
                            )}
                        </div>
                        {userBorrowings.length > 10 && (
                            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 text-center">
                                <span className="text-xs font-medium text-gray-500">Menampilkan 10 riwayat terbaru.</span>
                            </div>
                        )}
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
