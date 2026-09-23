import React from 'react';
import type { MuscleGroup } from '../data/mockExercises';

interface AnatomicalIconProps {
  muscle: MuscleGroup | 'All';
  size?: number;
  highlightColor?: string;
  className?: string;
}

export const AnatomicalIcon: React.FC<AnatomicalIconProps> = ({
  muscle,
  size = 40,
  highlightColor = '#d4af37', // Signature DeV Fit Luxury Gold
  className
}) => {
  // Determine if muscle is back-facing or front-facing
  const isBack = [
    'Dorsali',
    'Trapezi',
    'Lombari',
    'Tricipiti',
    'Glutei',
    'Femorali',
    'Polpacci'
  ].includes(muscle);

  const baseColor = '#2b2c37'; // High-contrast sleek dark slate body silhouette
  const activeColor = highlightColor;

  const isTarget = (m: string) => {
    if (muscle === 'All') return false;
    if (muscle === m) return true;
    if (muscle === 'Pettorali' && m === 'Petto') return true;
    if (muscle === 'Dorsali' && (m === 'Dorsali' || m === 'Schiena')) return true;
    if (muscle === 'Spalle' && m === 'Spalle') return true;
    if (muscle === 'Addominali' && m === 'Addominali') return true;
    return false;
  };

  if (muscle === 'Cardio') {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          background: '#14141c', 
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
        }}
        className={className}
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke={highlightColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        background: '#14141c', 
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
        flexShrink: 0
      }}
      className={className}
    >
      <svg 
        viewBox="0 0 100 100" 
        width={size * 0.88} 
        height={size * 0.88} 
        style={{ display: 'block' }}
      >
        {isBack ? (
          // ================= BACK VIEW =================
          <g>
            {/* Head */}
            <ellipse cx="50" cy="14" rx="7" ry="8" fill={isTarget('Collo') ? activeColor : baseColor} />
            {/* Neck */}
            <path d="M46 21 H54 V26 H46 Z" fill={isTarget('Collo') ? activeColor : baseColor} />

            {/* Traps (Upper Back Diamond) */}
            <path 
              d="M45 22 L55 22 L62 28 L50 38 L38 28 Z" 
              fill={isTarget('Trapezi') ? activeColor : baseColor} 
            />

            {/* Rear Deltoids */}
            <path d="M33 26 C28 27 25 32 26 36 C29 36 33 34 35 29 Z" fill={isTarget('Spalle') ? activeColor : baseColor} />
            <path d="M67 26 C72 27 75 32 74 36 C71 36 67 34 65 29 Z" fill={isTarget('Spalle') ? activeColor : baseColor} />

            {/* Triceps */}
            <path d="M25 35 C23 40 23 46 25 51 C27 51 29 46 29 37 Z" fill={isTarget('Tricipiti') ? activeColor : baseColor} />
            <path d="M75 35 C77 40 77 46 75 51 C73 51 71 46 71 37 Z" fill={isTarget('Tricipiti') ? activeColor : baseColor} />

            {/* Forearms back */}
            <path d="M24 52 C21 57 19 64 21 68 C23 68 26 63 26 53 Z" fill={isTarget('Avambracci') ? activeColor : baseColor} />
            <path d="M76 52 C79 57 81 64 79 68 C77 68 74 63 74 53 Z" fill={isTarget('Avambracci') ? activeColor : baseColor} />

            {/* Lats (Dorsali V-Shape) */}
            <path 
              d="M37 29 C40 33 41 44 45 49 C46 44 47 38 49 35 C43 32 39 30 37 29 Z" 
              fill={isTarget('Dorsali') ? activeColor : baseColor} 
            />
            <path 
              d="M63 29 C60 33 59 44 55 49 C54 44 53 38 51 35 C57 32 61 30 63 29 Z" 
              fill={isTarget('Dorsali') ? activeColor : baseColor} 
            />

            {/* Lower Back (Lombari) */}
            <path 
              d="M45 47 H55 V55 H45 Z" 
              fill={isTarget('Lombari') ? activeColor : baseColor} 
            />

            {/* Gluteus Maximus (Glutei) */}
            <path 
              d="M37 56 C37 54 48 54 49 56 C50 63 47 68 39 67 C36 65 36 60 37 56 Z" 
              fill={isTarget('Glutei') ? activeColor : baseColor} 
            />
            <path 
              d="M63 56 C63 54 52 54 51 56 C50 63 53 68 61 67 C64 65 64 60 63 56 Z" 
              fill={isTarget('Glutei') ? activeColor : baseColor} 
            />

            {/* Hamstrings (Femorali) */}
            <path 
              d="M38 68 C45 68 47 70 46 81 C41 81 38 78 38 68 Z" 
              fill={isTarget('Femorali') ? activeColor : baseColor} 
            />
            <path 
              d="M62 68 C55 68 53 70 54 81 C59 81 62 78 62 68 Z" 
              fill={isTarget('Femorali') ? activeColor : baseColor} 
            />

            {/* Calves (Polpacci) */}
            <path 
              d="M39 82 C44 83 45 88 44 94 C41 94 40 90 39 82 Z" 
              fill={isTarget('Polpacci') ? activeColor : baseColor} 
            />
            <path 
              d="M61 82 C56 83 55 88 56 94 C59 94 60 90 61 82 Z" 
              fill={isTarget('Polpacci') ? activeColor : baseColor} 
            />
          </g>
        ) : (
          // ================= FRONT VIEW =================
          <g>
            {/* Head */}
            <ellipse cx="50" cy="14" rx="7" ry="8" fill={isTarget('Collo') ? activeColor : baseColor} />
            {/* Neck */}
            <path d="M46 21 H54 V25 H46 Z" fill={isTarget('Collo') ? activeColor : baseColor} />

            {/* Front Deltoids (Spalle) */}
            <path d="M33 25 C27 26 24 31 25 35 C28 35 32 33 34 28 Z" fill={isTarget('Spalle') ? activeColor : baseColor} />
            <path d="M67 25 C73 26 76 31 75 35 C72 35 68 33 66 28 Z" fill={isTarget('Spalle') ? activeColor : baseColor} />

            {/* Pectorals (Pettorali) */}
            <path 
              d="M36 26 C43 25 48 26 49 32 C49 37 41 37 36 33 C34 30 34 27 36 26 Z" 
              fill={isTarget('Pettorali') ? activeColor : baseColor} 
            />
            <path 
              d="M64 26 C57 25 52 26 51 32 C51 37 59 37 64 33 C66 30 66 27 64 26 Z" 
              fill={isTarget('Pettorali') ? activeColor : baseColor} 
            />

            {/* Biceps */}
            <path d="M25 34 C23 38 23 44 26 48 C28 48 29 43 29 36 Z" fill={isTarget('Bicipiti') ? activeColor : baseColor} />
            <path d="M75 34 C77 38 77 44 74 48 C72 48 71 43 71 36 Z" fill={isTarget('Bicipiti') ? activeColor : baseColor} />

            {/* Forearms front */}
            <path d="M24 49 C21 54 19 61 21 66 C24 66 26 61 26 50 Z" fill={isTarget('Avambracci') ? activeColor : baseColor} />
            <path d="M76 49 C79 54 81 61 79 66 C76 66 74 61 74 50 Z" fill={isTarget('Avambracci') ? activeColor : baseColor} />

            {/* Abdominals (Addominali 6-pack) */}
            <g fill={isTarget('Addominali') ? activeColor : baseColor}>
              {/* Upper abs */}
              <rect x="44" y="34" width="5" height="4" rx="1" />
              <rect x="51" y="34" width="5" height="4" rx="1" />
              {/* Mid abs */}
              <rect x="44" y="39" width="5" height="4" rx="1" />
              <rect x="51" y="39" width="5" height="4" rx="1" />
              {/* Lower abs */}
              <rect x="44" y="44" width="5" height="4.5" rx="1" />
              <rect x="51" y="44" width="5" height="4.5" rx="1" />
              {/* Obliques */}
              <path d="M39 37 C41 44 42 49 43 51 C41 51 39 46 38 39 Z" />
              <path d="M61 37 C59 44 58 49 57 51 C59 51 61 46 62 39 Z" />
            </g>

            {/* Pelvis / Hips */}
            <path d="M43 51 H57 L54 57 H46 Z" fill={baseColor} />

            {/* Quadriceps (Quadricipiti) */}
            <path 
              d="M37 57 C44 57 47 60 46 76 C41 76 37 71 37 57 Z" 
              fill={isTarget('Quadricipiti') ? activeColor : baseColor} 
            />
            <path 
              d="M63 57 C56 57 53 60 54 76 C59 76 63 71 63 57 Z" 
              fill={isTarget('Quadricipiti') ? activeColor : baseColor} 
            />

            {/* Adductors (Adduttori - Inner Thighs) */}
            <path d="M45 59 C47 65 47 70 46 73 C44 68 44 62 45 59 Z" fill={isTarget('Adduttori') ? activeColor : baseColor} />
            <path d="M55 59 C53 65 53 70 54 73 C56 68 56 62 55 59 Z" fill={isTarget('Adduttori') ? activeColor : baseColor} />

            {/* Calves / Shins (Polpacci) */}
            <path 
              d="M39 78 C44 79 45 85 43 94 C40 94 39 88 39 78 Z" 
              fill={isTarget('Polpacci') ? activeColor : baseColor} 
            />
            <path 
              d="M61 78 C56 79 55 85 57 94 C60 94 61 88 61 78 Z" 
              fill={isTarget('Polpacci') ? activeColor : baseColor} 
            />
          </g>
        )}
      </svg>
    </div>
  );
};
