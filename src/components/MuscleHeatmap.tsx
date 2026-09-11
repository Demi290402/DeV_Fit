import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockExercises } from '../data/mockExercises';
import type { MuscleGroup } from '../data/mockExercises';

interface MuscleState {
  group: MuscleGroup;
  lastTrainedHoursAgo: number | null;
  volume7Days: number;
  setsCount7Days: number;
  recoveryPercentage: number; // 0 (just trained) to 100 (fully rested)
  status: 'fatigued' | 'recovering' | 'ready';
}

export const MuscleHeatmap: React.FC = () => {
  const { workoutHistory } = useApp();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('Pettorali');
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  // Compute 7-day muscle fatigue & recovery from actual workoutHistory
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const relevantWorkouts = workoutHistory.filter(w => {
    const time = new Date(w.date).getTime();
    return !isNaN(time) && time >= sevenDaysAgo;
  });

  const allMuscleGroups: MuscleGroup[] = [
    'Pettorali',
    'Dorsali',
    'Spalle',
    'Bicipiti',
    'Tricipiti',
    'Quadricipiti',
    'Addominali',
    'Adduttori',
    'Abduttori',
    'Avambracci'
  ];

  const muscleStatsMap: Record<MuscleGroup, MuscleState> = allMuscleGroups.reduce((acc, mg) => {
    let lastTrainedTime: number | null = null;
    let volume = 0;
    let sets = 0;

    relevantWorkouts.forEach(w => {
      const wTime = new Date(w.date).getTime();
      w.exercises.forEach(exLog => {
        const detail = mockExercises.find(e => e.id === exLog.exerciseId);
        if (detail && (detail.muscleGroup === mg || detail.category === mg)) {
          if (!lastTrainedTime || wTime > lastTrainedTime) {
            lastTrainedTime = wTime;
          }
          exLog.sets.forEach(s => {
            if (s.completed) {
              sets++;
              volume += s.weight * s.reps;
            }
          });
        }
      });
    });

    let hoursAgo: number | null = null;
    let recovery = 100;
    let status: 'fatigued' | 'recovering' | 'ready' = 'ready';

    if (lastTrainedTime) {
      hoursAgo = Math.max(1, Math.round((now - lastTrainedTime) / (1000 * 60 * 60)));
      if (hoursAgo < 36) {
        recovery = Math.min(60, Math.round((hoursAgo / 36) * 60));
        status = 'fatigued';
      } else if (hoursAgo < 72) {
        recovery = 60 + Math.round(((hoursAgo - 36) / 36) * 40);
        status = 'recovering';
      } else {
        recovery = 100;
        status = 'ready';
      }
    }

    acc[mg] = {
      group: mg,
      lastTrainedHoursAgo: hoursAgo,
      volume7Days: volume,
      setsCount7Days: sets,
      recoveryPercentage: recovery,
      status
    };
    return acc;
  }, {} as Record<MuscleGroup, MuscleState>);

  const activeStat = muscleStatsMap[selectedMuscle] || {
    group: selectedMuscle,
    lastTrainedHoursAgo: null,
    volume7Days: 0,
    setsCount7Days: 0,
    recoveryPercentage: 100,
    status: 'ready'
  };

  const getStatusColor = (st: MuscleState) => {
    if (st.status === 'fatigued') return '#ef4444'; // Red-orange
    if (st.status === 'recovering') return '#f59e0b'; // Amber / gold
    return '#10b981'; // Emerald ready
  };

  const getFillColor = (mg: MuscleGroup) => {
    const st = muscleStatsMap[mg];
    if (!st) return '#27272a';
    if (st.status === 'fatigued') return 'rgba(239, 68, 68, 0.85)';
    if (st.status === 'recovering') return 'rgba(245, 158, 11, 0.85)';
    return 'rgba(16, 185, 129, 0.45)'; // Ready to train
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="var(--color-primary)" /> Mappa Termica Muscolare & Recupero
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Analisi scientifica della fatica e sintesi proteica negli ultimi 7 giorni
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setViewSide('front')}
            style={{
              background: viewSide === 'front' ? 'var(--color-primary)' : 'transparent',
              color: viewSide === 'front' ? '#050506' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Frontale
          </button>
          <button
            type="button"
            onClick={() => setViewSide('back')}
            style={{
              background: viewSide === 'back' ? 'var(--color-primary)' : 'transparent',
              color: viewSide === 'back' ? '#050506' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Posteriore
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          Affaticato (&lt;36h)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          In Recupero (36-72h)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          Pronto (100%)
        </span>
      </div>

      {/* Interactive Anatomy Graphic and Details Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px', alignItems: 'center' }}>
        {/* Anatomical Silhouette (SVG) */}
        <div style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, rgba(5, 5, 6, 0.9) 100%)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          padding: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '260px'
        }}>
          {viewSide === 'front' ? (
            /* FRONT VIEW SVG */
            <svg viewBox="0 0 200 320" style={{ width: '100%', maxHeight: '250px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
              {/* Head / Neck outline */}
              <circle cx="100" cy="30" r="18" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
              <path d="M92 48 L108 48 L110 60 L90 60 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

              {/* Spalle (Front Delts) */}
              <path
                d="M62 64 C52 70 48 85 54 96 C58 92 68 84 72 74 Z"
                fill={getFillColor('Spalle')}
                stroke={selectedMuscle === 'Spalle' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Spalle' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Spalle')}
              />
              <path
                d="M138 64 C148 70 152 85 146 96 C142 92 132 84 128 74 Z"
                fill={getFillColor('Spalle')}
                stroke={selectedMuscle === 'Spalle' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Spalle' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Spalle')}
              />

              {/* Pettorali (Chest) */}
              <path
                d="M72 65 C85 64 98 68 98 94 C85 96 70 94 65 82 Z"
                fill={getFillColor('Pettorali')}
                stroke={selectedMuscle === 'Pettorali' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Pettorali' ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Pettorali')}
              />
              <path
                d="M128 65 C115 64 102 68 102 94 C115 96 130 94 135 82 Z"
                fill={getFillColor('Pettorali')}
                stroke={selectedMuscle === 'Pettorali' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Pettorali' ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Pettorali')}
              />

              {/* Bicipiti */}
              <path
                d="M48 98 C42 110 44 128 52 136 C56 128 60 114 56 100 Z"
                fill={getFillColor('Bicipiti')}
                stroke={selectedMuscle === 'Bicipiti' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Bicipiti' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Bicipiti')}
              />
              <path
                d="M152 98 C158 110 156 128 148 136 C144 128 140 114 144 100 Z"
                fill={getFillColor('Bicipiti')}
                stroke={selectedMuscle === 'Bicipiti' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Bicipiti' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Bicipiti')}
              />

              {/* Addominali (Abs / Core) */}
              <path
                d="M80 98 C93 98 107 98 120 98 C116 142 84 142 80 98 Z"
                fill={getFillColor('Addominali')}
                stroke={selectedMuscle === 'Addominali' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Addominali' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Addominali')}
              />

              {/* Quadricipiti (Quads) */}
              <path
                d="M74 150 C66 185 68 225 82 245 C94 240 98 200 96 150 Z"
                fill={getFillColor('Quadricipiti')}
                stroke={selectedMuscle === 'Quadricipiti' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Quadricipiti' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Quadricipiti')}
              />
              <path
                d="M126 150 C134 185 132 225 118 245 C106 240 102 200 104 150 Z"
                fill={getFillColor('Quadricipiti')}
                stroke={selectedMuscle === 'Quadricipiti' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Quadricipiti' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Quadricipiti')}
              />

              {/* Polpacci Frontali */}
              <path
                d="M74 256 C70 280 72 305 78 312 C86 312 90 285 88 256 Z"
                fill={getFillColor('Quadricipiti')}
                stroke="#27272a"
                strokeWidth="1"
              />
              <path
                d="M126 256 C130 280 128 305 122 312 C114 312 110 285 112 256 Z"
                fill={getFillColor('Quadricipiti')}
                stroke="#27272a"
                strokeWidth="1"
              />
            </svg>
          ) : (
            /* BACK VIEW SVG */
            <svg viewBox="0 0 200 320" style={{ width: '100%', maxHeight: '250px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
              {/* Head Back */}
              <circle cx="100" cy="30" r="18" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
              
              {/* Trapezio & Dorsali (Lats) */}
              <path
                d="M72 64 C90 56 110 56 128 64 C140 85 132 120 120 140 C100 135 100 135 80 140 C68 120 60 85 72 64 Z"
                fill={getFillColor('Dorsali')}
                stroke={selectedMuscle === 'Dorsali' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Dorsali' ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Dorsali')}
              />

              {/* Spalle Posteriori */}
              <path
                d="M58 66 C48 76 52 92 58 98 C64 90 70 80 70 70 Z"
                fill={getFillColor('Spalle')}
                stroke={selectedMuscle === 'Spalle' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Spalle' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Spalle')}
              />
              <path
                d="M142 66 C152 76 148 92 142 98 C136 90 130 80 130 70 Z"
                fill={getFillColor('Spalle')}
                stroke={selectedMuscle === 'Spalle' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Spalle' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Spalle')}
              />

              {/* Tricipiti */}
              <path
                d="M48 100 C42 115 44 132 50 138 C54 130 58 116 54 102 Z"
                fill={getFillColor('Tricipiti')}
                stroke={selectedMuscle === 'Tricipiti' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Tricipiti' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Tricipiti')}
              />
              <path
                d="M152 100 C158 115 156 132 150 138 C146 130 142 116 146 102 Z"
                fill={getFillColor('Tricipiti')}
                stroke={selectedMuscle === 'Tricipiti' ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={selectedMuscle === 'Tricipiti' ? 2 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Tricipiti')}
              />

              {/* Glutei & Femorali */}
              <path
                d="M74 148 C66 195 72 235 84 246 C94 240 98 190 96 148 Z"
                fill={getFillColor('Dorsali')}
                stroke="#27272a"
                strokeWidth="1"
              />
              <path
                d="M126 148 C134 195 128 235 116 246 C106 240 102 190 104 148 Z"
                fill={getFillColor('Dorsali')}
                stroke="#27272a"
                strokeWidth="1"
              />

              {/* Polpacci Posteriori */}
              <path
                d="M74 256 C68 280 72 305 78 312 C88 312 92 285 88 256 Z"
                fill={getFillColor('Quadricipiti')}
                stroke="#27272a"
                strokeWidth="1"
              />
              <path
                d="M126 256 C132 280 128 305 122 312 C112 312 108 285 112 256 Z"
                fill={getFillColor('Quadricipiti')}
                stroke="#27272a"
                strokeWidth="1"
              />
            </svg>
          )}
        </div>

        {/* Selected Muscle Detail Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Gruppo Muscolare
              </span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)', margin: '2px 0 0 0' }}>
                {activeStat.group}
              </h4>
            </div>

            {/* Recovery Badge */}
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: `${getStatusColor(activeStat)}20`,
              color: getStatusColor(activeStat),
              border: `1px solid ${getStatusColor(activeStat)}50`
            }}>
              {activeStat.recoveryPercentage}% Pronto
            </span>
          </div>

          {/* Recovery Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Livello Recupero</span>
              <span style={{ color: getStatusColor(activeStat), fontWeight: 700 }}>
                {activeStat.status === 'fatigued' ? 'Fase Ricostruzione' : activeStat.status === 'recovering' ? 'Quasi Pronto' : 'Recuperato al 100%'}
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${activeStat.recoveryPercentage}%`, 
                  background: getStatusColor(activeStat),
                  borderRadius: '3px',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
          </div>

          {/* 7-Day Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-dark)', display: 'block' }}>Volume Ultimi 7g</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{activeStat.volume7Days} kg</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-dark)', display: 'block' }}>Serie Eseguite</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{activeStat.setsCount7Days} set</span>
            </div>
          </div>

          {/* Advice */}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
            {activeStat.lastTrainedHoursAgo === null ? (
              'Nessun allenamento recente su questo gruppo. È fresco e pronto per essere stimolato al massimo!'
            ) : activeStat.status === 'fatigued' ? (
              `Allenato circa ${activeStat.lastTrainedHoursAgo} ore fa. Le fibre sono in sintesi proteica: consigliato riposo oggi.`
            ) : activeStat.status === 'recovering' ? (
              `Allenato ${activeStat.lastTrainedHoursAgo} ore fa. Il muscolo è quasi pronto, ideale per sessioni moderate o domani.`
            ) : (
              `Completamente recuperato (${activeStat.lastTrainedHoursAgo} ore fa). Momento perfetto per una sessione pesante con sovraccarico progressivo!`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
