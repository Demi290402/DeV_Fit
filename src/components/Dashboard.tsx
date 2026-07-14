import React, { useState } from 'react';
import { Flame, Droplet, Dumbbell, Scale, Check } from 'lucide-react';
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

      {/* Tip Widget */}
      <TipWidget />

      {/* Calories Ring and Macro progress */}
      <div className="glass-card macro-card">
        <div className="macro-circle-container">
          <svg className="macro-svg">
            <circle className="circle-bg" cx="60" cy="60" r={radius} />
            <circle 
              className="circle-progress" 
              cx="60" 
              cy="60" 
              r={radius} 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="macro-circle-text">
            <span className="macro-calories">{totalCalories}</span>
            <div className="macro-label">kcal / {profile.targetCalories}</div>
          </div>
        </div>

        <div className="macro-stats">
          <div className="macro-bar-row">
            <div className="macro-bar-header">
              <span>Proteine</span>
              <span style={{ color: '#3b82f6' }}>{totalProtein}g / {profile.targetProtein}g</span>
            </div>
            <div className="macro-bar-bg">
              <div className="macro-bar-fill fill-protein" style={{ width: `${Math.min((totalProtein / profile.targetProtein) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="macro-bar-row">
            <div className="macro-bar-header">
              <span>Carboidrati</span>
              <span style={{ color: '#eab308' }}>{totalCarbs}g / {profile.targetCarbs}g</span>
            </div>
            <div className="macro-bar-bg">
              <div className="macro-bar-fill fill-carbs" style={{ width: `${Math.min((totalCarbs / profile.targetCarbs) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="macro-bar-row">
            <div className="macro-bar-header">
              <span>Grassi</span>
              <span style={{ color: '#ef4444' }}>{totalFat}g / {profile.targetFat}g</span>
            </div>
            <div className="macro-bar-bg">
              <div className="macro-bar-fill fill-fat" style={{ width: `${Math.min((totalFat / profile.targetFat) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="section-title">Azioni Rapide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleAddWater} style={{ flexDirection: 'column', gap: '6px', padding: '12px 8px', fontSize: '0.75rem', height: '80px' }}>
            <Droplet size={20} color="#06b6d4" />
            <span>Acqua (+250ml)</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-secondary)', fontWeight: 'bold' }}>{waterCount} ml</span>
          </button>
          
          <button className="btn-secondary" onClick={() => { startWorkout(); setCurrentTab('workout'); }} style={{ flexDirection: 'column', gap: '6px', padding: '12px 8px', fontSize: '0.75rem', height: '80px' }}>
            <Dumbbell size={20} color="#8b5cf6" />
            <span>Inizia Allenamento</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>Vuoto</span>
          </button>

          <button className="btn-secondary" onClick={() => setShowWeightModal(true)} style={{ flexDirection: 'column', gap: '6px', padding: '12px 8px', fontSize: '0.75rem', height: '80px' }}>
            <Scale size={20} color="#10b981" />
            <span>Log Peso</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 'bold' }}>{profile.weight} kg</span>
          </button>
        </div>
      </div>

      {/* Today's Meals Overview */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Pasti Registrati Oggi</h3>
        {todayFoods.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textAlign: 'center', padding: '12px 0' }}>
            Nessun alimento registrato oggi. Vai nella scheda "Dieta" per aggiungere un pasto!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayFoods.map(food => (
              <div key={food.id} className="food-entry-item" style={{ border: 'none', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-secondary)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block' }}>{food.mealType}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{food.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginLeft: '8px' }}>{food.weight}g</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{food.calories} kcal</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>P:{food.protein} C:{food.carbs} G:{food.fat}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Weight Logger Modal */}
      {showWeightModal && (
        <div className="drawer-backdrop" onClick={() => setShowWeightModal(false)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ paddingBottom: '30px' }}>
            <h3 className="section-title">Registra Peso Corporeo</h3>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <input 
                type="number" 
                step="0.1" 
                className="set-input" 
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                style={{ flex: 1, height: '46px', fontSize: '1rem' }}
                placeholder="es: 65.4"
              />
              <button className="btn-primary" onClick={handleUpdateWeight} style={{ height: '46px' }}>
                <Check size={18} /> Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
