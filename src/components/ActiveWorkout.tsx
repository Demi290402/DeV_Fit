import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash, Check, Clock, X, ChevronDown, Disc, Dumbbell } from 'lucide-react';

import { useApp } from '../context/AppContext';
import type { SetLog } from '../context/AppContext';
import { mockExercises, renderMuscleIcon } from '../data/mockExercises';
import { ExerciseBrowserModal } from './ExerciseBrowserModal';
import { PlateAndOneRepModal } from './PlateAndOneRepModal';

export const ActiveWorkout: React.FC = () => {
  const {
    activeWorkout,
    updateActiveWorkoutSet,
    updateActiveWorkoutExercises,
    toggleCompleteSet,
    addExerciseToActiveWorkout,
    addExercisesToActiveWorkout,
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

  // Plate / 1RM Modal State
  const [showPlateModal, setShowPlateModal] = useState(false);
  const [plateModalInitialWeight, setPlateModalInitialWeight] = useState(60);
  const [plateModalInitialReps, setPlateModalInitialReps] = useState(8);
  const [activeTargetSet, setActiveTargetSet] = useState<{ exId: string; setIdx: number } | null>(null);

  // Web Audio synthetic beeper
  const playAudioTone = (freq: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context blocked by browser autoplay policy
    }
  };

  const playCompletionSound = () => {
    playAudioTone(587.33, 0.12); // D5
    setTimeout(() => playAudioTone(880, 0.3), 120); // A5
  };

  // Active workout duration timer
  useEffect(() => {
    if (!activeWorkout || !activeWorkout.startTime) return;
    
    // Set initial elapsed
    setElapsedTime(Math.round((Date.now() - activeWorkout.startTime) / 1000));

    const interval = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - activeWorkout.startTime!) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout?.startTime]);

  // Rest timer interval logic with Audio & Haptic Feedback
  useEffect(() => {
    if (restTimeLeft !== null) {
      if (restTimeLeft > 0) {
        // Countdown beeps in last 3 seconds
        if (restTimeLeft <= 3 && restTimeLeft >= 1) {
          playAudioTone(440 + (3 - restTimeLeft) * 110, 0.08);
          if (navigator.vibrate) navigator.vibrate(60);
        }

        restTimerRef.current = setTimeout(() => {
          setRestTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else {
        // Timer completed!
        setRestTimeLeft(null);
        playCompletionSound();
        if (navigator.vibrate) navigator.vibrate([250, 100, 250, 100, 400]);
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
    if (m === 0) return `${s}s`;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
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
    const currentEx = activeWorkout.exercises.find(e => e.exerciseId === exId);
    if (!currentEx) return;
    const lastSet = currentEx.sets[currentEx.sets.length - 1];
    const newSet: SetLog = {
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      completed: false
    };
    updateActiveWorkoutExercises(prev =>
      prev.map(e => e.exerciseId === exId ? { ...e, sets: [...e.sets, newSet] } : e)
    );
  };

  const handleRemoveSet = (exId: string, setIdx: number) => {
    const currentEx = activeWorkout.exercises.find(e => e.exerciseId === exId);
    if (!currentEx || currentEx.sets.length <= 1) return;
    updateActiveWorkoutExercises(prev =>
      prev.map(e => e.exerciseId === exId
        ? { ...e, sets: e.sets.filter((_, idx) => idx !== setIdx) }
        : e
      )
    );
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

  // Calculate total completed sets
  const completedSetsCount = activeWorkout.exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter(s => s.completed).length;
  }, 0);

  // Determine which muscle groups are involved in this workout
  const activeMuscles = Array.from(
    new Set(
      activeWorkout.exercises
        .map(ex => mockExercises.find(e => e.id === ex.exerciseId)?.muscleGroup)
        .filter(Boolean) as string[]
    )
  );

  // Memoize previous performances per exercise to avoid expensive O(N*M) lookups on every 1-second timer tick
  const prevPerformancesMap = useMemo(() => {
    const map: Record<string, { weight: number; reps: number }[]> = {};
    if (!activeWorkout) return map;
    activeWorkout.exercises.forEach(e => {
      map[e.exerciseId] = getPreviousPerformances(e.exerciseId);
    });
    return map;
  }, [activeWorkout?.exercises.map(e => e.exerciseId).join(','), workoutHistory]);

  // Render front and back mini anatomical mannequins (Hevy screenshot 5 style)
  const renderDuoMannequins = () => {
    const baseColor = '#2b2c37';
    const activeColor = '#00a8ff'; // vivid cyan

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Front silhouette */}
        <svg viewBox="0 0 100 100" width="34" height="42">
          {/* Head & Neck */}
          <ellipse cx="50" cy="14" rx="7" ry="8" fill={baseColor} />
          <path d="M46 21 H54 V25 H46 Z" fill={baseColor} />
          {/* Deltoids */}
          <path d="M33 25 C27 26 24 31 25 35 C28 35 32 33 34 28 Z" fill={activeMuscles.includes('Spalle') ? activeColor : baseColor} />
          <path d="M67 25 C73 26 76 31 75 35 C72 35 68 33 66 28 Z" fill={activeMuscles.includes('Spalle') ? activeColor : baseColor} />
          {/* Chest */}
          <path d="M36 26 C43 25 48 26 49 32 C49 37 41 37 36 33 Z" fill={activeMuscles.includes('Pettorali') ? activeColor : baseColor} />
          <path d="M64 26 C57 25 52 26 51 32 C51 37 59 37 64 33 Z" fill={activeMuscles.includes('Pettorali') ? activeColor : baseColor} />
          {/* Biceps */}
          <path d="M25 34 C23 38 23 44 26 48 C28 48 29 43 29 36 Z" fill={activeMuscles.includes('Bicipiti') ? activeColor : baseColor} />
          <path d="M75 34 C77 38 77 44 74 48 C72 48 71 43 71 36 Z" fill={activeMuscles.includes('Bicipiti') ? activeColor : baseColor} />
          {/* Abs */}
          <rect x="44" y="34" width="12" height="15" rx="2" fill={activeMuscles.includes('Addominali') ? activeColor : baseColor} />
          {/* Quads */}
          <path d="M37 57 C44 57 47 60 46 76 C41 76 37 71 37 57 Z" fill={activeMuscles.includes('Quadricipiti') ? activeColor : baseColor} />
          <path d="M63 57 C56 57 53 60 54 76 C59 76 63 71 63 57 Z" fill={activeMuscles.includes('Quadricipiti') ? activeColor : baseColor} />
          {/* Calves front */}
          <path d="M39 78 C44 79 45 85 43 94 C40 94 39 88 39 78 Z" fill={activeMuscles.includes('Polpacci') ? activeColor : baseColor} />
          <path d="M61 78 C56 79 55 85 57 94 C60 94 61 88 61 78 Z" fill={activeMuscles.includes('Polpacci') ? activeColor : baseColor} />
        </svg>

        {/* Back silhouette */}
        <svg viewBox="0 0 100 100" width="34" height="42">
          {/* Head & Neck */}
          <ellipse cx="50" cy="14" rx="7" ry="8" fill={baseColor} />
          <path d="M46 21 H54 V26 H46 Z" fill={baseColor} />
          {/* Traps */}
          <path d="M45 22 L55 22 L62 28 L50 38 L38 28 Z" fill={activeMuscles.includes('Trapezi') ? activeColor : baseColor} />
          {/* Lats */}
          <path d="M37 29 C40 33 41 44 45 49 C46 44 47 38 49 35 C43 32 39 30 37 29 Z" fill={activeMuscles.includes('Dorsali') ? activeColor : baseColor} />
          <path d="M63 29 C60 33 59 44 55 49 C54 44 53 38 51 35 C57 32 61 30 63 29 Z" fill={activeMuscles.includes('Dorsali') ? activeColor : baseColor} />
          {/* Triceps */}
          <path d="M25 35 C23 40 23 46 25 51 C27 51 29 46 29 37 Z" fill={activeMuscles.includes('Tricipiti') ? activeColor : baseColor} />
          <path d="M75 35 C77 40 77 46 75 51 C73 51 71 46 71 37 Z" fill={activeMuscles.includes('Tricipiti') ? activeColor : baseColor} />
          {/* Lower Back */}
          <path d="M45 47 H55 V55 H45 Z" fill={activeMuscles.includes('Lombari') ? activeColor : baseColor} />
          {/* Glutes */}
          <path d="M37 56 C37 54 48 54 49 56 C50 63 47 68 39 67 Z" fill={activeMuscles.includes('Glutei') ? activeColor : baseColor} />
          <path d="M63 56 C63 54 52 54 51 56 C50 63 53 68 61 67 Z" fill={activeMuscles.includes('Glutei') ? activeColor : baseColor} />
          {/* Hamstrings */}
          <path d="M38 68 C45 68 47 70 46 81 C41 81 38 78 38 68 Z" fill={activeMuscles.includes('Femorali') ? activeColor : baseColor} />
          <path d="M62 68 C55 68 53 70 54 81 C59 81 62 78 62 68 Z" fill={activeMuscles.includes('Femorali') ? activeColor : baseColor} />
          {/* Calves back */}
          <path d="M39 82 C44 83 45 88 44 94 C41 94 40 90 39 82 Z" fill={activeMuscles.includes('Polpacci') ? activeColor : baseColor} />
          <path d="M61 82 C56 83 55 88 56 94 C59 94 60 90 61 82 Z" fill={activeMuscles.includes('Polpacci') ? activeColor : baseColor} />
        </svg>
      </div>
    );
  };

  const restCircumference = 2 * Math.PI * 20; // radius 20
  const restProgress = restTimeLeft !== null ? (restTimeLeft / restTimeTotal) * 100 : 0;
  const restStrokeOffset = restCircumference - (restProgress / 100) * restCircumference;

  // Render Exercise detail Drawer content
  const selectedExercise = mockExercises.find(e => e.id === selectedDetailExerciseId);
  const exerciseHistory = selectedDetailExerciseId
    ? workoutHistory.flatMap(log => {
        const match = log.exercises.find(e => e.exerciseId === selectedDetailExerciseId);
        if (match) {
          const maxWeight = Math.max(...match.sets.filter(s => s.completed).map(s => s.weight), 0);
          return maxWeight > 0 ? [{ date: log.date, weight: maxWeight }] : [];
        }
        return [];
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

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
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--color-primary)" stroke="#09090b" strokeWidth="2" />
              <text x={p.x} y={p.y - 10} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">{p.weight}kg</text>
              <text x={p.x} y={height - 2} fill="var(--text-dark)" fontSize="8" textAnchor="middle">{p.date}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '50px' }}>
      {/* 1. TOP BAR (Registra allenamento | Dischi / 1RM | Termina) */}
      <div 
        className="active-workout-top-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#121216',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronDown size={18} color="var(--text-muted)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'white' }}>
            {activeWorkout.name || 'Registra allenamento'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setPlateModalInitialWeight(60);
              setActiveTargetSet(null);
              setShowPlateModal(true);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-muted)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Calcolatore Dischi & 1RM"
          >
            <Disc size={17} />
          </button>

          <button
            type="button"
            onClick={() => saveActiveWorkout()}
            style={{
              background: 'linear-gradient(135deg, #0084ff 0%, #0066cc 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 132, 255, 0.35)'
            }}
          >
            Termina
          </button>
        </div>
      </div>

      {/* 2. SUBHEADER (Status + Live Stats Banner + Mini Mannequins) */}
      <div style={{
        background: '#131318',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '12px 16px',
        marginBottom: '20px'
      }}>
        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>Sessione attiva</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '22px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Durata</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#00a8ff', marginTop: '2px' }}>
                {formatTime(elapsedTime)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Volume</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', marginTop: '2px' }}>
                {getLiveVolume()} kg
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Serie</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', marginTop: '2px' }}>
                {completedSetsCount}
              </div>
            </div>
          </div>

          {/* Front & Back Mini Anatomical Mannequins */}
          {renderDuoMannequins()}
        </div>
      </div>

      {/* 3. WORKOUT BODY: EMPTY STATE OR EXERCISE LIST */}
      {activeWorkout.exercises.length === 0 ? (
        /* Empty State (Hevy screenshot 5 style) */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 16px 30px 16px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px'
          }}>
            <Dumbbell size={36} color="var(--text-muted, #94a3b8)" strokeWidth={1.5} />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: '0 0 6px 0' }}>
            Inizia
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted, #94a3b8)', margin: '0 0 26px 0', maxWidth: '280px', lineHeight: 1.4 }}>
            Aggiungi un esercizio per iniziare il tuo allenamento
          </p>

          <button
            type="button"
            onClick={() => setShowAddExercise(true)}
            style={{
              width: '100%',
              maxWidth: '360px',
              height: '50px',
              background: 'linear-gradient(135deg, #0084ff 0%, #0066cc 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.96rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 132, 255, 0.35)',
              marginBottom: '20px'
            }}
          >
            <Plus size={20} strokeWidth={3} />
            <span>Aggiungi esercizio</span>
          </button>

          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '360px' }}>
            <button
              type="button"
              onClick={() => setShowPlateModal(true)}
              style={{
                flex: 1,
                height: '42px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'white',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Disc size={14} />
              <span>Dischi / 1RM</span>
            </button>

            <button
              type="button"
              onClick={cancelActiveWorkout}
              style={{
                flex: 1,
                height: '42px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Abbandona l'allen...
            </button>
          </div>
        </div>
      ) : (
        /* Exercises Log List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeWorkout.exercises.map((exLog) => {
            const exDetail = mockExercises.find(e => e.id === exLog.exerciseId);
            if (!exDetail) return null;

            const prevSets = prevPerformancesMap[exLog.exerciseId] || [];

            return (
              <div key={exLog.exerciseId} className="glass-card exercise-log-card">
                <div className="flex-between exercise-header-clickable" onClick={() => setSelectedDetailExerciseId(exLog.exerciseId)}>
                  <div className="exercise-title-row">
                    <div className="exercise-icon" style={{ width: '42px', height: '42px', background: 'transparent', padding: 0 }}>
                      {renderMuscleIcon(exDetail.muscleGroup, 42, '#00a8ff')}
                    </div>

                    <div>
                      <h4 className="exercise-title">{exDetail.name}</h4>
                      <span className="exercise-meta">{exDetail.muscleGroup} • {exDetail.equipment}</span>
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
                            {prevSet ? `${prevSet.weight}kg x ${prevSet.reps}` : '—'}
                          </td>
                          <td>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                className="set-input"
                                value={set.weight || ''}
                                onChange={(e) => updateActiveWorkoutSet(exLog.exerciseId, idx, 'weight', parseFloat(e.target.value) || 0)}
                                disabled={set.completed}
                                style={{ paddingRight: set.completed ? '8px' : '22px' }}
                              />
                              {!set.completed && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPlateModalInitialWeight(set.weight || 60);
                                    setPlateModalInitialReps(set.reps || 8);
                                    setActiveTargetSet({ exId: exLog.exerciseId, setIdx: idx });
                                    setShowPlateModal(true);
                                  }}
                                  style={{
                                    position: 'absolute',
                                    right: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-primary, #d4af37)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    opacity: 0.8
                                  }}
                                  title="Calcola dischi per questo peso"
                                >
                                  <Disc size={11} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              inputMode="numeric"
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

          {/* Control Buttons when exercises present */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <button 
              className="btn-primary" 
              onClick={() => setShowAddExercise(true)}
              style={{
                background: 'linear-gradient(135deg, #0084ff 0%, #0066cc 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(0, 132, 255, 0.3)'
              }}
            >
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
        </div>
      )}

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
              <button className="rest-adjust-btn" onClick={() => adjustRestTime(30)}>+30s</button>
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

      {/* Plate Calculator and 1RM Modal */}
      <PlateAndOneRepModal
        isOpen={showPlateModal}
        onClose={() => {
          setShowPlateModal(false);
          setActiveTargetSet(null);
        }}
        initialWeight={plateModalInitialWeight}
        initialReps={plateModalInitialReps}
        onApplyWeight={(w) => {
          if (activeTargetSet) {
            updateActiveWorkoutSet(activeTargetSet.exId, activeTargetSet.setIdx, 'weight', w);
          }
        }}
      />

      {/* Add Exercise Modal (Single & Multi-Select with Floating Confirmation Bar) */}
      <ExerciseBrowserModal 
        isOpen={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onAddExercises={(ids) => {
          addExercisesToActiveWorkout(ids);
          setShowAddExercise(false);
        }}
        onSelectExercise={(id) => {
          addExerciseToActiveWorkout(id);
          setShowAddExercise(false);
        }}
        selectedIds={activeWorkout ? activeWorkout.exercises.map(e => e.exerciseId) : []}
        isMultiSelect={true}
      />

      {/* Exercise Details Drawer */}
      {selectedDetailExerciseId && selectedExercise && (
        <div className="drawer-backdrop" onClick={() => setSelectedDetailExerciseId(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px' }}>
                  {renderMuscleIcon(selectedExercise.muscleGroup, 40, '#00a8ff')}
                </div>
                <div>
                  <h3 className="section-title" style={{ marginBottom: '2px', fontSize: '1.05rem' }}>{selectedExercise.name}</h3>
                  <span className="recipe-type-tag tag-fit">{selectedExercise.muscleGroup} • {selectedExercise.equipment}</span>
                </div>
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
              <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: '#e2e8f0' }}>{selectedExercise.instructions}</p>
            </div>

            {/* Linear Load Chart */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-primary, #d4af37)', fontWeight: 700, marginBottom: '4px' }}>ANDAMENTO DEL CARICO MASSIMO</h4>
              {renderSvgChart()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
