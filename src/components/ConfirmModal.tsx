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
      // Animate in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const buttonColors = {
    danger: 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]',
    warning: 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]',
    info: 'bg-gradient-to-r from-[#a855f7] to-[#ec4899]',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-[#1a1f35] to-[#252b45] rounded-2xl border-2 border-white/10 shadow-2xl p-6 max-w-md w-[90%] mx-auto"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/70 text-sm">{message}</p>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-semibold bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-semibold text-white border-none shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

