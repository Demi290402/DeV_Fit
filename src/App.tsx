import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { RoutineManager } from './components/RoutineManager';
import { ActiveWorkout } from './components/ActiveWorkout';
import { FoodScanner } from './components/FoodScanner';
import { RecipeBook } from './components/RecipeBook';
import { CycleTracker } from './components/CycleTracker';
import { SocialFeed } from './components/SocialFeed';
import { Profile } from './components/Profile';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dietSubTab, setDietSubTab] = useState<'diary' | 'recipes'>('diary');
  const { activeWorkout } = useApp();

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
            {/* Diet Sub-Tab Navigation */}
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
      case 'cycle':
        return <CycleTracker />;
      case 'social':
        return <SocialFeed />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setCurrentTab={setCurrentTab} />;
    }
  };

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
