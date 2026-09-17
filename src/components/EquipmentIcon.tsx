import React from 'react';
import type { EquipmentType } from '../data/mockExercises';

interface EquipmentIconProps {
  equipment: EquipmentType | 'All';
  size?: number;
  color?: string;
  className?: string;
}

export const EquipmentIcon: React.FC<EquipmentIconProps> = ({
  equipment,
  size = 32,
  color = '#ffffff',
  className
}) => {
  switch (equipment) {
    case 'Bilanciere':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill={color} className={className}>
          {/* Bar */}
          <rect x="2" y="22" width="44" height="4" rx="2" fill={color} />
          {/* Inner Collars */}
          <rect x="12" y="18" width="2" height="12" rx="1" fill={color} opacity="0.8" />
          <rect x="34" y="18" width="2" height="12" rx="1" fill={color} opacity="0.8" />
          {/* Big Plates */}
          <rect x="8" y="12" width="4" height="24" rx="2" fill={color} />
          <rect x="36" y="12" width="4" height="24" rx="2" fill={color} />
          {/* Small Plates */}
          <rect x="5" y="15" width="3" height="18" rx="1.5" fill={color} opacity="0.9" />
          <rect x="40" y="15" width="3" height="18" rx="1.5" fill={color} opacity="0.9" />
        </svg>
      );

    case 'Manubri':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill={color} className={className}>
          {/* Handle */}
          <rect x="18" y="21" width="12" height="6" rx="2" fill={color} />
          {/* Knurling */}
          <line x1="22" y1="21" x2="22" y2="27" stroke="#121215" strokeWidth="1" />
          <line x1="26" y1="21" x2="26" y2="27" stroke="#121215" strokeWidth="1" />
          {/* Left Hex Head */}
          <rect x="9" y="12" width="9" height="24" rx="4" fill={color} />
          <rect x="6" y="15" width="3" height="18" rx="1.5" fill={color} opacity="0.8" />
          {/* Right Hex Head */}
          <rect x="30" y="12" width="9" height="24" rx="4" fill={color} />
          <rect x="39" y="15" width="3" height="18" rx="1.5" fill={color} opacity="0.8" />
        </svg>
      );

    case 'Kettlebell':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" className={className}>
          {/* Handle */}
          <path d="M17 21 C17 11 31 11 31 21" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
          {/* Bell body */}
          <circle cx="24" cy="28" r="14" fill={color} />
          {/* Base flattening */}
          <rect x="18" y="39" width="12" height="3" rx="1.5" fill={color} />
          {/* Inner cutout hole */}
          <path d="M19 21 C19 15 29 15 29 21 Z" fill="#121215" />
        </svg>
      );

    case 'Disco':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" className={className}>
          {/* Outer ring */}
          <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="3" />
          {/* Plate face */}
          <circle cx="24" cy="24" r="17" fill={color} opacity="0.15" />
          {/* Inner rim */}
          <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="1.5" opacity="0.5" />
          {/* Center Olympic hole */}
          <circle cx="24" cy="24" r="5" fill={color} />
        </svg>
      );

    case 'Macchina':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          {/* Gym machine frame */}
          <path d="M10 42 V10 H30 V42" />
          <path d="M10 42 H38" />
          <path d="M22 10 V22 L34 28" />
          <circle cx="34" cy="28" r="2" fill={color} />
          {/* Weight stack plates */}
          <rect x="14" y="24" width="6" height="3" rx="1" fill={color} stroke="none" />
          <rect x="14" y="29" width="6" height="3" rx="1" fill={color} stroke="none" />
          <rect x="14" y="34" width="6" height="3" rx="1" fill={color} stroke="none" />
        </svg>
      );

    case 'Cavi':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          {/* Cable Pulley */}
          <circle cx="24" cy="14" r="6" strokeWidth="2" />
          <path d="M14 42 V14 H34 V42" />
          <line x1="24" y1="20" x2="24" y2="30" strokeWidth="2" />
          {/* Cable Stirrup Handle */}
          <path d="M19 32 H29 L26 38 H22 Z" fill={color} stroke="none" />
        </svg>
      );

    case 'Fascia di resistenza':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" className={className}>
          {/* Elastic loop band folded */}
          <rect x="10" y="14" width="28" height="20" rx="10" strokeWidth="4" />
          <line x1="14" y1="24" x2="34" y2="24" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        </svg>
      );

    case 'Fasce di sospensione':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" className={className}>
          {/* TRX top anchor */}
          <circle cx="24" cy="8" r="3" fill={color} />
          {/* Straps branching down */}
          <path d="M24 11 L16 32" />
          <path d="M24 11 L32 32" />
          {/* Triangle handles */}
          <path d="M12 34 H20 L16 40 Z" fill={color} stroke="none" />
          <path d="M28 34 H36 L32 40 Z" fill={color} stroke="none" />
        </svg>
      );

    case 'Niente':
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill={color} className={className}>
          {/* Bodyweight Silhouette */}
          <circle cx="24" cy="10" r="4.5" />
          <path d="M19 16 C19 16 29 16 29 16 C31 16 33 18 33 21 L32 29 H30 L29 42 H26 L25 32 H23 L22 42 H19 L18 29 H16 C16 18 17 16 19 16 Z" />
        </svg>
      );

    default: // Altro / All
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill={color} className={className}>
          <circle cx="14" cy="24" r="3.5" />
          <circle cx="24" cy="24" r="3.5" />
          <circle cx="34" cy="24" r="3.5" />
        </svg>
      );
  }
};
