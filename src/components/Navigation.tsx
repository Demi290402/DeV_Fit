import React from 'react';
import { Home, Dumbbell, Apple, Heart, Users, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, setCurrentTab }) => {
  const { activeWorkout, profile } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Casa', icon: Home },
    { id: 'workout', label: 'Allenamento', icon: Dumbbell },
    { id: 'diet', label: 'Dieta', icon: Apple },
    ...(profile.gender === 'female' ? [{ id: 'cycle', label: 'Ciclo', icon: Heart }] : []),
    { id: 'social', label: 'Social', icon: Users },
    { id: 'profile', label: 'Profilo', icon: User },
  ];

  return (
    <>
      <header className="app-header">
        <div className="brand-title">
          DeV_Fit<span className="brand-dot">.</span>
        </div>
        <div className="header-actions">
          {activeWorkout && (
            <div 
              className="timer-box animate-glow" 
              style={{ 
                background: 'var(--color-secondary-glow)', 
                padding: '6px 12px', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentTab('workout')}
            >
              <Dumbbell size={14} className="animate-pulse" />
              Allenamento Attivo
            </div>
          )}
          <div className="icon-btn">
            <User size={18} onClick={() => setCurrentTab('profile')} />
          </div>
        </div>
      </header>

      <nav className="bottom-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </>
  );
};
