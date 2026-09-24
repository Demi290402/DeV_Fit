import React, { useState } from 'react';
import { 
  ChevronLeft, MoreHorizontal, ThumbsUp, MessageSquare, Share2, 
  Heart, Flame, Trophy, Edit3, Trash2, ChevronRight, Users,
  Watch, Send, X
} from 'lucide-react';
import type { WorkoutLog } from '../context/AppContext';
import { renderMuscleIcon, type MuscleGroup } from '../data/mockExercises';
import { EditWorkoutLogModal } from './EditWorkoutLogModal';

export interface DetailedWorkoutSet {
  setNumber: string | number; // 'W' or 1, 2, 3...
  type?: 'warmup' | 'normal' | 'drop';
  weight?: number;
  reps?: number;
  distance?: number;
  timeSeconds?: number;
  is1RM?: boolean;
  isMaxVolume?: boolean;
  isMaxWeight?: boolean;
  isMaxReps?: boolean;
  isMaxDistance?: boolean;
  isMaxTime?: boolean;
  completed?: boolean;
}

export interface DetailedWorkoutExercise {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  category?: string;
  notes?: string;
  trackingType?: 'weight_reps' | 'distance_time' | 'time_only';
  sets: DetailedWorkoutSet[];
}

export interface DetailedWorkout {
  id: string;
  isUserPost: boolean;
  username: string;
  userAvatar: string;
  date: string; // ISO or formatted
  rawDate?: string;
  workoutName: string;
  durationMinutes: number;
  volume: number;
  totalSets: number;
  recordsCount?: number;
  avgHeartRate?: number;
  calories?: number;
  deviceSynced?: string; // e.g. 'WearOS Watch'
  muscleSplit?: { muscle: string; percentage: number }[];
  heartRateData?: { time: number; bpm: number }[];
  exercises: DetailedWorkoutExercise[];
  likes: string[];
  comments: { username: string; text: string }[];
  originalWorkoutLog?: WorkoutLog;
}

interface WorkoutDetailViewProps {
  workout: DetailedWorkout;
  onBack: () => void;
  onLike?: (workoutId: string) => void;
  onComment?: (workoutId: string, commentText: string) => void;
  onEditWorkout?: (updated: WorkoutLog) => void;
  onDeleteWorkout?: (workoutId: string) => void;
}

export const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({
  workout,
  onBack,
  onLike,
  onComment,
  onEditWorkout,
  onDeleteWorkout
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(workout.likes.length);

  // Format header date (e.g. "mercoledì, set 23, 2026 • 7:10pm")
  const formattedDateTime = (() => {
    try {
      const d = new Date(workout.rawDate || workout.date);
      if (isNaN(d.getTime())) return workout.date;
      
      const dayName = d.toLocaleDateString('it-IT', { weekday: 'long' });
      const monthShort = d.toLocaleDateString('it-IT', { month: 'short' });
      const dayNum = d.getDate();
      const year = d.getFullYear();
      
      // format 12h time (7:10pm)
      let hours = d.getHours();
      const mins = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12 || 12;

      return `${dayName}, ${monthShort} ${dayNum}, ${year} • ${hours}:${mins}${ampm}`;
    } catch {
      return workout.date;
    }
  })();

  // Format duration text (e.g. "48min" or "1h 1min")
  const formattedDuration = (() => {
    const mins = workout.durationMinutes;
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    return `${mins}min`;
  })();

  // Calculated muscle split if not explicitly provided
  const computedMuscleSplit = (() => {
    if (workout.muscleSplit && workout.muscleSplit.length > 0) {
      return workout.muscleSplit;
    }

    const map: Record<string, number> = {};
    let totalCount = 0;

    workout.exercises.forEach(ex => {
      const cat = ex.category || ex.muscleGroup || 'Schiena';
      const setsCount = ex.sets.length || 1;
      map[cat] = (map[cat] || 0) + setsCount;
      totalCount += setsCount;
    });

    if (totalCount === 0) return [{ muscle: 'Corpo intero', percentage: 100 }];

    return Object.entries(map).map(([muscle, count]) => ({
      muscle,
      percentage: Math.round((count / totalCount) * 100)
    })).sort((a, b) => b.percentage - a.percentage);
  })();

  // Toggle Like
  const handleToggleLike = () => {
    if (onLike) {
      onLike(workout.id);
    }
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
  };

  // Submit Comment
  const handleCommentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim()) return;

    if (onComment) {
      onComment(workout.id, commentInput.trim());
    }
    workout.comments.push({
      username: 'Tu',
      text: commentInput.trim()
    });
    setCommentInput('');
  };

  // Share Workout
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${workout.workoutName} di ${workout.username}`,
          text: `Guarda questo allenamento di ${workout.workoutName} su DeV Fit! Durata: ${formattedDuration}, Volume: ${workout.volume.toLocaleString('it-IT')} kg.`,
          url: window.location.href
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link dell\'allenamento copiato negli appunti!');
    }
    setShowMenu(false);
  };

  // Generate Heart Rate SVG Path from real recorded samples
  const renderHeartRateChart = () => {
    if (!workout.heartRateData || workout.heartRateData.length === 0) return null;

    const samples = workout.heartRateData;
    const duration = workout.durationMinutes || Math.max(1, Math.round(samples[samples.length - 1].time / 60));
    const svgW = 340;
    const svgH = 80;

    const bpms = samples.map(s => s.bpm);
    const minBpm = Math.max(40, Math.min(...bpms) - 5);
    const maxBpm = Math.max(...bpms) + 5;
    const bpmRange = Math.max(10, maxBpm - minBpm);

    const maxTime = Math.max(1, samples[samples.length - 1].time || duration * 60);

    const dataPoints = samples.map(s => {
      const x = (s.time / maxTime) * svgW;
      const yNorm = (s.bpm - minBpm) / bpmRange;
      const y = svgH - yNorm * (svgH - 14) - 7;
      return { x, y };
    });

    const pathD = dataPoints.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${svgW} ${svgH} L 0 ${svgH} Z`;

    return (
      <div style={{ position: 'relative', width: '100%', marginTop: '6px' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="hrRedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="10" x2={svgW} y2="10" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <line x1="0" y1={svgH / 2} x2={svgW} y2={svgH / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <line x1="0" y1={svgH - 2} x2={svgW} y2={svgH - 2} stroke="rgba(255,255,255,0.08)" />

          {/* Area under curve */}
          <path d={areaD} fill="url(#hrRedGradient)" />

          {/* Red line */}
          <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: '#71717a', marginTop: '3px' }}>
          <span>0min</span>
          <span>{duration}min</span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '75px', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* 1. TOP HEADER (< Dettagli dell'allenamento •••) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '8px 0 14px 0', 
        borderBottom: '1px solid rgba(255,255,255,0.06)' 
      }}>
        <button 
          onClick={onBack}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#ffffff', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px'
          }}
          title="Torna indietro"
        >
          <ChevronLeft size={24} />
        </button>

        <h2 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Dettagli dell'allenamento
        </h2>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ffffff', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <MoreHorizontal size={22} />
          </button>

          {showMenu && (
            <div 
              className="glass-card animate-scale-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 100,
                padding: '6px',
                minWidth: '150px',
                background: '#16161c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.85)'
              }}
            >
              <button
                onClick={handleShare}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Share2 size={15} />
                <span>Condividi</span>
              </button>

              {workout.isUserPost && workout.originalWorkoutLog && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #d4af37)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Modifica</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm("Sei sicuro di voler eliminare questo allenamento?")) {
                        if (onDeleteWorkout) onDeleteWorkout(workout.id);
                        onBack();
                      }
                      setShowMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-error, #ef4444)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Trash2 size={15} />
                    <span>Elimina</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. USER ROW (Avatar, Username, Timestamp) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0 10px 0' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1.5px solid var(--color-primary, #d4af37)',
          background: '#121217',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {workout.userAvatar ? (
            <img src={workout.userAvatar} alt={workout.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary, #d4af37)' }}>
              {workout.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
            {workout.username}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#8e8e93' }}>
            {formattedDateTime}
          </span>
        </div>
      </div>

      {/* 3. WORKOUT TITLE */}
      <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 16px 0', letterSpacing: '-0.3px' }}>
        {workout.workoutName}
      </h1>

      {/* 4. STATS GRID (2 rows matching Screenshot 1 & 3) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {/* Row 1: Tempo, Volume, Serie */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#8e8e93', display: 'block', marginBottom: '2px' }}>
              Tempo
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {formattedDuration}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#8e8e93', display: 'block', marginBottom: '2px' }}>
              Volume
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {workout.volume.toLocaleString('it-IT')} kg
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#8e8e93', display: 'block', marginBottom: '2px' }}>
              Serie
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {workout.totalSets}
            </span>
          </div>
        </div>

        {/* Row 2: Record (optional), Bpm medi (only if measured by device), Calorie (only if present) */}
        {(workout.recordsCount || (workout.avgHeartRate && workout.avgHeartRate > 0) || (workout.calories && workout.calories > 0)) ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${
              (workout.recordsCount ? 1 : 0) +
              ((workout.avgHeartRate && workout.avgHeartRate > 0) ? 1 : 0) +
              ((workout.calories && workout.calories > 0) ? 1 : 0)
            }, 1fr)`,
            gap: '10px'
          }}>
            {workout.recordsCount ? (
              <div>
                <span style={{ fontSize: '0.72rem', color: '#8e8e93', display: 'block', marginBottom: '2px' }}>
                  Record
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trophy size={16} color="var(--color-primary, #d4af37)" />
                  {workout.recordsCount}
                </span>
              </div>
            ) : null}

            {workout.avgHeartRate && workout.avgHeartRate > 0 ? (
              <div>
                <span style={{ fontSize: '0.72rem', color: '#8e8e93', display: 'block', marginBottom: '2px' }}>
                  Bpm medi
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={15} color="#ef4444" fill="#ef4444" />
                  {workout.avgHeartRate}
                </span>
              </div>
            ) : null}

            {workout.calories && workout.calories > 0 ? (
              <div>
                <span style={{ fontSize: '0.72rem', color: '#8e8e93', display: 'block', marginBottom: '2px' }}>
                  Calorie
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={15} color="#f59e0b" fill="#f59e0b" />
                  {workout.calories}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* 5. SOCIAL ACTIONS ROW (Like, Comment, Share) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '28px', 
        padding: '12px 4px', 
        borderTop: '1px solid rgba(255,255,255,0.06)', 
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '20px'
      }}>
        <button 
          onClick={handleToggleLike}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: isLiked ? 'var(--color-primary, #d4af37)' : '#ffffff', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: 0
          }}
        >
          <ThumbsUp size={18} fill={isLiked ? 'var(--color-primary, #d4af37)' : 'none'} />
          <span>{likesCount}</span>
        </button>

        <button 
          onClick={() => setShowCommentsModal(true)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#ffffff', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: 0
          }}
        >
          <MessageSquare size={18} />
          <span>{workout.comments.length}</span>
        </button>

        <button 
          onClick={handleShare}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#ffffff', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            padding: 0
          }}
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* 6. DIVISIONE MUSCOLARE (Progress Bars with Gold Gradient) */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#8e8e93', margin: '0 0 12px 0' }}>
          Divisione muscolare
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {computedMuscleSplit.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
                <span>{item.muscle}</span>
                <span style={{ color: '#8e8e93' }}>{item.percentage}%</span>
              </div>

              <div style={{
                height: '14px',
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${item.percentage}%`,
                  background: 'linear-gradient(90deg, #d4af37 0%, #f6e09a 100%)',
                  borderRadius: '6px',
                  boxShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. AVG. HEART RATE (BPM) WITH SVG CHART - Only shown if measured by smartwatch/cardio device! */}
      {(workout.avgHeartRate && workout.avgHeartRate > 0 && workout.heartRateData && workout.heartRateData.length > 0) ? (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8e8e93' }}>
                Avg. Heart Rate (bpm)
              </span>
              <ChevronRight size={15} color="#8e8e93" />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>
              {Math.max(...workout.heartRateData.map(d => d.bpm))} max
            </span>
          </div>

          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>
            {workout.avgHeartRate}
          </span>

          {renderHeartRateChart()}
        </div>
      ) : null}

      {/* 8. ALLENAMENTO SECTION */}
      <div style={{ marginBottom: '24px' }}>
        {/* Section title & Edit button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Allenamento
          </h3>

          {workout.isUserPost && workout.originalWorkoutLog && (
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary, #d4af37)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              Modifica l'allenamento
            </button>
          )}
        </div>

        {/* Wearable device badge (only if actually synced) */}
        {workout.deviceSynced ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#8e8e93', marginBottom: '16px' }}>
            <Watch size={14} color="var(--color-primary, #d4af37)" />
            <span>Registrato con {workout.deviceSynced}</span>
          </div>
        ) : null}

        {/* Exercises list with all sets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {workout.exercises.map((ex, exIdx) => {
            const isCardio = ex.trackingType === 'distance_time' || ex.muscleGroup === 'Cardio' || ex.name.toLowerCase().includes('tapis');
            const isBodyweight = ex.trackingType === 'time_only' || (!isCardio && ex.sets.every(s => !s.weight));

            return (
              <div key={exIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Exercise header: avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#16161c',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {renderMuscleIcon(ex.muscleGroup, 24, '#d4af37')}
                  </div>

                  <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-primary, #d4af37)' }}>
                    {ex.name}
                  </span>
                </div>

                {/* Optional note under exercise name */}
                {ex.notes && (
                  <p style={{ fontSize: '0.76rem', color: '#a1a1aa', margin: '0 0 2px 0', fontStyle: 'italic', paddingLeft: '4px' }}>
                    {ex.notes}
                  </p>
                )}

                {/* Table headers: SERIE | PESO & RIPETIZIONI (or DISTANZA E DURATA) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '46px 1fr',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#71717a',
                  letterSpacing: '0.5px',
                  padding: '4px 8px 2px 8px'
                }}>
                  <span>SERIE</span>
                  <span>{isCardio ? 'DISTANZA E DURATA' : isBodyweight ? 'RIPETIZIONI' : 'PESO & RIPETIZIONI'}</span>
                </div>

                {/* Set rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {ex.sets.map((s, sIdx) => {
                    const setLabel = s.type === 'warmup' || s.setNumber === 'W' ? 'W' : (s.setNumber || sIdx + 1);
                    const isWarmup = setLabel === 'W';
                    const hasPR = s.is1RM || s.isMaxVolume || s.isMaxWeight;

                    return (
                      <div 
                        key={sIdx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '46px 1fr',
                          padding: '7px 8px',
                          background: sIdx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                          borderRadius: '6px',
                          alignItems: 'center'
                        }}
                      >
                        {/* Set index / Warmup */}
                        <span style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 800, 
                          color: isWarmup ? '#f59e0b' : '#ffffff' 
                        }}>
                          {setLabel}
                        </span>

                        {/* Set performance value */}
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'block' }}>
                            {isCardio ? (
                              `${s.distance || 0} km - ${s.timeSeconds ? `${Math.floor(s.timeSeconds / 60)}min ${s.timeSeconds % 60}s` : '10min 0s'}`
                            ) : isBodyweight ? (
                              `${s.reps || 0}`
                            ) : (
                              `${s.weight || 0} kg × ${s.reps || 0}`
                            )}
                          </span>

                          {/* PR Badges (Volume / 1RM) matching Single-Trophy Rule */}
                          {hasPR && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                              {s.isMaxVolume && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: 'var(--color-primary, #d4af37)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  🏆 Volume
                                </span>
                              )}
                              {s.is1RM && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: 'var(--color-primary, #d4af37)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  🏆 1RM
                                </span>
                              )}
                              {(s.isMaxWeight && !s.is1RM) && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: 'var(--color-primary, #d4af37)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  🏆 Peso Max
                                </span>
                              )}
                              {s.isMaxReps && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: 'var(--color-primary, #d4af37)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  🏆 Max Reps
                                </span>
                              )}
                              {s.isMaxDistance && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: 'var(--color-primary, #d4af37)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  🏆 Distanza Max
                                </span>
                              )}
                              {s.isMaxTime && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  color: 'var(--color-primary, #d4af37)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  🏆 Tempo Max
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 9. BOTTOM CONFRONTA LINK */}
      <div 
        onClick={() => alert("Confronto allenamenti disponibile: puoi confrontare i tuoi record con i tuoi allenamenti precedenti!")}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 4px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary, #d4af37)', fontWeight: 700, fontSize: '0.88rem' }}>
          <Users size={16} />
          <span>Confronta</span>
        </div>
        <ChevronRight size={16} color="var(--color-primary, #d4af37)" />
      </div>

      {/* COMMENTS MODAL */}
      {showCommentsModal && (
        <div className="drawer-backdrop" onClick={() => setShowCommentsModal(false)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '70vh' }}>
            <div className="drawer-header">
              <h3 className="section-title">Commenti ({workout.comments.length})</h3>
              <button className="drawer-close" onClick={() => setShowCommentsModal(false)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', maxHeight: '340px', overflowY: 'auto' }}>
              {workout.comments.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#71717a', textAlign: 'center', padding: '20px 0' }}>
                  Nessun commento finora. Sii il primo a congratularti!
                </p>
              ) : (
                workout.comments.map((c, i) => (
                  <div key={i} style={{ background: '#121217', padding: '10px 12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-primary, #d4af37)', display: 'block', marginBottom: '2px' }}>
                      {c.username}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#ffffff' }}>
                      {c.text}
                    </span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <input 
                type="text"
                placeholder="Aggiungi un commento..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="set-input"
                style={{ flex: 1, height: '38px', textAlign: 'left', padding: '0 12px' }}
              />
              <button type="submit" className="btn-primary" style={{ height: '38px', padding: '0 14px' }}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORKOUT MODAL (If user's workout) */}
      {showEditModal && workout.originalWorkoutLog && (
        <EditWorkoutLogModal
          workoutLog={workout.originalWorkoutLog}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            if (onEditWorkout) onEditWorkout(updated);
            setShowEditModal(false);
          }}
        />
      )}

    </div>
  );
};
