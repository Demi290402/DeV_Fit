import React, { useState } from 'react';
import { User, Scale, Activity, Calendar as CalendarIcon, Check, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { WorkoutLog } from '../context/AppContext';


export const Profile: React.FC = () => {
  const { profile, updateProfile, workoutHistory, foodLogs } = useApp();
  const [editing, setEditing] = useState(false);
  
  // Profile settings state
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState(profile.gender);
  const [targetKcal, setTargetKcal] = useState(profile.targetCalories.toString());
  const [targetP, setTargetP] = useState(profile.targetProtein.toString());
  const [targetC, setTargetC] = useState(profile.targetCarbs.toString());
  const [targetF, setTargetF] = useState(profile.targetFat.toString());

  // Measurement state
  const [waist, setWaist] = useState(profile.waist.toString());
  const [arms, setArms] = useState(profile.arms.toString());
  const [thighs, setThighs] = useState(profile.thighs.toString());
  const [bf, setBf] = useState(profile.bodyFat.toString());

  // Chart stats selector
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');
  const [metricType, setMetricType] = useState<'volume' | 'duration' | 'reps'>('volume');

  const handleSaveProfile = () => {
    updateProfile({
      name,
      gender,
      targetCalories: parseInt(targetKcal) || 1800,
      targetProtein: parseInt(targetP) || 120,
      targetCarbs: parseInt(targetC) || 185,
      targetFat: parseInt(targetF) || 55
    });
    setEditing(false);
  };

  const handleSaveMeasurements = () => {
    updateProfile({
      waist: parseFloat(waist) || 0,
      arms: parseFloat(arms) || 0,
      thighs: parseFloat(thighs) || 0,
      bodyFat: parseFloat(bf) || 0
    });
    alert('Misurazioni aggiornate!');
  };

  // --- STATS COMPUTATION FOR CHARTS ---
  const getFilteredLogs = (): WorkoutLog[] => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - parseInt(timeRange));
    return workoutHistory.filter(log => new Date(log.date).getTime() >= limitDate.getTime());
  };

  const renderStatsChart = () => {
    const logs = getFilteredLogs().reverse(); // Chronological

    if (logs.length === 0) {
      return (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dark)', fontSize: '0.8rem' }}>
          Nessun dato di allenamento registrato in questo arco temporale.
        </div>
      );
    }

    // Extract metrics values
    const chartData = logs.map(log => {
      let val = 0;
      if (metricType === 'volume') {
        val = log.volume;
      } else if (metricType === 'duration') {
        val = Math.round(log.duration / 60); // minutes
      } else if (metricType === 'reps') {
        // sum all completed reps
        log.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            if (s.completed) val += s.reps;
          });
        });
      }
      return {
        label: new Date(log.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
        value: val
      };
    });

    const values = chartData.map(d => d.value);
    const maxVal = Math.max(...values) || 10;

    // SVG parameters
    const svgW = 380;
    const svgH = 140;
    const padX = 40;
    const padY = 20;
    const chartW = svgW - 2 * padX;
    const chartH = svgH - 2 * padY;

    // Drawing lines & bars
    const barWidth = Math.max(10, (chartW / chartData.length) - 10);
    const stepX = chartData.length > 1 ? chartW / (chartData.length - 1) : chartW;

    return (
      <div style={{ marginTop: '16px' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto' }}>
          {/* Grid lines */}
          <line x1={padX} y1={padY} x2={svgW - padX} y2={padY} stroke="rgba(255,255,255,0.03)" />
          <line x1={padX} y1={padY + chartH/2} x2={svgW - padX} y2={padY + chartH/2} stroke="rgba(255,255,255,0.03)" />
          <line x1={padX} y1={padY + chartH} x2={svgW - padX} y2={padY + chartH} stroke="rgba(255,255,255,0.08)" />

          {/* Draw bars */}
          {chartData.map((d, i) => {
            const pct = d.value / maxVal;
            const h = chartH * pct;
            const x = padX + i * stepX - barWidth/2;
            const y = padY + chartH - h;

            return (
              <g key={i}>
                {/* Glowing bar */}
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={h} 
                  rx="3" 
                  fill={`url(#glowGrad-${metricType})`}
                  style={{ filter: 'drop-shadow(0px 2px 4px rgba(139, 92, 246, 0.15))' }}
                />
                {/* Value text */}
                <text x={x + barWidth/2} y={y - 5} fill="white" fontSize="7" fontWeight="700" textAnchor="middle">
                  {d.value}
                </text>
                {/* Label text */}
                <text x={x + barWidth/2} y={svgH - 5} fill="var(--text-muted)" fontSize="7" textAnchor="middle">
                  {d.label}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="glowGrad-volume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient id="glowGrad-duration" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" />
              <stop offset="100%" stopColor="#155e75" />
            </linearGradient>
            <linearGradient id="glowGrad-reps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#831843" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  // --- MOCK CONSISTENCY CALENDAR GRID (Last 28 Days) ---
  const renderConsistencyGrid = () => {
    const blocks = [];
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      // Check training or diet logs
      const hasWorkout = workoutHistory.some(log => log.date.split('T')[0] === dStr);
      const hasFood = !!foodLogs[dStr] && foodLogs[dStr].length > 0;

      let color = 'rgba(255, 255, 255, 0.03)'; // gray default
      let title = `Nessun record per il ${d.toLocaleDateString()}`;

      if (hasWorkout && hasFood) {
        color = 'var(--color-success)'; // Emerald green for full consistency
        title = `Allenamento e Dieta loggati! (${d.toLocaleDateString()})`;
      } else if (hasWorkout) {
        color = 'var(--color-primary)'; // Violet for workout
        title = `Solo Allenamento loggato (${d.toLocaleDateString()})`;
      } else if (hasFood) {
        color = 'var(--color-secondary)'; // Cyan for food
        title = `Solo Dieta loggata (${d.toLocaleDateString()})`;
      }

      blocks.push(
        <div 
          key={i} 
          style={{
            background: color, 
            width: '18px', 
            height: '18px', 
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.02)'
          }}
          title={title}
        />
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '10px' }}>
        {blocks}
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      
      {/* Header Profile Title */}
      <div className="flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={22} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Profilo & Statistiche</h2>
        </div>
        <button className="btn-secondary" onClick={() => setEditing(!editing)} style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
          <Settings size={14} style={{ marginRight: '4px' }} />
          {editing ? 'Annulla' : 'Modifica'}
        </button>
      </div>

      {/* Editing Settings Profile */}
      {editing ? (
        <div className="glass-card animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Modifica Account</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nome Utente</label>
            <input 
              type="text" 
              className="set-input" 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '10px', textAlign: 'left' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Genere</label>
            <select 
              className="set-input" 
              value={gender} 
              onChange={e => setGender(e.target.value as any)}
              style={{ width: '100%', height: '38px', padding: '0 10px' }}
            >
              <option value="male">Maschio</option>
              <option value="female">Femmina</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Calorie Obiettivo</label>
              <input 
                type="number" 
                className="set-input" 
                value={targetKcal} 
                onChange={e => setTargetKcal(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pro target (g)</label>
              <input 
                type="number" 
                className="set-input" 
                value={targetP} 
                onChange={e => setTargetP(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Carbi target (g)</label>
              <input 
                type="number" 
                className="set-input" 
                value={targetC} 
                onChange={e => setTargetC(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Grassi target (g)</label>
              <input 
                type="number" 
                className="set-input" 
                value={targetF} 
                onChange={e => setTargetF(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleSaveProfile} style={{ padding: '10px' }}>
            <Check size={16} /> Salva Impostazioni
          </button>
        </div>
      ) : (
        /* Account Info Display */
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
            {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{profile.name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              Genere: {profile.gender === 'female' ? 'Femmina' : 'Maschio'} • Peso: {profile.weight} kg
            </span>
          </div>
        </div>
      )}

      {/* Body Measurements Log Card */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <Scale size={16} color="var(--color-secondary)" /> Registro Misure Corporee
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Vita (cm)</span>
            <input type="number" className="set-input" value={waist} onChange={e => setWaist(e.target.value)} style={{ width: '100%', height: '32px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Braccio (cm)</span>
            <input type="number" className="set-input" value={arms} onChange={e => setArms(e.target.value)} style={{ width: '100%', height: '32px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Coscia (cm)</span>
            <input type="number" className="set-input" value={thighs} onChange={e => setThighs(e.target.value)} style={{ width: '100%', height: '32px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Massa G. (%)</span>
            <input type="number" className="set-input" value={bf} onChange={e => setBf(e.target.value)} style={{ width: '100%', height: '32px' }} />
          </div>
        </div>

        <button className="btn-secondary" onClick={handleSaveMeasurements} style={{ width: '100%', padding: '8px', fontSize: '0.75rem' }}>
          Aggiorna Misure
        </button>
      </div>

      {/* Fitness Logs Statistics with filters */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Activity size={16} color="var(--color-primary)" /> Dashboard Statistiche
        </h3>

        {/* Filter selectors */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
          {/* Time range */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['7', '30', '90'] as const).map(range => (
              <button 
                key={range} 
                className={`filter-badge ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
                style={{ padding: '4px 10px', fontSize: '0.68rem' }}
              >
                {range} gg
              </button>
            ))}
          </div>

          {/* Metric Selector */}
          <select 
            className="set-input" 
            value={metricType}
            onChange={e => setMetricType(e.target.value as any)}
            style={{ height: '28px', fontSize: '0.68rem', padding: '0 4px', width: '90px' }}
          >
            <option value="volume">Volume (kg)</option>
            <option value="duration">Tempo (min)</option>
            <option value="reps">Ripetizioni</option>
          </select>
        </div>

        {/* SVG chart rendering */}
        {renderStatsChart()}
      </div>

      {/* Monthly Consistency Calendar Map */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarIcon size={16} color="var(--color-success)" /> Mappa di Costanza (Ultimi 28gg)
        </h3>
        
        {renderConsistencyGrid()}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-success)' }} />
            <span>Allenamento + Dieta</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-primary)' }} />
            <span>Solo Allenamento</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-secondary)' }} />
            <span>Solo Dieta</span>
          </div>
        </div>
      </div>

    </div>
  );
};
