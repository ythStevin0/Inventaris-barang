import { useEffect } from 'react';

export default function ImageModal({ isOpen, onClose, imageUrl, altText }) {
  // Mencegah scroll pada body saat modal terbuka & menambahkan listener tombol Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-transparent p-4 transition-opacity"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white hover:text-slate-200 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
        onClick={onClose}
        title="Tutup Preview"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img 
        src={imageUrl} 
        alt={altText || 'Preview Image'} 
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl transform transition-transform"
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  );
}
