import React from 'react';
import { Home, Dumbbell, Apple, User } from 'lucide-react';
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
    { id: 'profile', label: 'Profilo', icon: User },
  ];

  return (
    <>
      {/* Mobile Top Header (hidden on desktop) */}
      <header className="app-header">
        <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/DeVFitLogo.png" 
            alt="DeV Fit" 
            style={{ height: '28px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>
        <div className="header-actions">
          {activeWorkout && (
            <div 
              className="timer-box animate-glow" 
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)', 
                color: '#050506',
                fontWeight: 700,
                padding: '6px 12px', 
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
              }}
              onClick={() => setCurrentTab('workout')}
            >
              <Dumbbell size={13} className="animate-pulse" />
              <span>In corso</span>
            </div>
          )}

          <div 
            className="icon-btn"
            onClick={() => setCurrentTab('profile')}
            style={{ 
              overflow: 'hidden', 
              padding: 0,
              border: profile.avatarUrl ? '1.5px solid var(--color-primary)' : '1px solid transparent',
              cursor: 'pointer',
              background: profile.avatarUrl ? 'transparent' : undefined
            }}
            title="Profilo"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={18} />
            )}
          </div>
        </div>
      </header>

      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="bottom-nav">
        {/* Brand title inside sidebar - visible only on desktop */}
        <div className="brand-title desktop-only-logo" style={{ margin: '0 0 24px 14px', display: 'block', textAlign: 'center' }}>
          <img 
            src="/DeVFitLogo.png" 
            alt="DeV Fit" 
            style={{ height: '56px', width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }} 
          />
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isProfile = item.id === 'profile';
          return (
            <div
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <div className="nav-icon-pill">
                {isProfile && profile.avatarUrl ? (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: currentTab === 'profile' ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.3)',
                    boxShadow: currentTab === 'profile' ? '0 0 8px rgba(212, 175, 55, 0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}>
                    <img src={profile.avatarUrl} alt="Profilo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <span>{item.label}</span>
            </div>
          );
        })}

        {/* Active workout indicator inside sidebar - visible only on desktop */}
        {activeWorkout && (
          <div 
            className="timer-box animate-glow desktop-only-logo" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(10, 10, 12, 0.95) 100%)', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              marginTop: 'auto',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onClick={() => setCurrentTab('workout')}
          >
            <Dumbbell size={18} className="animate-pulse" color="var(--color-primary)" />

            <div>
              <span style={{ fontWeight: 'bold', display: 'block' }}>Allenamento in corso</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Fai clic per riprendere</span>
            </div>
          </div>
        )}

        {/* User mini profile card inside sidebar - visible only on desktop */}
        <div 
          className="desktop-only-logo"
          onClick={() => setCurrentTab('profile')}
          style={{
            marginTop: activeWorkout ? '12px' : 'auto',
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid var(--color-primary)',
            background: 'var(--background-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={18} color="var(--color-primary)" />
            )}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {profile.name}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Visualizza Profilo
            </span>
          </div>
        </div>
      </nav>

      {/* CSS injection for responsive sidebar logo toggle */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-only-logo {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
