import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Check, Clock, X, ChevronDown, Disc, Dumbbell, MoreVertical, Info, ArrowLeftRight, Trash2, Heart, Bluetooth, Watch } from 'lucide-react';

import { useApp } from '../context/AppContext';
import type { SetLog } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, isDistanceTimeExercise, isTimeOnlyExercise, isPlateLoadedExercise } from '../data/mockExercises';
import { ExerciseBrowserModal } from './ExerciseBrowserModal';
import { PlateAndOneRepModal } from './PlateAndOneRepModal';
import { SwipeableSetRow } from './SwipeableSetRow';
import { ExerciseDetailModal } from './ExerciseDetailModal';

export const ActiveWorkout: React.FC = () => {
  const {
    activeWorkout,
    updateActiveWorkoutSet,
    updateActiveWorkoutExercises,
    updateActiveWorkoutExerciseRest,
    customExercises,
    toggleCompleteSet,
    addExerciseToActiveWorkout,
    addExercisesToActiveWorkout,
    saveActiveWorkout,
    cancelActiveWorkout,
    workoutHistory,
    getPreviousPerformances
  } = useApp();

  const allExercises = useMemo(() => [...customExercises, ...mockExercises], [customExercises]);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedDetailExerciseId, setSelectedDetailExerciseId] = useState<string | null>(null);
  
  // Exercise Action Menu (3-dots bottom sheet)
  const [activeExerciseMenuId, setActiveExerciseMenuId] = useState<string | null>(null);
  // Exercise Replacement Mode
  const [replacingExerciseId, setReplacingExerciseId] = useState<string | null>(null);
  // Rest Picker inline popover
  const [restPickerExId, setRestPickerExId] = useState<string | null>(null);

  // Rest Timer State
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [restTimeTotal, setRestTimeTotal] = useState<number>(90); // default 90s
  const restTimerRef = useRef<any>(null);

  // Plate / 1RM Modal State
  const [showPlateModal, setShowPlateModal] = useState(false);
  const [plateModalInitialWeight, setPlateModalInitialWeight] = useState(60);
  const [plateModalInitialReps, setPlateModalInitialReps] = useState(8);
  const [activeTargetSet, setActiveTargetSet] = useState<{ exId: string; setIdx: number } | null>(null);

  // Web Bluetooth Live Heart Rate State
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);
  const [liveBpm, setLiveBpm] = useState<number | null>(null);
  const [isConnectingBle, setIsConnectingBle] = useState(false);
  const [hrSamples, setHrSamples] = useState<{ time: number; bpm: number }[]>([]);
  const bleDeviceRef = useRef<any>(null);

  const handleConnectBleHeartRate = async () => {
    if (!('bluetooth' in navigator)) {
      alert('Web Bluetooth non supportato su questo browser (usa Google Chrome o Microsoft Edge).');
      return;
    }
    try {
      setIsConnectingBle(true);
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });
      if (!device || !device.gatt) {
        setIsConnectingBle(false);
        return;
      }
      bleDeviceRef.current = device;
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let hr = 0;
        if (flags & 0x01) {
          hr = value.getUint16(1, true);
        } else {
          hr = value.getUint8(1);
        }
        if (hr > 30 && hr < 240) {
          setLiveBpm(hr);
          const currentSecond = Math.round((Date.now() - (activeWorkout?.startTime || Date.now())) / 1000);
          setHrSamples(prev => [...prev, { time: currentSecond, bpm: hr }]);
        }
      });
      const name = device.name || 'Cardiofrequenzimetro';
      setBleDeviceName(name);
      setIsConnectingBle(false);
    } catch (err: any) {
      console.warn('Bluetooth HR error:', err);
      setIsConnectingBle(false);
    }
  };

  const handleDisconnectBle = () => {
    try {
      if (bleDeviceRef.current?.gatt?.connected) {
        bleDeviceRef.current.gatt.disconnect();
      }
    } catch {}
    bleDeviceRef.current = null;
    setBleDeviceName(null);
    setLiveBpm(null);
  };

  const handleFinishWorkout = () => {
    let avgHr: number | undefined = undefined;
    if (hrSamples.length > 0) {
      const sum = hrSamples.reduce((acc, s) => acc + s.bpm, 0);
      avgHr = Math.round(sum / hrSamples.length);
    }
    saveActiveWorkout(undefined, {
      avgHeartRate: avgHr,
      heartRateSamples: hrSamples.length > 0 ? hrSamples : undefined,
      deviceSource: bleDeviceName || undefined
    });
    handleDisconnectBle();
  };

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

  const formatRestDisplay = (secs?: number) => {
    if (!secs || secs <= 0) return 'DISATTIVO';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}min ${s}s`;
  };

  const handleSetCheck = (exId: string, setIdx: number) => {
    const currentEx = activeWorkout.exercises.find(e => e.exerciseId === exId);
    if (currentEx) {
      const set = currentEx.sets[setIdx];
      const isAlreadyCompleted = set.completed;
      
      toggleCompleteSet(exId, setIdx);

      // If completing (checking the box), launch rest timer ONLY if not continuous cardio
      if (!isAlreadyCompleted) {
        const exDetail = allExercises.find(e => e.id === exId);
        const isCardio = isDistanceTimeExercise(exDetail);
        if (!isCardio && (currentEx.restSeconds || 0) > 0) {
          const restDuration = currentEx.restSeconds || 90;
          setRestTimeTotal(restDuration);
          setRestTimeLeft(restDuration);
        } else {
          playCompletionSound();
          if (navigator.vibrate) navigator.vibrate([150, 80, 200]);
        }
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

  const updateExerciseNotes = (exId: string, notes: string) => {
    updateActiveWorkoutExercises(prev =>
      prev.map(e => e.exerciseId === exId ? { ...e, notes } : e)
    );
  };

  const handleRemoveExercise = (exId: string) => {
    updateActiveWorkoutExercises(prev => prev.filter(e => e.exerciseId !== exId));
    setActiveExerciseMenuId(null);
  };

  const handleStartReplaceExercise = (exId: string) => {
    setReplacingExerciseId(exId);
    setActiveExerciseMenuId(null);
    setShowAddExercise(true);
  };

  const handleModalAddExercises = (ids: string[]) => {
    if (replacingExerciseId) {
      if (ids.length > 0) {
        const newId = ids[0];
        updateActiveWorkoutExercises(prev =>
          prev.map(e => e.exerciseId === replacingExerciseId ? { ...e, exerciseId: newId } : e)
        );
      }
      setReplacingExerciseId(null);
    } else {
      addExercisesToActiveWorkout(ids);
    }
    setShowAddExercise(false);
  };

  const handleModalSelectExercise = (id: string) => {
    if (replacingExerciseId) {
      updateActiveWorkoutExercises(prev =>
        prev.map(e => e.exerciseId === replacingExerciseId ? { ...e, exerciseId: id } : e)
      );
      setReplacingExerciseId(null);
    } else {
      addExerciseToActiveWorkout(id);
    }
    setShowAddExercise(false);
  };

  const handleAddSet = (exId: string) => {
    const currentEx = activeWorkout.exercises.find(e => e.exerciseId === exId);
    if (!currentEx) return;
    const exDetail = allExercises.find(e => e.id === exId);
    const isCardio = isDistanceTimeExercise(exDetail);
    const isIso = isTimeOnlyExercise(exDetail);
    const lastSet = currentEx.sets[currentEx.sets.length - 1];

    const newSet: SetLog = {
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      weight: isCardio || isIso ? 0 : (lastSet ? lastSet.weight : 0),
      reps: isCardio || isIso ? 0 : (lastSet ? lastSet.reps : 10),
      time: isCardio ? (lastSet?.time || 20) : (isIso ? (lastSet?.time || 60) : undefined),
      distance: isCardio ? (lastSet?.distance || 3.0) : undefined,
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

  // Calculate live volume (excluding pure cardio or isometric exercises)
  const getLiveVolume = () => {
    let vol = 0;
    activeWorkout.exercises.forEach(ex => {
      const exDetail = mockExercises.find(e => e.id === ex.exerciseId);
      if (isDistanceTimeExercise(exDetail) || isTimeOnlyExercise(exDetail)) return;
      ex.sets.forEach(s => {
        if (s.completed) vol += s.weight * s.reps;
      });
    });
    return vol;
  };

  // Calculate live cardio distance
  const getLiveCardioKm = () => {
    let km = 0;
    activeWorkout.exercises.forEach(ex => {
      const exDetail = mockExercises.find(e => e.id === ex.exerciseId);
      if (isDistanceTimeExercise(exDetail)) {
        ex.sets.forEach(s => {
          if (s.completed && s.distance) km += s.distance;
        });
      }
    });
    return km;
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
    const map: Record<string, { weight: number; reps: number; time?: number; distance?: number }[]> = {};
    if (!activeWorkout) return map;
    activeWorkout.exercises.forEach(e => {
      map[e.exerciseId] = getPreviousPerformances(e.exerciseId);
    });
    return map;
  }, [activeWorkout?.exercises.map(e => e.exerciseId).join(','), workoutHistory]);

  // Render front and back mini anatomical mannequins with signature DeV Fit Luxury Gold
  const renderDuoMannequins = () => {
    const baseColor = '#24242c';
    const activeColor = '#d4af37'; // Luxury Gold

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

  const selectedExerciseIds = useMemo(() => activeWorkout?.exercises.map(e => e.exerciseId) || [], [activeWorkout?.exercises]);

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '60px' }}>
      {/* 1. TOP BAR (Hevy Screenshot 4 & 5 Style: ∨ Registra allenamento | ⏱ | Termina in Gold) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 4px',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronDown size={22} color="#ffffff" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'white' }}>
            {activeWorkout.name || 'Registra allenamento'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setPlateModalInitialWeight(60);
              setActiveTargetSet(null);
              setShowPlateModal(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '4px'
            }}
            title="Calcolatore Dischi & 1RM"
          >
            <Clock size={22} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={handleFinishWorkout}
            style={{
              background: 'var(--color-primary, #d4af37)',
              color: '#000000',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.35)',
              letterSpacing: '0.2px'
            }}
          >
            Termina
          </button>
        </div>
      </div>

      {/* 2. SUBHEADER: Smart Device & Heart Rate Status Row (No fake data!) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 4px 12px 4px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '14px'
      }}>
        {bleDeviceName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 600 }}>{bleDeviceName}</span>
            {liveBpm && (
              <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={13} fill="#ef4444" /> {liveBpm} bpm
              </span>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#8e8e93' }}>
            <Watch size={14} color="#8e8e93" />
            <span>Nessun orologio cardio connesso</span>
          </div>
        )}

        {bleDeviceName ? (
          <button
            type="button"
            onClick={handleDisconnectBle}
            style={{
              background: 'none',
              border: 'none',
              color: '#8e8e93',
              fontSize: '0.74rem',
              cursor: 'pointer',
              padding: '2px 6px'
            }}
          >
            Disconnetti
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConnectBleHeartRate}
            disabled={isConnectingBle}
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '6px',
              color: 'var(--color-primary, #d4af37)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 9px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Bluetooth size={13} />
            <span>{isConnectingBle ? 'Ricerca...' : 'Connetti Smartwatch / HR'}</span>
          </button>
        )}
      </div>

      {/* 3. WORKOUT STATS BAR (Durata in Gold | Volume | Serie | Duo-Mannequins) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
        marginBottom: '22px'
      }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#8e8e93', fontWeight: 500 }}>Durata</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary, #d4af37)', marginTop: '2px' }}>
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#8e8e93', fontWeight: 500 }}>Volume</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {getLiveVolume()} kg
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#8e8e93', fontWeight: 500 }}>Serie</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {completedSetsCount}
            </div>
          </div>

          {getLiveCardioKm() > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', color: '#8e8e93', fontWeight: 500 }}>Km Cardio</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                {getLiveCardioKm().toFixed(1)} km
              </div>
            </div>
          )}
        </div>

        {/* Duo silhouettes on the right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {renderDuoMannequins()}
        </div>
      </div>

      {/* 4. WORKOUT BODY: EMPTY STATE OR EXERCISE LIST */}
      {activeWorkout.exercises.length === 0 ? (
        /* Empty State (Hevy Screenshot 5 style) */
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
            onClick={() => {
              setReplacingExerciseId(null);
              setShowAddExercise(true);
            }}
            style={{
              width: '100%',
              maxWidth: '360px',
              height: '50px',
              background: 'var(--color-primary, #d4af37)',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.96rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.35)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeWorkout.exercises.map((exLog) => {
            const exDetail = allExercises.find(e => e.id === exLog.exerciseId);
            if (!exDetail) return null;

            const prevSets = prevPerformancesMap[exLog.exerciseId] || [];
            const isCardio = isDistanceTimeExercise(exDetail);
            const isIso = isTimeOnlyExercise(exDetail);
            const isPlate = isPlateLoadedExercise(exDetail);

            return (
              <div 
                key={exLog.exerciseId}
                style={{
                  background: '#0d0d11',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Exercise Header: Avatar, Name in Gold, 3-dots */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
                    onClick={() => setSelectedDetailExerciseId(exLog.exerciseId)}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {renderMuscleIcon(exDetail.muscleGroup, 34, '#d4af37')}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--color-primary, #d4af37)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {exDetail.name}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveExerciseMenuId(exLog.exerciseId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8e8e93',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Opzioni esercizio"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>

                {/* Inline Notes Field (Aggiungi delle note qui...) */}
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Aggiungi delle note qui..."
                    value={exLog.notes || ''}
                    onChange={(e) => updateExerciseNotes(exLog.exerciseId, e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '0.86rem',
                      padding: '4px 0'
                    }}
                  />
                </div>

                {/* Inline Rest Timer Indicator & Quick Duration Selector */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => setRestPickerExId(restPickerExId === exLog.exerciseId ? null : exLog.exerciseId)}
                  >
                    <Clock size={16} color="var(--color-primary, #d4af37)" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-primary, #d4af37)' }}>
                      Riposo: {formatRestDisplay(exLog.restSeconds)}
                    </span>
                  </div>

                  {/* Rest Duration Popover */}
                  {restPickerExId === exLog.exerciseId && (
                    <div style={{
                      position: 'absolute',
                      top: '28px',
                      left: 0,
                      zIndex: 60,
                      background: '#181822',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '12px',
                      padding: '8px',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px',
                      minWidth: '240px'
                    }}>
                      {[
                        { label: 'Off', val: 0 },
                        { label: '30s', val: 30 },
                        { label: '60s', val: 60 },
                        { label: '90s', val: 90 },
                        { label: '2m', val: 120 },
                        { label: '2m 30s', val: 150 },
                        { label: '3m', val: 180 },
                        { label: '4m', val: 240 },
                        { label: '5m', val: 300 }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            updateActiveWorkoutExerciseRest(exLog.exerciseId, opt.val);
                            setRestPickerExId(null);
                          }}
                          style={{
                            background: (exLog.restSeconds || 0) === opt.val ? 'var(--color-primary, #d4af37)' : 'rgba(255, 255, 255, 0.06)',
                            color: (exLog.restSeconds || 0) === opt.val ? '#000000' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sets Table */}
                {isCardio ? (
                  /* ================= CARDIO TABLE (KM & TEMPO) ================= */
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ color: '#8e8e93', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ width: '14%', textAlign: 'left', paddingLeft: '4px' }}>SERIE</th>
                        <th style={{ width: '32%', textAlign: 'left' }}>PRECEDENTE</th>
                        <th style={{ width: '22%', textAlign: 'center' }}>KM</th>
                        <th style={{ width: '22%', textAlign: 'center' }}>TEMPO</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>✓</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exLog.sets.map((set, idx) => {
                        const prevSet = prevSets[idx];
                        const prevText = prevSet && (prevSet.distance || prevSet.time)
                          ? `${prevSet.distance ? `${prevSet.distance} km` : ''}${prevSet.distance && prevSet.time ? ' in ' : ''}${prevSet.time ? `${prevSet.time}m` : ''}`
                          : '—';

                        return (
                          <SwipeableSetRow
                            key={set.id}
                            isCompleted={set.completed}
                            canDelete={exLog.sets.length > 1}
                            onDelete={() => handleRemoveSet(exLog.exerciseId, idx)}
                          >
                            <td style={{ width: '14%', verticalAlign: 'middle', paddingLeft: '2px' }}>
                              <div className="hevy-set-badge">{idx + 1}</div>
                            </td>
                            <td style={{ width: '32%', verticalAlign: 'middle', color: '#8e8e93', fontSize: '0.8rem', paddingRight: '4px', lineHeight: 1.2 }}>
                              {prevText}
                            </td>
                            <td style={{ width: '22%', verticalAlign: 'middle', textAlign: 'center' }}>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                placeholder="km"
                                className="hevy-set-input"
                                value={set.distance !== undefined && set.distance !== null && set.distance > 0 ? set.distance : ''}
                                onChange={(e) => updateActiveWorkoutSet(exLog.exerciseId, idx, 'distance', parseFloat(e.target.value) || 0)}
                                disabled={set.completed}
                              />
                            </td>
                            <td style={{ width: '22%', verticalAlign: 'middle', textAlign: 'center' }}>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                placeholder="min"
                                className="hevy-set-input"
                                value={set.time !== undefined && set.time !== null && set.time > 0 ? set.time : ''}
                                onChange={(e) => updateActiveWorkoutSet(exLog.exerciseId, idx, 'time', parseFloat(e.target.value) || 0)}
                                disabled={set.completed}
                              />
                            </td>
                            <td style={{ width: '10%', verticalAlign: 'middle', textAlign: 'center' }}>
                              <button 
                                className={`hevy-check-btn ${set.completed ? 'completed' : ''}`}
                                onClick={() => handleSetCheck(exLog.exerciseId, idx)}
                              >
                                <Check size={18} strokeWidth={2.5} />
                              </button>
                            </td>
                          </SwipeableSetRow>
                        );
                      })}
                    </tbody>
                  </table>
                ) : isIso ? (
                  /* ================= ISOMETRIC TABLE (TEMPO TENUTA) ================= */
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ color: '#8e8e93', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ width: '14%', textAlign: 'left', paddingLeft: '4px' }}>SERIE</th>
                        <th style={{ width: '40%', textAlign: 'left' }}>PRECEDENTE</th>
                        <th style={{ width: '36%', textAlign: 'center' }}>TEMPO (SEC)</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>✓</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exLog.sets.map((set, idx) => {
                        const prevSet = prevSets[idx];
                        const prevText = prevSet && prevSet.time ? `${prevSet.time}s` : '—';

                        return (
                          <SwipeableSetRow
                            key={set.id}
                            isCompleted={set.completed}
                            canDelete={exLog.sets.length > 1}
                            onDelete={() => handleRemoveSet(exLog.exerciseId, idx)}
                          >
                            <td style={{ width: '14%', verticalAlign: 'middle', paddingLeft: '2px' }}>
                              <div className="hevy-set-badge">{idx + 1}</div>
                            </td>
                            <td style={{ width: '40%', verticalAlign: 'middle', color: '#8e8e93', fontSize: '0.8rem', paddingRight: '4px' }}>
                              {prevText}
                            </td>
                            <td style={{ width: '36%', verticalAlign: 'middle', textAlign: 'center' }}>
                              <input
                                type="number"
                                inputMode="numeric"
                                placeholder="sec"
                                className="hevy-set-input"
                                style={{ width: '84px' }}
                                value={set.time !== undefined && set.time !== null && set.time > 0 ? set.time : ''}
                                onChange={(e) => updateActiveWorkoutSet(exLog.exerciseId, idx, 'time', parseInt(e.target.value) || 0)}
                                disabled={set.completed}
                              />
                            </td>
                            <td style={{ width: '10%', verticalAlign: 'middle', textAlign: 'center' }}>
                              <button 
                                className={`hevy-check-btn ${set.completed ? 'completed' : ''}`}
                                onClick={() => handleSetCheck(exLog.exerciseId, idx)}
                              >
                                <Check size={18} strokeWidth={2.5} />
                              </button>
                            </td>
                          </SwipeableSetRow>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  /* ================= STRENGTH / WEIGHTS TABLE ================= */
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ color: '#8e8e93', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ width: '14%', textAlign: 'left', paddingLeft: '4px' }}>SERIE</th>
                        <th style={{ width: '32%', textAlign: 'left' }}>PRECEDENTE</th>
                        <th style={{ width: '22%', textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <Dumbbell size={11} /> KG
                          </span>
                        </th>
                        <th style={{ width: '22%', textAlign: 'center' }}>RIPETIZIONI</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>✓</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exLog.sets.map((set, idx) => {
                        const prevSet = prevSets[idx];
                        const prevText = prevSet ? `${prevSet.weight}kg x ${prevSet.reps}` : '—';

                        return (
                          <SwipeableSetRow
                            key={set.id}
                            isCompleted={set.completed}
                            canDelete={exLog.sets.length > 1}
                            onDelete={() => handleRemoveSet(exLog.exerciseId, idx)}
                          >
                            <td style={{ width: '14%', verticalAlign: 'middle', paddingLeft: '2px' }}>
                              <div className="hevy-set-badge">{idx + 1}</div>
                            </td>
                            <td style={{ width: '32%', verticalAlign: 'middle', color: '#8e8e93', fontSize: '0.8rem', paddingRight: '4px', lineHeight: 1.2 }}>
                              {prevText}
                            </td>
                            <td style={{ width: '22%', verticalAlign: 'middle', textAlign: 'center' }}>
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="any"
                                  placeholder="0"
                                  className="hevy-set-input"
                                  value={set.weight !== undefined && set.weight !== null && set.weight > 0 ? set.weight : (set.weight === 0 ? '0' : '')}
                                  onChange={(e) => updateActiveWorkoutSet(exLog.exerciseId, idx, 'weight', parseFloat(e.target.value) || 0)}
                                  disabled={set.completed}
                                  style={{ paddingRight: (!set.completed && isPlate) ? '18px' : '0' }}
                                />
                                {!set.completed && isPlate && (
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
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--color-primary, #d4af37)',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      opacity: 0.8
                                    }}
                                    title="Calcola dischi per questo bilanciere"
                                  >
                                    <Disc size={11} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={{ width: '22%', verticalAlign: 'middle', textAlign: 'center' }}>
                              <input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                className="hevy-set-input"
                                value={set.reps !== undefined && set.reps !== null && set.reps > 0 ? set.reps : ''}
                                onChange={(e) => updateActiveWorkoutSet(exLog.exerciseId, idx, 'reps', parseInt(e.target.value) || 0)}
                                disabled={set.completed}
                              />
                            </td>
                            <td style={{ width: '10%', verticalAlign: 'middle', textAlign: 'center' }}>
                              <button 
                                className={`hevy-check-btn ${set.completed ? 'completed' : ''}`}
                                onClick={() => handleSetCheck(exLog.exerciseId, idx)}
                              >
                                <Check size={18} strokeWidth={2.5} />
                              </button>
                            </td>
                          </SwipeableSetRow>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* Badges / Achievements under sets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {exLog.sets.map((set, idx) => {
                    if (!set.completed) return null;
                    const badges = [];
                    if (set.isMaxDistance) badges.push(<span key="dist" className="achievement-badge badge-1rm-glow">🏃 Distanza (S.{idx+1})</span>);
                    if (set.isMaxTime) badges.push(<span key="time" className="achievement-badge badge-volume-glow">⏱ Tempo (S.{idx+1})</span>);
                    if (set.isMaxReps) badges.push(<span key="reps" className="achievement-badge badge-1rm-glow">⭐ Record Rep ({set.reps} rep)</span>);
                    if (set.is1RM) badges.push(<span key="1rm" className="achievement-badge badge-1rm-glow">⭐ 1RM (S.{idx+1})</span>);
                    if (set.isMaxVolume) badges.push(<span key="vol" className="achievement-badge badge-volume-glow">🔥 Vol (S.{idx+1})</span>);
                    if (set.isMaxWeight) badges.push(<span key="wgt" className="achievement-badge badge-weight-glow">💪 Peso (S.{idx+1})</span>);
                    return badges;
                  })}
                </div>

                {/* + Aggiungi serie Button (Hevy style) */}
                <button
                  type="button"
                  className="hevy-add-set-btn"
                  onClick={() => handleAddSet(exLog.exerciseId)}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Aggiungi serie</span>
                </button>
              </div>
            );
          })}

          {/* Bottom Action Controls (Aggiungi esercizio & Abbandona) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setReplacingExerciseId(null);
                setShowAddExercise(true);
              }}
              style={{
                width: '100%',
                height: '48px',
                background: '#1a1a22',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '12px',
                color: 'var(--color-primary, #d4af37)',
                fontSize: '0.94rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Aggiungi esercizio</span>
            </button>

            <button
              type="button"
              onClick={cancelActiveWorkout}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.88rem',
                fontWeight: 600,
                padding: '10px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Abbandona l'allenamento
            </button>
          </div>
        </div>
      )}

      {/* Floating Rest Timer Component (radial progress overlay) */}
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

      {/* Exercise Action Bottom Sheet Modal (Hevy Screenshot 2 style for exercise) */}
      {activeExerciseMenuId && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setActiveExerciseMenuId(null)}
        >
          <div 
            className="hevy-bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '480px' }}
          >
            <div className="bottom-sheet-drag-handle" />

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 16px 0' }}>
              {allExercises.find(e => e.id === activeExerciseMenuId)?.name || 'Opzioni Esercizio'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="bottom-sheet-btn"
                onClick={() => {
                  setSelectedDetailExerciseId(activeExerciseMenuId);
                  setActiveExerciseMenuId(null);
                }}
              >
                <Info size={18} color="var(--color-primary, #d4af37)" />
                <span>Dettagli & Guida esercizio</span>
              </button>

              <button
                type="button"
                className="bottom-sheet-btn"
                onClick={() => handleStartReplaceExercise(activeExerciseMenuId)}
              >
                <ArrowLeftRight size={18} color="var(--color-primary, #d4af37)" />
                <span>Sostituisci esercizio</span>
              </button>

              <button
                type="button"
                className="bottom-sheet-btn btn-danger"
                onClick={() => handleRemoveExercise(activeExerciseMenuId)}
              >
                <Trash2 size={18} />
                <span>Rimuovi esercizio dall'allenamento</span>
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

      {/* Add / Replace Exercise Modal */}
      <ExerciseBrowserModal 
        isOpen={showAddExercise}
        onClose={() => {
          setShowAddExercise(false);
          setReplacingExerciseId(null);
        }}
        onAddExercises={handleModalAddExercises}
        onSelectExercise={handleModalSelectExercise}
        selectedIds={selectedExerciseIds}
        isMultiSelect={!replacingExerciseId}
      />

      {/* Fullscreen Exercise Details View */}
      <ExerciseDetailModal
        exerciseId={selectedDetailExerciseId}
        onClose={() => setSelectedDetailExerciseId(null)}
      />
    </div>
  );
};

