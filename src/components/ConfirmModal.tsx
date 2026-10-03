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
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.25 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.93, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power4.out' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancel = () => {
    gsap.to(modalRef.current, { scale: 0.93, opacity: 0, y: 30, duration: 0.25, ease: 'power4.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onCancel });
  };
  
  const handleConfirm = () => {
    gsap.to(modalRef.current, { scale: 0.93, opacity: 0, y: 30, duration: 0.25, ease: 'power4.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onConfirm });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const confirmColors = {
    danger: { bg: 'linear-gradient(135deg, #e8826e, #d45c44)', shadow: 'rgba(212,92,68,0.3)' },
    warning: { bg: 'linear-gradient(135deg, #f6b96b, #f0934a)', shadow: 'rgba(240,147,74,0.3)' },
    info: { bg: 'linear-gradient(135deg, #6bb8f5, #4a8ad4)', shadow: 'rgba(74,138,212,0.3)' },
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center opacity-0"
      style={{ background: 'rgba(61, 43, 26, 0.4)', backdropFilter: 'blur(6px)' }}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="rounded-2xl p-6 max-w-md w-[90%] mx-auto"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(180,100,60,0.15)',
        }}
      >
        <div className="mb-5">
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200"
            style={{ background: confirmColors[type].bg, boxShadow: `0 3px 12px ${confirmColors[type].shadow}` }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}