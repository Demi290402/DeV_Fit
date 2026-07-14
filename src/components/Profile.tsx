import React, { useState } from 'react';
import { User, Scale, Activity, Calendar as CalendarIcon, Check, Settings, LogOut, Trash2, ShieldAlert, Download } from 'lucide-react';

import { useApp } from '../context/AppContext';
import type { WorkoutLog } from '../context/AppContext';
import { CycleTracker } from './CycleTracker';
import { DeviceSyncHub } from './DeviceSyncHub';

const compressImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error("Il file selezionato non è un'immagine valida."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || img.width || maxWidth;
        let height = img.naturalHeight || img.height || maxHeight;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Impossibile inizializzare il contesto Canvas."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG blob first (more memory efficient than toDataURL on mobile)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileReader = new FileReader();
              fileReader.onloadend = () => {
                resolve(fileReader.result as string);
              };
              fileReader.onerror = () => {
                reject(new Error("Errore durante la codifica base64."));
              };
              fileReader.readAsDataURL(blob);
            } else {
              reject(new Error("Errore nella compressione del blob."));
            }
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => {
        reject(new Error("Errore nel caricamento dei dati dell'immagine."));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Errore di lettura del file."));
    };
  });
};



export const Profile: React.FC = () => {
  const { profile, updateProfile, workoutHistory, foodLogs, signOut, deleteAccountAndData } = useApp();
  const [editing, setEditing] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // Profile settings state
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height ? profile.height.toString() : '165');
  const [weight, setWeight] = useState(profile.weight.toString());
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl || '');
  const [targetKcal, setTargetKcal] = useState(profile.targetCalories.toString());
  const [targetP, setTargetP] = useState(profile.targetProtein.toString());
  const [targetC, setTargetC] = useState(profile.targetCarbs.toString());
  const [targetF, setTargetF] = useState(profile.targetFat.toString());

  // Measurement state
  const [waist, setWaist] = useState(profile.waist.toString());
  const [arms, setArms] = useState(profile.arms.toString());
  const [thighs, setThighs] = useState(profile.thighs.toString());
  const [bf, setBf] = useState(profile.bodyFat.toString());

  // Sync state with profile (e.g. from smartscale data update)
  React.useEffect(() => {
    setName(profile.name);
    setGender(profile.gender);
    setHeight(profile.height ? profile.height.toString() : '165');
    setWeight(profile.weight.toString());
    setAvatarUrl(profile.avatarUrl || '');
    setBannerUrl(profile.bannerUrl || '');
    setTargetKcal(profile.targetCalories.toString());
    setTargetP(profile.targetProtein.toString());
    setTargetC(profile.targetCarbs.toString());
    setTargetF(profile.targetFat.toString());
    
    setWaist(profile.waist.toString());
    setArms(profile.arms.toString());
    setThighs(profile.thighs.toString());
    setBf(profile.bodyFat.toString());
  }, [profile]);

  // Chart stats selector
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');
  const [metricType, setMetricType] = useState<'volume' | 'duration' | 'reps'>('volume');

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const maxWidth = type === 'avatar' ? 300 : 800;
      const maxHeight = type === 'avatar' ? 300 : 260;
      
      const compressed = await compressImage(file, maxWidth, maxHeight);
      if (type === 'avatar') {
        setAvatarUrl(compressed);
      } else {
        setBannerUrl(compressed);
      }
    } catch (err) {
      console.error(err);
      alert("Errore durante la compressione dell'immagine. Riprova con un altro file.");
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name,
      gender,
      height: parseFloat(height) || 165,
      weight: parseFloat(weight) || 60.0,
      avatarUrl,
      bannerUrl,
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

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'ATTENZIONE: Questa azione è irreversibile. Verranno eliminati permanentemente il tuo account, il tuo profilo e tutta la cronologia dei tuoi allenamenti e pasti. Vuoi procedere?'
    );
    if (confirmation) {
      await deleteAccountAndData();
    }
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
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={h} 
                  rx="3" 
                  fill={`url(#glowGrad-${metricType})`}
                  style={{ filter: 'drop-shadow(0px 2px 4px rgba(139, 92, 246, 0.15))' }}
                />
                <text x={x + barWidth/2} y={y - 5} fill="white" fontSize="7" fontWeight="700" textAnchor="middle">
                  {d.value}
                </text>
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

      const hasWorkout = workoutHistory.some(log => log.date.split('T')[0] === dStr);
      const hasFood = !!foodLogs[dStr] && foodLogs[dStr].length > 0;

      let color = 'rgba(255, 255, 255, 0.03)';
      let title = `Nessun record per il ${d.toLocaleDateString()}`;

      if (hasWorkout && hasFood) {
        color = 'var(--color-success)';
        title = `Allenamento e Dieta loggati! (${d.toLocaleDateString()})`;
      } else if (hasWorkout) {
        color = 'var(--color-primary)';
        title = `Solo Allenamento loggato (${d.toLocaleDateString()})`;
      } else if (hasFood) {
        color = 'var(--color-secondary)';
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
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Altezza (cm)</label>
              <input 
                type="number" 
                className="set-input" 
                value={height} 
                onChange={e => setHeight(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Peso (kg)</label>
              <input 
                type="number" 
                className="set-input" 
                value={weight} 
                onChange={e => setWeight(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>
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

          {/* Immagini del Profilo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Foto Profilo</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  id="avatar-upload" 
                  onChange={e => handleUploadImage(e, 'avatar')}
                  style={{ display: 'none' }} 
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="btn-secondary" 
                  style={{ 
                    flex: 1, 
                    padding: '8px 10px', 
                    fontSize: '0.7rem', 
                    height: '34px', 
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0
                  }}
                >
                  Carica Foto
                </label>
                {avatarUrl && (
                  <button 
                    className="icon-btn" 
                    onClick={() => setAvatarUrl('')} 
                    style={{ width: '34px', height: '34px', color: 'var(--color-error)', flexShrink: 0 }}
                    title="Rimuovi Foto Profilo"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Foto Sfondo</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  id="banner-upload" 
                  onChange={e => handleUploadImage(e, 'banner')}
                  style={{ display: 'none' }} 
                />
                <label 
                  htmlFor="banner-upload" 
                  className="btn-secondary" 
                  style={{ 
                    flex: 1, 
                    padding: '8px 10px', 
                    fontSize: '0.7rem', 
                    height: '34px', 
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0
                  }}
                >
                  Carica Copertina
                </label>
                {bannerUrl && (
                  <button 
                    className="icon-btn" 
                    onClick={() => setBannerUrl('')} 
                    style={{ width: '34px', height: '34px', color: 'var(--color-error)', flexShrink: 0 }}
                    title="Rimuovi Sfondo"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={handleSaveProfile} style={{ padding: '10px' }}>
            <Check size={16} /> Salva Impostazioni
          </button>
        </div>
      ) : (
        /* Account Info Display (Redesigned with Banner, Avatar & Dynamic BMI - No overlaps) */
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}>
          {/* Banner container */}
          <div style={{ 
            height: '110px', 
            width: '100%', 
            backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : 'linear-gradient(135deg, var(--color-primary) 0%, #1a1505 100%)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }} />
          
          {/* Avatar and User details area */}
          <div style={{ padding: '16px', position: 'relative', marginTop: '-36px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
              {/* Avatar circle */}
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                border: '3px solid var(--color-primary)', 
                background: '#050506', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                flexShrink: 0
              }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Logout button */}
              <button 
                className="icon-btn" 
                onClick={signOut} 
                title="Disconnettiti" 
                style={{ 
                  color: 'var(--color-error)', 
                  width: '34px', 
                  height: '34px', 
                  background: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                  margin: 0
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
            
            {/* Info details aligned cleanly below to prevent overlap */}
            <div style={{ marginTop: '2px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>{profile.name}</h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Genere: <strong style={{ color: 'white', textTransform: 'capitalize' }}>{profile.gender === 'female' ? 'Femmina' : 'Maschio'}</strong></span>
                <span>Altezza: <strong style={{ color: 'white' }}>{profile.height || 165} cm</strong></span>
                <span>Peso: <strong style={{ color: 'white' }}>{profile.weight} kg</strong></span>
                {profile.height && profile.weight && (
                  <span>BMI: <strong style={{ color: 'var(--color-primary)' }}>
                    {(profile.weight / Math.pow((profile.height || 165) / 100, 2)).toFixed(1)}
                  </strong></span>
                )}
              </div>
            </div>
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

      {/* Smart wearable sync hub */}
      <DeviceSyncHub />

      {/* Embedded Cycle Tracker: Render only for Female Users */}
      {profile.gender === 'female' && (
        <div style={{ marginTop: '4px' }}>
          <CycleTracker />
        </div>
      )}

      {/* Fitness Logs Statistics with filters */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Activity size={16} color="var(--color-primary)" /> Dashboard Statistiche
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
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

      {/* PWA Install Guide Card */}
      <div className="glass-card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Download size={16} color="var(--color-primary)" /> Installa DeV Fit sul tuo Dispositivo
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Installa l'app per un'esperienza a tutto schermo fluida ed immediata:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <p>
            <strong>📱 Su iPhone/iPad (Safari)</strong>: Tocca il pulsante di <strong>Condividi</strong> (quadrato con freccia verso l'alto) nel browser, scorri verso il basso e seleziona <strong>"Aggiungi alla schermata Home"</strong>.
          </p>
          <p style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
            <strong>🤖 Su Android (Chrome)</strong>: Tocca il menu a tre puntini in alto a destra e seleziona <strong>"Installa app"</strong>, oppure usa il pulsante nella Dashboard principale.
          </p>
        </div>
      </div>

      {/* Compliance / Privacy Policy / Deletion Area */}
      <div className="glass-card" style={{ border: '1px dashed rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-error)' }}>
          <ShieldAlert size={16} /> Data Security & GDPR
        </h3>
        <p style={{ fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-muted)' }}>
          Gestisci i tuoi consensi e la rimozione definitiva dei tuoi dati personali ed account (conforme alle linee guida di Google Play e Apple Store).
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setShowPrivacyModal(true)}
            style={{ flex: 1, padding: '8px', fontSize: '0.72rem' }}
          >
            Informativa Privacy
          </button>
          <button 
            className="btn-primary" 
            onClick={handleDeleteAccount}
            style={{ flex: 1, padding: '8px', fontSize: '0.72rem', background: 'linear-gradient(135deg, var(--color-error) 0%, #b91c1c 100%)', boxShadow: 'none' }}
          >
            <Trash2 size={12} /> Elimina Account & Dati
          </button>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="drawer-backdrop" onClick={() => setShowPrivacyModal(false)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', paddingBottom: '30px' }}>
            <div className="drawer-header">
              <h3 className="section-title">Informativa sulla Privacy</h3>
              <button className="drawer-close" onClick={() => setShowPrivacyModal(false)}><Check size={20} /></button>
            </div>
            
            <div style={{ fontSize: '0.78rem', lineHeight: '1.5', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', maxHeight: '450px', overflowY: 'auto', paddingRight: '6px' }}>
              <p><strong>Ultimo aggiornamento: 14 Luglio 2026</strong></p>
              
              <p>La presente Informativa sulla Privacy descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati sensibili all'interno dell'applicazione DeV Fit, in conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR) e i requisiti delle piattaforme Google Play e App Store.</p>

              
              <h5 style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>1. Dati Raccolti</h5>
              <p>Raccogliamo le seguenti categorie di dati per consentire il funzionamento corretto delle funzioni dell'app:</p>
              <ul>
                <li><strong>Dati di Autenticazione:</strong> Email, password e nome forniti durante la registrazione.</li>
                <li><strong>Metriche Fisiche:</strong> Peso, percentuale di grasso, e circonferenze corporee (vita, braccia, cosce).</li>
                <li><strong>Dati di Allenamento:</strong> Esercizi eseguiti, carichi sollevati, ripetizioni e tempi di recupero.</li>
                <li><strong>Dati Nutrizionali:</strong> Alimenti e cibi registrati nel diario alimentare giornaliero.</li>
                <li><strong>Dati Sanitari Femminili (opzionale):</strong> Date di inizio del ciclo mestruale e sintomi segnalati, per il calcolo delle fasi del ciclo.</li>
              </ul>

              <h5 style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>2. Finalità del Trattamento</h5>
              <p>I dati sono utilizzati esclusivamente per mostrarti statistiche personali, calcolare i tuoi massimali (1RM), visualizzare il diario alimentare e fornire suggerimenti sportivi/nutrizionali personalizzati. Nessun dato viene venduto o condiviso con scopi commerciali.</p>

              <h5 style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>3. Condivisione dei Dati (Social)</h5>
              <p>Gli allenamenti completati (durata, volume totale e record infranti) vengono pubblicati sul feed social visibile esclusivamente agli utenti con cui hai stretto amicizia nell'applicazione. Puoi smettere di condividere in qualsiasi momento.</p>

              <h5 style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>4. Diritti dell'Utente e Cancellazione dei Dati</h5>
              <p>In conformità con il GDPR e le linee guida per gli store, hai il diritto di accedere ai tuoi dati ed ottenerne la rimozione permanente in qualsiasi momento. All'interno del tuo Profilo è presente il pulsante <strong>"Elimina Account & Dati"</strong>, il quale provvederà a cancellare istantaneamente e in modo irreversibile ogni traccia del tuo profilo e dei tuoi registri fisici dal nostro database cloud e locale.</p>
            </div>
            
            <button className="btn-primary" onClick={() => setShowPrivacyModal(false)} style={{ width: '100%', marginTop: '20px' }}>
              Ho Capito
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
