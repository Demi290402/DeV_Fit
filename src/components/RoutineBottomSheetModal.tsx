import React, { useEffect } from 'react';
import { Share2, Copy, Edit3, Trash2 } from 'lucide-react';
import type { Routine } from '../context/AppContext';

interface RoutineBottomSheetModalProps {
  routine: Routine | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (routine: Routine) => void;
  onDuplicate: (routine: Routine) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (routine: Routine) => void;
}

export const RoutineBottomSheetModal: React.FC<RoutineBottomSheetModalProps> = ({
  routine,
  isOpen,
  onClose,
  onShare,
  onDuplicate,
  onEdit,
  onDelete
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !routine) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="hevy-bottom-sheet"
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#121216',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderTopLeftRadius: '22px',
          borderTopRightRadius: '22px',
          padding: '12px 18px 28px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.85)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 10px 0' }}>
          <div
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '99px',
              background: 'rgba(255, 255, 255, 0.25)'
            }}
          />
        </div>

        {/* Routine Title */}
        <div style={{ textAlign: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {routine.name}
          </h3>
        </div>

        {/* Action Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Condividi Routine */}
          <button
            type="button"
            className="bottom-sheet-btn"
            onClick={() => {
              onClose();
              onShare(routine);
            }}
          >
            <Share2 size={19} color="#ffffff" />
            <span>Condividi Routine</span>
          </button>

          {/* Duplica la routine */}
          <button
            type="button"
            className="bottom-sheet-btn"
            onClick={() => {
              onClose();
              onDuplicate(routine);
            }}
          >
            <Copy size={19} color="#ffffff" />
            <span>Duplica la routine</span>
          </button>

          {/* Modifica la routine */}
          <button
            type="button"
            className="bottom-sheet-btn"
            onClick={() => {
              onClose();
              onEdit(routine);
            }}
          >
            <Edit3 size={19} color="#ffffff" />
            <span>Modifica la routine</span>
          </button>

          {/* Elimina la routine */}
          <button
            type="button"
            className="bottom-sheet-btn delete"
            onClick={() => {
              onClose();
              onDelete(routine);
            }}
          >
            <Trash2 size={19} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>Elimina la routine</span>
          </button>
        </div>
      </div>
    </div>
  );
};
