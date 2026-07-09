import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function SlideOver({ isOpen, onClose, title, children, width = 'max-w-md' }) {
  const [render, setRender] = useState(isOpen);
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delaying setState to next tick to avoid cascading render lint errors
      setTimeout(() => {
        setRender(true);
        // Let React render the component first, then trigger animation
        requestAnimationFrame(() => requestAnimationFrame(() => setIsShowing(true)));
      }, 0);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsShowing(false), 0);
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => setRender(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!render) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-[#11224E]/50 transition-opacity duration-300 backdrop-blur-sm ${isShowing ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        {/* Slide-over panel */}
        <div className={`w-screen ${width} transform transition-transform ease-in-out duration-300 ${isShowing ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-[40px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-[#11224E]" id="slide-over-title">
                {title}
              </h2>
              <button
                type="button"
                className="rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="relative flex-1 px-6 py-6 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
