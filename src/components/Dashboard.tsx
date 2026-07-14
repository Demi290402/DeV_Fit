import React, { useState, useEffect } from 'react';
import { Flame, Droplet, Dumbbell, Scale, Check, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { TipWidget } from './TipWidget';

interface DashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentTab }) => {
  const { profile, updateProfile, foodLogs, startWorkout } = useApp();
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

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Scale size={16} color="var(--color-primary)" /> Peso Corporeo
        </h3>
        <div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{profile.weight} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>kg</span></span>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Aggiornato di recente</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowWeightModal(true)} style={{ width: '100%', padding: '8px', fontSize: '0.75rem' }}>
          Aggiorna Peso
        </button>
      </div>

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
