import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Scale, Calendar as CalendarIcon, Check, Settings, LogOut, 
  Trash2, ShieldAlert, Camera, Share2, Dumbbell, BarChart2, 
  MoreHorizontal, ChevronDown, Edit3, Award, Clock, X, Search,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { WorkoutLog } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, type MuscleGroup } from '../data/mockExercises';
import { CycleTracker } from './CycleTracker';
import { DeviceSyncHub } from './DeviceSyncHub';
import { WorkoutDetailView, type DetailedWorkout, type DetailedWorkoutExercise } from './WorkoutDetailView';
import { MuscleHeatmap } from './MuscleHeatmap';

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
          0.75
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
  const { 
    profile, 
    updateProfile, 
    workoutHistory, 
    foodLogs, 
    updateWorkoutLog,
    deleteWorkoutLog,
    signOut, 
    deleteAccountAndData 
  } = useApp();

  // Active Modals state
  const [activeModal, setActiveModal] = useState<
    'settings' | 'stats' | 'exercises' | 'measurements' | 'calendar' | 'privacy' | 'recovery' | null
  >(null);
  
  // Selected Workout for full detailed view
  const [selectedDetailedWorkout, setSelectedDetailedWorkout] = useState<DetailedWorkout | null>(null);

  const openWorkoutDetail = (log: WorkoutLog) => {
    const totalVolume = log.volume || log.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
    }, 0);
    const totalSets = log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
    const recordsCount = log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.is1RM || s.isMaxVolume || s.isMaxWeight).length, 0);

    const exercisesDetailed: DetailedWorkoutExercise[] = log.exercises.map(ex => {
      const detail = mockExercises.find(m => m.id === ex.exerciseId);
      const name = detail ? detail.name : 'Esercizio';
      const muscleGroup: MuscleGroup = detail ? detail.muscleGroup : 'Pettorali';
      const category = detail ? detail.category : 'Schiena';

      return {
        exerciseId: ex.exerciseId,
        name,
        muscleGroup,
        category,
        notes: ex.notes,
        sets: ex.sets.map((s, idx) => ({
          setNumber: idx + 1,
          type: 'normal',
          weight: s.weight,
          reps: s.reps,
          distance: s.distance,
          timeSeconds: s.time,
          is1RM: s.is1RM,
          isMaxVolume: s.isMaxVolume,
          isMaxWeight: s.isMaxWeight,
          completed: s.completed
        }))
      };
    });

    setSelectedDetailedWorkout({
      id: `user-w-${log.id}`,
      isUserPost: true,
      username: profile.name.toLowerCase().replace(/\s+/g, '') || 'demi02',
      userAvatar: profile.avatarUrl || '',
      date: new Date(log.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' }),
      rawDate: log.date,
      workoutName: log.name || 'Allenamento',
      durationMinutes: Math.max(1, Math.round(log.duration / 60)),
      volume: totalVolume,
      totalSets,
      recordsCount,
      avgHeartRate: log.avgHeartRate && log.avgHeartRate > 0 ? log.avgHeartRate : undefined,
      heartRateData: log.heartRateSamples && log.heartRateSamples.length > 0 ? log.heartRateSamples : undefined,
      calories: log.caloriesBurned,
      deviceSynced: log.deviceSource,
      exercises: exercisesDetailed,
      likes: [],
      comments: [],
      originalWorkoutLog: log
    });
  };

  // Profile Form state
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height ? profile.height.toString() : '175');
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

  // Chart Metric & Timeframe
  const [metricType, setMetricType] = useState<'duration' | 'volume' | 'reps'>('duration');
  const [timeRangeDays, setTimeRangeDays] = useState<number>(90); // 90 = Ultimi 3 mesi
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  // Exercises Modal search & filter
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState('all');

  // Workout History Three-dot dropdown menu
  const [activeMenuWorkoutId, setActiveMenuWorkoutId] = useState<string | null>(null);

  // Sync state with profile
  React.useEffect(() => {
    setName(profile.name);
    setGender(profile.gender);
    setHeight(profile.height ? profile.height.toString() : '175');
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

  // Username generator
  const username = useMemo(() => {
    const raw = profile.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return raw ? raw : 'demi02';
  }, [profile.name]);

  // Image Upload handler
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const maxWidth = type === 'avatar' ? 300 : 800;
      const maxHeight = type === 'avatar' ? 300 : 260;
      const compressed = await compressImage(file, maxWidth, maxHeight);
      
      if (type === 'avatar') {
        setAvatarUrl(compressed);
        updateProfile({ avatarUrl: compressed });
      } else {
        setBannerUrl(compressed);
        updateProfile({ bannerUrl: compressed });
      }
      window.dispatchEvent(new CustomEvent('df_data_updated'));
    } catch (err) {
      console.error(err);
      alert("Errore durante il caricamento dell'immagine. Riprova.");
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name,
      gender,
      height: parseFloat(height) || 175,
      weight: parseFloat(weight) || 70,
      avatarUrl,
      bannerUrl,
      targetCalories: parseInt(targetKcal) || 2000,
      targetProtein: parseInt(targetP) || 140,
      targetCarbs: parseInt(targetC) || 200,
      targetFat: parseInt(targetF) || 60
    });
    setActiveModal(null);
  };

  const handleSaveMeasurements = () => {
    updateProfile({
      weight: parseFloat(weight) || profile.weight,
      waist: parseFloat(waist) || 0,
      arms: parseFloat(arms) || 0,
      thighs: parseFloat(thighs) || 0,
      bodyFat: parseFloat(bf) || 0
    });
    setActiveModal(null);
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'ATTENZIONE: Questa azione è irreversibile. Verranno eliminati permanentemente il tuo account, il tuo profilo e tutti gli allenamenti e cibi salvati. Vuoi procedere?'
    );
    if (confirmation) {
      await deleteAccountAndData();
    }
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profilo di ${profile.name} su DeV Fit`,
          text: `Guarda il mio profilo fitness e i miei progressi su DeV Fit!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or aborted
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link al profilo copiato negli appunti!');
    }
  };

  // --- WEEKLY AGGREGATION FOR BAR CHART ---
  const weeklyChartData = useMemo(() => {
    const numWeeks = timeRangeDays === 30 ? 4 : timeRangeDays === 90 ? 12 : timeRangeDays === 180 ? 24 : 52;
    const now = new Date();
    // Align to Sunday/Monday or 7-day increments
    const data: { label: string; value: number; isCurrentWeek: boolean }[] = [];

    for (let w = numWeeks - 1; w >= 0; w--) {
      const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

      const logsInWeek = workoutHistory.filter(log => {
        const d = new Date(log.date).getTime();
        return d >= weekStart.getTime() && d < weekEnd.getTime();
      });

      let totalVal = 0;
      logsInWeek.forEach(log => {
        if (metricType === 'duration') {
          totalVal += Math.round(log.duration / 60); // minutes
        } else if (metricType === 'volume') {
          totalVal += log.volume;
        } else if (metricType === 'reps') {
          log.exercises.forEach(ex => {
            ex.sets.forEach(s => {
              if (s.completed) totalVal += (s.reps || 0);
            });
          });
        }
      });

      const label = weekStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
      data.push({
        label,
        value: totalVal,
        isCurrentWeek: w === 0
      });
    }

    return data;
  }, [workoutHistory, timeRangeDays, metricType]);

  // Current week or selected week value for Headline
  const currentOrSelectedVal = useMemo(() => {
    if (selectedBarIndex !== null && weeklyChartData[selectedBarIndex]) {
      return weeklyChartData[selectedBarIndex].value;
    }
    const cur = weeklyChartData[weeklyChartData.length - 1];
    return cur ? cur.value : 0;
  }, [weeklyChartData, selectedBarIndex]);

  // Headline text generator matching Screenshot 2
  const headlineText = useMemo(() => {
    if (metricType === 'duration') {
      const hours = Math.floor(currentOrSelectedVal / 60);
      const mins = currentOrSelectedVal % 60;
      if (hours > 0 && mins === 0) {
        return `${hours} ${hours === 1 ? 'ora' : 'ore'} questa settimana`;
      } else if (hours > 0) {
        return `${hours}h ${mins}m questa settimana`;
      } else {
        return `${mins} min questa settimana`;
      }
    } else if (metricType === 'volume') {
      return `${currentOrSelectedVal.toLocaleString('it-IT')} kg questa settimana`;
    } else {
      return `${currentOrSelectedVal.toLocaleString('it-IT')} ripetizioni questa settimana`;
    }
  }, [metricType, currentOrSelectedVal]);

  const timeRangeLabel = useMemo(() => {
    switch (timeRangeDays) {
      case 30: return 'Ultimo mese';
      case 90: return 'Ultimi 3 mesi';
      case 180: return 'Ultimi 6 mesi';
      case 365: return 'Tutto';
      default: return 'Ultimi 3 mesi';
    }
  }, [timeRangeDays]);

  // Total Lifetime Stats
  const lifetimeStats = useMemo(() => {
    let totalWorkouts = workoutHistory.length;
    let totalSeconds = 0;
    let totalVol = 0;
    let totalSets = 0;

    workoutHistory.forEach(log => {
      totalSeconds += log.duration;
      totalVol += log.volume;
      log.exercises.forEach(ex => {
        totalSets += ex.sets.filter(s => s.completed).length;
      });
    });

    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
    return {
      totalWorkouts,
      totalHours,
      totalVol,
      totalSets
    };
  }, [workoutHistory]);

  // 1RM Personal Records per Exercise
  const personalRecords = useMemo(() => {
    const prMap: Record<string, { weight: number; reps: number; oneRepMax: number; date: string }> = {};

    workoutHistory.forEach(log => {
      log.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed && s.weight && s.reps) {
            // Epley 1RM formula: weight * (1 + reps / 30)
            const est1RM = Math.round(s.weight * (1 + s.reps / 30));
            const existing = prMap[ex.exerciseId];
            if (!existing || est1RM > existing.oneRepMax) {
              prMap[ex.exerciseId] = {
                weight: s.weight,
                reps: s.reps,
                oneRepMax: est1RM,
                date: log.date
              };
            }
          }
        });
      });
    });

    return prMap;
  }, [workoutHistory]);

  // Filtered exercises for catalog
  const filteredCatalogExercises = useMemo(() => {
    return mockExercises.filter(ex => {
      const matchSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        ex.category.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase());
      const matchCategory = exerciseMuscleFilter === 'all' || ex.category === exerciseMuscleFilter;
      return matchSearch && matchCategory;
    });
  }, [exerciseSearch, exerciseMuscleFilter]);

  // SVG Bar Chart rendering
  const renderSvgBarChart = () => {
    const data = weeklyChartData;
    const maxVal = Math.max(...data.map(d => d.value), metricType === 'duration' ? 60 : 100);

    const svgW = 360;
    const svgH = 130;
    const padTop = 15;
    const padBottom = 25;
    const padLeft = 10;
    const padRight = 10;
    const chartW = svgW - padLeft - padRight;
    const chartH = svgH - padTop - padBottom;

    const n = data.length;
    const slotW = chartW / n;
    const barW = Math.max(6, Math.min(18, slotW * 0.55));

    // Label interval: show ~4-5 labels max along X-axis
    const stepLabel = Math.max(1, Math.floor(n / 4));

    return (
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg 
          viewBox={`0 0 ${svgW} ${svgH}`} 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Subtle Grid Lines */}
          <line x1={padLeft} y1={padTop} x2={svgW - padRight} y2={padTop} stroke="rgba(255,255,255,0.03)" />
          <line x1={padLeft} y1={padTop + chartH / 2} x2={svgW - padRight} y2={padTop + chartH / 2} stroke="rgba(255,255,255,0.03)" />
          <line x1={padLeft} y1={padTop + chartH} x2={svgW - padRight} y2={padTop + chartH} stroke="rgba(255,255,255,0.08)" />

          {/* Vertical Bars */}
          {data.map((item, idx) => {
            const isSelected = selectedBarIndex === idx || (selectedBarIndex === null && item.isCurrentWeek);
            const pct = maxVal > 0 ? item.value / maxVal : 0;
            const h = Math.max(3, chartH * pct);
            const x = padLeft + idx * slotW + (slotW - barW) / 2;
            const y = padTop + chartH - h;

            return (
              <g 
                key={idx} 
                onClick={() => setSelectedBarIndex(idx)} 
                style={{ cursor: 'pointer' }}
              >
                {/* Background Hit Target for touch */}
                <rect 
                  x={padLeft + idx * slotW} 
                  y={padTop} 
                  width={slotW} 
                  height={chartH} 
                  fill="transparent" 
                />

                {/* The Bar */}
                <rect 
                  x={x} 
                  y={y} 
                  width={barW} 
                  height={h} 
                  rx={3}
                  fill={isSelected ? '#f6e09a' : 'var(--color-primary)'}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.6))' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                />

                {/* Label on X-axis */}
                {(idx % stepLabel === 0 || idx === n - 1) && (
                  <text 
                    x={padLeft + idx * slotW + slotW / 2} 
                    y={svgH - 6} 
                    fill="var(--text-muted)" 
                    fontSize="7" 
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {item.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // 28-day consistency grid generator
  const render28DayGrid = () => {
    const blocks = [];
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      const hasWorkout = workoutHistory.some(log => log.date.split('T')[0] === dStr);
      const hasFood = !!foodLogs[dStr] && foodLogs[dStr].length > 0;

      let color = 'rgba(255, 255, 255, 0.04)';
      let title = `Nessun record per il ${d.toLocaleDateString('it-IT')}`;

      if (hasWorkout && hasFood) {
        color = 'var(--color-primary)';
        title = `Allenamento e Dieta loggati (${d.toLocaleDateString('it-IT')})`;
      } else if (hasWorkout) {
        color = '#f59e0b';
        title = `Allenamento loggato (${d.toLocaleDateString('it-IT')})`;
      } else if (hasFood) {
        color = 'var(--color-secondary)';
        title = `Dieta loggata (${d.toLocaleDateString('it-IT')})`;
      }

      blocks.push(
        <div 
          key={i} 
          style={{
            background: color, 
            aspectRatio: '1', 
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'transform 0.15s ease'
          }}
          title={title}
        />
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', margin: '14px 0' }}>
        {blocks}
      </div>
    );
  };

  if (selectedDetailedWorkout) {
    return (
      <WorkoutDetailView
        workout={selectedDetailedWorkout}
        onBack={() => setSelectedDetailedWorkout(null)}
        onEditWorkout={updateWorkoutLog}
        onDeleteWorkout={(id) => {
          const rawId = id.replace('user-w-', '');
          deleteWorkoutLog(rawId);
          setSelectedDetailedWorkout(null);
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '70px', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* 1. TOP HEADER (Username ✏️, Share ↗️, Settings ⚙️) matching Screenshot 2 */}
      <div className="hevy-profile-header">
        <button 
          className="hevy-profile-username-btn"
          onClick={() => setActiveModal('settings')}
          title="Modifica profilo"
        >
          <span>{username}</span>
          <Edit3 size={15} style={{ color: 'var(--text-muted)' }} />
        </button>

        <div className="hevy-profile-actions">
          <button 
            className="icon-btn" 
            onClick={handleShareProfile} 
            title="Condividi profilo"
            style={{ width: '36px', height: '36px' }}
          >
            <Share2 size={18} />
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setActiveModal('settings')} 
            title="Impostazioni"
            style={{ width: '36px', height: '36px' }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* 2. USER ROW (Avatar, Display Name, 3 stats: Allenamenti, Seguaci, Seguendo) */}
      <div className="hevy-profile-user-row">
        {/* Large Avatar */}
        <div 
          className="hevy-profile-avatar"
          onClick={() => setActiveModal('settings')}
          title="Tocca per cambiare foto profilo"
          style={{ cursor: 'pointer' }}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" />
          ) : (
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {profile.name.charAt(0).toUpperCase() || 'D'}
            </span>
          )}
        </div>

        {/* Name and Stats */}
        <div className="hevy-profile-identity-col">
          <h2 className="hevy-profile-display-name">{profile.name || 'Demi'}</h2>
          
          <div className="hevy-profile-stats-row">
            <div className="hevy-profile-stat-item">
              <span className="hevy-profile-stat-value">{workoutHistory.length}</span>
              <span className="hevy-profile-stat-label">Allenamenti</span>
            </div>
            <div className="hevy-profile-stat-item">
              <span className="hevy-profile-stat-value">1</span>
              <span className="hevy-profile-stat-label">Seguaci</span>
            </div>
            <div className="hevy-profile-stat-item">
              <span className="hevy-profile-stat-value">1</span>
              <span className="hevy-profile-stat-label">Seguendo</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HEADLINE STATS & TIMEFRAME SELECTOR */}
      <div className="hevy-chart-headline-row">
        <h3 className="hevy-chart-headline-text">{headlineText}</h3>

        <div style={{ position: 'relative' }}>
          <button 
            className="hevy-period-badge"
            onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
          >
            <span>{timeRangeLabel}</span>
            <ChevronDown size={14} />
          </button>

          {showTimeRangeDropdown && (
            <div 
              className="glass-card animate-scale-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 100,
                padding: '6px',
                minWidth: '140px',
                background: '#16161c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
              }}
            >
              {[
                { label: 'Ultimo mese', days: 30 },
                { label: 'Ultimi 3 mesi', days: 90 },
                { label: 'Ultimi 6 mesi', days: 180 },
                { label: 'Tutto', days: 365 }
              ].map(opt => (
                <button
                  key={opt.days}
                  onClick={() => {
                    setTimeRangeDays(opt.days);
                    setSelectedBarIndex(null);
                    setShowTimeRangeDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    background: timeRangeDays === opt.days ? 'rgba(212, 175, 55, 0.15)' : 'none',
                    color: timeRangeDays === opt.days ? 'var(--color-primary)' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: timeRangeDays === opt.days ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. INTERACTIVE WEEKLY BAR CHART (Hevy gold style) */}
      <div style={{ margin: '8px 0 12px 0' }}>
        {renderSvgBarChart()}
      </div>

      {/* 5. METRIC FILTER PILLS (Durata, Volume, Ripetizioni) matching Screenshot 2 */}
      <div className="hevy-filter-pills-row">
        <button 
          className={`hevy-filter-pill ${metricType === 'duration' ? 'active' : ''}`}
          onClick={() => {
            setMetricType('duration');
            setSelectedBarIndex(null);
          }}
        >
          Durata
        </button>
        <button 
          className={`hevy-filter-pill ${metricType === 'volume' ? 'active' : ''}`}
          onClick={() => {
            setMetricType('volume');
            setSelectedBarIndex(null);
          }}
        >
          Volume
        </button>
        <button 
          className={`hevy-filter-pill ${metricType === 'reps' ? 'active' : ''}`}
          onClick={() => {
            setMetricType('reps');
            setSelectedBarIndex(null);
          }}
        >
          Ripetizioni
        </button>
      </div>

      {/* 6. PANNELLO DI CONTROLLO (2x2 Grid) matching Screenshot 2 */}
      <h3 className="section-title" style={{ fontSize: '1.05rem', marginBottom: '12px' }}>
        Pannello di controllo
      </h3>

      <div className="hevy-control-grid">
        {/* Statistiche */}
        <div 
          className="hevy-control-card"
          onClick={() => setActiveModal('stats')}
        >
          <BarChart2 size={20} color="var(--color-primary)" />
          <span>Statistiche</span>
        </div>

        {/* Esercizi */}
        <div 
          className="hevy-control-card"
          onClick={() => setActiveModal('exercises')}
        >
          <Dumbbell size={20} color="var(--color-primary)" />
          <span>Esercizi</span>
        </div>

        {/* Misurazioni */}
        <div 
          className="hevy-control-card"
          onClick={() => setActiveModal('measurements')}
        >
          <Scale size={20} color="var(--color-primary)" />
          <span>Misurazioni</span>
        </div>

        {/* Calendario */}
        <div 
          className="hevy-control-card"
          onClick={() => setActiveModal('calendar')}
        >
          <CalendarIcon size={20} color="var(--color-primary)" />
          <span>Calendario</span>
        </div>

        {/* Recupero & Manichino Muscolare */}
        <div 
          className="hevy-control-card"
          onClick={() => setActiveModal('recovery')}
          style={{ gridColumn: 'span 2' }}
        >
          <Activity size={20} color="var(--color-primary)" />
          <span>Recupero & Manichino Muscolare</span>
        </div>
      </div>

      {/* 7. ALLENAMENTI SECTION (Past Workouts List) matching Screenshot 2 */}
      <div style={{ marginTop: '10px' }}>
        <div className="flex-between" style={{ marginBottom: '14px' }}>
          <h3 className="section-title" style={{ fontSize: '1.05rem', margin: 0 }}>
            Allenamenti
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {workoutHistory.length} completati
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="empty-state" style={{ padding: '36px 16px' }}>
            <Dumbbell size={32} color="var(--text-dark)" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Nessun allenamento salvato finora.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>
              Inizia una sessione dalla scheda Allenamento per vedere qui i tuoi log!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workoutHistory.map(log => {
              const dateFormatted = new Date(log.date).toLocaleDateString('it-IT', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'short' 
              });
              const durationMin = Math.round(log.duration / 60);
              const totalSetsCount = log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);

              return (
                <div 
                  key={log.id} 
                  className="hevy-workout-history-card"
                  onClick={() => openWorkoutDetail(log)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Card Header: Routine Title + Menu */}
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {log.name || 'Allenamento Personalizzato'}
                      </h4>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {dateFormatted}
                      </span>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button 
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuWorkoutId(activeMenuWorkoutId === log.id ? null : log.id);
                        }}
                        style={{ width: '32px', height: '32px' }}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {activeMenuWorkoutId === log.id && (
                        <div 
                          className="glass-card animate-scale-in"
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 'calc(100% + 4px)',
                            zIndex: 100,
                            padding: '6px',
                            minWidth: '130px',
                            background: '#16161c',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openWorkoutDetail(log);
                              setActiveMenuWorkoutId(null);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <Activity size={14} color="var(--color-primary)" />
                            <span>Vedi Dettagli</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Eliminare definitivamente questo allenamento dalla cronologia?")) {
                                deleteWorkoutLog(log.id);
                              }
                              setActiveMenuWorkoutId(null);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-error)',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Elimina</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Stats Chips */}
                  <div style={{ display: 'flex', gap: '16px', margin: '10px 0 14px 0', fontSize: '0.78rem', color: '#a1a1aa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} color="var(--color-primary)" />
                      <span>{durationMin} min</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Dumbbell size={14} color="var(--color-primary)" />
                      <span>{log.volume.toLocaleString('it-IT')} kg</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Award size={14} color="var(--color-primary)" />
                      <span>{totalSetsCount} serie</span>
                    </div>
                  </div>

                  {/* Exercise Preview List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {log.exercises.map((ex, i) => {
                      const completedCount = ex.sets.filter(s => s.completed).length;
                      const exDetail = mockExercises.find(m => m.id === ex.exerciseId);
                      const exName = exDetail ? exDetail.name : 'Esercizio';
                      const exMuscleGroup: MuscleGroup = exDetail ? exDetail.muscleGroup : 'Pettorali';
                      return (
                        <div key={i} className="hevy-exercise-preview-row">
                          <div className="hevy-exercise-icon-avatar">
                            {renderMuscleIcon(exMuscleGroup, 32)}
                          </div>
                          <span className="hevy-exercise-preview-text">
                            <strong>{completedCount} serie</strong> {exName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS & DRAWERS
          ========================================================================= */}

      {activeModal && createPortal(
        <>
          {/* 1. SETTINGS / EDIT PROFILE MODAL */}
          {activeModal === 'settings' && (
        <div className="drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh' }}>
            <div className="drawer-header">
              <h3 className="section-title">Impostazioni Profilo & Account</h3>
              <button className="drawer-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', overflowY: 'auto', paddingRight: '4px' }}>
              
              {/* Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#121217', padding: '12px', borderRadius: '12px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-primary)',
                  overflow: 'hidden',
                  background: '#0a0a0c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} color="var(--color-primary)" />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label htmlFor="settings-avatar-input" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.74rem', cursor: 'pointer', textAlign: 'center' }}>
                    <Camera size={14} style={{ marginRight: '4px' }} /> Cambia Foto
                  </label>
                  <input 
                    type="file" 
                    id="settings-avatar-input" 
                    accept="image/*" 
                    onChange={e => handleUploadImage(e, 'avatar')} 
                    style={{ display: 'none' }} 
                  />
                  {avatarUrl && (
                    <button 
                      onClick={() => {
                        setAvatarUrl('');
                        updateProfile({ avatarUrl: '' });
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: '0.7rem', cursor: 'pointer', textAlign: 'left' }}
                    >
                      Rimuovi foto
                    </button>
                  )}
                </div>
              </div>

              {/* Basic Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nome Visualizzato</label>
                <input 
                  type="text" 
                  className="set-input" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', height: '38px', textAlign: 'left', padding: '0 12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
              </div>

              {/* Nutritional Targets */}
              <div style={{ background: '#121217', padding: '14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '10px' }}>
                  Target Nutrizionali Giornalieri
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Kcal</label>
                    <input type="number" className="set-input" value={targetKcal} onChange={e => setTargetKcal(e.target.value)} style={{ width: '100%', height: '32px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Pro (g)</label>
                    <input type="number" className="set-input" value={targetP} onChange={e => setTargetP(e.target.value)} style={{ width: '100%', height: '32px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Carb (g)</label>
                    <input type="number" className="set-input" value={targetC} onChange={e => setTargetC(e.target.value)} style={{ width: '100%', height: '32px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Fat (g)</label>
                    <input type="number" className="set-input" value={targetF} onChange={e => setTargetF(e.target.value)} style={{ width: '100%', height: '32px' }} />
                  </div>
                </div>
              </div>

              {/* Save Changes button */}
              <button className="btn-primary" onClick={handleSaveProfile} style={{ width: '100%', height: '42px' }}>
                <Check size={16} /> Salva Modifiche
              </button>

              {/* Extra Tools Section: Wearables, Cycle tracker, GDPR */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Funzionalità Avanzate & Sicurezza
                </span>

                {profile.gender === 'female' && (
                  <div style={{ background: '#121217', padding: '12px', borderRadius: '12px' }}>
                    <CycleTracker />
                  </div>
                )}

                <div style={{ background: '#121217', padding: '12px', borderRadius: '12px' }}>
                  <DeviceSyncHub />
                </div>

                <button 
                  className="btn-secondary" 
                  onClick={() => setActiveModal('privacy')}
                  style={{ width: '100%', padding: '10px', fontSize: '0.78rem' }}
                >
                  <ShieldAlert size={15} style={{ marginRight: '6px' }} /> Informativa Privacy & GDPR
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                  <button 
                    className="btn-secondary" 
                    onClick={signOut}
                    style={{ color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <LogOut size={14} style={{ marginRight: '4px' }} /> Esci
                  </button>

                  <button 
                    className="btn-secondary" 
                    onClick={handleDeleteAccount}
                    style={{ color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <Trash2 size={14} style={{ marginRight: '4px' }} /> Elimina Account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. STATISTICHE MODAL */}
      {activeModal === 'stats' && (
        <div className="drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
            <div className="drawer-header">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={20} color="var(--color-primary)" /> Statistiche Globali
              </h3>
              <button className="drawer-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#111116', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Allenamenti Totali</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>
                    {lifetimeStats.totalWorkouts}
                  </p>
                </div>

                <div style={{ background: '#111116', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ore in Palestra</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', margin: '4px 0 0 0' }}>
                    {lifetimeStats.totalHours} h
                  </p>
                </div>

                <div style={{ background: '#111116', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Volume Totale</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>
                    {lifetimeStats.totalVol.toLocaleString('it-IT')} kg
                  </p>
                </div>

                <div style={{ background: '#111116', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Serie Eseguite</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>
                    {lifetimeStats.totalSets}
                  </p>
                </div>
              </div>

              {/* BMI Card */}
              <div style={{ background: '#111116', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '8px' }}>
                  Indice di Massa Corporea (BMI)
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {(profile.weight / Math.pow((profile.height || 175) / 100, 2)).toFixed(1)}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Peso: {profile.weight} kg • Altezza: {profile.height || 175} cm
                  </span>
                </div>
              </div>

              <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ width: '100%' }}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ESERCIZI MODAL (Exercise Library & 1RM Records) */}
      {activeModal === 'exercises' && (
        <div className="drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="drawer-header">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Dumbbell size={20} color="var(--color-primary)" /> Catalogo & Record 1RM
              </h3>
              <button className="drawer-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>

            {/* Search and muscle filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Cerca esercizio..."
                  className="set-input"
                  value={exerciseSearch}
                  onChange={e => setExerciseSearch(e.target.value)}
                  style={{ width: '100%', height: '36px', paddingLeft: '34px', textAlign: 'left' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['all', 'Petto', 'Schiena', 'Gambe', 'Spalle', 'Braccia', 'Core', 'Cardio'].map(m => (
                  <button
                    key={m}
                    className={`filter-badge ${exerciseMuscleFilter === m ? 'active' : ''}`}
                    onClick={() => setExerciseMuscleFilter(m)}
                    style={{ whiteSpace: 'nowrap', padding: '4px 10px', fontSize: '0.72rem' }}
                  >
                    {m === 'all' ? 'Tutti' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises List with 1RM Records */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {filteredCatalogExercises.map(ex => {
                const pr = personalRecords[ex.id];
                return (
                  <div 
                    key={ex.id}
                    style={{
                      background: '#111116',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="hevy-exercise-icon-avatar">
                        {renderMuscleIcon(ex.muscleGroup, 32)}
                      </div>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', display: 'block' }}>
                          {ex.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {ex.category} • {ex.equipment}
                        </span>
                      </div>
                    </div>

                    {pr ? (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>
                          1RM: {pr.oneRepMax} kg
                        </span>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                          {pr.weight}kg × {pr.reps} rip
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>
                        Nessun PR
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. MISURAZIONI MODAL */}
      {activeModal === 'measurements' && (
        <div className="drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
            <div className="drawer-header">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={20} color="var(--color-primary)" /> Misure Corporee
              </h3>
              <button className="drawer-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Peso Corporeo (kg)</label>
                  <input type="number" className="set-input" value={weight} onChange={e => setWeight(e.target.value)} style={{ width: '100%', height: '36px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Massa Grassa (%)</label>
                  <input type="number" className="set-input" value={bf} onChange={e => setBf(e.target.value)} style={{ width: '100%', height: '36px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vita (cm)</label>
                  <input type="number" className="set-input" value={waist} onChange={e => setWaist(e.target.value)} style={{ width: '100%', height: '36px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Braccia (cm)</label>
                  <input type="number" className="set-input" value={arms} onChange={e => setArms(e.target.value)} style={{ width: '100%', height: '36px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cosce (cm)</label>
                  <input type="number" className="set-input" value={thighs} onChange={e => setThighs(e.target.value)} style={{ width: '100%', height: '36px' }} />
                </div>
              </div>

              <button className="btn-primary" onClick={handleSaveMeasurements} style={{ width: '100%', height: '42px', marginTop: '10px' }}>
                <Check size={16} /> Salva Misure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CALENDARIO MODAL (28-day consistency map & streak) */}
      {activeModal === 'calendar' && (
        <div className="drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
            <div className="drawer-header">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={20} color="var(--color-primary)" /> Calendario di Costanza
              </h3>
              <button className="drawer-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>

            <div style={{ marginTop: '14px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Attività registrata negli ultimi 28 giorni:
              </span>

              {render28DayGrid()}

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-primary)' }} />
                  <span>Allenamento + Dieta</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
                  <span>Solo Allenamento</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-secondary)' }} />
                  <span>Solo Dieta</span>
                </div>
              </div>

              <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ width: '100%', marginTop: '20px' }}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PRIVACY POLICY MODAL */}
      {activeModal === 'privacy' && (
        <div className="drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', paddingBottom: '24px' }}>
            <div className="drawer-header">
              <h3 className="section-title">Informativa Privacy & GDPR</h3>
              <button className="drawer-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>

            <div style={{ fontSize: '0.78rem', lineHeight: '1.5', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', maxHeight: '450px', overflowY: 'auto' }}>
              <p><strong>Ultimo aggiornamento: 23 Settembre 2026</strong></p>
              <p>La presente Informativa sulla Privacy descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati sensibili all'interno dell'applicazione DeV Fit, in piena conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR) e i requisiti delle piattaforme Google Play e Apple Store.</p>
              
              <h5 style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>1. Dati Raccolti</h5>
              <p>Raccogliamo le seguenti categorie di dati: Dati di autenticazione (email, nome), metriche fisiche (peso, altezza, circonferenze), dati di allenamento (serie, carichi, ripetizioni), dati nutrizionali (diario pasti) e dati sanitari femminili opzionali (fasi del ciclo).</p>

              <h5 style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>2. Finalità e Condivisione</h5>
              <p>I tuoi dati sono utilizzati per calcolare progressi, massimali (1RM) e statistiche. Non vendiamo né cediamo dati a soggetti terzi. Gli allenamenti completati sono condivisi sul feed solo con gli utenti autorizzati.</p>

              <h5 style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>3. Cancellazione Definitiva</h5>
              <p>Hai il diritto in qualsiasi momento di richiedere la rimozione immediata ed irreversibile del tuo account e di tutti i record di allenamento e salute tramite il pulsante "Elimina Account" nelle Impostazioni.</p>
            </div>

            <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ width: '100%', marginTop: '16px' }}>
              Ho Capito
            </button>
          </div>
        </div>
      )}

      {/* 7. RECUPERO MUSCOLARE & HEATMAP MODAL */}
      {activeModal === 'recovery' && (
        <div className="drawer-backdrop" onClick={() => setActiveModal(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="drawer-header" style={{ marginBottom: '16px' }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--color-primary)" /> Manichino & Recupero Muscolare
              </h3>
              <button className="drawer-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>

            <MuscleHeatmap />

            <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ width: '100%', marginTop: '20px' }}>
              Chiudi
            </button>
          </div>
        </div>
          )}
        </>,
        document.body
      )}

    </div>
  );
};
