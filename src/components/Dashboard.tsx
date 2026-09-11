import React, { useState, useEffect } from 'react';
import { Flame, Droplet, Dumbbell, Scale, Check, Download, Moon, Heart, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { TipWidget } from './TipWidget';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
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
  const radius = 50;
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






  return (

    <div className="dashboard-grid animate-fade-in-up">
      {/* Welcome & Streak */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Ciao, {profile.name}!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Continua così per raggiungere i tuoi obiettivi.</p>
      </div>

      <div className="glass-card streak-counter">
        <div className="streak-number">{profile.streak}</div>
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem', fontWeight: 700 }}>
            Giorni di Costanza <Flame size={16} fill="#f59e0b" color="#f59e0b" />
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Mantieni il diario alimentare o l'allenamento attivo ogni giorno!
          </p>
        </div>
      </div>

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div 
          className="glass-card animate-scale-in" 
          style={{ 
            gridColumn: 'span 2', 
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
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={16} /> Installa DeV Fit!
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.4' }}>
              Aggiungi l'applicazione alla tua schermata Home per usarla a tutto schermo, velocizzare gli accessi e salvare i dati.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button className="btn-primary" onClick={handleInstallClick} style={{ padding: '8px 12px', fontSize: '0.72rem', height: '32px', boxShadow: 'none' }}>
              Scarica App
            </button>
            <button className="btn-secondary" onClick={() => setShowInstallBanner(false)} style={{ padding: '8px 10px', fontSize: '0.72rem', height: '32px' }}>
              Nascondi
            </button>
          </div>
        </div>
      )}

      {/* Tip Widget */}
      <TipWidget />

      {/* Calories Card */}
      <div className="glass-card macro-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Bilancio Calorico</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>
              {totalCalories} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {profile.targetCalories} kcal</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Assunte oggi</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>{totalProtein}g / {profile.targetProtein}g</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>Proteine</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>{totalCarbs}g / {profile.targetCarbs}g</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>Carboidrati</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>{totalFat}g / {profile.targetFat}g</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>Grassi</span>
            </div>
          </div>
        </div>

        {/* Circular SVG Ring */}
        <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="55" cy="55" r={radius} fill="transparent" stroke="var(--border-color)" strokeWidth="8" />
            <circle 
              cx="55" 
              cy="55" 
              r={radius} 
              fill="transparent" 
              stroke="var(--color-primary)" 
              strokeWidth="8" 
              strokeDasharray={circumference}
              strokeDashoffset={safeStrokeDashoffset}

              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.35s' }}
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'white' }}>{Math.round(safeProgressPercent)}%</span>

            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Macro</span>
          </div>
        </div>
      </div>

      {/* Quick Action Widgets */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Droplet size={16} color="var(--color-info)" /> Acqua Giornaliera
        </h3>
        <div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{waterCount} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>ml</span></span>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Obiettivo: 2000 ml</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-secondary" onClick={handleAddWater} style={{ flex: 1, padding: '8px', fontSize: '0.75rem' }}>
            +250 ml (Bicchiere)
          </button>
          {waterCount > 0 && (
            <button 
              className="btn-secondary" 
              onClick={handleRemoveWater} 
              style={{ width: '38px', padding: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }} 
              title="Rimuovi 250ml"
            >
              -
            </button>
          )}
        </div>

      </div>

      {/* Peso + BMI compatto */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Scale size={16} color="var(--color-primary)" /> Peso Corporeo
        </h3>
        <div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{profile.weight} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>kg</span></span>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Altezza: {profile.height || 165} cm</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowWeightModal(true)} style={{ width: '100%', padding: '8px', fontSize: '0.75rem' }}>
          Aggiorna Peso
        </button>
      </div>

      {/* BMI Card — full width */}
      <div className="glass-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5, borderLeft: `3px solid ${bmiCat.color}`, paddingLeft: '10px' }}>
          {bmiCat.text}
        </p>
      </div>

      {/* Sonno - Reale */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Moon size={15} color="#8b5cf6" /> Sonno
          </h3>
          {sleepData && (
            <button
              className="btn-secondary"
              onClick={() => {
                setNewSleepHours(sleepData.hours.toString());
                setNewSleepMinutes(sleepData.minutes.toString());
                setShowSleepModal(true);
              }}
              style={{ padding: '2px 8px', fontSize: '0.65rem' }}
            >
              Modifica
            </button>
          )}
        </div>

        {sleepData ? (
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
              {sleepData.hours}h {sleepData.minutes > 0 ? `${sleepData.minutes}m` : ''}
            </span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {sleepData.hours >= 7 && sleepData.hours <= 9
                ? 'Durata ottimale (7–9h)'
                : sleepData.hours < 7
                ? 'Sotto la soglia consigliata (<7h)'
                : 'Sonno prolungato (>9h)'}
            </p>
            <div style={{ marginTop: '8px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(((sleepData.hours * 60 + sleepData.minutes) / (8 * 60)) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                  borderRadius: '3px'
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>--</span>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Nessun dato registrato oggi.
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setShowSleepModal(true)}
              style={{ width: '100%', padding: '8px', fontSize: '0.7rem', marginTop: 'auto' }}
            >
              Registra Sonno
            </button>
          </div>
        )}
      </div>

      {/* Frequenza Cardiaca a Riposo - Reale */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Heart size={15} color="#ef4444" /> Battito a Riposo
          </h3>
          {heartRateData && (
            <button
              className="btn-secondary"
              onClick={() => {
                setNewBpm(heartRateData.toString());
                setShowBpmModal(true);
              }}
              style={{ padding: '2px 8px', fontSize: '0.65rem' }}
            >
              Modifica
            </button>
          )}
        </div>

        {heartRateData ? (
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
              {heartRateData} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>bpm</span>
            </span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {heartRateData < 60
                ? 'Range atleta / ottimo (<60 bpm)'
                : heartRateData <= 80
                ? 'Frequenza a riposo ideale (60–80 bpm)'
                : 'Frequenza elevata (>80 bpm)'}
            </p>
            <div style={{ marginTop: '8px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(Math.max(((heartRateData - 40) / (100 - 40)) * 100, 10), 100)}%`,
                  background: heartRateData <= 80 ? '#10b981' : '#ef4444',
                  borderRadius: '3px'
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>-- <span style={{ fontSize: '0.8rem' }}>bpm</span></span>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Nessuna rilevazione odierna.
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setShowBpmModal(true)}
              style={{ width: '100%', padding: '8px', fontSize: '0.7rem', marginTop: 'auto' }}
            >
              Registra Battito
            </button>
          </div>
        )}
      </div>


      {/* Ciclo Mestruale — solo per le donne */}
      {profile.gender === 'female' && cycleInfo && (
        <div className="glass-card" style={{
          gridColumn: 'span 2',
          display: 'flex', flexDirection: 'column', gap: '12px',
          borderLeft: `4px solid ${cycleInfo.color}`,
          background: `linear-gradient(135deg, ${cycleInfo.color}08 0%, rgba(10,10,12,0.9) 100%)`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌙 Ciclo Mestruale
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
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>di {cycleData.cycleLength} del ciclo</p>
            </div>
            {/* Mini cycle wheel */}
            <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
              <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke={cycleInfo.color} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - cycleInfo.currentDay / cycleData.cycleLength)}`}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '0.62rem', fontWeight: 800, color: cycleInfo.color }}>
                {Math.round((cycleInfo.currentDay / cycleData.cycleLength) * 100)}%
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5, borderLeft: `3px solid ${cycleInfo.color}`, paddingLeft: '10px' }}>
            💡 {cycleInfo.tips}
          </p>
          <button
            className="btn-secondary"
            onClick={() => setCurrentTab('cycle')}
            style={{ padding: '7px', fontSize: '0.7rem', alignSelf: 'flex-start' }}
          >
            Vai al Ciclo →
          </button>
        </div>
      )}

      {/* Quick Start / Resume Gym Workout */}
      <div
        className="glass-card animate-glow"
        style={{
          gridColumn: 'span 2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: '4px solid var(--color-primary)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 10, 12, 0.95) 100%)'
        }}
      >
        <div style={{ flex: 1, paddingRight: '10px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {activeWorkout ? `In Corso: ${activeWorkout.name}` : 'Inizia Allenamento'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activeWorkout
              ? 'Hai una sessione aperta. Tocca per registrare serie e carichi.'
              : 'Registra carichi, serie e statistiche all\'istante.'}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            if (!activeWorkout) {
              startWorkout();
            }
            setCurrentTab('workout');
          }}
          style={{ padding: '10px 18px', fontSize: '0.75rem', flexShrink: 0 }}
        >
          <Dumbbell size={14} /> {activeWorkout ? 'Riprendi' : 'Inizia Ora'}
        </button>
      </div>




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
