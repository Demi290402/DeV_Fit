import React, { useState, useEffect } from 'react';
import { Flame, Droplet, Dumbbell, Scale, Check, Download, Moon, Heart, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { TipWidget } from './TipWidget';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const { profile, updateProfile, foodLogs, startWorkout, cycleData } = useApp();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.weight.toString());
  const [waterCount, setWaterCount] = useState(() => {
    const saved = localStorage.getItem(`df_water_${new Date().toISOString().split('T')[0]}`);
    return saved ? parseInt(saved) : 0;
  });


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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFoods = foodLogs[todayStr] || [];

  // Macro Totals
  const totalCalories = todayFoods.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = todayFoods.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = todayFoods.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = todayFoods.reduce((sum, item) => sum + item.fat, 0);

  // Calorie Ring Calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min((totalCalories / profile.targetCalories) * 100, 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleAddWater = () => {
    const newVal = waterCount + 250;
    setWaterCount(newVal);
    localStorage.setItem(`df_water_${todayStr}`, newVal.toString());
  };

  const handleUpdateWeight = () => {
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      updateProfile({ weight: w });
      setShowWeightModal(false);
    }
  };

  // BMI Calculations

  const heightM = (profile.height || 165) / 100;
  const bmi = profile.weight / (heightM * heightM);
  
  const getBmiCategory = (value: number) => {
    if (value < 18.5) return { label: 'Sottopeso', color: '#3b82f6', text: 'Il tuo peso è inferiore alla norma per la tua altezza. Considera un surplus calorico sano per aumentare la massa muscolare.' };
    if (value < 25) return { label: 'Normopeso', color: '#10b981', text: 'Il tuo peso è ottimale ed ideale per la tua altezza! Mantieni uno stile di vita attivo.' };
    if (value < 30) return { label: 'Sovrappeso', color: '#eab308', text: 'Il tuo peso è leggermente superiore alla norma. Associa una dieta controllata ad attività cardio e allenamenti di forza.' };
    return { label: 'Obesità', color: '#ef4444', text: 'Il tuo peso è superiore alla norma. Si raccomanda di associare attività fisica regolare a una dieta controllata.' };
  };
  const bmiCat = getBmiCategory(bmi);
  const bmiPercentage = Math.min(Math.max(((bmi - 15) / (35 - 15)) * 100, 0), 100);

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

  // Active Health Sync check
  const isHealthConnected = (() => {
    const saved = localStorage.getItem('df_sync_integrations');
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return parsed.apple_health || parsed.google_fit;
  })();

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
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.35s' }}
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'white' }}>{Math.round(progressPercent)}%</span>
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
        <button className="btn-secondary" onClick={handleAddWater} style={{ width: '100%', padding: '8px', fontSize: '0.75rem' }}>
          + Bicchier d'Acqua (250ml)
        </button>
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

      {/* Sonno */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Moon size={15} color="#8b5cf6" /> Qualità del Sonno
        </h3>
        {isHealthConnected ? (
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>7h 32m</span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ieri notte · Ottimo</p>
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
              {[
                { label: 'Leggero', pct: 45, color: '#3b82f6' },
                { label: 'Profondo', pct: 30, color: '#8b5cf6' },
                { label: 'REM', pct: 25, color: '#ec4899' }
              ].map(s => (
                <div key={s.label} style={{ flex: 1 }}>
                  <div style={{ height: '5px', borderRadius: '3px', background: s.color, opacity: 0.8, width: `${s.pct}%` }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)' }}>{s.label} {s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Collega Apple Health o Google Fit per tracciare automaticamente il tuo sonno e le sue fasi.
            </p>
            <button
              className="btn-secondary"
              onClick={() => setCurrentTab('devices')}
              style={{ padding: '8px', fontSize: '0.7rem', marginTop: 'auto' }}
            >
              Collega Dispositivo
            </button>
          </div>
        )}
      </div>

      {/* Frequenza Cardiaca a Riposo (da Health Sync) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Heart size={15} color="#ef4444" /> Battito a Riposo
        </h3>
        {isHealthConnected ? (
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>62 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>bpm</span></span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Stato: Ottimo</p>
            <div style={{ marginTop: '8px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '44%', background: '#10b981', borderRadius: '3px', transition: 'width 0.6s' }} />
            </div>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-dark)', marginTop: '4px' }}>Range atleti: 40–60 bpm · Normale: 60–100 bpm</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Il monitoraggio del battito cardiaco a riposo richiede la sincronizzazione con un'app salute.
            </p>
            <button
              className="btn-secondary"
              onClick={() => setCurrentTab('devices')}
              style={{ padding: '8px', fontSize: '0.7rem', marginTop: 'auto' }}
            >
              Collega Dispositivo
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

      {/* Quick Start Gym Workout */}
      <div
        className="glass-card animate-glow"
        style={{
          gridColumn: 'span 2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: '4px solid var(--color-primary)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(10, 10, 12, 0.85) 100%)'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Inizia Allenamento</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Registra carichi, recuperi e statistiche all'istante.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            startWorkout();
            setCurrentTab('workout');
          }}
          style={{ padding: '10px 18px', fontSize: '0.75rem' }}
        >
          <Dumbbell size={14} /> Inizia Ora
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
    </div>
  );
};
