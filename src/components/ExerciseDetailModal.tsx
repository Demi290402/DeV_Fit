import React, { useMemo } from 'react';
import { ArrowLeft, X, Award, Calendar, Dumbbell, Zap } from 'lucide-react';
import { mockExercises, renderMuscleIcon, isDistanceTimeExercise, isTimeOnlyExercise } from '../data/mockExercises';
import { useApp } from '../context/AppContext';

interface ExerciseDetailModalProps {
  exerciseId: string | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exerciseId, onClose }) => {
  const { workoutHistory, customExercises } = useApp();

  const allExercises = useMemo(() => {
    return [...customExercises, ...mockExercises];
  }, [customExercises]);

  const exercise = useMemo(() => {
    if (!exerciseId) return null;
    return allExercises.find(e => e.id === exerciseId) || null;
  }, [exerciseId, allExercises]);

  // Extract all historical logs containing this exercise
  const exerciseHistory = useMemo(() => {
    if (!exerciseId) return [];
    const list: { workoutName: string; date: string; sets: any[] }[] = [];
    
    workoutHistory.forEach(log => {
      const match = log.exercises.find(e => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        list.push({
          workoutName: log.name,
          date: log.date,
          sets: match.sets
        });
      }
    });

    return list;
  }, [exerciseId, workoutHistory]);

  const isCardio = isDistanceTimeExercise(exercise);
  const isIso = isTimeOnlyExercise(exercise);

  // Compute Personal Records (PRs)
  const personalRecords = useMemo(() => {
    let maxWeight = 0;
    let maxReps = 0;
    let max1RM = 0;
    let maxVolume = 0;
    let maxDistance = 0;
    let maxTime = 0;
    let totalExecutions = 0;

    exerciseHistory.forEach(h => {
      let workoutVol = 0;
      h.sets.forEach(s => {
        totalExecutions++;
        const w = s.weight || 0;
        const r = s.reps || 0;
        const t = s.time || 0;
        const d = s.distance || 0;

        if (w > maxWeight) maxWeight = w;
        if (r > maxReps) maxReps = r;
        if (d > maxDistance) maxDistance = d;
        if (t > maxTime) maxTime = t;

        if (w > 0 && r > 0) {
          const estimated1RM = Math.round(w * (36 / (37 - Math.min(r, 36))));
          if (estimated1RM > max1RM) max1RM = estimated1RM;
          workoutVol += (w * r);
        }
      });
      if (workoutVol > maxVolume) maxVolume = workoutVol;
    });

    return { maxWeight, maxReps, max1RM, maxVolume, maxDistance, maxTime, totalExecutions };
  }, [exerciseHistory]);

  // Secondary muscles guessing or fallback
  const secondaryMuscles = useMemo(() => {
    if (!exercise) return [];
    const group = exercise.muscleGroup;
    switch (group) {
      case 'Pettorali': return ['Tricipiti', 'Spalle Anteriori', 'Core'];
      case 'Dorsali': return ['Bicipiti', 'Spalle Posteriori', 'Avambracci'];
      case 'Quadricipiti':
      case 'Femorali':
      case 'Glutei':
      case 'Polpacci':
      case 'Adduttori':
      case 'Abduttori': return ['Lombari', 'Core', 'Stabilità Bacino'];
      case 'Spalle':
      case 'Trapezi': return ['Tricipiti', 'Spalle Posteriori', 'Core'];
      case 'Bicipiti':
      case 'Tricipiti':
      case 'Avambracci': return ['Spalle', 'Presa', 'Braccia'];
      case 'Cardio': return ['Quadricipiti', 'Polpacci', 'Sistema Cardiovascolare'];
      case 'Addominali':
      case 'Lombari': return ['Flessori dell\'anca', 'Obliqui', 'Core'];
      default: return ['Core', 'Stabilità articolare'];
    }
  }, [exercise]);

  if (!exerciseId || !exercise) return null;

  return (
    <div 
      className="fixed inset-0 z-[5000] flex flex-col bg-[#0b0c10] text-white overflow-y-auto animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5000,
        backgroundColor: '#0b0c10',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* 1. TOP NAVIGATION BAR */}
      <div 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: 'rgba(11, 12, 16, 0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: 'white',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="Torna indietro"
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {exercise.name}
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#00a8ff', fontWeight: 600 }}>
            {exercise.muscleGroup} • {isCardio ? 'Cardio' : isIso ? 'Isometrico' : exercise.equipment}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: 'white',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="Chiudi"
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', padding: '20px 16px 60px 16px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* 2. VIDEO / CSS-HTML ANIMATED DEMO */}
        <div style={{
          background: 'linear-gradient(180deg, #151720 0%, #101117 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
        }}>
          {exercise.videoUrl ? (
            <video 
              src={exercise.videoUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const fallback = document.getElementById(`css-anim-${exercise.id}`);
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}

          {/* CSS/SVG High-Tech Animated Loop Fallback */}
          <div 
            id={`css-anim-${exercise.id}`}
            style={{
              display: exercise.videoUrl ? 'none' : 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 20px',
              position: 'relative',
              background: 'radial-gradient(circle at center, rgba(0, 168, 255, 0.12) 0%, rgba(16, 17, 23, 0.8) 70%)',
              minHeight: '220px'
            }}
          >
            {/* Animated Pulser */}
            <div style={{
              position: 'relative',
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'rgba(0, 168, 255, 0.12)',
              border: '2px solid rgba(0, 168, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              animation: 'pulseGlow 2s infinite ease-in-out'
            }}>
              {renderMuscleIcon(exercise.muscleGroup, 48, '#00a8ff')}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.04em' }}>
                GUIDA TECNICA E MOVIMENTO
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                Loop biometrico • Attivazione muscolare mirata
              </div>
            </div>

            {/* Stylized moving bar animation */}
            <div style={{
              width: '180px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              marginTop: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '60px',
                background: 'linear-gradient(90deg, #0084ff, #00d2ff)',
                borderRadius: '4px',
                animation: 'slideBar 1.8s infinite ease-in-out alternate'
              }} />
            </div>
          </div>
        </div>

        {/* 3. MUSCOLI PRIMARI E SECONDARI */}
        <div style={{
          background: '#12141c',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '18px'
        }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '12px' }}>
            Anatomia & Muscoli Coinvolti
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#00a8ff', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Target Primario:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{
                  background: 'rgba(0, 168, 255, 0.16)',
                  color: '#38bdf8',
                  border: '1px solid rgba(0, 168, 255, 0.35)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Zap size={14} /> {exercise.muscleGroup}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Sinergici & Secondari:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {secondaryMuscles.map((sec, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#d4d4d8',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}>
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. RECORD PERSONALI (PR) */}
        <div style={{
          background: '#12141c',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Award size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f59e0b', margin: 0 }}>
              Record Personali (PR)
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px'
          }}>
            {isCardio ? (
              <>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Distanza Massima</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '3px' }}>
                    {personalRecords.maxDistance > 0 ? `${personalRecords.maxDistance} km` : '—'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Miglior Tempo</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '3px' }}>
                    {personalRecords.maxTime > 0 ? `${personalRecords.maxTime} min` : '—'}
                  </div>
                </div>
              </>
            ) : isIso ? (
              <>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Max Tempo Tenuta</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '3px' }}>
                    {personalRecords.maxTime > 0 ? `${personalRecords.maxTime} sec` : '—'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1RM Stimato</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '3px' }}>
                    {personalRecords.max1RM > 0 ? `${personalRecords.max1RM} kg` : '—'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Peso Massimo</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00a8ff', marginTop: '3px' }}>
                    {personalRecords.maxWeight > 0 ? `${personalRecords.maxWeight} kg` : '—'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Max Ripetizioni</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '3px' }}>
                    {personalRecords.maxReps > 0 ? `${personalRecords.maxReps} reps` : '—'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Volume Massimo</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ec4899', marginTop: '3px' }}>
                    {personalRecords.maxVolume > 0 ? `${personalRecords.maxVolume} kg` : '—'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 5. GUIDA ESECUTIVA */}
        <div style={{
          background: '#12141c',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '18px'
        }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '10px' }}>
            Consigli di Esecuzione & Respirazione
          </h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.6', color: '#cbd5e1', margin: 0 }}>
            {exercise.instructions || 'Mantieni il core attivo e controlla la fase eccentrica del movimento per massimizzare la tensione muscolare.'}
          </p>
        </div>

        {/* 6. CRONOLOGIA COMPLETA ESECUZIONI */}
        <div style={{
          background: '#12141c',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#00a8ff" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#00a8ff', margin: 0 }}>
                Cronologia Esecuzioni Passate ({exerciseHistory.length})
              </h3>
            </div>
          </div>

          {exerciseHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
              <Dumbbell size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.84rem', margin: 0 }}>Nessuna esecuzione registrata finora per questo esercizio.</p>
              <p style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>Completa una sessione per vedere qui i tuoi progressi e record!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exerciseHistory.map((item, histIdx) => {
                const dateFormatted = new Date(item.date).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div key={histIdx} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>{item.workoutName}</span>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{dateFormatted}</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {item.sets.map((s, sIdx) => {
                        let text = '';
                        if (isCardio) {
                          text = `${s.distance || 0} km (${s.time || 0}m)`;
                        } else if (isIso) {
                          text = `${s.time || 0}s`;
                        } else {
                          text = `${s.weight}kg × ${s.reps}`;
                        }

                        return (
                          <span key={sIdx} style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            color: '#e2e8f0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ color: '#00a8ff', fontWeight: 700 }}>#{sIdx + 1}</span> {text}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(0, 168, 255, 0.2); }
          50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(0, 168, 255, 0.45); }
        }
        @keyframes slideBar {
          0% { left: 0%; }
          100% { left: calc(100% - 60px); }
        }
      `}</style>
    </div>
  );
};
