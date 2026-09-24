import React, { useState } from 'react';
import { 
  Plus, Trash2, ArrowLeft, Check, Clock, Calendar, 
  Trophy, Repeat, Share2, Edit3, Info, ChevronDown, 
  RotateCw, MoreHorizontal, FileText, Search, FolderPlus 
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import type { Routine, WorkoutLog } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, isDistanceTimeExercise, isTimeOnlyExercise } from '../data/mockExercises';
import { ExerciseBrowserModal } from './ExerciseBrowserModal';
import { StoryCardModal } from './StoryCardModal';
import type { StoryCardData } from './StoryCardModal';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { EditWorkoutLogModal } from './EditWorkoutLogModal';
import { RoutineDetailView } from './RoutineDetailView';
import { RoutineBottomSheetModal } from './RoutineBottomSheetModal';
import { LogPastWorkoutModal } from './LogPastWorkoutModal';

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
    customExercises,
    syncAllDataFromCloud
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

  // Hevy Screen Navigation & Context Menu states
  const [selectedDetailRoutine, setSelectedDetailRoutine] = useState<Routine | null>(null);
  const [menuRoutine, setMenuRoutine] = useState<Routine | null>(null);
  const [isRoutinesExpanded, setIsRoutinesExpanded] = useState(true);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Modals for exercise details & workout editing
  const [selectedDetailExerciseId, setSelectedDetailExerciseId] = useState<string | null>(null);
  const [editingWorkoutLog, setEditingWorkoutLog] = useState<WorkoutLog | null>(null);
  const [isLogPastModalOpen, setIsLogPastModalOpen] = useState(false);

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
    setSelectedDetailRoutine(null);
    setMenuRoutine(null);
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

  const handleDuplicateRoutine = (rot: Routine) => {
    const cloned: Routine = {
      id: `rot-${Date.now()}`,
      name: `${rot.name} (Copia)`,
      description: rot.description || '',
      exercises: JSON.parse(JSON.stringify(rot.exercises))
    };
    addRoutine(cloned);
    setMenuRoutine(null);
    setSyncNotice(`Routine "${cloned.name}" duplicata con successo!`);
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const handleDeleteRoutine = (rot: Routine) => {
    if (window.confirm(`Sei sicuro di voler eliminare la routine "${rot.name}"?`)) {
      deleteRoutine(rot.id);
      if (selectedDetailRoutine?.id === rot.id) {
        setSelectedDetailRoutine(null);
      }
      setMenuRoutine(null);
    }
  };

  const handleShareRoutine = async (rot: Routine) => {
    const exercisesText = rot.exercises
      .map(e => allExercises.find(m => m.id === e.exerciseId)?.name)
      .filter(Boolean)
      .join(', ');
    const shareText = `Ecco la mia scheda "${rot.name}" su DeV Fit:\n${exercisesText}\nAllenati con me su ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Scheda ${rot.name} - DeV Fit`,
          text: shareText,
          url: window.location.origin
        });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setSyncNotice('Link e dettagli della scheda copiati negli appunti!');
      setTimeout(() => setSyncNotice(null), 3000);
    } catch {
      alert(`Condividi questa scheda:\n${shareText}`);
    }
  };

  const handleSyncCloud = async () => {
    if (isSyncingCloud) return;
    setIsSyncingCloud(true);
    const res = await syncAllDataFromCloud();
    setIsSyncingCloud(false);
    setSyncNotice(res.message);
    setTimeout(() => setSyncNotice(null), 3500);
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
                          {renderMuscleIcon(ex.muscleGroup, 36, '#d4af37')}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>{ex.name}</h4>
                            <Info size={13} color="var(--color-primary, #d4af37)" />
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
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary, #d4af37)', minWidth: '42px', textAlign: 'center' }}>
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

  if (selectedDetailRoutine) {
    return (
      <>
        <RoutineDetailView
          routine={selectedDetailRoutine}
          onBack={() => setSelectedDetailRoutine(null)}
          onStartRoutine={(rot) => startWorkout(rot.id)}
          onEditRoutine={(rot) => handleEditRoutine(rot)}
          onOpenMenu={(rot) => setMenuRoutine(rot)}
          onSelectExerciseDetail={(exId) => setSelectedDetailExerciseId(exId)}
        />
        <RoutineBottomSheetModal
          routine={menuRoutine}
          isOpen={!!menuRoutine}
          onClose={() => setMenuRoutine(null)}
          onShare={handleShareRoutine}
          onDuplicate={handleDuplicateRoutine}
          onEdit={handleEditRoutine}
          onDelete={handleDeleteRoutine}
        />
        <ExerciseDetailModal
          exerciseId={selectedDetailExerciseId}
          onClose={() => setSelectedDetailExerciseId(null)}
        />
      </>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>
      
      {/* Hevy Top Bar: "Allenamento ∨" + Sync + PRO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0 6px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
            Allenamento
          </h1>
          <ChevronDown size={18} color="#8e8e93" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleSyncCloud}
            style={{
              background: 'none',
              border: 'none',
              color: isSyncingCloud ? 'var(--color-primary)' : '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Sincronizza con Cloud Supabase"
          >
            <RotateCw size={19} className={isSyncingCloud ? 'animate-spin' : ''} />
          </button>
          
          <div
            style={{
              background: 'var(--color-primary)',
              color: '#000000',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '99px',
              letterSpacing: '0.4px',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
            }}
          >
            PRO
          </div>
        </div>
      </div>

      {/* Sync Feedback Toast Banner */}
      {syncNotice && (
        <div
          style={{
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: 'var(--color-secondary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚡</span>
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Quick Start Empty Workout & Log Past Workout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '4px 0 10px 0' }}>
        <button
          type="button"
          className="hevy-quick-action"
          onClick={() => startWorkout()}
          style={{ height: '48px', margin: 0, justifyContent: 'center' }}
        >
          <Plus size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Nuovo Vuoto</span>
        </button>

        <button
          type="button"
          className="hevy-quick-action"
          onClick={() => setIsLogPastModalOpen(true)}
          style={{ height: '48px', margin: 0, justifyContent: 'center' }}
        >
          <Calendar size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>Registra Passato</span>
        </button>
      </div>

      {/* "Routine" Section Header & Quick Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Routine
          </h2>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', padding: '4px' }}
            title="Nuova cartella"
            onClick={() => {
              setEditingRoutineId(null);
              setNewRoutineName('');
              setNewRoutineDesc('');
              setSelectedExercises([]);
              setIsCreating(true);
            }}
          >
            <FolderPlus size={20} />
          </button>
        </div>

        {/* Two side-by-side action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            className="hevy-quick-action"
            onClick={() => {
              setEditingRoutineId(null);
              setNewRoutineName('');
              setNewRoutineDesc('');
              setSelectedExercises([]);
              setIsCreating(true);
            }}
            style={{ height: '46px' }}
          >
            <FileText size={18} color="#ffffff" />
            <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Nuova routine</span>
          </button>

          <button
            type="button"
            className="hevy-quick-action"
            onClick={() => setIsCatalogOpen(true)}
            style={{ height: '46px' }}
          >
            <Search size={18} color="#ffffff" />
            <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Esplora</span>
          </button>
        </div>

        {/* Collapsible Group Header: "▼ Le mie routine (X)" */}
        <div
          onClick={() => setIsRoutinesExpanded(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#8e8e93',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 0',
            userSelect: 'none'
          }}
        >
          <ChevronDown
            size={14}
            style={{
              transform: isRoutinesExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease'
            }}
          />
          <span>Le mie routine ({routines.length})</span>
        </div>

        {/* Routine Cards List */}
        {isRoutinesExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {routines.length === 0 ? (
              <div className="hevy-card" style={{ textAlign: 'center', padding: '24px', color: '#8e8e93', fontSize: '0.82rem' }}>
                <p style={{ margin: 0 }}>Nessuna routine salvata.</p>
                <p style={{ fontSize: '0.74rem', color: '#71717a', marginTop: '4px', margin: 0 }}>
                  Tocca "Nuova routine" per comporre la tua prima scheda con tempi di recupero e serie!
                </p>
              </div>
            ) : (
              routines.map(rot => {
                const exerciseSnippet = rot.exercises
                  .map(re => allExercises.find(e => e.id === re.exerciseId)?.name || 'Esercizio')
                  .join(', ');

                return (
                  <div
                    key={rot.id}
                    className="hevy-card"
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                    onClick={() => setSelectedDetailRoutine(rot)}
                  >
                    {/* Card Header: Routine Title + Three dots */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                        {rot.name}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuRoutine(rot);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#8e8e93',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Opzioni routine"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>

                    {/* Truncated Exercise preview snippet */}
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#8e8e93',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.4
                      }}
                    >
                      {exerciseSnippet || 'Nessun esercizio'}
                    </p>

                    {/* Big Solid Gold CTA Button: "Avvia la Routine" */}
                    <button
                      type="button"
                      className="hevy-cta-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startWorkout(rot.id);
                      }}
                      style={{
                        width: '100%',
                        height: '42px',
                        marginTop: '8px',
                        fontSize: '0.92rem'
                      }}
                    >
                      Avvia la Routine
                    </button>
                  </div>
                );
              })
            )}
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

      {/* Routine Bottom Sheet Menu Modal */}
      <RoutineBottomSheetModal
        routine={menuRoutine}
        isOpen={!!menuRoutine}
        onClose={() => setMenuRoutine(null)}
        onShare={handleShareRoutine}
        onDuplicate={handleDuplicateRoutine}
        onEdit={handleEditRoutine}
        onDelete={handleDeleteRoutine}
      />

      {/* Log Past Workout Modal */}
      <LogPastWorkoutModal
        isOpen={isLogPastModalOpen}
        onClose={() => setIsLogPastModalOpen(false)}
      />
    </div>
  );
};
