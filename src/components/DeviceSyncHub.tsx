import React, { useState, useEffect } from 'react';
import { Check, RefreshCw, X, Link, Link2Off, Shield, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface IntegrationItem {
  id: 'apple_health' | 'google_fit' | 'strava';
  name: string;
  provider: string;
  description: string;
  icon: string;
  category: 'system' | 'third_party';
}

export const DeviceSyncHub: React.FC = () => {
  const { profile, updateProfile } = useApp();
  
  // Connection states (saved in localStorage)
  const [connections, setConnections] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('df_sync_integrations');
    return saved ? JSON.parse(saved) : {
      apple_health: false,
      google_fit: false,
      strava: false
    };
  });

  const [lastSync, setLastSync] = useState<{ [key: string]: string }>({});
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [activeWizard, setActiveWizard] = useState<IntegrationItem | null>(null);
  const [permissionStep, setPermissionStep] = useState<'request' | 'success'>('request');

  // Permission toggles inside connection modal
  const [permissions, setPermissions] = useState({
    workouts: true,
    steps: true,
    heartRate: true,
    weight: true
  });

  useEffect(() => {
    localStorage.setItem('df_sync_integrations', JSON.stringify(connections));
  }, [connections]);

  const handleToggleConnection = (item: IntegrationItem) => {
    if (connections[item.id]) {
      // Disconnect
      setConnections(prev => ({ ...prev, [item.id]: false }));
      const newSyncs = { ...lastSync };
      delete newSyncs[item.id];
      setLastSync(newSyncs);
    } else {
      // Open clean permissions prompt modal
      setActiveWizard(item);
      setPermissionStep('request');
      setPermissions({
        workouts: true,
        steps: true,
        heartRate: true,
        weight: true
      });
    }
  };

  const confirmConnection = () => {
    if (!activeWizard) return;
    
    // If connecting a system aggregator, disconnect the other one
    let newConnections = { ...connections, [activeWizard.id]: true };
    if (activeWizard.id === 'apple_health') {
      newConnections.google_fit = false;
    } else if (activeWizard.id === 'google_fit') {
      newConnections.apple_health = false;
    }

    setConnections(newConnections);
    setLastSync(prev => ({ ...prev, [activeWizard.id]: 'Appena adesso' }));
    
    // If weight permission is checked, let's update profile weight from simulated health data
    if (permissions.weight) {
      const currentWeight = profile.weight;
      // Slightly alter the weight to simulate actual sync import
      const syncedWeight = parseFloat((currentWeight > 0 ? currentWeight - 0.3 : 62.5).toFixed(1));
      updateProfile({ weight: syncedWeight });
    }

    setPermissionStep('success');
  };

  const triggerSync = (id: 'apple_health' | 'google_fit' | 'strava') => {
    setIsSyncing(id);
    setTimeout(() => {
      setIsSyncing(null);
      setLastSync(prev => ({ ...prev, [id]: 'Appena adesso' }));
      
      // Update weight randomly to simulate a new weigh-in from scale via Apple Health / Google Fit
      if (id !== 'strava') {
        const currentWeight = profile.weight;
        const newWeight = parseFloat((currentWeight + (Math.random() > 0.5 ? 0.1 : -0.1)).toFixed(1));
        updateProfile({ weight: newWeight });
      }
      
      alert('Sincronizzazione completata con successo!');
    }, 1500);
  };

  const integrations: IntegrationItem[] = [
    {
      id: 'apple_health',
      name: 'Apple Salute (Health)',
      provider: 'Apple iOS',
      description: 'Sincronizza passi, battito cardiaco, sonno, allenamenti e peso da Apple Watch, anelli smart (Oura), Garmin ed altre bilance connesse ad iOS.',
      icon: '❤️',
      category: 'system'
    },
    {
      id: 'google_fit',
      name: 'Google Fit / Health Connect',
      provider: 'Google Android',
      description: 'Importa passi, calorie attive, battito cardiaco e peso da smartband Xiaomi, Fitbit, Galaxy Watch, Garmin o bilance smart registrati su Android.',
      icon: '💚',
      category: 'system'
    },
    {
      id: 'strava',
      name: 'Strava',
      provider: 'Strava Inc.',
      description: 'Sincronizza automaticamente le tue attività all\'aperto come corsa, ciclismo e camminate per includerle nel calcolo calorico quotidiano.',
      icon: '🧡',
      category: 'third_party'
    }
  ];

  return (
    <div className="glass-card animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={18} color="var(--color-primary)" /> Collegamento App & Salute
        </h3>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '2px' }}>
          Collega il sistema operativo del tuo telefono o Strava per aggregare tutti i tuoi dispositivi fisici (wearable, smartwatch, bilance smart).
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* System aggregators */}
        <div>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Sorgenti di Sistema (Consigliato)
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {integrations.filter(i => i.category === 'system').map(item => {
              const isConnected = connections[item.id];
              return (
                <div 
                  key={item.id}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '14px', 
                    background: isConnected ? 'rgba(212, 175, 55, 0.02)' : 'rgba(255,255,255,0.01)', 
                    borderRadius: 'var(--radius-md)', 
                    border: isConnected ? '1px solid rgba(212,175,55,0.25)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{item.icon}</span>
                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: isConnected ? 'white' : 'var(--text-muted)' }}>{item.name}</h5>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '2px', lineHeight: '1.3' }}>{item.description}</p>
                      </div>
                    </div>
                    
                    <button 
                      className={isConnected ? 'btn-secondary' : 'btn-primary'}
                      onClick={() => handleToggleConnection(item)}
                      style={{ 
                        padding: '4px 10px', 
                        fontSize: '0.68rem', 
                        height: '28px', 
                        flexShrink: 0,
                        background: isConnected ? 'rgba(255, 255, 255, 0.03)' : 'var(--color-primary)',
                        color: isConnected ? 'var(--color-error)' : 'black',
                        border: isConnected ? '1px solid rgba(239, 68, 68, 0.2)' : 'none'
                      }}
                    >
                      {isConnected ? (
                        <>
                          <Link2Off size={11} /> Scollega
                        </>
                      ) : (
                        <>
                          <Link size={11} /> Collega
                        </>
                      )}
                    </button>
                  </div>

                  {isConnected && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.68rem' }}>
                      <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                        ● Collegato (Sincronizzazione attiva)
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-dark)' }}>Sinc: {lastSync[item.id] || 'Mai'}</span>
                        <button 
                          className="btn-secondary" 
                          onClick={() => triggerSync(item.id)}
                          disabled={isSyncing !== null}
                          style={{ padding: '2px 8px', fontSize: '0.62rem', height: '22px' }}
                        >
                          <RefreshCw size={10} className={isSyncing === item.id ? 'animate-spin' : ''} /> Sincronizza
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Third-party apps */}
        <div style={{ marginTop: '4px' }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            App Terze
          </h4>
          
          {integrations.filter(i => i.category === 'third_party').map(item => {
            const isConnected = connections[item.id];
            return (
              <div 
                key={item.id}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '14px', 
                  background: isConnected ? 'rgba(212, 175, 55, 0.02)' : 'rgba(255,255,255,0.01)', 
                  borderRadius: 'var(--radius-md)', 
                  border: isConnected ? '1px solid rgba(212,175,55,0.25)' : '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{item.icon}</span>
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: isConnected ? 'white' : 'var(--text-muted)' }}>{item.name}</h5>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '2px', lineHeight: '1.3' }}>{item.description}</p>
                    </div>
                  </div>
                  
                  <button 
                    className={isConnected ? 'btn-secondary' : 'btn-primary'}
                    onClick={() => handleToggleConnection(item)}
                    style={{ 
                      padding: '4px 10px', 
                      fontSize: '0.68rem', 
                      height: '28px', 
                      flexShrink: 0,
                      background: isConnected ? 'rgba(255, 255, 255, 0.03)' : 'var(--color-primary)',
                      color: isConnected ? 'var(--color-error)' : 'black',
                      border: isConnected ? '1px solid rgba(239, 68, 68, 0.2)' : 'none'
                    }}
                  >
                    {isConnected ? (
                      <>
                        <Link2Off size={11} /> Scollega
                      </>
                    ) : (
                      <>
                        <Link size={11} /> Collega
                      </>
                    )}
                  </button>
                </div>

                {isConnected && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.68rem' }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                      ● Collegato
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-dark)' }}>Sinc: {lastSync[item.id] || 'Mai'}</span>
                      <button 
                        className="btn-secondary" 
                        onClick={() => triggerSync(item.id)}
                        disabled={isSyncing !== null}
                        style={{ padding: '2px 8px', fontSize: '0.62rem', height: '22px' }}
                      >
                        <RefreshCw size={10} className={isSyncing === item.id ? 'animate-spin' : ''} /> Sincronizza
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Authorization Modal */}
      {activeWizard && (
        <div className="drawer-backdrop" onClick={() => setActiveWizard(null)}>
          <div className="drawer-content animate-scale-in" onClick={e => e.stopPropagation()} style={{ paddingBottom: '30px' }}>
            <div className="drawer-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Integrazione {activeWizard.name}</h3>
              <button className="drawer-close" onClick={() => setActiveWizard(null)}><X size={20} /></button>
            </div>

            {permissionStep === 'request' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', background: 'rgba(212, 175, 55, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(212, 175, 55, 0.15)', fontSize: '0.72rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  <Shield size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Richiesta Autorizzazione Dati</span>
                    Seleziona quali informazioni desideri sincronizzare e importare nel tuo diario DeV Fit:
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '8px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={permissions.workouts} 
                      onChange={e => setPermissions(prev => ({ ...prev, workouts: e.target.checked }))}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>Sincronizza Allenamenti (Durata e Volume)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={permissions.steps} 
                      onChange={e => setPermissions(prev => ({ ...prev, steps: e.target.checked }))}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>Sincronizza Passi & Calorie Attive</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={permissions.heartRate} 
                      onChange={e => setPermissions(prev => ({ ...prev, heartRate: e.target.checked }))}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>Sincronizza Battito Cardiaco</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={permissions.weight} 
                      onChange={e => setPermissions(prev => ({ ...prev, weight: e.target.checked }))}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>Sincronizza Composizione Corporea (Peso)</span>
                  </label>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={confirmConnection}
                  style={{ height: '42px', fontWeight: 'bold' }}
                >
                  Consenti e Collega
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--color-primary)', color: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px auto' }}>
                  <Check size={26} strokeWidth={3} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Integrazione Attivata!</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {activeWizard.name} è ora associato correttamente. I dati verranno importati automaticamente ogni volta che apri l'app.
                </p>
                <button className="btn-primary" onClick={() => setActiveWizard(null)} style={{ height: '42px', marginTop: '10px', fontWeight: 'bold' }}>
                  Fatto
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
