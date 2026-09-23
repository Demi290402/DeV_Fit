import React, { useState } from 'react';
import { Plus, Play, Trash2, ArrowLeft, Check, BookOpen, Clock, Calendar, Trophy, Repeat, Dumbbell, Share2, Edit3, Info } from 'lucide-react';

import { useApp } from '../context/AppContext';
import type { Routine, WorkoutLog } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, isDistanceTimeExercise, isTimeOnlyExercise } from '../data/mockExercises';
import { ExerciseBrowserModal } from './ExerciseBrowserModal';
import { StoryCardModal } from './StoryCardModal';
import type { StoryCardData } from './StoryCardModal';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { EditWorkoutLogModal } from './EditWorkoutLogModal';

interface SelectedRoutineExercise {
  exerciseId: string;
  setsCount: number;
  restSeconds?: number;
  time?: number; // min for cardio, sec for isometric
  distance?: number; // km for cardio
}

export const RoutineManager: React.FC = () => {
  const {
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    startWorkout,
    workoutHistory,
    updateWorkoutLog,
    deleteWorkoutLog,
    customExercises
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedRoutineExercise[]>([]);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [storyData, setStoryData] = useState<StoryCardData | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Modals for exercise details & workout editing
  const [selectedDetailExerciseId, setSelectedDetailExerciseId] = useState<string | null>(null);
  const [editingWorkoutLog, setEditingWorkoutLog] = useState<WorkoutLog | null>(null);

  const allExercises = [...customExercises, ...mockExercises];

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  const formatWorkoutDate = (isoStr: string) => {
    const d = new Date(isoStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return `Oggi, ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return `Ieri, ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const hasPr = (log: WorkoutLog) => {
    return log.exercises.some(ex => ex.sets.some(s => s.is1RM || s.isMaxWeight || s.isMaxVolume || s.isMaxDistance || s.isMaxTime || s.isMaxReps));
  };

  const handleEditRoutine = (rot: Routine) => {
    setEditingRoutineId(rot.id);
    setNewRoutineName(rot.name);
    setNewRoutineDesc(rot.description || '');
    setSelectedExercises(rot.exercises.map(re => ({
      exerciseId: re.exerciseId,
      setsCount: re.defaultSets.length || 3,
      restSeconds: re.restSeconds || 90,
      time: re.defaultSets[0]?.time,
      distance: re.defaultSets[0]?.distance
    })));
    setIsCreating(true);
  };

  const handleSaveRoutine = () => {
    if (!newRoutineName.trim()) return;
    if (selectedExercises.length === 0) {
      alert('Aggiungi almeno un esercizio per salvare la routine!');
      return;
    }

    const builtExercises = selectedExercises.map(se => {
      const ex = allExercises.find(e => e.id === se.exerciseId);
      const restSeconds = se.restSeconds || 90;
      if (isDistanceTimeExercise(ex)) {
        return {
          exerciseId: se.exerciseId,
          restSeconds,
          defaultSets: [{ weight: 0, reps: 0, time: se.time || 20, distance: se.distance || 3.0 }]
        };
      } else if (isTimeOnlyExercise(ex)) {
        return {
          exerciseId: se.exerciseId,
          restSeconds,
          defaultSets: Array.from({ length: se.setsCount }, () => ({ weight: 0, reps: 0, time: se.time || 60 }))
        };
      }
      return {
        exerciseId: se.exerciseId,
        restSeconds,
        defaultSets: Array.from({ length: se.setsCount }, () => ({ weight: 0, reps: 10 }))
      };
    });

    if (editingRoutineId) {
      updateRoutine({
        id: editingRoutineId,
        name: newRoutineName.trim(),
        description: newRoutineDesc.trim(),
        exercises: builtExercises
      });
    } else {
      addRoutine({
        id: `rot-${Date.now()}`,
        name: newRoutineName.trim(),
        description: newRoutineDesc.trim(),
        exercises: builtExercises
      });
    }

    setIsCreating(false);
    setEditingRoutineId(null);
    setNewRoutineName('');
    setNewRoutineDesc('');
    setSelectedExercises([]);
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    const exists = selectedExercises.find(se => se.exerciseId === exerciseId);
    if (exists) {
      setSelectedExercises(prev => prev.filter(se => se.exerciseId !== exerciseId));
    } else {
      const ex = allExercises.find(e => e.id === exerciseId);
      if (isDistanceTimeExercise(ex)) {
        setSelectedExercises(prev => [...prev, { exerciseId, setsCount: 1, restSeconds: 90, time: 20, distance: 3.0 }]);
      } else if (isTimeOnlyExercise(ex)) {
        setSelectedExercises(prev => [...prev, { exerciseId, setsCount: 3, restSeconds: 60, time: 60 }]);
      } else {
        setSelectedExercises(prev => [...prev, { exerciseId, setsCount: 3, restSeconds: 90 }]);
      }
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

  const updateExerciseRest = (exerciseId: string, seconds: number) => {
    setSelectedExercises(prev => prev.map(se => {
      if (se.exerciseId === exerciseId) {
        return { ...se, restSeconds: Math.max(10, seconds) };
      }
      return se;
    }));
  };

  const updateCardioTime = (exerciseId: string, time: number) => {
    setSelectedExercises(prev => prev.map(se => {
      if (se.exerciseId === exerciseId) {
        return { ...se, time: Math.max(1, time) };
      }
      return se;
    }));
  };

  const updateCardioDistance = (exerciseId: string, dist: number) => {
    setSelectedExercises(prev => prev.map(se => {
      if (se.exerciseId === exerciseId) {
        return { ...se, distance: Math.max(0.1, Math.round(dist * 10) / 10) };
      }
      return se;
    }));
  };

  const updateIsometricTime = (exerciseId: string, time: number) => {
    setSelectedExercises(prev => prev.map(se => {
      if (se.exerciseId === exerciseId) {
        return { ...se, time: Math.max(5, time) };
      }
      return se;
    }));
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(se => se.exerciseId !== exerciseId));
  };

  if (isCreating) {
    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="icon-btn"
            onClick={() => {
              setIsCreating(false);
              setEditingRoutineId(null);
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {editingRoutineId ? 'Modifica Scheda' : 'Nuova Routine'}
          </h2>
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

        {/* Selected Exercises List */}
        <div>
          <h3 className="section-title">Esercizi Inclusi</h3>
          
          {selectedExercises.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dark)' }}>
              Nessun esercizio aggiunto. Clicca sul pulsante qui sotto per selezionarli.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {selectedExercises.map(se => {
                const ex = allExercises.find(e => e.id === se.exerciseId);
                if (!ex) return null;
                
                return (
                  <div key={se.exerciseId} className="glass-card" style={{ padding: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => setSelectedDetailExerciseId(se.exerciseId)}
                        title="Clicca per visualizzare dettagli e video"
                      >
                        <div style={{ width: '36px', height: '36px' }}>
                          {renderMuscleIcon(ex.muscleGroup, 36, '#00a8ff')}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>{ex.name}</h4>
                            <Info size={13} color="#00a8ff" />
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {ex.muscleGroup} • {ex.equipment}
                          </span>
                        </div>
                      </div>
                      <button className="icon-btn" onClick={() => handleRemoveExercise(se.exerciseId)} style={{ color: 'var(--color-error)', width: '30px', height: '30px' }} title="Rimuovi">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {isDistanceTimeExercise(ex) ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tempo (min):</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <button className="rest-adjust-btn" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }} onClick={() => updateCardioTime(se.exerciseId, (se.time || 20) - 5)}>-5</button>
                            <input 
                              type="number" 
                              className="set-input" 
                              value={se.time || 20} 
                              onChange={e => updateCardioTime(se.exerciseId, parseInt(e.target.value) || 1)}
                              style={{ width: '45px', height: '26px', textAlign: 'center', fontSize: '0.78rem' }}
                            />
                            <button className="rest-adjust-btn" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }} onClick={() => updateCardioTime(se.exerciseId, (se.time || 20) + 5)}>+5</button>
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Distanza (km):</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <button className="rest-adjust-btn" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }} onClick={() => updateCardioDistance(se.exerciseId, (se.distance || 3.0) - 0.5)}>-0.5</button>
                            <input 
                              type="number" 
                              step="0.1"
                              className="set-input" 
                              value={se.distance || 3.0} 
                              onChange={e => updateCardioDistance(se.exerciseId, parseFloat(e.target.value) || 0.1)}
                              style={{ width: '45px', height: '26px', textAlign: 'center', fontSize: '0.78rem' }}
                            />
                            <button className="rest-adjust-btn" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }} onClick={() => updateCardioDistance(se.exerciseId, (se.distance || 3.0) + 0.5)}>+0.5</button>
                          </div>
                        </div>
                      </div>
                    ) : isTimeOnlyExercise(ex) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                        <div className="flex-between">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Numero di serie:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button className="rest-adjust-btn" style={{ width: '26px', height: '26px' }} onClick={() => updateSetsCount(se.exerciseId, se.setsCount - 1)}>-</button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{se.setsCount}</span>
                            <button className="rest-adjust-btn" style={{ width: '26px', height: '26px' }} onClick={() => updateSetsCount(se.exerciseId, se.setsCount + 1)}>+</button>
                          </div>
                        </div>
                        <div className="flex-between">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tempo tenuta (sec):</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button className="rest-adjust-btn" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }} onClick={() => updateIsometricTime(se.exerciseId, (se.time || 60) - 10)}>-10</button>
                            <input 
                              type="number" 
                              className="set-input" 
                              value={se.time || 60} 
                              onChange={e => updateIsometricTime(se.exerciseId, parseInt(e.target.value) || 5)}
                              style={{ width: '45px', height: '26px', textAlign: 'center', fontSize: '0.78rem' }}
                            />
                            <button className="rest-adjust-btn" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }} onClick={() => updateIsometricTime(se.exerciseId, (se.time || 60) + 10)}>+10</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Numero di serie:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button className="rest-adjust-btn" style={{ width: '26px', height: '26px' }} onClick={() => updateSetsCount(se.exerciseId, se.setsCount - 1)}>-</button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{se.setsCount}</span>
                          <button className="rest-adjust-btn" style={{ width: '26px', height: '26px' }} onClick={() => updateSetsCount(se.exerciseId, se.setsCount + 1)}>+</button>
                        </div>
                      </div>
                    )}

                    {/* Tempi di Recupero Personalizzabili */}
                    <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Tempo di recupero:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          className="rest-adjust-btn"
                          style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}
                          onClick={() => updateExerciseRest(se.exerciseId, (se.restSeconds || 90) - 15)}
                        >
                          -15
                        </button>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#00a8ff', minWidth: '42px', textAlign: 'center' }}>
                          {se.restSeconds || 90}s
                        </span>
                        <button
                          type="button"
                          className="rest-adjust-btn"
                          style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}
                          onClick={() => updateExerciseRest(se.exerciseId, (se.restSeconds || 90) + 15)}
                        >
                          +15
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Exercise Trigger Button */}
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setIsBrowserOpen(true)}
            style={{ width: '100%', border: '1px dashed var(--color-primary)', background: 'rgba(139, 92, 246, 0.02)', color: 'var(--color-primary)' }}
          >
            <Plus size={16} /> Aggiungi Esercizio
          </button>
        </div>

        <button className="btn-primary" onClick={handleSaveRoutine} style={{ marginTop: '10px' }}>
          <Check size={18} /> {editingRoutineId ? 'Aggiorna Scheda' : 'Salva Routine'}
        </button>

        {/* Modal Selection */}
        <ExerciseBrowserModal 
          isOpen={isBrowserOpen}
          onClose={() => setIsBrowserOpen(false)}
          onAddExercises={(ids) => {
            setSelectedExercises(ids.map(id => {
              const existing = selectedExercises.find(se => se.exerciseId === id);
              if (existing) return existing;
              const ex = allExercises.find(e => e.id === id);
              if (isDistanceTimeExercise(ex)) {
                return { exerciseId: id, setsCount: 1, restSeconds: 90, time: 20, distance: 3.0 };
              } else if (isTimeOnlyExercise(ex)) {
                return { exerciseId: id, setsCount: 3, restSeconds: 60, time: 60 };
              }
              return { exerciseId: id, setsCount: 3, restSeconds: 90 };
            }));
            setIsBrowserOpen(false);
          }}
          onSelectExercise={toggleExerciseSelection}
          selectedIds={selectedExercises.map(se => se.exerciseId)}
          isMultiSelect={true}
        />

        {/* Exercise Detail Modal */}
        <ExerciseDetailModal
          exerciseId={selectedDetailExerciseId}
          onClose={() => setSelectedDetailExerciseId(null)}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header with Actions */}
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Allenamento & Schede</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
            Avvia sessioni, gestisci routine e consulta i tuoi progressi.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn-secondary"
            onClick={() => setIsCatalogOpen(true)}
            style={{ padding: '8px 12px', fontSize: '0.75rem', height: '34px', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Sfoglia catalogo oltre 100 esercizi"
          >
            <BookOpen size={14} /> Catalogo
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingRoutineId(null);
              setNewRoutineName('');
              setNewRoutineDesc('');
              setSelectedExercises([]);
              setIsCreating(true);
            }}
            style={{ padding: '8px 14px', fontSize: '0.75rem', height: '34px' }}
          >
            <Plus size={15} /> Nuova
          </button>
        </div>
      </div>

      {/* Quick Start / Free Workout */}
      <div 
        className="glass-card animate-glow" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 10, 12, 0.95) 100%)', 
          border: '1px solid var(--border-color)', 
          borderLeft: '4px solid var(--color-primary)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-primary)', fontWeight: 700 }}>
              Sessione Libera
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
            Allenamento Libero
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
            Inizia subito senza scheda preimpostata e aggiungi esercizi al volo.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => startWorkout()}
          style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', padding: 0, flexShrink: 0 }}
          title="Inizia sessione libera"
        >
          <Play size={18} fill="black" style={{ marginLeft: '3px' }} />
        </button>
      </div>

      {/* Routines List ("Le Mie Schede") */}
      <div>
        <div className="flex-between" style={{ marginBottom: '10px' }}>
          <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Dumbbell size={16} color="var(--color-primary)" /> Le mie Schede
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {routines.length} salvate
          </span>
        </div>

        {routines.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <p style={{ margin: 0 }}>Nessuna scheda creata.</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '4px', margin: 0 }}>
              Tocca "Nuova" per creare la tua prima scheda personalizzata con serie e ripetizioni!
            </p>
          </div>
        ) : (
          <div className="routine-list">
            {routines.map(rot => (
              <div key={rot.id} className="glass-card routine-card" style={{ cursor: 'pointer' }}>
                <div className="routine-info" style={{ flex: 1 }} onClick={() => handleEditRoutine(rot)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ margin: 0 }}>{rot.name}</h4>
                    <span style={{ fontSize: '0.68rem', color: '#00a8ff', opacity: 0.8 }}>(Tocca per modificare)</span>
                  </div>
                  {rot.description && <p style={{ marginTop: '3px' }}>{rot.description}</p>}
                  
                  {/* Exercises badges inside routine card */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {rot.exercises.map(ex => {
                      const exerciseDef = allExercises.find(m => m.id === ex.exerciseId);
                      return (
                        <span
                          key={ex.exerciseId}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailExerciseId(ex.exerciseId);
                          }}
                          style={{
                            fontSize: '0.68rem',
                            padding: '3px 8px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '6px',
                            color: '#e2e8f0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Vedi scheda dettagliata esercizio"
                        >
                          {exerciseDef ? exerciseDef.name : 'Esercizio'}
                          {ex.restSeconds && (
                            <span style={{ color: '#00a8ff', fontSize: '0.62rem' }}>({ex.restSeconds}s)</span>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginTop: '6px' }}>
                    {rot.exercises.length} esercizi • {rot.exercises.reduce((sum, e) => sum + e.defaultSets.length, 0)} serie totali
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="icon-btn"
                    onClick={() => handleEditRoutine(rot)}
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#38bdf8' }}
                    title="Modifica scheda completa"
                  >
                    <Edit3 size={15} />
                  </button>
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

      {/* Recent Workout History Section */}
      <div>
        <div className="flex-between" style={{ marginBottom: '10px' }}>
          <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="var(--color-primary)" /> Cronologia Allenamenti
          </h3>
          {workoutHistory.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {workoutHistory.length} totali
            </span>
          )}
        </div>

        {workoutHistory.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <p style={{ margin: 0 }}>Nessun allenamento registrato.</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '4px', margin: 0 }}>
              I tuoi allenamenti completati appariranno qui con statistiche, volumi e record personali (PR).
            </p>
          </div>
        ) : (
          <div className="history-list-desktop" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...workoutHistory]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map(log => {
                const totalCompletedSets = log.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
                const cardioKm = log.exercises.reduce((sum, ex) => {
                  const exDef = allExercises.find(m => m.id === ex.exerciseId);
                  if (isDistanceTimeExercise(exDef)) {
                    return sum + ex.sets.filter(s => s.completed).reduce((sSum, s) => sSum + (s.distance || 0), 0);
                  }
                  return sum;
                }, 0);
                const isPr = hasPr(log);

                return (
                  <div key={log.id} className="workout-history-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'white', margin: 0 }}>
                          {log.name}
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                          <Calendar size={12} /> {formatWorkoutDate(log.date)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isPr && (
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(212, 175, 55, 0.15)',
                            color: 'var(--color-primary)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0
                          }}>
                            <Trophy size={11} /> PR Raggiunto
                          </span>
                        )}
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => {
                            if (window.confirm(`Vuoi davvero eliminare l'allenamento "${log.name}"?`)) {
                              deleteWorkoutLog(log.id);
                            }
                          }}
                          style={{ width: '28px', height: '28px', color: '#ef4444' }}
                          title="Elimina dalla cronologia"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ⏱ {formatDuration(log.duration)}
                      </span>
                      {log.volume > 0 && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-primary)',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          🏋️ {log.volume.toLocaleString('it-IT')} kg
                        </span>
                      )}
                      {cardioKm > 0 && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          background: 'rgba(16, 185, 129, 0.08)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#34d399',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          🏃 {cardioKm.toFixed(1)} km
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-muted)'
                      }}>
                        {totalCompletedSets} {cardioKm > 0 && log.volume === 0 ? 'sessioni' : 'serie'} • {log.exercises.length} es.
                      </span>
                    </div>

                    {/* Exercise names snippet with click for details */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                      {log.exercises.map(ex => {
                        const exerciseDef = allExercises.find(m => m.id === ex.exerciseId);
                        return (
                          <span
                            key={ex.exerciseId}
                            onClick={() => setSelectedDetailExerciseId(ex.exerciseId)}
                            style={{
                              fontSize: '0.65rem',
                              padding: '2px 6px',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              borderRadius: '4px',
                              color: '#94a3b8',
                              cursor: 'pointer'
                            }}
                            title="Tocca per vedere scheda e cronologia esercizio"
                          >
                            {exerciseDef ? exerciseDef.name : 'Esercizio'}
                          </span>
                        );
                      })}
                    </div>

                    {/* Action buttons row */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setEditingWorkoutLog(log)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.72rem',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          borderColor: 'rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8'
                        }}
                        title="Modifica pesi, serie o ripetizioni di questo allenamento"
                      >
                        <Edit3 size={13} /> Modifica
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => startWorkout(undefined, log)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.72rem',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Avvia una nuova sessione con gli stessi esercizi"
                      >
                        <Repeat size={13} /> Ripeti Allenamento
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setStoryData({
                            workoutName: log.name,
                            duration: formatDuration(log.duration),
                            totalVolume: log.volume,
                            totalSets: totalCompletedSets,
                            exercisesCount: log.exercises.length,
                            recordsCount: isPr ? 1 : 0,
                            date: new Date(log.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
                          });
                          setIsStoryModalOpen(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.72rem',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          borderColor: 'rgba(212, 175, 55, 0.4)',
                          color: 'var(--color-primary)'
                        }}
                        title="Crea card verticale per Instagram Stories"
                      >
                        <Share2 size={13} /> Condividi Story
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Catalog Modal */}
      <ExerciseBrowserModal 
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectExercise={() => {}}
        selectedIds={[]}
        isMultiSelect={false}
      />

      {/* Luxury Story Card Modal */}
      <StoryCardModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        data={storyData}
      />

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exerciseId={selectedDetailExerciseId}
        onClose={() => setSelectedDetailExerciseId(null)}
      />

      {/* Edit Workout Log Modal */}
      <EditWorkoutLogModal
        workoutLog={editingWorkoutLog}
        isOpen={!!editingWorkoutLog}
        onClose={() => setEditingWorkoutLog(null)}
        onSave={updateWorkoutLog}
      />
    </div>
  );
};
