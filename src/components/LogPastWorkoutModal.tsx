import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Calendar, Plus, Trash2, 
  Check, ChevronDown, Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { WorkoutLog, ExerciseLog, SetLog } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, isDistanceTimeExercise } from '../data/mockExercises';
import { calculateWorkoutCalories, calculatePace } from '../utils/calorieCalculator';
import { ExerciseBrowserModal } from './ExerciseBrowserModal';

interface LogPastWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogPastWorkoutModal: React.FC<LogPastWorkoutModalProps> = ({ isOpen, onClose }) => {
  const { 
    routines, 
    customExercises, 
    addPastWorkoutLog, 
    profile
  } = useApp();

  const allExercises = useMemo(() => [...customExercises, ...mockExercises], [customExercises]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Tab: 'routine' | 'custom' | 'running'
  const [activeTab, setActiveTab] = useState<'routine' | 'custom' | 'running'>('routine');

  // Common metadata
  const [workoutDate, setWorkoutDate] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [avgHeartRate, setAvgHeartRate] = useState<string>(''); // empty by default
  const [notes, setNotes] = useState('');

  // 1. ROUTINE MODE STATE
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(routines[0]?.id || '');
  const [routineCustomName, setRoutineCustomName] = useState('');
  const [routineExercises, setRoutineExercises] = useState<ExerciseLog[]>(() => {
    if (routines.length > 0) {
      return routines[0].exercises.map(re => ({
        exerciseId: re.exerciseId,
        restSeconds: re.restSeconds || 90,
        sets: re.defaultSets.map((ds, sIdx) => ({
          id: `set-rot-${Date.now()}-${sIdx}`,
          weight: ds.weight || 0,
          reps: ds.reps || 10,
          time: ds.time,
          distance: ds.distance,
          completed: true
        }))
      }));
    }
    return [];
  });

  // When changing selected routine
  const handleSelectRoutine = (rId: string) => {
    setSelectedRoutineId(rId);
    const rot = routines.find(r => r.id === rId);
    if (rot) {
      setRoutineCustomName(rot.name);
      setRoutineExercises(rot.exercises.map(re => ({
        exerciseId: re.exerciseId,
        restSeconds: re.restSeconds || 90,
        sets: re.defaultSets.map((ds, sIdx) => ({
          id: `set-rot-${Date.now()}-${sIdx}`,
          weight: ds.weight || 0,
          reps: ds.reps || 10,
          time: ds.time,
          distance: ds.distance,
          completed: true
        }))
      })));
    }
  };

  // 2. CUSTOM MODE STATE
  const [customWorkoutName, setCustomWorkoutName] = useState('Allenamento Libero');
  const [customExercisesList, setCustomExercisesList] = useState<ExerciseLog[]>([]);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  // 3. RUNNING MODE STATE
  const [runDistanceKm, setRunDistanceKm] = useState<string>('5.0');
  const [runMinutes, setRunMinutes] = useState<string>('27');
  const [runSeconds, setRunSeconds] = useState<string>('30');
  const [runElevation, setRunElevation] = useState<string>('35');

  // Computed pace for Running
  const runTotalSeconds = (parseInt(runMinutes) || 0) * 60 + (parseInt(runSeconds) || 0);
  const parsedRunDistance = parseFloat(runDistanceKm) || 0;
  const runningPaceInfo = useMemo(() => {
    return calculatePace(parsedRunDistance, runTotalSeconds);
  }, [parsedRunDistance, runTotalSeconds]);

  // Handle adding exercise in Custom mode
  const handleAddExercisesToCustom = (ids: string[]) => {
    const newExs: ExerciseLog[] = ids.map(id => {
      const exDetail = allExercises.find(e => e.id === id);
      const isCardio = isDistanceTimeExercise(exDetail);
      return {
        exerciseId: id,
        restSeconds: 90,
        sets: [
          {
            id: `set-c-${Date.now()}-1`,
            weight: isCardio ? 0 : 20,
            reps: isCardio ? 0 : 10,
            distance: isCardio ? 1.5 : undefined,
            time: isCardio ? 10 : undefined,
            completed: true
          }
        ]
      };
    });
    setCustomExercisesList(prev => [...prev, ...newExs]);
    setIsBrowserOpen(false);
  };

  // Set updates for Routine or Custom
  const updateExerciseSet = (
    mode: 'routine' | 'custom',
    exIdx: number,
    setIdx: number,
    field: 'weight' | 'reps' | 'time' | 'distance',
    val: number
  ) => {
    const setter = mode === 'routine' ? setRoutineExercises : setCustomExercisesList;
    setter(prev => prev.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      const updatedSets = ex.sets.map((s, sIdx) => {
        if (sIdx !== setIdx) return s;
        return { ...s, [field]: val };
      });
      return { ...ex, sets: updatedSets };
    }));
  };

  const addSetToExercise = (mode: 'routine' | 'custom', exIdx: number) => {
    const setter = mode === 'routine' ? setRoutineExercises : setCustomExercisesList;
    setter(prev => prev.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: SetLog = {
        id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        weight: lastSet ? lastSet.weight : 20,
        reps: lastSet ? lastSet.reps : 10,
        time: lastSet?.time,
        distance: lastSet?.distance,
        completed: true
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
  };

  const removeSetFromExercise = (mode: 'routine' | 'custom', exIdx: number, setIdx: number) => {
    const setter = mode === 'routine' ? setRoutineExercises : setCustomExercisesList;
    setter(prev => prev.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      if (ex.sets.length <= 1) return ex;
      return { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIdx) };
    }));
  };

  const removeExercise = (mode: 'routine' | 'custom', exIdx: number) => {
    const setter = mode === 'routine' ? setRoutineExercises : setCustomExercisesList;
    setter(prev => prev.filter((_, idx) => idx !== exIdx));
  };

  // Save past workout handler
  const handleSavePastWorkout = () => {
    const parsedHr = avgHeartRate ? parseInt(avgHeartRate) : undefined;
    const dateIso = new Date(workoutDate).toISOString();

    if (activeTab === 'running') {
      if (parsedRunDistance <= 0 || runTotalSeconds <= 0) {
        alert('Inserisci una distanza e una durata valide per la corsa.');
        return;
      }

      const runningCalories = calculateWorkoutCalories(
        { weightKg: profile.weight, gender: profile.gender },
        {
          durationSeconds: runTotalSeconds,
          activityType: 'running',
          distanceKm: parsedRunDistance,
          avgHeartRate: parsedHr
        }
      );

      const runLog: WorkoutLog = {
        id: `past-run-${Date.now()}`,
        name: 'Corsa Outdoor',
        date: dateIso,
        duration: runTotalSeconds,
        volume: 0,
        activityType: 'running',
        distanceKm: parsedRunDistance,
        elevationMeters: parseFloat(runElevation) || 0,
        pace: runningPaceInfo.paceString,
        notes: notes || undefined,
        avgHeartRate: parsedHr && parsedHr > 0 ? parsedHr : undefined,
        caloriesBurned: runningCalories,
        deviceSource: parsedHr ? 'Cardiofrequenzimetro' : undefined,
        exercises: [
          {
            exerciseId: 'ex-corsa-outdoor',
            sets: [
              {
                id: `s-run-${Date.now()}`,
                weight: 0,
                reps: 0,
                distance: parsedRunDistance,
                time: Math.round(runTotalSeconds / 60),
                completed: true
              }
            ]
          }
        ]
      };

      addPastWorkoutLog(runLog);
      onClose();
      return;
    }

    // Routine or Custom Resistance Workout
    const targetExercises = activeTab === 'routine' ? routineExercises : customExercisesList;
    const name = activeTab === 'routine' 
      ? (routineCustomName || routines.find(r => r.id === selectedRoutineId)?.name || 'Allenamento Passato')
      : (customWorkoutName || 'Allenamento Personalizzato');

    if (targetExercises.length === 0) {
      alert('Aggiungi almeno un esercizio al tuo allenamento.');
      return;
    }

    let totalVolume = 0;
    let completedSetsCount = 0;

    // Apply Single-Trophy Rule across each exercise
    const processedExercises: ExerciseLog[] = targetExercises.map(ex => {
      let max1RM = 0;
      let best1RMIdx = -1;
      let maxVol = 0;
      let bestVolIdx = -1;

      ex.sets.forEach((s, sIdx) => {
        if (!s.completed) return;
        completedSetsCount++;
        const vol = (s.weight || 0) * (s.reps || 0);
        totalVolume += vol;
        const oneRm = s.reps === 1 ? s.weight : s.weight * (1 + s.reps / 30);
        if (oneRm > max1RM) {
          max1RM = oneRm;
          best1RMIdx = sIdx;
        }
        if (vol > maxVol) {
          maxVol = vol;
          bestVolIdx = sIdx;
        }
      });

      return {
        ...ex,
        sets: ex.sets.map((s, sIdx) => ({
          ...s,
          is1RM: sIdx === best1RMIdx && best1RMIdx !== -1,
          isMaxVolume: sIdx === bestVolIdx && bestVolIdx !== -1
        }))
      };
    });

    const totalSeconds = durationMinutes * 60;
    const computedCalories = calculateWorkoutCalories(
      { weightKg: profile.weight, gender: profile.gender },
      {
        durationSeconds: totalSeconds,
        totalVolumeKg: totalVolume,
        completedSetsCount,
        activityType: 'strength',
        avgHeartRate: parsedHr
      }
    );

    const pastLog: WorkoutLog = {
      id: `past-log-${Date.now()}`,
      name,
      date: dateIso,
      duration: totalSeconds,
      volume: totalVolume,
      exercises: processedExercises,
      avgHeartRate: parsedHr && parsedHr > 0 ? parsedHr : undefined,
      caloriesBurned: computedCalories,
      deviceSource: parsedHr ? 'Cardiofrequenzimetro' : undefined,
      activityType: 'strength',
      notes: notes || undefined
    };

    addPastWorkoutLog(pastLog);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="modal-portal-backdrop" 
      onClick={onClose} 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="glass-card animate-scale-in" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxHeight: '90vh', 
          width: '100%',
          maxWidth: '580px', 
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '20px',
          background: '#121217',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(212, 175, 55, 0.15)'
        }}
      >
        {/* Sticky Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#16161c'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="var(--color-primary, #d4af37)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Registra Allenamento Passato
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '16px 20px 24px 20px', flex: 1 }}>

        {/* 3-Mode Segmented Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '18px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('routine')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: activeTab === 'routine' ? 'var(--color-primary, #d4af37)' : 'transparent',
              color: activeTab === 'routine' ? '#000000' : '#ffffff',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Da Routine
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: activeTab === 'custom' ? 'var(--color-primary, #d4af37)' : 'transparent',
              color: activeTab === 'custom' ? '#000000' : '#ffffff',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Personalizzato
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('running')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: activeTab === 'running' ? 'var(--color-primary, #d4af37)' : 'transparent',
              color: activeTab === 'running' ? '#000000' : '#ffffff',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Corsa
          </button>
        </div>

        {/* General Meta: Date & Time Picker */}
        <div className="glass-card" style={{ padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
              Data e Ora dell'Allenamento
            </label>
            <input
              type="datetime-local"
              className="set-input"
              value={workoutDate}
              onChange={e => setWorkoutDate(e.target.value)}
              style={{ width: '100%', height: '40px', padding: '0 10px', fontSize: '0.86rem' }}
            />
          </div>

          {activeTab !== 'running' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
                  Durata (minuti)
                </label>
                <input
                  type="number"
                  className="set-input"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', height: '40px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
                  Bpm Medi (Opzionale)
                </label>
                <input
                  type="number"
                  placeholder="Es. 125 (se misurato)"
                  className="set-input"
                  value={avgHeartRate}
                  onChange={e => setAvgHeartRate(e.target.value)}
                  style={{ width: '100%', height: '40px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= MODE 1: ROUTINE ================= */}
        {activeTab === 'routine' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="glass-card" style={{ padding: '14px' }}>
              <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '6px' }}>
                Seleziona Routine Salvata
              </label>
              {routines.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: '#ef4444', margin: 0 }}>
                  Nessuna routine salvata. Crea una routine o usa la modalità "Personalizzato".
                </p>
              ) : (
                <div style={{ position: 'relative' }}>
                  <select
                    className="set-input"
                    value={selectedRoutineId}
                    onChange={e => handleSelectRoutine(e.target.value)}
                    style={{ width: '100%', height: '42px', appearance: 'none', paddingRight: '30px' }}
                  >
                    {routines.map(r => (
                      <option key={r.id} value={r.id} style={{ background: '#18181b', color: '#ffffff' }}>
                        {r.name} ({r.exercises.length} esercizi)
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} color="#8e8e93" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
                </div>
              )}
            </div>

            {/* Exercise list for routine */}
            {routineExercises.map((ex, exIdx) => {
              const detail = allExercises.find(e => e.id === ex.exerciseId);
              return (
                <div key={ex.exerciseId} className="glass-card" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {detail && renderMuscleIcon(detail.muscleGroup, 26)}
                      <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                        {detail ? detail.name : 'Esercizio'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removeExercise('routine', exIdx)}
                      style={{ width: '28px', height: '28px', color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Sets table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ fontSize: '0.68rem', color: '#8e8e93' }}>
                        <th style={{ width: '30px', padding: '4px' }}>SET</th>
                        <th style={{ padding: '4px' }}>PESO (KG)</th>
                        <th style={{ padding: '4px' }}>REPS</th>
                        <th style={{ width: '30px', padding: '4px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((set, sIdx) => (
                        <tr key={sIdx}>
                          <td style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d4af37' }}>{sIdx + 1}</td>
                          <td style={{ padding: '3px 4px' }}>
                            <input
                              type="number"
                              className="set-input"
                              value={set.weight}
                              onChange={e => updateExerciseSet('routine', exIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)}
                              style={{ width: '100%', height: '34px', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ padding: '3px 4px' }}>
                            <input
                              type="number"
                              className="set-input"
                              value={set.reps}
                              onChange={e => updateExerciseSet('routine', exIdx, sIdx, 'reps', parseInt(e.target.value) || 0)}
                              style={{ width: '100%', height: '34px', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeSetFromExercise('routine', exIdx, sIdx)}
                              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    onClick={() => addSetToExercise('routine', exIdx)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'var(--color-primary, #d4af37)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '6px'
                    }}
                  >
                    + Aggiungi serie
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= MODE 2: CUSTOM ================= */}
        {activeTab === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="glass-card" style={{ padding: '14px' }}>
              <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
                Nome Allenamento
              </label>
              <input
                type="text"
                className="set-input"
                value={customWorkoutName}
                onChange={e => setCustomWorkoutName(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 10px', fontSize: '0.9rem' }}
              />
            </div>

            {customExercisesList.map((ex, exIdx) => {
              const detail = allExercises.find(e => e.id === ex.exerciseId);
              return (
                <div key={ex.exerciseId} className="glass-card" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {detail && renderMuscleIcon(detail.muscleGroup, 26)}
                      <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                        {detail ? detail.name : 'Esercizio'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removeExercise('custom', exIdx)}
                      style={{ width: '28px', height: '28px', color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ fontSize: '0.68rem', color: '#8e8e93' }}>
                        <th style={{ width: '30px', padding: '4px' }}>SET</th>
                        <th style={{ padding: '4px' }}>PESO (KG)</th>
                        <th style={{ padding: '4px' }}>REPS</th>
                        <th style={{ width: '30px', padding: '4px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((set, sIdx) => (
                        <tr key={sIdx}>
                          <td style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d4af37' }}>{sIdx + 1}</td>
                          <td style={{ padding: '3px 4px' }}>
                            <input
                              type="number"
                              className="set-input"
                              value={set.weight}
                              onChange={e => updateExerciseSet('custom', exIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)}
                              style={{ width: '100%', height: '34px', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ padding: '3px 4px' }}>
                            <input
                              type="number"
                              className="set-input"
                              value={set.reps}
                              onChange={e => updateExerciseSet('custom', exIdx, sIdx, 'reps', parseInt(e.target.value) || 0)}
                              style={{ width: '100%', height: '34px', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeSetFromExercise('custom', exIdx, sIdx)}
                              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    onClick={() => addSetToExercise('custom', exIdx)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'var(--color-primary, #d4af37)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '6px'
                    }}
                  >
                    + Aggiungi serie
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsBrowserOpen(true)}
              style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Plus size={18} />
              <span>Aggiungi Esercizi dal Catalogo</span>
            </button>
          </div>
        )}

        {/* ================= MODE 3: CORSA (RUNNING) ================= */}
        {activeTab === 'running' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <Compass size={22} color="var(--color-primary, #d4af37)" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Attività Corsa Outdoor</h4>
              </div>

              {/* Distance and Duration Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
                    Distanza (km)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="set-input"
                    value={runDistanceKm}
                    onChange={e => setRunDistanceKm(e.target.value)}
                    style={{ width: '100%', height: '42px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
                    Tempo (min : sec)
                  </label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      className="set-input"
                      value={runMinutes}
                      onChange={e => setRunMinutes(e.target.value)}
                      style={{ width: '100%', height: '42px', textAlign: 'center', fontWeight: 700 }}
                    />
                    <span style={{ color: '#8e8e93', fontWeight: 800 }}>:</span>
                    <input
                      type="number"
                      placeholder="Sec"
                      className="set-input"
                      value={runSeconds}
                      onChange={e => setRunSeconds(e.target.value)}
                      style={{ width: '100%', height: '42px', textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Pace Calculation Display Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '10px',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#8e8e93', textTransform: 'uppercase', display: 'block' }}>
                    Ritmo Medio (Pace)
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary, #d4af37)' }}>
                    {runningPaceInfo.paceString}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: '#8e8e93', textTransform: 'uppercase', display: 'block' }}>
                    Velocità Media
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    {runningPaceInfo.speedKmH} km/h
                  </span>
                </div>
              </div>

              {/* Elevation & Optional BPM */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
                    Dislivello (metri)
                  </label>
                  <input
                    type="number"
                    className="set-input"
                    value={runElevation}
                    onChange={e => setRunElevation(e.target.value)}
                    style={{ width: '100%', height: '40px', textAlign: 'center' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
                    Bpm medi (se misurati)
                  </label>
                  <input
                    type="number"
                    placeholder="Es. 152"
                    className="set-input"
                    value={avgHeartRate}
                    onChange={e => setAvgHeartRate(e.target.value)}
                    style={{ width: '100%', height: '40px', textAlign: 'center' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optional Notes */}
        <div className="glass-card" style={{ padding: '14px', marginTop: '14px' }}>
          <label style={{ fontSize: '0.74rem', color: '#8e8e93', display: 'block', marginBottom: '4px' }}>
            Note sull'allenamento (Opzionale)
          </label>
          <textarea
            className="set-input"
            rows={2}
            placeholder="Come ti sei sentito? Note su carichi, meteo o sensazioni..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', height: 'auto', resize: 'none' }}
          />
        </div>

        {/* Save Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={handleSavePastWorkout}
          style={{ width: '100%', padding: '14px', fontSize: '0.96rem', marginTop: '20px' }}
        >
          <Check size={18} /> Salva Allenamento nella Cronologia
        </button>

        {/* Exercise Browser Modal for Custom Mode */}
        {isBrowserOpen && (
          <ExerciseBrowserModal
            isOpen={isBrowserOpen}
            onClose={() => setIsBrowserOpen(false)}
            onSelectExercise={(id) => handleAddExercisesToCustom([id])}
            isMultiSelect={false}
          />
        )}
        </div>
      </div>
    </div>,
    document.body
  );
};
