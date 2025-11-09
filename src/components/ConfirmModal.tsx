'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info',
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power4.out' }
      );
    } else {
      // No need for hiding animation as it's unmounted
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancel = () => {
    gsap.to(modalRef.current, { scale: 0.9, opacity: 0, y: 50, duration: 0.3, ease: 'power4.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: onCancel });
  };
  
  const handleConfirm = () => {
    gsap.to(modalRef.current, { scale: 0.9, opacity: 0, y: 50, duration: 0.3, ease: 'power4.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: onConfirm });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const buttonColors = {
    danger: 'from-red-500 to-orange-600 shadow-red-500/40',
    warning: 'from-yellow-500 to-orange-500 shadow-yellow-500/40',
    info: 'from-cyan-500 to-blue-500 shadow-cyan-500/40',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md opacity-0"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-[#1a1c2c] via-[#131523] to-[#0f101c] rounded-2xl border-2 border-white/10 shadow-2xl p-6 max-w-lg w-[90%] mx-auto animated-border"
      >
        <div className="mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent mb-2">{title}</h3>
          <p className="text-white/70 text-base">{message}</p>
        </div>
        
        <div className="flex gap-4 justify-end mt-8">
          <button
            onClick={handleCancel}
            className="btn-glow px-6 py-3 rounded-xl font-semibold bg-black/30 text-white/80 border border-white/20 hover:bg-black/40 hover:text-white transition-all duration-300"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn-glow px-6 py-3 rounded-xl font-semibold text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}