import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockExercises } from '../data/mockExercises';
import type { MuscleGroup } from '../data/mockExercises';

interface MuscleState {
  group: MuscleGroup;
  lastTrainedHoursAgo: number | null;
  volume7Days: number;
  setsCount7Days: number;
  recoveryPercentage: number; // 0 (appena allenato) a 100 (completamente fresco)
  status: 'fatigued' | 'recovering' | 'ready';
  recentExercises: string[];
}

interface MuscleHeatmapProps {
  isModal?: boolean;
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ isModal = false }) => {
  const { workoutHistory } = useApp();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('Pettorali');
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  // Calcolo fatica e recupero muscolare negli ultimi 7 giorni basato su workoutHistory reale
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
    'Addominali',
    'Quadricipiti',
    'Femorali',
    'Glutei',
    'Polpacci'
  ];

  const muscleStatsMap: Record<MuscleGroup, MuscleState> = allMuscleGroups.reduce((acc, mg) => {
    let lastTrainedTime: number | null = null;
    let volume = 0;
    let sets = 0;
    const exerciseNamesSet = new Set<string>();

    relevantWorkouts.forEach(w => {
      const wTime = new Date(w.date).getTime();
      w.exercises.forEach(exLog => {
        const detail = mockExercises.find(e => e.id === exLog.exerciseId);
        const matchesMuscle = detail && (
          detail.muscleGroup === mg || 
          detail.category === mg ||
          (mg === 'Spalle' && detail.category === 'Spalle') ||
          (mg === 'Glutei' && (detail.muscleGroup === 'Glutei' || detail.name.toLowerCase().includes('glutei') || detail.name.toLowerCase().includes('hip thrust'))) ||
          (mg === 'Femorali' && (detail.muscleGroup === 'Femorali' || detail.name.toLowerCase().includes('curl') || detail.name.toLowerCase().includes('stacco rumeno'))) ||
          (mg === 'Polpacci' && (detail.muscleGroup === 'Polpacci' || detail.name.toLowerCase().includes('calf')))
        );

        if (matchesMuscle) {
          if (!lastTrainedTime || wTime > lastTrainedTime) {
            lastTrainedTime = wTime;
          }
          if (detail) {
            exerciseNamesSet.add(detail.name);
          }
          exLog.sets.forEach(s => {
            if (s.completed) {
              sets++;
              volume += (s.weight || 0) * (s.reps || 0);
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
      status,
      recentExercises: Array.from(exerciseNamesSet)
    };
    return acc;
  }, {} as Record<MuscleGroup, MuscleState>);

  const activeStat = muscleStatsMap[selectedMuscle] || {
    group: selectedMuscle,
    lastTrainedHoursAgo: null,
    volume7Days: 0,
    setsCount7Days: 0,
    recoveryPercentage: 100,
    status: 'ready',
    recentExercises: []
  };

  const getStatusColor = (st: MuscleState) => {
    if (st.status === 'fatigued') return '#ef4444'; // Rosso affaticato
    if (st.status === 'recovering') return '#f59e0b'; // Ambra in recupero
    return '#10b981'; // Smeraldo pronto
  };

  const getFillColor = (mg: MuscleGroup) => {
    const st = muscleStatsMap[mg];
    if (!st || st.lastTrainedHoursAgo === null) return '#242429'; // Non allenato recentemente: grigio riposato
    if (st.status === 'fatigued') return 'rgba(239, 68, 68, 0.85)';
    if (st.status === 'recovering') return 'rgba(245, 158, 11, 0.85)';
    return 'rgba(16, 185, 129, 0.65)';
  };

  const isSelected = (mg: MuscleGroup) => selectedMuscle === mg;

  return (
    <div 
      className={isModal ? 'animate-fade-in' : 'glass-card animate-fade-in'} 
      style={{ 
        padding: isModal ? '0' : '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px',
        background: isModal ? 'transparent' : undefined,
        border: isModal ? 'none' : undefined,
        boxShadow: isModal ? 'none' : undefined
      }}
    >
      {/* Header & View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        {!isModal && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Mappa Muscolare & Recupero
              </h3>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
              Stato scientifico di sintesi proteica e fatica (ultimi 7 giorni)
            </p>
          </div>
        )}
        {isModal && (
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
            Sintesi proteica & fatica (ultimi 7 giorni)
          </p>
        )}

        {/* View Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginLeft: isModal ? 'auto' : undefined
        }}>
          <button
            type="button"
            onClick={() => setViewSide('front')}
            style={{
              background: viewSide === 'front' ? 'var(--color-primary)' : 'transparent',
              color: viewSide === 'front' ? '#050506' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Vista Frontale
          </button>
          <button
            type="button"
            onClick={() => setViewSide('back')}
            style={{
              background: viewSide === 'back' ? 'var(--color-primary)' : 'transparent',
              color: viewSide === 'back' ? '#050506' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Vista Posteriore
          </button>
        </div>
      </div>

      {/* Muscle Quick Filter Pills */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {allMuscleGroups.map(mg => {
          const active = selectedMuscle === mg;
          const st = muscleStatsMap[mg];
          const hasTrained = st && st.lastTrainedHoursAgo !== null;

          return (
            <button
              key={mg}
              type="button"
              onClick={() => {
                setSelectedMuscle(mg);
                // Switch perspective automatically for back-only muscles
                if (['Glutei', 'Femorali', 'Dorsali'].includes(mg)) {
                  setViewSide('back');
                } else if (['Pettorali', 'Addominali', 'Quadricipiti', 'Bicipiti'].includes(mg)) {
                  setViewSide('front');
                }
              }}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.68rem',
                fontWeight: active ? 800 : 600,
                background: active ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: active ? '#050506' : hasTrained ? '#ffffff' : 'var(--text-muted)',
                border: active ? '1px solid var(--color-primary)' : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s'
              }}
            >
              {hasTrained && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: getStatusColor(st)
                }} />
              )}
              {mg}
            </button>
          );
        })}
      </div>

      {/* Interactive Anatomy Graphic and Details Panel */}
      <div className="muscle-heatmap-grid">
        {/* Anatomical Silhouette (SVG) */}
        <div 
          className="muscle-silhouette-box"
          style={{
            background: 'linear-gradient(180deg, #111114 0%, #09090b 100%)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '220px',
            position: 'relative'
          }}
        >
          {viewSide === 'front' ? (
            /* FRONT VIEW SVG */
            <svg viewBox="0 0 200 320" style={{ width: '100%', maxHeight: '220px' }}>
              {/* Head / Neck */}
              <circle cx="100" cy="28" r="16" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
              <path d="M94 44 L106 44 L108 58 L92 58 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

              {/* Spalle - Deltoidi Anteriori & Laterali */}
              <path
                d="M62 60 C50 66 46 82 52 94 C57 90 67 82 72 72 Z"
                fill={getFillColor('Spalle')}
                stroke={isSelected('Spalle') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Spalle') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Spalle')}
              >
                <title>Spalle (Deltoidi Anteriori/Laterali)</title>
              </path>
              <path
                d="M138 60 C150 66 154 82 148 94 C143 90 133 82 128 72 Z"
                fill={getFillColor('Spalle')}
                stroke={isSelected('Spalle') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Spalle') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Spalle')}
              >
                <title>Spalle (Deltoidi Anteriori/Laterali)</title>
              </path>

              {/* Pettorali */}
              <path
                d="M72 63 C85 62 98 66 98 92 C85 94 70 92 65 80 Z"
                fill={getFillColor('Pettorali')}
                stroke={isSelected('Pettorali') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Pettorali') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Pettorali')}
              >
                <title>Pettorali</title>
              </path>
              <path
                d="M128 63 C115 62 102 66 102 92 C115 94 130 92 135 80 Z"
                fill={getFillColor('Pettorali')}
                stroke={isSelected('Pettorali') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Pettorali') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Pettorali')}
              >
                <title>Pettorali</title>
              </path>

              {/* Bicipiti */}
              <path
                d="M47 96 C41 108 43 126 51 134 C55 126 59 112 55 98 Z"
                fill={getFillColor('Bicipiti')}
                stroke={isSelected('Bicipiti') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Bicipiti') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Bicipiti')}
              >
                <title>Bicipiti</title>
              </path>
              <path
                d="M153 96 C159 108 157 126 149 134 C145 126 141 112 145 98 Z"
                fill={getFillColor('Bicipiti')}
                stroke={isSelected('Bicipiti') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Bicipiti') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Bicipiti')}
              >
                <title>Bicipiti</title>
              </path>

              {/* Addominali */}
              <path
                d="M79 96 C93 96 107 96 121 96 C117 142 83 142 79 96 Z"
                fill={getFillColor('Addominali')}
                stroke={isSelected('Addominali') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Addominali') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Addominali')}
              >
                <title>Addominali (Core)</title>
              </path>

              {/* Quadricipiti */}
              <path
                d="M74 148 C66 182 68 220 82 240 C94 235 98 196 96 148 Z"
                fill={getFillColor('Quadricipiti')}
                stroke={isSelected('Quadricipiti') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Quadricipiti') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Quadricipiti')}
              >
                <title>Quadricipiti</title>
              </path>
              <path
                d="M126 148 C134 182 132 220 118 240 C106 235 102 196 104 148 Z"
                fill={getFillColor('Quadricipiti')}
                stroke={isSelected('Quadricipiti') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Quadricipiti') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Quadricipiti')}
              >
                <title>Quadricipiti</title>
              </path>

              {/* Polpacci Frontali (Tibiali & Polpacci) */}
              <path
                d="M74 250 C69 274 71 298 77 310 C86 310 90 282 88 250 Z"
                fill={getFillColor('Polpacci')}
                stroke={isSelected('Polpacci') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Polpacci') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Polpacci')}
              >
                <title>Polpacci (Frontali)</title>
              </path>
              <path
                d="M126 250 C131 274 129 298 123 310 C114 310 110 282 112 250 Z"
                fill={getFillColor('Polpacci')}
                stroke={isSelected('Polpacci') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Polpacci') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Polpacci')}
              >
                <title>Polpacci (Frontali)</title>
              </path>
            </svg>
          ) : (
            /* BACK VIEW SVG */
            <svg viewBox="0 0 200 320" style={{ width: '100%', maxHeight: '220px' }}>
              {/* Head Back */}
              <circle cx="100" cy="28" r="16" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />

              {/* Trapezi & Dorsali */}
              <path
                d="M72 60 C90 52 110 52 128 60 C140 82 132 116 120 138 C100 133 100 133 80 138 C68 116 60 82 72 60 Z"
                fill={getFillColor('Dorsali')}
                stroke={isSelected('Dorsali') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Dorsali') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Dorsali')}
              >
                <title>Dorsali & Trapezi</title>
              </path>

              {/* Spalle - Deltoidi Posteriori */}
              <path
                d="M58 62 C48 72 52 88 58 94 C64 86 70 76 70 66 Z"
                fill={getFillColor('Spalle')}
                stroke={isSelected('Spalle') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Spalle') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Spalle')}
              >
                <title>Spalle (Deltoidi Posteriori)</title>
              </path>
              <path
                d="M142 62 C152 72 148 88 142 94 C136 86 130 76 130 66 Z"
                fill={getFillColor('Spalle')}
                stroke={isSelected('Spalle') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Spalle') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Spalle')}
              >
                <title>Spalle (Deltoidi Posteriori)</title>
              </path>

              {/* Tricipiti */}
              <path
                d="M47 96 C41 110 43 128 49 135 C53 127 57 114 53 99 Z"
                fill={getFillColor('Tricipiti')}
                stroke={isSelected('Tricipiti') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Tricipiti') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Tricipiti')}
              >
                <title>Tricipiti</title>
              </path>
              <path
                d="M153 96 C159 110 157 128 151 135 C147 127 143 114 147 99 Z"
                fill={getFillColor('Tricipiti')}
                stroke={isSelected('Tricipiti') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Tricipiti') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Tricipiti')}
              >
                <title>Tricipiti</title>
              </path>

              {/* GLUTEI (Nuovo fascio separato) */}
              <path
                d="M74 140 C63 148 64 178 76 188 C88 188 97 172 97 144 Z"
                fill={getFillColor('Glutei')}
                stroke={isSelected('Glutei') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Glutei') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Glutei')}
              >
                <title>Glutei</title>
              </path>
              <path
                d="M126 140 C137 148 136 178 124 188 C112 188 103 172 103 144 Z"
                fill={getFillColor('Glutei')}
                stroke={isSelected('Glutei') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Glutei') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Glutei')}
              >
                <title>Glutei</title>
              </path>

              {/* FEMORALI (Nuovo fascio separato) */}
              <path
                d="M75 192 C67 212 70 232 82 245 C92 242 96 222 96 192 Z"
                fill={getFillColor('Femorali')}
                stroke={isSelected('Femorali') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Femorali') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Femorali')}
              >
                <title>Femorali (Bicipite Femorale)</title>
              </path>
              <path
                d="M125 192 C133 212 130 232 118 245 C108 242 104 222 104 192 Z"
                fill={getFillColor('Femorali')}
                stroke={isSelected('Femorali') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Femorali') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Femorali')}
              >
                <title>Femorali (Bicipite Femorale)</title>
              </path>

              {/* POLPACCI POSTERIORI (Gastrocnemio e Soleo) */}
              <path
                d="M74 250 C68 274 72 300 78 308 C88 308 92 282 88 250 Z"
                fill={getFillColor('Polpacci')}
                stroke={isSelected('Polpacci') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Polpacci') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Polpacci')}
              >
                <title>Polpacci Posteriori</title>
              </path>
              <path
                d="M126 250 C132 274 128 300 122 308 C112 308 108 282 112 250 Z"
                fill={getFillColor('Polpacci')}
                stroke={isSelected('Polpacci') ? 'var(--color-primary)' : '#27272a'}
                strokeWidth={isSelected('Polpacci') ? 2.5 : 1}
                cursor="pointer"
                onClick={() => setSelectedMuscle('Polpacci')}
              >
                <title>Polpacci Posteriori</title>
              </path>
            </svg>
          )}

          {/* Micro Helper */}
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tocca un muscolo per i dettagli
          </span>
        </div>

        {/* Selected Muscle Detail Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
                Gruppo Muscolare
              </span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', margin: '2px 0 0 0' }}>
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
              <span>Recupero Fibre</span>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: '#121215', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Volume 7g</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'white' }}>{activeStat.volume7Days} kg</span>
            </div>
            <div style={{ background: '#121215', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>Serie Eseguite</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'white' }}>{activeStat.setsCount7Days} set</span>
            </div>
          </div>

          {/* Recent Exercises (if any) */}
          {activeStat.recentExercises.length > 0 && (
            <div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Esercizi Recenti (ultimi 7g)
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {activeStat.recentExercises.map(name => (
                  <span key={name} style={{
                    fontSize: '0.66rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    padding: '2px 7px',
                    color: 'var(--text-primary)'
                  }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scientific Advice */}
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            lineHeight: '1.4',
            background: 'rgba(255,255,255,0.02)',
            borderLeft: `3px solid ${getStatusColor(activeStat)}`,
            padding: '6px 10px',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
          }}>
            {activeStat.lastTrainedHoursAgo === null ? (
              'Nessun allenamento recente su questo gruppo. È completamente fresco e pronto per essere stimolato con la massima intensità!'
            ) : activeStat.status === 'fatigued' ? (
              `Allenato ${activeStat.lastTrainedHoursAgo}h fa. Le fibre muscolari sono in piena sintesi proteica e riparazione. Consigliato riposo oggi.`
            ) : activeStat.status === 'recovering' ? (
              `Allenato ${activeStat.lastTrainedHoursAgo}h fa. Il recupero è a buon punto. Ottimo per una sessione leggera o per attendere domani.`
            ) : (
              `Completamente recuperato (${activeStat.lastTrainedHoursAgo}h fa). Momento ideale per programmare un workout pesante e puntare a un sovraccarico progressivo!`
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
