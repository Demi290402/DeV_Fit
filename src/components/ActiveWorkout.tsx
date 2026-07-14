import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Check, Clock, X, Info, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SetLog } from '../context/AppContext';
import { mockExercises } from '../data/mockExercises';

export const ActiveWorkout: React.FC = () => {
  const {
    activeWorkout,
    updateActiveWorkoutSet,
    toggleCompleteSet,
    addExerciseToActiveWorkout,
    saveActiveWorkout,
    cancelActiveWorkout,
    workoutHistory,
    getPreviousPerformances
  } = useApp();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedDetailExerciseId, setSelectedDetailExerciseId] = useState<string | null>(null);
  
  // Rest Timer State
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [restTimeTotal, setRestTimeTotal] = useState<number>(90); // default 90s
  const restTimerRef = useRef<any>(null);


  // Active workout duration timer
  useEffect(() => {
    if (!activeWorkout || !activeWorkout.startTime) return;
    
    // Set initial elapsed
    setElapsedTime(Math.round((Date.now() - activeWorkout.startTime) / 1000));

    const interval = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - activeWorkout.startTime!) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest timer interval logic
  useEffect(() => {
    if (restTimeLeft !== null) {
      if (restTimeLeft > 0) {
        restTimerRef.current = setTimeout(() => {
          setRestTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else {
        // Timer completed!
        setRestTimeLeft(null);
        // HTML5 Vibrate if supported
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }
    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [restTimeLeft]);

  if (!activeWorkout) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetCheck = (exId: string, setIdx: number) => {
    const currentEx = activeWorkout.exercises.find(e => e.exerciseId === exId);
    if (currentEx) {
      const set = currentEx.sets[setIdx];
      const isAlreadyCompleted = set.completed;
      
      toggleCompleteSet(exId, setIdx);

      // If completing (checking the box), launch rest timer
      if (!isAlreadyCompleted) {
        setRestTimeLeft(restTimeTotal);
      }
    }
  };

  const adjustRestTime = (amount: number) => {
    setRestTimeLeft(prev => {
      if (prev === null) return null;
      const newVal = prev + amount;
      return newVal > 0 ? newVal : 0;
    });
    setRestTimeTotal(prev => {
      const newVal = prev + amount;
      return newVal > 0 ? newVal : 10;
    });
  };

  const handleAddSet = (exId: string) => {
    // Generate unique ID and add a set log
    const currentEx = activeWorkout.exercises.find(e => e.exerciseId === exId);
    if (currentEx) {
      const lastSet = currentEx.sets[currentEx.sets.length - 1];
      const weight = lastSet ? lastSet.weight : 0;
      const reps = lastSet ? lastSet.reps : 10;
      const newSet: SetLog = {
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        weight,
        reps,
        completed: false
      };
      
      // We directly mutate activeWorkout state using custom setter or update
      // Since context doesn't expose addSet, we update activeWorkout state through field edit on a dummy index or extend activeWorkout exercises
      // Wait, we can implement it by adding a set to the activeWorkout exercises array
      const updatedExercises = activeWorkout.exercises.map(e => {
        if (e.exerciseId === exId) {
          return { ...e, sets: [...e.sets, newSet] };
        }
        return e;
      });
      activeWorkout.exercises = updatedExercises;
      // Triggers re-render by updating dummy values
      updateActiveWorkoutSet(exId, 0, 'weight', activeWorkout.exercises.find(e => e.exerciseId === exId)!.sets[0].weight);
    }
  };

  const handleRemoveSet = (exId: string, setIdx: number) => {
    const currentEx = activeWorkout.exercises.find(e => e.exerciseId === exId);
    if (currentEx && currentEx.sets.length > 1) {
      const updatedExercises = activeWorkout.exercises.map(e => {
        if (e.exerciseId === exId) {
          return { ...e, sets: e.sets.filter((_, idx) => idx !== setIdx) };
        }
        return e;
      });
      activeWorkout.exercises = updatedExercises;
      // Triggers re-render
      updateActiveWorkoutSet(exId, 0, 'weight', activeWorkout.exercises.find(e => e.exerciseId === exId)!.sets[0].weight);
    }
  };

  // Calculate live volume
  const getLiveVolume = () => {
    let vol = 0;
    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) vol += s.weight * s.reps;
      });
    });
    return vol;
  };

  // Rest Timer progress radial calculation
  const restCircumference = 2 * Math.PI * 20; // radius 20
  const restProgress = restTimeLeft !== null ? (restTimeLeft / restTimeTotal) * 100 : 0;
  const restStrokeOffset = restCircumference - (restProgress / 100) * restCircumference;

  // Render Exercise detail Drawer content
  const selectedExercise = mockExercises.find(e => e.id === selectedDetailExerciseId);
  const exerciseHistory = selectedDetailExerciseId
    ? workoutHistory.flatMap(log => {
        const match = log.exercises.find(e => e.exerciseId === selectedDetailExerciseId);
        if (match) {
          // Find max weight in this logged session
          const maxWeight = Math.max(...match.sets.filter(s => s.completed).map(s => s.weight), 0);
          return maxWeight > 0 ? [{ date: log.date, weight: maxWeight }] : [];
        }
        return [];
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Generate SVG chart coordinates
  const renderSvgChart = () => {
    if (exerciseHistory.length < 2) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dark)', fontSize: '0.78rem' }}>
          Registra almeno 2 allenamenti con questo esercizio per vedere il grafico storico dei carichi.
        </div>
      );
    }

    const width = 360;
    const height = 100;
    const paddingX = 30;
    const paddingY = 15;

    const weights = exerciseHistory.map(h => h.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const wRange = maxW - minW || 10;

    const points = exerciseHistory.map((h, idx) => {
      const x = paddingX + (idx / (exerciseHistory.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((h.weight - minW) / wRange) * (height - 2 * paddingY);
      return { x, y, weight: h.weight, date: new Date(h.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) };
    });

    const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;

    return (
      <div className="svg-chart-container" style={{ height: '140px' }}>
        <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`}>
          {/* Horizontal lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Line Path */}
          <path d={pathD} className="chart-line" />

          {/* Value markers */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="4" className="chart-dots" />
              <text x={p.x} y={p.y - 8} fill="white" fontSize="7" fontWeight="bold" textAnchor="middle">{p.weight}kg</text>
              <text x={p.x} y={height - 2} fill="var(--text-dark)" fontSize="7" textAnchor="middle">{p.date}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '40px' }}>
      {/* Timer Bar */}
      <div className="active-workout-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeWorkout.name}</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Volume: {getLiveVolume()} kg</span>
        </div>
        <div className="timer-box">
          <Clock size={16} />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Exercises Log List */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeWorkout.exercises.map((exLog) => {
          const exDetail = mockExercises.find(e => e.id === exLog.exerciseId);
          if (!exDetail) return null;

          const prevSets = getPreviousPerformances(exLog.exerciseId);

          return (
            <div key={exLog.exerciseId} className="glass-card exercise-log-card">
              <div className="flex-between exercise-header-clickable" onClick={() => setSelectedDetailExerciseId(exLog.exerciseId)}>
                <div className="exercise-title-row">
                  <div className="exercise-icon" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
                    <Info size={16} />
                  </div>
                  <div>
                    <h4 className="exercise-title">{exDetail.name}</h4>
                    <span className="exercise-meta">{exDetail.category} • Vedi istruzioni e video</span>
                  </div>
                </div>
                <ChevronDown size={18} color="var(--text-muted)" />
              </div>

              {/* Sets Table */}
              <table className="sets-table">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Set</th>
                    <th style={{ width: '30%' }}>Ultima volta</th>
                    <th style={{ width: '22%' }}>Kg</th>
                    <th style={{ width: '22%' }}>Rep</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>OK</th>
                  </tr>
                </thead>
                <tbody>
                  {exLog.sets.map((set, idx) => {
                    const prevSet = prevSets[idx];
                    return (
                      <tr key={set.id} className={`set-row ${set.completed ? 'completed' : ''}`}>
                        <td className="set-index">{idx + 1}</td>
                        <td className="prev-set-value">
                          {prevSet ? `${prevSet.weight}kg x ${prevSet.reps}` : 'Nessuno'}
                        </td>
                        <td>
                          <input
                            type="number"
                            className="set-input"
                            value={set.weight || ''}
                            onChange={(e) => updateActiveWorkoutSet(exLog.exerciseId, idx, 'weight', parseFloat(e.target.value) || 0)}
                            disabled={set.completed}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="set-input"
                            value={set.reps || ''}
                            onChange={(e) => updateActiveWorkoutSet(exLog.exerciseId, idx, 'reps', parseInt(e.target.value) || 0)}
                            disabled={set.completed}
                          />
                        </td>
                        <td align="center">
                          <button 
                            className="btn-complete-set" 
                            onClick={() => handleSetCheck(exLog.exerciseId, idx)}
                          >
                            <Check size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Badges / Achievements under the sets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {exLog.sets.map((set, idx) => {
                  if (!set.completed) return null;
                  const badges = [];
                  if (set.is1RM) badges.push(<span key="1rm" className="achievement-badge badge-1rm-glow">⭐ 1RM (S.{idx+1})</span>);
                  if (set.isMaxVolume) badges.push(<span key="vol" className="achievement-badge badge-volume-glow">🔥 Vol (S.{idx+1})</span>);
                  if (set.isMaxWeight) badges.push(<span key="wgt" className="achievement-badge badge-weight-glow">💪 Peso (S.{idx+1})</span>);
                  return badges;
                })}
              </div>

              {/* Set modifiers */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleAddSet(exLog.exerciseId)}
                  style={{ flex: 1, padding: '8px', fontSize: '0.75rem' }}
                >
                  + Aggiungi Set
                </button>
                {exLog.sets.length > 1 && (
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleRemoveSet(exLog.exerciseId, exLog.sets.length - 1)}
                    style={{ padding: '8px 12px', color: 'var(--color-error)' }}
                    title="Elimina ultimo set"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        <button className="btn-primary" onClick={() => setShowAddExercise(true)}>
          <Plus size={18} /> Aggiungi Esercizio
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-primary" 
            onClick={() => saveActiveWorkout()} 
            style={{ flex: 1, background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          >
            <Check size={18} /> Salva Allenamento
          </button>
          <button 
            className="btn-secondary" 
            onClick={cancelActiveWorkout} 
            style={{ color: 'var(--color-error)' }}
          >
            Annulla
          </button>
        </div>
      </div>

      {/* Floating Rest Timer Component */}
      {restTimeLeft !== null && (
        <div className="rest-timer-overlay">
          <div className="rest-timer-radial">
            <svg width="44" height="44">
              <circle className="rest-circle-bg" cx="22" cy="22" r="20" />
              <circle 
                className="rest-circle-progress" 
                cx="22" 
                cy="22" 
                r="20" 
                strokeDasharray={restCircumference}
                strokeDashoffset={restStrokeOffset}
              />
            </svg>
            <div className="rest-time-digits">{restTimeLeft}s</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tempo di Recupero</div>
            <div className="rest-controls">
              <button className="rest-adjust-btn" onClick={() => adjustRestTime(-10)}>-10s</button>
              <button className="rest-adjust-btn" onClick={() => adjustRestTime(10)}>+10s</button>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} 
                onClick={() => setRestTimeLeft(null)}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className="drawer-backdrop" onClick={() => setShowAddExercise(false)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="section-title">Aggiungi Esercizio</h3>
              <button className="drawer-close" onClick={() => setShowAddExercise(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', maxHeight: '400px', overflowY: 'auto' }}>
              {mockExercises.map(ex => (
                <div 
                  key={ex.id} 
                  className="glass-card" 
                  style={{ padding: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => {
                    addExerciseToActiveWorkout(ex.id);
                    setShowAddExercise(false);
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{ex.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ex.category}</span>
                  </div>
                  <Plus size={16} color="var(--color-primary)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Details Drawer */}
      {selectedDetailExerciseId && selectedExercise && (
        <div className="drawer-backdrop" onClick={() => setSelectedDetailExerciseId(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3 className="section-title" style={{ marginBottom: '4px' }}>{selectedExercise.name}</h3>
                <span className="recipe-type-tag tag-fit">{selectedExercise.category}</span>
              </div>
              <button className="drawer-close" onClick={() => setSelectedDetailExerciseId(null)}><X size={20} /></button>
            </div>

            {/* Video Loop (Muted) */}
            <div className="video-container" style={{ marginTop: '16px' }}>
              <video 
                src={selectedExercise.videoUrl} 
                className="video-demo" 
                autoPlay 
                loop 
                muted 
                playsInline 
                onError={(e) => {
                  // Fallback if video URL is blocked or fails
                  const target = e.target as HTMLVideoElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const placeholder = parent.querySelector('.video-placeholder');
                    if (placeholder) (placeholder as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <div className="video-placeholder" style={{ display: 'none', padding: '20px', textAlign: 'center' }}>
                <Clock size={32} color="var(--text-dark)" style={{ margin: '0 auto 8px' }} />
                <span style={{ fontSize: '0.78rem' }}>Dimostrazione Video Loop Muto (Stock)</span>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 700, marginBottom: '6px' }}>ESECUZIONE CORRETTA</h4>
              <p style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>{selectedExercise.instructions}</p>
            </div>

            {/* Linear Load Chart */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '4px' }}>ANDAMENTO DEL CARICO MASSIMO</h4>
              {renderSvgChart()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
