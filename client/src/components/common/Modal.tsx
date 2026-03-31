import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(29, 28, 13, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '0',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '20px 20px 0 0',
          padding: 'var(--space-xl) var(--space-lg)',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(84, 67, 60, 0.15)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1.4rem',
            color: 'var(--color-secondary)',
            margin: '0 0 var(--space-lg)',
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
