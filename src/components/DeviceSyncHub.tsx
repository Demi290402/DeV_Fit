import React, { useState, useEffect } from 'react';
import { Smartphone, Scale, Heart, Info, Check, RefreshCw, X, Link, Link2Off, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DeviceItem {
  id: string;
  name: string;
  category: 'Wearable' | 'Bilancia' | 'App';
  brand: string;
  icon: React.ReactNode;
}

export const DeviceSyncHub: React.FC = () => {
  const { profile, updateProfile } = useApp();
  
  // Connection states
  const [connections, setConnections] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('df_sync_connections');
    return saved ? JSON.parse(saved) : {
      fitbit: false,
      applewatch: false,
      samsungwatch: false,
      xiaomi: false,
      smartscale: false,
      googlefit: false,
      samsunghealth: false,
      hevy: false
    };
  });

  // Simulated metrics state
  const [syncData, setSyncData] = useState<{ heartRate?: number; activeKcal?: number; lastSyncScaleWeight?: number }>({});
  
  // Connection wizard modal
  const [activeWizardDevice, setActiveWizardDevice] = useState<DeviceItem | null>(null);
  const [wizardStep, setWizardStep] = useState<'intro' | 'linking' | 'success'>('intro');
  const [wizardMessage, setWizardMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('df_sync_connections', JSON.stringify(connections));
  }, [connections]);

  // Simulate receiving data from active wearables
  useEffect(() => {
    const activeWearable = connections.applewatch || connections.fitbit || connections.samsungwatch || connections.xiaomi;
    
    if (activeWearable) {
      // Generate some dummy heart rate and calories syncing
      setSyncData(prev => ({
        ...prev,
        heartRate: Math.floor(Math.random() * (140 - 68 + 1)) + 68,
        activeKcal: (prev.activeKcal || 150) + Math.floor(Math.random() * 5)
      }));

      const interval = setInterval(() => {
        setSyncData(prev => ({
          ...prev,
          heartRate: Math.floor(Math.random() * (135 - 70 + 1)) + 70,
          activeKcal: (prev.activeKcal || 150) + Math.floor(Math.random() * 3)
        }));
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setSyncData(prev => ({ ...prev, heartRate: undefined, activeKcal: undefined }));
    }
  }, [connections]);

  const devices: DeviceItem[] = [
    { id: 'applewatch', name: 'Apple Watch', category: 'Wearable', brand: 'Apple', icon: <Smartphone size={24} color="#ec4899" /> },
    { id: 'fitbit', name: 'Fitbit Versa / Charge', category: 'Wearable', brand: 'Fitbit', icon: <Smartphone size={24} color="#06b6d4" /> },
    { id: 'samsungwatch', name: 'Galaxy Watch', category: 'Wearable', brand: 'Samsung', icon: <Smartphone size={24} color="#3b82f6" /> },
    { id: 'xiaomi', name: 'Mi Band / RedMi', category: 'Wearable', brand: 'Xiaomi', icon: <Smartphone size={24} color="#f97316" /> },
    { id: 'smartscale', name: 'Bilancia Smart Impedenziometrica', category: 'Bilancia', brand: 'Xiaomi / Withings', icon: <Scale size={24} color="#10b981" /> },
    { id: 'googlefit', name: 'Google Fit', category: 'App', brand: 'Google', icon: <Check size={24} color="#ef4444" /> },
    { id: 'samsunghealth', name: 'Samsung Health', category: 'App', brand: 'Samsung', icon: <Award size={24} color="#8b5cf6" /> },
    { id: 'hevy', name: 'Hevy Workout Sync', category: 'App', brand: 'Hevy', icon: <RefreshCw size={24} color="#3b82f6" /> }
  ];

  const handleConnectClick = (device: DeviceItem) => {
    if (connections[device.id]) {
      // Disconnect
      setConnections(prev => ({ ...prev, [device.id]: false }));
    } else {
      // Open connection wizard
      setActiveWizardDevice(device);
      setWizardStep('intro');
    }
  };

  const startLinking = () => {
    if (!activeWizardDevice) return;
    setWizardStep('linking');
    setWizardMessage(`Connessione ai server cloud di ${activeWizardDevice.brand}...`);

    setTimeout(() => {
      setWizardMessage(`Sincronizzazione chiavi API ed autorizzazione dati sanitari...`);
    }, 1200);

    setTimeout(() => {
      setConnections(prev => ({ ...prev, [activeWizardDevice.id]: true }));
      setWizardStep('success');

      // Special action if smart scale is connected: sync weight automatically!
      if (activeWizardDevice.id === 'smartscale') {
        // Simulates retrieving scale data (eg. 64.8kg, 20.8% bodyfat)
        const currentWeight = profile.weight;
        const scaleWeight = parseFloat((currentWeight - 0.6).toFixed(1)); // slightly different weight
        const scaleBf = parseFloat((profile.bodyFat - 0.7).toFixed(1));
        
        updateProfile({ weight: scaleWeight, bodyFat: scaleBf });
        setSyncData(prev => ({ ...prev, lastSyncScaleWeight: scaleWeight }));
      }
    }, 2500);
  };

  return (
    <div className="glass-card animate-scale-in">
      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <RefreshCw size={16} color="var(--color-secondary)" /> Centro Connessioni & Wearables
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Collega l'app a bilance intelligenti, orologi o app di fitness per ricevere dati corporei ed atletici in tempo reale senza inserimenti manuali.
      </p>

      {/* Wearable Real-time Sync Banner */}
      {syncData.heartRate && (
        <div className="animate-glow" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)', border: '1px solid var(--color-female)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} color="var(--color-female)" className="animate-pulse" fill="var(--color-female)" />
            <div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>BATTITO CARDIACO IN DIRETTA</span>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>{syncData.heartRate} <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>bpm</span></span>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
          <div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>CALORIE ATTIVE SYNC</span>
            <span style={{ fontSize: '1rem', fontWeight: 800 }}>{syncData.activeKcal} <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>kcal</span></span>
          </div>
        </div>
      )}

      {/* Smart scale sync feedback banner */}
      {connections.smartscale && syncData.lastSyncScaleWeight && (
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scale size={16} color="var(--color-success)" />
          <p>
            Bilancia smart connessa! Peso sincronizzato automaticamente: <strong>{syncData.lastSyncScaleWeight} kg</strong> (risparmiati 10 secondi).
          </p>
        </div>
      )}

      {/* Devices list grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {devices.map(device => {
          const isConnected = connections[device.id];
          return (
            <div key={device.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {device.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>{device.name}</h4>
                  <span style={{ fontSize: '0.68rem', color: isConnected ? 'var(--color-success)' : 'var(--text-dark)', fontWeight: 'bold' }}>
                    {isConnected ? '● Connesso e Sincronizzato' : '○ Disconnesso'}
                  </span>
                </div>
              </div>
              <button 
                className={isConnected ? 'btn-secondary' : 'btn-primary'}
                onClick={() => handleConnectClick(device)}
                style={{ padding: '6px 14px', fontSize: '0.72rem', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {isConnected ? (
                  <>
                    <Link2Off size={12} /> Scollega
                  </>
                ) : (
                  <>
                    <Link size={12} /> Collega
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Connection Wizard Modal */}
      {activeWizardDevice && (
        <div className="drawer-backdrop" onClick={() => setWizardStep('intro')}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ paddingBottom: '30px' }}>
            <div className="drawer-header">
              <h3 className="section-title">Collegamento {activeWizardDevice.name}</h3>
              <button className="drawer-close" onClick={() => setActiveWizardDevice(null)}><X size={20} /></button>
            </div>

            {wizardStep === 'intro' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <p style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                  DeV_Fit utilizzerà le API protette di <strong>{activeWizardDevice.brand}</strong> per estrarre in tempo reale dati su allenamenti, sonno, battito cardiaco o peso.
                </p>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(6, 182, 212, 0.05)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.15)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <Info size={16} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
                  <span>Nessuna password di {activeWizardDevice.brand} verrà salvata. L'autorizzazione avviene in modo sicuro tramite protocollo OAuth2 (crittografia SSL).</span>
                </div>
                <button className="btn-primary" onClick={startLinking} style={{ height: '42px' }}>
                  Avvia Autorizzazione Cloud
                </button>
              </div>
            )}

            {wizardStep === 'linking' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '30px 0' }}>
                <RefreshCw size={42} className="animate-spin" color="var(--color-secondary)" />
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', textAlign: 'center' }}>
                  {wizardMessage}
                </p>
              </div>
            )}

            {wizardStep === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--color-success)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px auto' }}>
                  <Check size={28} />
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800 }}>Integrazione Completata!</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {activeWizardDevice.name} è stato connesso con successo. DeV_Fit ora sincronizzerà le tue informazioni in background.
                </p>
                {activeWizardDevice.id === 'smartscale' && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                    Bilancia smart: sincronizzati {profile.weight} kg!
                  </p>
                )}
                <button className="btn-primary" onClick={() => setActiveWizardDevice(null)} style={{ height: '42px', marginTop: '10px' }}>
                  Chiudi finestra
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
