import React, { useState, useEffect } from 'react';
import { Flame, Droplet, Dumbbell, Scale, Check, Download, Moon, Heart, Info, Plus, Zap, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { TipWidget } from './TipWidget';
import { MuscleHeatmap } from './MuscleHeatmap';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const [activeSection, setActiveSection] = useState<'today' | 'muscles' | 'vitals'>('today');
  const [todayStr, setTodayStr] = useState(() => new Date().toISOString().split('T')[0]);
  const { profile, updateProfile, foodLogs, startWorkout, cycleData, activeWorkout } = useApp();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.weight.toString());
  const [waterCount, setWaterCount] = useState(() => {
    const saved = localStorage.getItem(`df_water_${new Date().toISOString().split('T')[0]}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Dati reali Sonno (tracciati per data, nessun dato fake)
  const [sleepData, setSleepData] = useState<{ hours: number; minutes: number } | null>(() => {
    try {
      const saved = localStorage.getItem(`df_sleep_${new Date().toISOString().split('T')[0]}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [newSleepHours, setNewSleepHours] = useState(sleepData ? sleepData.hours.toString() : '7');
  const [newSleepMinutes, setNewSleepMinutes] = useState(sleepData ? sleepData.minutes.toString() : '30');

  // Dati reali Battito Cardiaco a Riposo (nessun dato fake)
  const [heartRateData, setHeartRateData] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(`df_bpm_${new Date().toISOString().split('T')[0]}`);
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });
  const [showBpmModal, setShowBpmModal] = useState(false);
  const [newBpm, setNewBpm] = useState(heartRateData ? heartRateData.toString() : '65');

  // Auto-Sync: Aggiornamento automatico istantaneo senza refresh manuale
  useEffect(() => {
    const syncData = () => {
      const currentDay = new Date().toISOString().split('T')[0];
      if (currentDay !== todayStr) {
        setTodayStr(currentDay);
      }
      const savedW = localStorage.getItem(`df_water_${currentDay}`);
      setWaterCount(savedW ? parseInt(savedW, 10) : 0);

      const savedS = localStorage.getItem(`df_sleep_${currentDay}`);
      setSleepData(savedS ? JSON.parse(savedS) : null);

      const savedB = localStorage.getItem(`df_bpm_${currentDay}`);
      setHeartRateData(savedB ? parseInt(savedB, 10) : null);
    };

    window.addEventListener('storage', syncData);
    window.addEventListener('df_data_updated', syncData);
    window.addEventListener('focus', syncData);

    const onVis = () => {
      if (document.visibilityState === 'visible') syncData();
    };
    document.addEventListener('visibilitychange', onVis);

    const timer = setInterval(syncData, 10000);

    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('df_data_updated', syncData);
      window.removeEventListener('focus', syncData);
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(timer);
    };
  }, [todayStr]);

  const handleSaveSleep = () => {
    const h = parseInt(newSleepHours, 10) || 0;
    const m = Math.min(Math.max(parseInt(newSleepMinutes, 10) || 0, 0), 59);
    if (h > 0 || m > 0) {
      const data = { hours: h, minutes: m };
      setSleepData(data);
      localStorage.setItem(`df_sleep_${todayStr}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('df_data_updated'));
      setShowSleepModal(false);
    }
  };

  const handleSaveBpm = () => {
    const val = parseInt(newBpm, 10) || 0;
    if (val > 30 && val < 220) {
      setHeartRateData(val);
      localStorage.setItem(`df_bpm_${todayStr}`, val.toString());
      window.dispatchEvent(new CustomEvent('df_data_updated'));
      setShowBpmModal(false);
    }
  };


  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      // Prevent browser's default install banner from showing
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if app is already launched as standalone (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const todayFoods = foodLogs[todayStr] || [];

  // Macro Totals
  const totalCalories = todayFoods.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = todayFoods.reduce((sum, item) => sum + item.protein, 0);

  const totalCarbs = todayFoods.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = todayFoods.reduce((sum, item) => sum + item.fat, 0);

  // Calorie Ring Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;


  const handleAddWater = () => {
    const newVal = waterCount + 250;
    setWaterCount(newVal);
    localStorage.setItem(`df_water_${todayStr}`, newVal.toString());
    window.dispatchEvent(new CustomEvent('df_data_updated'));
  };

  const handleRemoveWater = () => {
    const newVal = Math.max(0, waterCount - 250);
    setWaterCount(newVal);
    localStorage.setItem(`df_water_${todayStr}`, newVal.toString());
    window.dispatchEvent(new CustomEvent('df_data_updated'));
  };

  const handleUpdateWeight = () => {
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      updateProfile({ weight: w });
      window.dispatchEvent(new CustomEvent('df_data_updated'));
      setShowWeightModal(false);
    }
  };


  // BMI Calculations

  // BMI Calculations — FIX #8: guard contro altezza = 0 (evita Infinity/NaN)
  const heightM = Math.max((profile.height || 0) / 100, 0.01); // minimo 1cm per evitare div/0
  const bmi = profile.weight > 0 && profile.height > 0 ? profile.weight / (heightM * heightM) : 0;
  
  // FIX #9: guard contro targetCalories = 0 nella calorie ring
  const safeTargetCalories = Math.max(profile.targetCalories || 0, 1);
  // Sovrascrive progressPercent calcolato sopra con versione safe
  const safeProgressPercent = Math.min((totalCalories / safeTargetCalories) * 100, 100);
  const safeStrokeDashoffset = circumference - (safeProgressPercent / 100) * circumference;

  const getBmiCategory = (value: number) => {
    if (value <= 0) return { label: '–', color: 'var(--text-dark)', text: 'Inserisci peso e altezza nel tuo profilo per calcolare il BMI.' };
    if (value < 18.5) return { label: 'Sottopeso', color: '#3b82f6', text: 'Il tuo peso è inferiore alla norma per la tua altezza. Considera un surplus calorico sano per aumentare la massa muscolare.' };
    if (value < 25) return { label: 'Normopeso', color: '#10b981', text: 'Il tuo peso è ottimale ed ideale per la tua altezza! Mantieni uno stile di vita attivo.' };
    if (value < 30) return { label: 'Sovrappeso', color: '#eab308', text: 'Il tuo peso è leggermente superiore alla norma. Associa una dieta controllata ad attività cardio e allenamenti di forza.' };
    return { label: 'Obesità', color: '#ef4444', text: 'Il tuo peso è superiore alla norma. Si raccomanda di associare attività fisica regolare a una dieta controllata.' };
  };
  const bmiCat = getBmiCategory(bmi);
  const bmiPercentage = bmi > 0 ? Math.min(Math.max(((bmi - 15) / (35 - 15)) * 100, 0), 100) : 0;

  // Menstrual Cycle Calculations
  const getCycleInfo = () => {
    if (!cycleData) return null;
    const elapsedDays = Math.floor((new Date().getTime() - new Date(cycleData.lastPeriodStart).getTime()) / (1000 * 60 * 60 * 24)) % cycleData.cycleLength;
    const currentDay = elapsedDays >= 0 ? elapsedDays + 1 : 1;
    
    let phase = 'Fase Mestruale';
    let color = 'var(--color-female)';
    let tips = 'Preferisci yoga o allungamenti. Consuma cibi caldi e ricchi di ferro.';
    
    if (currentDay > cycleData.periodLength && currentDay <= 13) {
      phase = 'Fase Follicolare';
      color = '#f59e0b';
      tips = 'Le energie crescono! Perfetto per intensificare gli allenamenti di forza.';
    } else if (currentDay >= 14 && currentDay <= 16) {
      phase = 'Fase Ovulatoria (Fertile)';
      color = 'var(--color-primary)';
      tips = 'Forza al massimo! Ottimo momento per tentare record personali (PR).';
    } else if (currentDay > 16) {
      phase = 'Fase Luteale';
      color = '#8b5cf6';
      tips = 'L\'energia cala. Riduci l\'intensità e punta sulla resistenza ed idratazione.';
    }
    
    return { currentDay, phase, color, tips };
  };
  const cycleInfo = profile.gender === 'female' ? getCycleInfo() : null;

  const todayFormatted = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const capitalizedToday = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  const remainingCalories = profile.targetCalories - totalCalories;
  const proteinPercent = Math.min(Math.round((totalProtein / Math.max(profile.targetProtein || 1, 1)) * 100), 100);
  const carbsPercent = Math.min(Math.round((totalCarbs / Math.max(profile.targetCarbs || 1, 1)) * 100), 100);
  const fatPercent = Math.min(Math.round((totalFat / Math.max(profile.targetFat || 1, 1)) * 100), 100);

  return (
    <div className="dashboard-grid animate-fade-in-up">
      {/* 1. Competitor Header: Welcome & Compact Streak */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            onClick={() => setCurrentTab('profile')}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--color-primary)',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.25)',
              cursor: 'pointer',
              flexShrink: 0,
              background: 'rgba(212, 175, 55, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Visualizza Profilo"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>
              Ciao, {profile.name} 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px', margin: 0 }}>
              {capitalizedToday}
            </p>
          </div>
        </div>

        {/* Compact Streak Badge */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.1)'
          }}
          title="Giorni consecutivi di costanza"
        >
          <Flame size={16} fill="#f59e0b" color="#f59e0b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>
            {profile.streak} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>gg</span>
          </span>
        </div>
      </div>

      {/* Sleek Segmented Switcher (Hevy / Native iOS Style) */}
      <div className="segmented-control">
        <button
          type="button"
          className={`segmented-btn ${activeSection === 'today' ? 'active' : ''}`}
          onClick={() => setActiveSection('today')}
        >
          <Zap size={14} /> Oggi
        </button>
        <button
          type="button"
          className={`segmented-btn ${activeSection === 'muscles' ? 'active' : ''}`}
          onClick={() => setActiveSection('muscles')}
        >
          <Activity size={14} /> Muscoli
        </button>
        <button
          type="button"
          className={`segmented-btn ${activeSection === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveSection('vitals')}
        >
          <Heart size={14} /> Salute
        </button>
      </div>

      {/* VIEW 1: OGGI (Daily gym action & nutrition hero) */}
      {activeSection === 'today' && (
        <div className="dashboard-today-grid">
          {/* LEFT COLUMN: Workout Hero + Quick Habits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* HERO WORKOUT CARD (Priority #1 Gym Feature - Hevy/Strong style) */}
            <div
              className={`glass-card ${activeWorkout ? 'animate-glow' : ''}`}
              style={{
                borderLeft: '4px solid var(--color-primary)',
                background: activeWorkout
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, #121215 100%)'
                  : 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, #121215 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '18px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(212, 175, 55, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)'
                  }}>
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <span className="section-eyebrow" style={{ color: 'var(--color-primary)', display: 'block' }}>
                      {activeWorkout ? 'Sessione Attiva' : 'Allenamento del Giorno'}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
                      {activeWorkout ? activeWorkout.name : 'Pronto ad allenarti?'}
                    </h3>
                  </div>
                </div>

                {activeWorkout && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    In Corso
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {activeWorkout
                  ? `${activeWorkout.exercises.length} esercizi registrati. Tocca per inserire carichi e ripetizioni.`
                  : 'Registra carichi, serie e supera i tuoi massimali con il timer di recupero automatico.'}
              </p>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (!activeWorkout) startWorkout();
                    setCurrentTab('workout');
                  }}
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.82rem', height: '40px' }}
                >
                  <Dumbbell size={16} /> {activeWorkout ? 'Riprendi Sessione' : 'Inizia Ora'}
                </button>
                {!activeWorkout && (
                  <button
                    className="btn-secondary"
                    onClick={() => setCurrentTab('workout')}
                    style={{ padding: '10px 14px', fontSize: '0.82rem', height: '40px', whiteSpace: 'nowrap' }}
                  >
                    Le mie Schede →
                  </button>
                )}
              </div>
            </div>

            {/* Quick Habit Bar (Water & Weight inline quick actions) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Quick Water */}
              <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
                    <Droplet size={14} color="var(--color-info)" /> Acqua
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2000 ml</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{waterCount}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ml</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn-secondary" onClick={handleAddWater} style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', height: '28px' }}>
                    +250ml
                  </button>
                  {waterCount > 0 && (
                    <button className="btn-secondary" onClick={handleRemoveWater} style={{ width: '28px', padding: 0, fontSize: '0.8rem', height: '28px' }}>
                      -
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Weight */}
              <div 
                className="glass-card" 
                style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
                onClick={() => setShowWeightModal(true)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
                    <Scale size={14} color="var(--color-primary)" /> Peso
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    BMI {bmi > 0 ? bmi.toFixed(1) : '--'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{profile.weight}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kg</span>
                </div>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); setShowWeightModal(true); }}
                  style={{ width: '100%', padding: '4px 6px', fontSize: '0.7rem', height: '28px' }}
                >
                  Aggiorna Peso
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Daily Energy & Macro Card + Tip Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="section-eyebrow" style={{ display: 'block' }}>
                    Nutrizione & Dieta
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Bilancio Energetico</h3>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => setCurrentTab('diet')}
                  style={{ padding: '6px 12px', fontSize: '0.72rem', height: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Diario Pasti
                </button>
              </div>

              {/* Remaining Calories Hero + Ring */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{
                      fontSize: '2.3rem',
                      fontWeight: 900,
                      color: remainingCalories >= 0 ? 'white' : '#f59e0b',
                      lineHeight: 1
                    }}>
                      {remainingCalories >= 0 ? remainingCalories : `+${Math.abs(remainingCalories)}`}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>kcal</span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: remainingCalories >= 0 ? 'var(--color-primary)' : '#f59e0b', fontWeight: 700 }}>
                    {remainingCalories >= 0 ? 'Calorie Rimanenti' : 'Surplus Calorico'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Assunte: <strong style={{ color: 'white' }}>{totalCalories}</strong> / {profile.targetCalories} kcal
                  </span>
                </div>

                {/* Circular SVG Ring */}
                <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="92" height="92" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="46"
                      cy="46"
                      r="38"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="46"
                      cy="46"
                      r="38"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={safeStrokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', display: 'block', lineHeight: 1 }}>
                      {Math.round(safeProgressPercent)}%
                    </span>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-dark)' }}>consumate</span>
                  </div>
                </div>
              </div>

              {/* Linear Macro Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Protein */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'white' }}>Proteine</span>
                    <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>{totalProtein}g</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${proteinPercent}%`, background: 'var(--color-secondary)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Ob: {profile.targetProtein}g</span>
                </div>

                {/* Carbs */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'white' }}>Carboidrati</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{totalCarbs}g</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${carbsPercent}%`, background: 'var(--color-primary)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Ob: {profile.targetCarbs}g</span>
                </div>

                {/* Fat */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'white' }}>Grassi</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{totalFat}g</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${fatPercent}%`, background: '#ef4444', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Ob: {profile.targetFat}g</span>
                </div>
              </div>
            </div>

            {/* Tip Widget */}
            <TipWidget />
          </div>
        </div>
      )}

      {/* VIEW 2: MUSCOLI & RECUPERO (Interactive Heatmap & Science) */}
      {activeSection === 'muscles' && (
        <div className="animate-fade-in">
          <MuscleHeatmap />
        </div>
      )}

      {/* VIEW 3: SALUTE & PARAMETRI VITALI */}
      {activeSection === 'vitals' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 2x2 SYMMETRIC VITALS & HABITS GRID */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Activity size={16} color="var(--color-primary)" />
              <h4 className="section-eyebrow" style={{ margin: 0 }}>
                Parametri Vitali & Abitudini
              </h4>
            </div>

            <div className="vitals-grid">
              {/* Card 1: Acqua */}
              <div className="glass-card vital-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
                    <Droplet size={15} color="var(--color-info)" /> Acqua
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2000 ml</span>
                </div>

                <div>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                    {waterCount} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>ml</span>
                  </span>
                  <div style={{ marginTop: '6px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((waterCount / 2000) * 100, 100)}%`, background: 'var(--color-info)', borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn-secondary" onClick={handleAddWater} style={{ flex: 1, padding: '5px 8px', fontSize: '0.72rem', height: '28px' }}>
                    +250ml
                  </button>
                  {waterCount > 0 && (
                    <button className="btn-secondary" onClick={handleRemoveWater} style={{ width: '28px', padding: 0, fontSize: '0.8rem', height: '28px', fontWeight: 'bold' }}>
                      -
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Peso Corporeo */}
              <div className="glass-card vital-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
                    <Scale size={15} color="var(--color-primary)" /> Peso
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    BMI {bmi > 0 ? bmi.toFixed(1) : '--'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                    {profile.weight} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>kg</span>
                  </span>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                    Altezza: {profile.height || 165} cm
                  </p>
                </div>

                <button className="btn-secondary" onClick={() => setShowWeightModal(true)} style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem', height: '28px' }}>
                  Aggiorna Peso
                </button>
              </div>

              {/* Card 3: Sonno */}
              <div className="glass-card vital-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
                    <Moon size={15} color="#8b5cf6" /> Sonno
                  </span>
                  {sleepData && (
                    <span style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 700 }}>
                      {sleepData.hours >= 7 && sleepData.hours <= 9 ? 'Ottimo' : sleepData.hours < 7 ? 'Basso' : 'Lungo'}
                    </span>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                    {sleepData ? `${sleepData.hours}h ${sleepData.minutes > 0 ? `${sleepData.minutes}m` : ''}` : '--'}
                  </span>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                    {sleepData ? 'Target: 7–9 ore' : 'Nessun dato odierno'}
                  </p>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    if (sleepData) {
                      setNewSleepHours(sleepData.hours.toString());
                      setNewSleepMinutes(sleepData.minutes.toString());
                    }
                    setShowSleepModal(true);
                  }}
                  style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem', height: '28px' }}
                >
                  {sleepData ? 'Modifica' : 'Registra Sonno'}
                </button>
              </div>

              {/* Card 4: Battito a Riposo */}
              <div className="glass-card vital-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
                    <Heart size={15} color="#ef4444" /> Battito
                  </span>
                  {heartRateData && (
                    <span style={{ fontSize: '0.65rem', color: heartRateData <= 80 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {heartRateData < 60 ? 'Atleta' : heartRateData <= 80 ? 'Ideale' : 'Elevato'}
                    </span>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                    {heartRateData ? heartRateData : '--'} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>bpm</span>
                  </span>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                    {heartRateData ? 'A riposo (RHR)' : 'Nessun dato odierno'}
                  </p>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    if (heartRateData) setNewBpm(heartRateData.toString());
                    setShowBpmModal(true);
                  }}
                  style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem', height: '28px' }}
                >
                  {heartRateData ? 'Modifica' : 'Registra BPM'}
                </button>
              </div>
            </div>
          </div>

          {/* BMI Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Info size={15} color="var(--color-primary)" /> Indice di Massa Corporea (BMI)
              </h3>
              <span style={{
                fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px',
                borderRadius: '99px', background: bmiCat.color + '22', color: bmiCat.color, border: `1px solid ${bmiCat.color}55`
              }}>
                {bmiCat.label}
              </span>
            </div>

            {/* BMI number + scale bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: bmiCat.color, lineHeight: 1 }}>
                {bmi.toFixed(1)}
              </span>
              <div style={{ flex: 1 }}>
                {/* Color scale bar */}
                <div style={{ position: 'relative', height: '8px', borderRadius: '99px', background: 'linear-gradient(to right, #3b82f6 0%, #10b981 37%, #eab308 62%, #ef4444 100%)', overflow: 'visible' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${bmiPercentage}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '14px', height: '14px',
                    borderRadius: '50%',
                    background: 'white',
                    border: `3px solid ${bmiCat.color}`,
                    boxShadow: `0 0 8px ${bmiCat.color}66`,
                    transition: 'left 0.6s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.58rem', color: 'var(--text-dark)' }}>
                  <span>Sottopeso<br />&lt;18.5</span>
                  <span style={{ textAlign: 'center' }}>Normopeso<br />18.5–25</span>
                  <span style={{ textAlign: 'center' }}>Sovrappeso<br />25–30</span>
                  <span style={{ textAlign: 'right' }}>Obesità<br />&gt;30</span>
                </div>
              </div>
            </div>

            {/* Personalized advice */}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5, borderLeft: `3px solid ${bmiCat.color}`, paddingLeft: '10px', margin: 0 }}>
              {bmiCat.text}
            </p>
          </div>

          {/* Ciclo Mestruale — solo per le donne */}
          {profile.gender === 'female' && cycleInfo && (
            <div className="glass-card" style={{
              display: 'flex', flexDirection: 'column', gap: '12px',
              borderLeft: `4px solid ${cycleInfo.color}`,
              background: `linear-gradient(135deg, ${cycleInfo.color}08 0%, rgba(10,10,12,0.9) 100%)`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Moon size={15} color={cycleInfo.color} /> Ciclo Mestruale
                </h3>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px',
                  borderRadius: '99px', background: cycleInfo.color + '22', color: cycleInfo.color, border: `1px solid ${cycleInfo.color}55`
                }}>
                  {cycleInfo.phase}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: cycleInfo.color }}>Giorno {cycleInfo.currentDay}</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>di {cycleData.cycleLength} del ciclo</p>
                </div>
                {/* Mini cycle wheel */}
                <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                  <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                    <circle
                      cx="26" cy="26" r="20" fill="none"
                      stroke={cycleInfo.color} strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - cycleInfo.currentDay / cycleData.cycleLength)}`}
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '0.62rem', fontWeight: 800, color: cycleInfo.color }}>
                    {Math.round((cycleInfo.currentDay / cycleData.cycleLength) * 100)}%
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5, borderLeft: `3px solid ${cycleInfo.color}`, paddingLeft: '10px', margin: 0 }}>
                {cycleInfo.tips}
              </p>
              <button
                className="btn-secondary"
                onClick={() => setCurrentTab('cycle')}
                style={{ padding: '6px 12px', fontSize: '0.7rem', alignSelf: 'flex-start' }}
              >
                Dettagli Ciclo →
              </button>
            </div>
          )}

          {/* PWA Install Banner */}
          {showInstallBanner && (
            <div 
              className="glass-card animate-scale-in" 
              style={{ 
                border: '1px solid var(--color-primary)', 
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 10, 12, 0.95) 100%)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '14px', 
                padding: '16px' 
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Download size={16} /> Installa DeV Fit
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.4', margin: 0 }}>
                  Aggiungi l'app alla schermata Home per usarla a schermo intero senza barra del browser.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button className="btn-primary" onClick={handleInstallClick} style={{ padding: '8px 12px', fontSize: '0.72rem', height: '32px', boxShadow: 'none' }}>
                  Scarica
                </button>
                <button className="btn-secondary" onClick={() => setShowInstallBanner(false)} style={{ padding: '8px 10px', fontSize: '0.72rem', height: '32px' }}>
                  Nascondi
                </button>
              </div>
            </div>
          )}
        </div>
      )}




      {/* Weight Modal */}
      {showWeightModal && (
        <div className="drawer-backdrop" onClick={() => setShowWeightModal(false)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="section-title">Aggiorna Peso Corporeo</h3>
              <button className="drawer-close" onClick={() => setShowWeightModal(false)}><Check size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input 
                type="number" 
                className="set-input" 
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                style={{ flex: 1, height: '42px' }}
                placeholder="es: 65.5"
              />
              <button className="btn-primary" onClick={handleUpdateWeight} style={{ height: '42px' }}>
                Salva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Modal */}
      {showSleepModal && (
        <div className="drawer-backdrop" onClick={() => setShowSleepModal(false)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="section-title">Registra Ore di Sonno</h3>
              <button className="drawer-close" onClick={() => setShowSleepModal(false)}><Check size={20} /></button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Inserisci i dati rilevati dal tuo smartwatch (Galaxy Watch, Apple Watch) o stimati per oggi:
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ore</label>
                <input 
                  type="number" 
                  min="0"
                  max="24"
                  className="set-input" 
                  value={newSleepHours}
                  onChange={e => setNewSleepHours(e.target.value)}
                  style={{ width: '100%', height: '42px' }}
                  placeholder="es: 7"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Minuti</label>
                <input 
                  type="number" 
                  min="0"
                  max="59"
                  className="set-input" 
                  value={newSleepMinutes}
                  onChange={e => setNewSleepMinutes(e.target.value)}
                  style={{ width: '100%', height: '42px' }}
                  placeholder="es: 30"
                />
              </div>
            </div>
            <button className="btn-primary" onClick={handleSaveSleep} style={{ width: '100%', height: '42px', marginTop: '14px' }}>
              Salva Sonno
            </button>
          </div>
        </div>
      )}

      {/* BPM Modal */}
      {showBpmModal && (
        <div className="drawer-backdrop" onClick={() => setShowBpmModal(false)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="section-title">Registra Battito a Riposo</h3>
              <button className="drawer-close" onClick={() => setShowBpmModal(false)}><Check size={20} /></button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Inserisci la frequenza cardiaca a riposo (BPM) misurata dal tuo orologio:
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <input 
                type="number" 
                min="35"
                max="200"
                className="set-input" 
                value={newBpm}
                onChange={e => setNewBpm(e.target.value)}
                style={{ flex: 1, height: '42px' }}
                placeholder="es: 62"
              />
              <button className="btn-primary" onClick={handleSaveBpm} style={{ height: '42px', padding: '0 20px' }}>
                Salva
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
