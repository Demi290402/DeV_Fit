import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeableSetRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  canDelete?: boolean;
  className?: string;
  isCompleted?: boolean;
}

export const SwipeableSetRow: React.FC<SwipeableSetRowProps> = ({
  children,
  onDelete,
  canDelete = true,
  className = '',
  isCompleted = false
}) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentOffset = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canDelete) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentOffset.current = offset;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !canDelete) return;
    const diffX = e.touches[0].clientX - startX.current;
    const diffY = e.touches[0].clientY - startY.current;

    // Determine direction on first significant movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (!isHorizontalSwipe.current) return;

    let target = currentOffset.current + diffX;
    // Bound swipe: don't allow swiping right past 0, allow left swipe up to -120px
    if (target > 0) target = 0;
    if (target < -120) target = -120;

    setOffset(target);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !canDelete) return;
    setIsDragging(false);

    // If swiped far left (> 90px), trigger delete directly with haptic
    if (offset < -90) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      setOffset(0);
      onDelete();
    } else if (offset < -35) {
      // Snap open to reveal delete button
      setOffset(-68);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
    } else {
      // Snap closed
      setOffset(0);
    }
  };

  // Close swipe when clicking outside or tapping row when open
  const handleRowClick = () => {
    if (offset < 0) {
      setOffset(0);
    }
  };

  return (
    <tr
      className={`set-row ${isCompleted ? 'completed' : ''} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleRowClick}
      style={{
        transform: `translateX(${offset}px)`,
        transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}
    >
      {children}

      {/* Swipe Reveal Red Delete Button */}
      {canDelete && (
        <td
          style={{
            position: 'absolute',
            right: '-68px',
            top: 0,
            bottom: 0,
            width: '68px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOffset(0);
              onDelete();
            }}
            style={{
              width: '100%',
              height: 'calc(100% - 4px)',
              margin: '2px 0',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
            }}
            title="Elimina serie"
          >
            <Trash2 size={16} />
            <span style={{ fontSize: '0.62rem', fontWeight: 800, marginTop: '2px', textTransform: 'uppercase' }}>
              Elimina
            </span>
          </button>
        </td>
      )}
    </tr>
  );
};
