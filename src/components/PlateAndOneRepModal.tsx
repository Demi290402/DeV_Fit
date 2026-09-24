import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Disc, Award } from 'lucide-react';

interface PlateAndOneRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: number;
  initialReps?: number;
  onApplyWeight?: (weight: number) => void;
}

export const PlateAndOneRepModal: React.FC<PlateAndOneRepModalProps> = ({
  isOpen,
  onClose,
  initialWeight = 60,
  initialReps = 8,
  onApplyWeight
}) => {
  const [activeTab, setActiveTab] = useState<'plate' | '1rm'>('plate');

  // Plate Calculator State
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight > 0 ? initialWeight : 60);
  const [barbellWeight, setBarbellWeight] = useState<number>(20); // 20kg olimpico standard
  const availablePlates = [20, 15, 10, 5, 2.5, 1.25];

  // 1RM Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(initialWeight > 0 ? initialWeight : 60);
  const [calcReps, setCalcReps] = useState<number>(initialReps > 0 ? initialReps : 8);

  if (!isOpen) return null;

  // Calculate plates per side
  const weightPerSide = Math.max(0, (targetWeight - barbellWeight) / 2);
  const calculatePlates = (sideWeight: number) => {
    let remaining = sideWeight;
    const result: { weight: number; count: number }[] = [];

    for (const plate of availablePlates) {
      if (remaining >= plate) {
        const count = Math.floor(remaining / plate);
        result.push({ weight: plate, count });
        remaining = Math.round((remaining - count * plate) * 100) / 100;
      }
    }
    return { plates: result, remainingRemainder: remaining };
  };

  const { plates, remainingRemainder } = calculatePlates(weightPerSide);

  // 1RM Formulas (Brzycki & Epley)
  const calculate1RM = (weight: number, reps: number) => {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;
    const epley = weight * (1 + reps / 30);
    const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : epley;
    return Math.round(((epley + brzycki) / 2) * 10) / 10;
  };

  const estimated1RM = calculate1RM(calcWeight, calcReps);

  const percentageTable = [
    { pct: 100, reps: '1', label: 'Massimale (1RM)' },
    { pct: 95, reps: '2', label: 'Forza Massimale' },
    { pct: 90, reps: '3-4', label: 'Forza Pura' },
    { pct: 85, reps: '5-6', label: 'Forza / Ipertrofia' },
    { pct: 80, reps: '7-8', label: 'Ipertrofia Standard' },
    { pct: 75, reps: '9-10', label: 'Ipertrofia / Volume' },
    { pct: 70, reps: '12-15', label: 'Resistenza Muscolare' }
  ];

  const getPlateColor = (weight: number) => {
    switch (weight) {
      case 20: return { bg: '#2563eb', border: '#3b82f6', text: '#ffffff' }; // Blu olimpico
      case 15: return { bg: '#eab308', border: '#facc15', text: '#050506' }; // Giallo
      case 10: return { bg: '#16a34a', border: '#22c55e', text: '#ffffff' }; // Verde
      case 5:  return { bg: '#f8fafc', border: '#cbd5e1', text: '#050506' }; // Bianco
      case 2.5: return { bg: '#475569', border: '#64748b', text: '#ffffff' }; // Grigio scuro
      case 1.25: return { bg: '#d4af37', border: '#f59e0b', text: '#050506' }; // Oro DeV Fit
      default: return { bg: '#333333', border: '#555555', text: '#ffffff' };
    }
  };

  return createPortal(
    <div className="drawer-backdrop" onClick={onClose}>
      <div 
        className="drawer-content animate-scale-in" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '480px', 
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.15)'
        }}
      >
        {/* Header with Tabs */}
        <div className="drawer-header" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('plate')}
              style={{
                background: activeTab === 'plate' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === 'plate' ? '#050506' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.8rem',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Disc size={15} /> Calcola Dischi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('1rm')}
              style={{
                background: activeTab === '1rm' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === '1rm' ? '#050506' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.8rem',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Award size={15} /> Massimale 1RM
            </button>
          </div>
          <button 
            type="button"
            className="drawer-close"
            onClick={onClose} 
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* --- TAB 1: PLATE CALCULATOR --- */}
          {activeTab === 'plate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Target Weight Inputs */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Peso Totale Desiderato (Bilanciere + Dischi)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTargetWeight(prev => Math.max(barbellWeight, prev - 5))}
                  style={{
                    width: '40px',
                    height: '42px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setTargetWeight(prev => Math.max(barbellWeight, prev - 2.5))}
                  style={{
                    width: '40px',
                    height: '42px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  -2.5
                </button>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={targetWeight || ''}
                    onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1.5px solid var(--color-primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 36px 10px 12px',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                    kg
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTargetWeight(prev => prev + 2.5)}
                  style={{
                    width: '40px',
                    height: '42px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +2.5
                </button>
                <button
                  type="button"
                  onClick={() => setTargetWeight(prev => prev + 5)}
                  style={{
                    width: '40px',
                    height: '42px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +5
                </button>
              </div>
            </div>

            {/* Barbell Type Selection */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Peso del Bilanciere
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { weight: 20, label: 'Olimpico (20 kg)' },
                  { weight: 15, label: 'Donna/Tecnico (15 kg)' },
                  { weight: 10, label: 'EZ / Corto (10 kg)' }
                ].map(bar => (
                  <button
                    type="button"
                    key={bar.weight}
                    onClick={() => {
                      setBarbellWeight(bar.weight);
                      if (targetWeight < bar.weight) setTargetWeight(bar.weight);
                    }}
                    style={{
                      background: barbellWeight === bar.weight ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: barbellWeight === bar.weight ? '1.5px solid var(--color-primary)' : '1px solid var(--border-color)',
                      color: barbellWeight === bar.weight ? 'var(--color-primary)' : 'var(--text-muted)',
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {bar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Barbell Graphic */}
            <div style={{
              background: 'linear-gradient(180deg, #0a0a0c 0%, #121216 100%)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Carico per Lato:</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{weightPerSide} kg</span>
              </div>

              {/* Barbell Sleeve Visual */}
              <div style={{
                width: '100%',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                justifyContent: 'center',
                overflowX: 'auto',
                padding: '4px'
              }}>
                {/* Bar shaft */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '10px',
                  background: 'linear-gradient(180deg, #71717a 0%, #3f3f46 100%)',
                  borderRadius: '2px',
                  zIndex: 0
                }} />

                {/* Barbell collar stop */}
                <div style={{
                  width: '14px',
                  height: '56px',
                  background: 'linear-gradient(180deg, #a1a1aa 0%, #52525b 100%)',
                  borderRadius: '3px',
                  border: '1px solid #27272a',
                  zIndex: 1,
                  marginRight: '6px'
                }} />

                {/* Plates stack on the sleeve */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', zIndex: 2 }}>
                  {plates.length === 0 ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', fontStyle: 'italic', zIndex: 3 }}>
                      Nessun disco necessario (solo bilanciere)
                    </span>
                  ) : (
                    plates.map(p => {
                      const col = getPlateColor(p.weight);
                      const heightPx = Math.max(34, 24 + p.weight * 1.8);
                      return Array.from({ length: p.count }).map((_, i) => (
                        <div
                          key={`${p.weight}-${i}`}
                          style={{
                            width: p.weight >= 10 ? '16px' : '12px',
                            height: `${heightPx}px`,
                            background: col.bg,
                            border: `1.5px solid ${col.border}`,
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: col.text,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            userSelect: 'none'
                          }}
                          title={`Disco da ${p.weight} kg`}
                        >
                          {p.weight}
                        </div>
                      ));
                    })
                  )}
                </div>
              </div>

              {/* Plate Legend List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', justifyContent: 'center' }}>
                {plates.map(p => (
                  <span 
                    key={p.weight} 
                    style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      padding: '4px 8px', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <strong>{p.count}x</strong> {p.weight} kg per lato
                  </span>
                ))}
              </div>

              {remainingRemainder > 0 && (
                <span style={{ fontSize: '0.68rem', color: '#f59e0b' }}>
                  ⚠️ Differenza di {remainingRemainder * 2} kg non caricabile con dischi standard.
                </span>
              )}
            </div>

            {onApplyWeight && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onApplyWeight(targetWeight);
                  onClose();
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                Applica {targetWeight} kg al Set
              </button>
            )}
          </div>
        )}

        {/* --- TAB 2: 1RM ESTIMATOR --- */}
        {activeTab === '1rm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Input Weight and Reps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Peso Sollevato (kg)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={calcWeight || ''}
                  onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Ripetizioni Eseguite
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="30"
                  value={calcReps || ''}
                  onChange={(e) => setCalcReps(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>

            {/* Estimated 1RM Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(10, 10, 12, 0.9) 100%)',
              border: '1.5px solid var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.15)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Massimale Stimato (1RM Teorico)
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '4px' }}>
                {estimated1RM} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span>
              </div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-dark)', marginTop: '4px' }}>
                Basato sulla combinazione validata delle formule scientifiche di Brzycki ed Epley.
              </p>
            </div>

            {/* Percentage Training Table */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)', display: 'block', marginBottom: '8px' }}>
                Percentuali di Lavoro & Obiettivi
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {percentageTable.map(row => {
                  const load = Math.round(estimated1RM * (row.pct / 100) * 10) / 10;
                  return (
                    <div 
                      key={row.pct}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', minWidth: '42px' }}>
                          {row.pct}%
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          ~{row.reps} rep ({row.label})
                        </span>
                      </div>
                      <span style={{ fontWeight: 800, color: 'white' }}>
                        {load} kg
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
};
