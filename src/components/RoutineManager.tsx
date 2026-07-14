import React, { useState } from 'react';
import { Plus, Play, Trash2, ArrowLeft, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Routine } from '../context/AppContext';

import { mockExercises } from '../data/mockExercises';

export const RoutineManager: React.FC = () => {
  const { routines, addRoutine, deleteRoutine, startWorkout } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<{ exerciseId: string; setsCount: number }[]>([]);

  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) return;

    const newRot: Routine = {
      id: `rot-${Date.now()}`,
      name: newRoutineName,
      description: newRoutineDesc || 'Routine personalizzata dell\'utente.',
      exercises: selectedExercises.map(se => ({
        exerciseId: se.exerciseId,
        defaultSets: Array.from({ length: se.setsCount }, () => ({ weight: 0, reps: 10 }))
      }))
    };

    addRoutine(newRot);
    setIsCreating(false);
    setNewRoutineName('');
    setNewRoutineDesc('');
    setSelectedExercises([]);
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    const exists = selectedExercises.find(se => se.exerciseId === exerciseId);
    if (exists) {
      setSelectedExercises(prev => prev.filter(se => se.exerciseId !== exerciseId));
    } else {
      setSelectedExercises(prev => [...prev, { exerciseId, setsCount: 3 }]);
    }
  };

  const updateSetsCount = (exerciseId: string, count: number) => {
    setSelectedExercises(prev => prev.map(se => {
      if (se.exerciseId === exerciseId) {
        return { ...se, setsCount: Math.max(1, count) };
      }
      return se;
    }));
  };

  if (isCreating) {
    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="icon-btn" onClick={() => setIsCreating(false)}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Nuova Routine</h2>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nome della scheda</label>
            <input 
              type="text" 
              className="set-input" 
              style={{ width: '100%', textAlign: 'left', height: '42px', padding: '10px' }}
              value={newRoutineName}
              onChange={e => setNewRoutineName(e.target.value)}
              placeholder="es: Upper Body A - Spinta"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Descrizione (opzionale)</label>
            <input 
              type="text" 
              className="set-input" 
              style={{ width: '100%', textAlign: 'left', height: '42px', padding: '10px' }}
              value={newRoutineDesc}
              onChange={e => setNewRoutineDesc(e.target.value)}
              placeholder="es: Focus pettorali e spalle laterali"
            />
          </div>
        </div>

        <div>
          <h3 className="section-title">Seleziona Esercizi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {mockExercises.map(ex => {
              const selection = selectedExercises.find(se => se.exerciseId === ex.id);
              const isSelected = !!selection;

              return (
                <div key={ex.id} className="glass-card" style={{ padding: '14px', border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="flex-between" onClick={() => toggleExerciseSelection(ex.id)} style={{ cursor: 'pointer' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{ex.name}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>{ex.category}</span>
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '4px', border: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyItems: 'center', background: isSelected ? 'var(--color-primary)' : 'none', color: isSelected ? 'white' : 'transparent'
                    }}>
                      <Check size={14} style={{ margin: 'auto' }} />
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Numero di serie:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button className="rest-adjust-btn" style={{ width: '26px', height: '26px' }} onClick={() => updateSetsCount(ex.id, selection.setsCount - 1)}>-</button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{selection.setsCount}</span>
                        <button className="rest-adjust-btn" style={{ width: '26px', height: '26px' }} onClick={() => updateSetsCount(ex.id, selection.setsCount + 1)}>+</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button className="btn-primary" onClick={handleCreateRoutine} style={{ marginTop: '10px' }}>
          <Check size={18} /> Salva Routine
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="flex-between">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Routine e Schede</h2>
        <button className="btn-primary" onClick={() => setIsCreating(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          <Plus size={16} /> Nuova Routine
        </button>
      </div>

      {/* Empty Workout Direct Start */}
      <div className="glass-card animate-glow" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Allenamento Vuoto</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Inizia una sessione libera senza precompilare.</p>
        </div>
        <button className="btn-primary" onClick={() => startWorkout()} style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', padding: 0 }}>
          <Play size={18} fill="white" style={{ marginLeft: '3px' }} />
        </button>
      </div>

      <div>
        <h3 className="section-title">Le mie Routine</h3>
        {routines.length === 0 ? (
          <p style={{ color: 'var(--text-dark)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>Nessuna routine salvata. Creane una nuova!</p>
        ) : (
          <div className="routine-list">
            {routines.map(rot => (
              <div key={rot.id} className="glass-card routine-card">
                <div className="routine-info" style={{ flex: 1 }}>
                  <h4>{rot.name}</h4>
                  <p>{rot.description}</p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-secondary)', fontWeight: 600, display: 'block', marginTop: '6px' }}>
                    {rot.exercises.length} esercizi • {rot.exercises.reduce((sum, e) => sum + e.defaultSets.length, 0)} serie totali
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button className="icon-btn" onClick={() => startWorkout(rot.id)} style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }} title="Avvia questa routine">
                    <Play size={16} fill="var(--color-primary)" style={{ marginLeft: '2px' }} />
                  </button>
                  <button className="icon-btn" onClick={() => deleteRoutine(rot.id)} style={{ color: 'var(--color-error)' }} title="Elimina routine">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
