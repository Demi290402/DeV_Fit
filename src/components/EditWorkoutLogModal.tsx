import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Dumbbell } from 'lucide-react';
import type { WorkoutLog, ExerciseLog, SetLog } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, isDistanceTimeExercise, isTimeOnlyExercise } from '../data/mockExercises';
import { SwipeableSetRow } from './SwipeableSetRow';

interface EditWorkoutLogModalProps {
  workoutLog: WorkoutLog | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: WorkoutLog) => void;
}

export const EditWorkoutLogModal: React.FC<EditWorkoutLogModalProps> = ({
  workoutLog,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);

  useEffect(() => {
    if (workoutLog) {
      setName(workoutLog.name);
      setExercises(JSON.parse(JSON.stringify(workoutLog.exercises)));
    }
  }, [workoutLog]);

  if (!isOpen || !workoutLog) return null;

  const handleUpdateSet = (
    exIdx: number,
    setIdx: number,
    field: 'weight' | 'reps' | 'time' | 'distance',
    value: number
  ) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      ex.sets = sets;
      copy[exIdx] = ex;
      return copy;
    });
  };

  const handleAddSet = (exIdx: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: SetLog = {
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 10,
        time: lastSet ? lastSet.time : 60,
        distance: lastSet ? lastSet.distance : 1.0,
        completed: true
      };
      ex.sets = [...ex.sets, newSet];
      copy[exIdx] = ex;
      return copy;
    });
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const ex = { ...copy[exIdx] };
      if (ex.sets.length <= 1) return prev;
      ex.sets = ex.sets.filter((_, idx) => idx !== setIdx);
      copy[exIdx] = ex;
      return copy;
    });
  };

  const handleSave = () => {
    let totalVolume = 0;
    exercises.forEach(ex => {
      const def = mockExercises.find(m => m.id === ex.exerciseId);
      const isCardio = isDistanceTimeExercise(def);
      const isIso = isTimeOnlyExercise(def);

      ex.sets.forEach(s => {
        if (!isCardio && !isIso) {
          totalVolume += (s.weight || 0) * (s.reps || 0);
        }
      });
    });

    const updated: WorkoutLog = {
      ...workoutLog,
      name: name.trim() || workoutLog.name,
      volume: totalVolume,
      exercises
    };

    onSave(updated);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5000,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#12131a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Modifica Allenamento Salvato
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Correggi pesi, serie o ripetizioni registrate
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Nome Allenamento
            </label>
            <input
              type="text"
              className="set-input"
              style={{ width: '100%', textAlign: 'left', padding: '10px 14px', height: '42px', fontSize: '0.9rem' }}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {exercises.map((ex, exIdx) => {
              const def = mockExercises.find(m => m.id === ex.exerciseId);
              const isCardio = isDistanceTimeExercise(def);
              const isIso = isTimeOnlyExercise(def);

              return (
                <div
                  key={ex.exerciseId + exIdx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '14px',
                    overflowX: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px' }}>
                      {def ? renderMuscleIcon(def.muscleGroup, 28, '#00a8ff') : <Dumbbell size={20} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'white' }}>
                        {def ? def.name : 'Esercizio'}
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {def?.muscleGroup} • {isCardio ? 'Cardio' : isIso ? 'Isometrico' : def?.equipment}
                      </span>
                    </div>
                  </div>

                  {/* Table of sets */}
                  <table className="sets-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '15%', fontSize: '0.68rem', color: '#94a3b8' }}>Set</th>
                        {isCardio ? (
                          <>
                            <th style={{ width: '40%', fontSize: '0.68rem', color: '#94a3b8' }}>Minuti</th>
                            <th style={{ width: '35%', fontSize: '0.68rem', color: '#94a3b8' }}>Km</th>
                          </>
                        ) : isIso ? (
                          <th style={{ width: '75%', fontSize: '0.68rem', color: '#94a3b8' }}>Secondi</th>
                        ) : (
                          <>
                            <th style={{ width: '40%', fontSize: '0.68rem', color: '#94a3b8' }}>Kg</th>
                            <th style={{ width: '35%', fontSize: '0.68rem', color: '#94a3b8' }}>Ripetizioni</th>
                          </>
                        )}
                        <th style={{ width: '10%', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((set, setIdx) => (
                        <SwipeableSetRow
                          key={set.id || setIdx}
                          onDelete={() => handleRemoveSet(exIdx, setIdx)}
                          canDelete={ex.sets.length > 1}
                        >
                          <td style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                            {setIdx + 1}
                          </td>
                          {isCardio ? (
                            <>
                              <td>
                                <input
                                  type="number"
                                  className="set-input"
                                  value={set.time || ''}
                                  onChange={e => handleUpdateSet(exIdx, setIdx, 'time', parseFloat(e.target.value) || 0)}
                                  placeholder="min"
                                  style={{ width: '65px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="set-input"
                                  value={set.distance || ''}
                                  onChange={e => handleUpdateSet(exIdx, setIdx, 'distance', parseFloat(e.target.value) || 0)}
                                  placeholder="km"
                                  style={{ width: '65px' }}
                                />
                              </td>
                            </>
                          ) : isIso ? (
                            <td>
                              <input
                                type="number"
                                className="set-input"
                                value={set.time || ''}
                                onChange={e => handleUpdateSet(exIdx, setIdx, 'time', parseInt(e.target.value) || 0)}
                                placeholder="sec"
                                style={{ width: '80px' }}
                              />
                            </td>
                          ) : (
                            <>
                              <td>
                                <input
                                  type="number"
                                  step="any"
                                  className="set-input"
                                  value={set.weight !== undefined && set.weight !== null ? set.weight : ''}
                                  onChange={e => handleUpdateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                                  placeholder="kg"
                                  style={{ width: '65px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="set-input"
                                  value={set.reps !== undefined && set.reps !== null ? set.reps : ''}
                                  onChange={e => handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                  placeholder="rep"
                                  style={{ width: '65px' }}
                                />
                              </td>
                            </>
                          )}
                          <td align="center">
                            {ex.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                                title="Elimina serie (oppure fai swipe a sinistra)"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </SwipeableSetRow>
                      ))}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    onClick={() => handleAddSet(exIdx)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px dashed rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      color: '#00a8ff',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '6px 12px',
                      marginTop: '10px',
                      width: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={14} /> Aggiungi Serie
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          padding: '14px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            Annulla
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            style={{ padding: '8px 20px', fontSize: '0.82rem' }}
          >
            <Check size={16} /> Salva Modifiche
          </button>
        </div>
      </div>
    </div>
  );
};
