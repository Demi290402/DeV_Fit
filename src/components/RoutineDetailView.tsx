import React, { useState, useMemo } from 'react';
import { ChevronLeft, Share2, MoreHorizontal, Clock, Dumbbell } from 'lucide-react';
import type { Routine } from '../context/AppContext';
import { useApp } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, isDistanceTimeExercise, isTimeOnlyExercise } from '../data/mockExercises';

interface RoutineDetailViewProps {
  routine: Routine;
  onBack: () => void;
  onStartRoutine: (routine: Routine) => void;
  onEditRoutine: (routine: Routine) => void;
  onOpenMenu: (routine: Routine) => void;
  onSelectExerciseDetail: (exerciseId: string) => void;
}

export const RoutineDetailView: React.FC<RoutineDetailViewProps> = ({
  routine,
  onBack,
  onStartRoutine,
  onEditRoutine,
  onOpenMenu,
  onSelectExerciseDetail
}) => {
  const { workoutHistory, profile, customExercises } = useApp();
  const allExercises = useMemo(() => [...customExercises, ...mockExercises], [customExercises]);

  const [chartMetric, setChartMetric] = useState<'volume' | 'reps' | 'duration'>('volume');
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | 'all'>('3m');

  // Filter workout history logs for this routine (by routine name or matching exercises)
  const routineHistory = useMemo(() => {
    return workoutHistory
      .filter(log => {
        if (log.name.toLowerCase() === routine.name.toLowerCase()) return true;
        // Or if at least 2 exercises match
        const matchingCount = log.exercises.filter(le => 
          routine.exercises.some(re => re.exerciseId === le.exerciseId)
        ).length;
        return matchingCount >= Math.min(2, routine.exercises.length);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workoutHistory, routine]);

  // Extract chart points (or fallback points if not logged yet)
  const chartData = useMemo(() => {
    if (routineHistory.length >= 2) {
      return routineHistory.map(log => {
        const d = new Date(log.date);
        const dayStr = d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' });
        const totalReps = log.exercises.reduce((sum, ex) => 
          sum + ex.sets.reduce((sSum, s) => sSum + (s.reps || 0), 0), 0);
        return {
          dateStr: dayStr,
          rawDate: log.date,
          volume: log.volume || 0,
          reps: totalReps || 45,
          durationMin: Math.round((log.duration || 2700) / 60)
        };
      });
    }

    // Default reference data to populate the graph realistically like screenshot 1
    const baseTargetVolume = routine.exercises.reduce((sum, re) => {
      const setsCount = re.defaultSets.length || 3;
      return sum + setsCount * 10 * 60; // ~1800kg per exercise
    }, 4000);

    const now = Date.now();
    return [
      {
        dateStr: 'gio 27',
        rawDate: new Date(now - 20 * 24 * 3600 * 1000).toISOString(),
        volume: Math.round(baseTargetVolume * 0.78),
        reps: 36,
        durationMin: 42
      },
      {
        dateStr: 'lug 8',
        rawDate: new Date(now - 10 * 24 * 3600 * 1000).toISOString(),
        volume: Math.round(baseTargetVolume * 1.08),
        reps: 48,
        durationMin: 52
      },
      {
        dateStr: 'lug 16',
        rawDate: new Date(now - 2 * 24 * 3600 * 1000).toISOString(),
        volume: Math.round(baseTargetVolume * 0.98),
        reps: 44,
        durationMin: 48
      }
    ];
  }, [routineHistory, routine]);

  const lastPoint = chartData[chartData.length - 1];

  const formatRest = (seconds?: number) => {
    const s = seconds || 90;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (rem === 0) return `${m}min 0s`;
    return `${m}min ${rem}s`;
  };

  // SVG Chart Dimensions
  const chartWidth = 340;
  const chartHeight = 130;
  const padX = 35;
  const padY = 22;

  const getMetricValue = (p: typeof chartData[0]) => {
    if (chartMetric === 'volume') return p.volume;
    if (chartMetric === 'reps') return p.reps;
    return p.durationMin;
  };

  const values = chartData.map(getMetricValue);
  const minVal = Math.min(...values) * 0.85;
  const maxVal = Math.max(...values) * 1.15;
  const range = maxVal - minVal || 1;

  const points = chartData.map((d, idx) => {
    const x = padX + (idx / Math.max(1, chartData.length - 1)) * (chartWidth - padX * 2);
    const val = getMetricValue(d);
    const y = chartHeight - padY - ((val - minVal) / range) * (chartHeight - padY * 2);
    return { x, y, ...d, val };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

  const topStatLabel = useMemo(() => {
    if (chartMetric === 'volume') {
      const v = lastPoint.volume;
      if (v >= 1000) return `${(v / 1000).toFixed(0)}k kg`;
      return `${v} kg`;
    }
    if (chartMetric === 'reps') return `${lastPoint.reps} rip`;
    return `${lastPoint.durationMin} min`;
  }, [chartMetric, lastPoint]);

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '6px 8px 6px 0',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          <ChevronLeft size={24} color="#ffffff" />
          <span>Routine</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onOpenMenu(routine)}
            title="Condividi"
            style={{ width: '38px', height: '38px' }}
          >
            <Share2 size={20} color="#ffffff" />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onOpenMenu(routine)}
            title="Opzioni routine"
            style={{ width: '38px', height: '38px' }}
          >
            <MoreHorizontal size={22} color="#ffffff" />
          </button>
        </div>
      </div>

      {/* Routine Header Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
          {routine.name}
        </h1>
        <span style={{ fontSize: '0.85rem', color: '#8e8e93' }}>
          Creato da {profile?.name || 'demi02'}
        </span>
      </div>

      {/* Primary Call to Action: "Avvia la routine" */}
      <button
        type="button"
        className="hevy-cta-btn"
        onClick={() => onStartRoutine(routine)}
        style={{
          width: '100%',
          height: '48px',
          borderRadius: '12px',
          background: 'var(--color-primary)',
          color: '#000000',
          fontSize: '0.96rem',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(212, 175, 55, 0.25)',
          transition: 'transform 0.15s ease, filter 0.15s ease'
        }}
      >
        Avvia la routine
      </button>

      {/* Progress Chart & Stats Section */}
      <div
        className="hevy-card"
        style={{
          background: '#121216',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Metric Label Row + Range Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              {topStatLabel}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              {lastPoint.dateStr}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                paddingRight: '14px'
              }}
            >
              <option value="1m" style={{ background: '#18181c', color: '#fff' }}>Ultimo mese</option>
              <option value="3m" style={{ background: '#18181c', color: '#fff' }}>Ultimi 3 mesi</option>
              <option value="all" style={{ background: '#18181c', color: '#fff' }}>Tutto</option>
            </select>
          </div>
        </div>

        {/* Responsive Line Chart */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="goldLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#f6e09a" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1={padX} y1={padY + 15} x2={chartWidth - padX} y2={padY + 15} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1={padX} y1={chartHeight / 2} x2={chartWidth - padX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1={padX} y1={chartHeight - padY} x2={chartWidth - padX} y2={chartHeight - padY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* Y axis reference values */}
            <text x={padX - 4} y={padY + 18} fill="#71717a" fontSize="8" textAnchor="end">
              {chartMetric === 'volume' ? `${Math.round(maxVal / 1000)}k kg` : Math.round(maxVal)}
            </text>
            <text x={padX - 4} y={chartHeight - padY + 3} fill="#71717a" fontSize="8" textAnchor="end">
              {chartMetric === 'volume' ? `${Math.round(minVal / 1000)}k kg` : Math.round(minVal)}
            </text>

            {/* Main Trend Line */}
            <polyline
              fill="none"
              stroke="url(#goldLineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylineStr}
            />

            {/* Data Points */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="4.5" fill="#121216" stroke="var(--color-primary)" strokeWidth="2.5" />
                <circle cx={p.x} cy={p.y} r="2" fill="#ffffff" />
                {/* X axis dates */}
                <text x={p.x} y={chartHeight - 4} fill="#8e8e93" fontSize="8.5" textAnchor="middle">
                  {p.dateStr}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Metric Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
          <button
            type="button"
            className={`hevy-filter-pill ${chartMetric === 'volume' ? 'active' : ''}`}
            onClick={() => setChartMetric('volume')}
          >
            Volume
          </button>
          <button
            type="button"
            className={`hevy-filter-pill ${chartMetric === 'reps' ? 'active' : ''}`}
            onClick={() => setChartMetric('reps')}
          >
            Ripetizioni
          </button>
          <button
            type="button"
            className={`hevy-filter-pill ${chartMetric === 'duration' ? 'active' : ''}`}
            onClick={() => setChartMetric('duration')}
          >
            Durata
          </button>
        </div>
      </div>

      {/* Exercises Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Esercizi
          </h2>
          <button
            type="button"
            onClick={() => onEditRoutine(routine)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Modifica la routine
          </button>
        </div>

        {/* Exercise Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {routine.exercises.map((re, index) => {
            const exDef = allExercises.find(e => e.id === re.exerciseId);
            const isCardio = isDistanceTimeExercise(exDef);
            const isIso = isTimeOnlyExercise(exDef);
            const restText = formatRest(re.restSeconds);

            return (
              <div
                key={`${re.exerciseId}-${index}`}
                className="hevy-card"
                style={{
                  background: '#121216',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Exercise Row Header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  onClick={() => onSelectExerciseDetail(re.exerciseId)}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#1c1c22',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {exDef ? renderMuscleIcon(exDef.muscleGroup, 26, 'var(--color-primary)') : <Dumbbell size={22} color="var(--color-primary)" />}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                      {exDef?.name || 'Esercizio'}
                    </h3>
                  </div>
                </div>

                {/* Rest Timer Sub-header (for strength & isometric exercises) */}
                {!isCardio && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 600 }}>
                    <Clock size={14} color="var(--color-primary)" />
                    <span>Timer di riposo: {restText}</span>
                  </div>
                )}

                {/* Cardio / Distance Table */}
                {isCardio ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', fontWeight: 600 }}>SERIE</span>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', fontWeight: 600 }}>KM</span>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', fontWeight: 600 }}>TEMPO</span>
                    </div>
                    {re.defaultSets.map((s, sIdx) => (
                      <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', paddingTop: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{sIdx + 1}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{s.distance || 1.5}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{s.time ? `${s.time}:00` : '20:00'}</span>
                      </div>
                    ))}
                  </div>
                ) : isIso ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', fontWeight: 600 }}>SERIE</span>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', fontWeight: 600 }}>TEMPO (SEC)</span>
                    </div>
                    {re.defaultSets.map((s, sIdx) => (
                      <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', paddingTop: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{sIdx + 1}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{s.time || 60}s</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', fontWeight: 600 }}>SERIE</span>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', fontWeight: 600 }}>KG</span>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', fontWeight: 600 }}>RIPETIZIONI</span>
                    </div>
                    {re.defaultSets.map((s, sIdx) => (
                      <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', paddingTop: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{sIdx + 1}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{s.weight > 0 ? `${s.weight} kg` : '-'}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{s.reps || 10}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
