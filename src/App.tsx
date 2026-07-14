import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { RoutineManager } from './components/RoutineManager';
import { ActiveWorkout } from './components/ActiveWorkout';
import { FoodScanner } from './components/FoodScanner';
import { RecipeBook } from './components/RecipeBook';
import { SocialFeed } from './components/SocialFeed';
import { Profile } from './components/Profile';
import { AuthScreen } from './components/AuthScreen';
import { ShieldCheck, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dietSubTab, setDietSubTab] = useState<'diary' | 'recipes'>('diary');
  const { activeWorkout, user, signOut, hasConsented, setHasConsented } = useApp();

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'workout':
        if (activeWorkout) {
          return <ActiveWorkout />;
        }
        return <RoutineManager />;
      case 'diet':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setDietSubTab('diary')}
                style={{ 
                  flex: 1, 
                  background: dietSubTab === 'diary' ? 'var(--color-secondary)' : 'transparent',
                  color: dietSubTab === 'diary' ? 'black' : 'white',
                  border: 'none',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Diario Pasti
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => setDietSubTab('recipes')}
                style={{ 
                  flex: 1, 
                  background: dietSubTab === 'recipes' ? 'var(--color-secondary)' : 'transparent',
                  color: dietSubTab === 'recipes' ? 'black' : 'white',
                  border: 'none',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Ricettario
              </button>
            </div>
            
            {dietSubTab === 'diary' ? <FoodScanner /> : <RecipeBook />}
          </div>
        );
      case 'social':
        return <SocialFeed />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

  // 1. If user is not authenticated, show AuthScreen
  if (!user) {
    return <AuthScreen />;
  }

  // 2. If user is logged in but hasn't accepted health data consent (GDPR/Google Play requirement)
  if (!hasConsented) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#08080a',
        color: 'white'
      }}>
        <div className="glass-card animate-scale-in" style={{ maxWidth: '440px', padding: '28px', border: '1px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary)', marginBottom: '14px' }}>
            <ShieldCheck size={28} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Consenso Trattamento Dati Sensibili</h2>
          </div>
          
          <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-primary)', marginBottom: '14px' }}>
            DeV_Fit è un'applicazione dedicata a fitness, salute e nutrizione. Per fornirti statistiche di allenamento, andamento del peso corporeo, diario alimentare e phases del ciclo mestruale femminile, **è necessario raccogliere e memorizzare i tuoi dati corporei e sanitari**.
          </p>
          
          <div style={{ display: 'flex', gap: '10px', background: 'rgba(6, 182, 212, 0.05)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.15)', marginBottom: '20px' }}>
            <Info size={16} color="var(--color-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              I tuoi dati sono al sicuro nel database crittografato e non verranno **mai** ceduti a terzi. Puoi revocare il consenso ed eliminare definitivamente tutti i tuoi record in qualunque momento dal tuo Profilo.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-primary" onClick={() => setHasConsented(true)} style={{ width: '100%', height: '42px' }}>
              Accetto e procedo
            </button>
            <button className="btn-secondary" onClick={() => signOut()} style={{ width: '100%', height: '42px', color: 'var(--color-error)' }}>
              Rifiuta ed esci
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Normal App Shell
  return (
    <div className="app-container">
      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="app-content">
        {renderTabContent()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
