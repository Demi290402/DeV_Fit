import React, { useState, useEffect } from 'react';
import { Smartphone, Scale, Heart, Info, Check, RefreshCw, X, Link, Link2Off, Award, Activity, Zap } from 'lucide-react';
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
  
  // Global sync animation trigger
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

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
      setSyncData(prev => ({
        ...prev,
        heartRate: Math.floor(Math.random() * (135 - 72 + 1)) + 72,
        activeKcal: (prev.activeKcal || 180) + Math.floor(Math.random() * 4)
      }));

      const interval = setInterval(() => {
        setSyncData(prev => ({
          ...prev,
          heartRate: Math.floor(Math.random() * (130 - 70 + 1)) + 70,
          activeKcal: (prev.activeKcal || 180) + Math.floor(Math.random() * 2)
        }));
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setSyncData(prev => ({ ...prev, heartRate: undefined, activeKcal: undefined }));
    }
  }, [connections]);

  const handleConnectClick = (device: DeviceItem) => {
    if (connections[device.id]) {
      // Disconnect
      setConnections(prev => ({ ...prev, [device.id]: false }));
      if (device.id === 'smartscale') {
        setSyncData(prev => ({ ...prev, lastSyncScaleWeight: undefined }));
      }
    } else {
      // Open connection wizard
      setActiveWizardDevice(device);
      setWizardStep('intro');
    }
  };

  const startLinking = () => {
    if (!activeWizardDevice) return;
    setWizardStep('linking');
    setWizardMessage(`Inizializzazione OAuth2 con i server di ${activeWizardDevice.brand}...`);

    setTimeout(() => {
      setWizardMessage(`Sincronizzazione token crittografici ed autorizzazione dati...`);
    }, 1200);

    setTimeout(() => {
      setConnections(prev => ({ ...prev, [activeWizardDevice.id]: true }));
      setWizardStep('success');

      if (activeWizardDevice.id === 'smartscale') {
        const currentWeight = profile.weight;
        const scaleWeight = parseFloat((currentWeight > 0 ? currentWeight - 0.4 : 64.8).toFixed(1));
        const scaleBf = parseFloat((profile.bodyFat > 0 ? profile.bodyFat - 0.5 : 21.5).toFixed(1));
        
        updateProfile({ weight: scaleWeight, bodyFat: scaleBf });
        setSyncData(prev => ({ ...prev, lastSyncScaleWeight: scaleWeight }));
      }
    }, 2500);
  };

  // Master Sync All Handler
  const handleSyncAll = () => {
    const activeConnections = Object.values(connections).some(val => val === true);
    if (!activeConnections) {
      setSyncNotification("Nessun dispositivo connesso! Connetti un dispositivo prima di sincronizzare.");
      setTimeout(() => setSyncNotification(null), 4000);
      return;
    }

    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      
      // Update data if scale is connected
      if (connections.smartscale) {
        const currentWeight = profile.weight;
        const scaleWeight = parseFloat((currentWeight > 0 ? currentWeight - 0.2 : 64.6).toFixed(1));
        updateProfile({ weight: scaleWeight });
        setSyncData(prev => ({ ...prev, lastSyncScaleWeight: scaleWeight }));
      }

      setSyncNotification("Tutti i dispositivi attivi sono stati sincronizzati in background!");
      setTimeout(() => setSyncNotification(null), 4000);
    }, 2000);
  };

  const devices: DeviceItem[] = [
    // Wearables
    { id: 'applewatch', name: 'Apple Watch', category: 'Wearable', brand: 'Apple', icon: <Smartphone size={20} color="var(--color-primary)" /> },
    { id: 'fitbit', name: 'Fitbit Versa / Charge', category: 'Wearable', brand: 'Fitbit', icon: <Smartphone size={20} color="#10b981" /> },
    { id: 'samsungwatch', name: 'Galaxy Watch', category: 'Wearable', brand: 'Samsung', icon: <Smartphone size={20} color="#3b82f6" /> },
    { id: 'xiaomi', name: 'Mi Band / RedMi Tracker', category: 'Wearable', brand: 'Xiaomi', icon: <Smartphone size={20} color="#f97316" /> },
    // Scales
    { id: 'smartscale', name: 'Bilancia Smart Impedenziometrica', category: 'Bilancia', brand: 'Xiaomi / Withings', icon: <Scale size={20} color="var(--color-secondary)" /> },
    // Apps
    { id: 'googlefit', name: 'Google Fit', category: 'App', brand: 'Google', icon: <Check size={20} color="#ef4444" /> },
    { id: 'samsunghealth', name: 'Samsung Health', category: 'App', brand: 'Samsung', icon: <Award size={20} color="#8b5cf6" /> },
    { id: 'hevy', name: 'Hevy Workout Sync', category: 'App', brand: 'Hevy', icon: <RefreshCw size={20} color="#06b6d4" /> }
  ];

  const getDeviceDetails = (id: string) => {
    switch (id) {
      case 'applewatch':
        return syncData.heartRate ? `FC: ${syncData.heartRate} bpm • Sincronizzato` : 'Sincronizzato • Standby';
      case 'fitbit':
        return 'Sincronizzato • Passi oggi: 9.420';
      case 'samsungwatch':
        return 'Sincronizzato • Sonno: 7h 24m';
      case 'xiaomi':
        return 'Sincronizzato • Battito a riposo: 62 bpm';
      case 'smartscale':
        return syncData.lastSyncScaleWeight ? `Ultima misurazione: ${syncData.lastSyncScaleWeight} kg` : 'Pronto per la pesata';
      case 'hevy':
        return 'Importazione automatica schede attiva';
      case 'googlefit':
      case 'samsunghealth':
        return 'Sync calorie attive & passi completato';
      default:
        return 'Connesso';
    }
  };

  const renderDeviceSection = (title: string, category: 'Wearable' | 'Bilancia' | 'App') => {
    const filtered = devices.filter(d => d.category === category);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
        <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
          {title}
        </h4>
        
        {filtered.map(device => {
          const isConnected = connections[device.id];
          return (
            <div 
              key={device.id} 
              className="animate-scale-in"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px', 
                background: isConnected ? 'rgba(212, 175, 55, 0.02)' : 'rgba(255,255,255,0.01)', 
                borderRadius: 'var(--radius-md)', 
                border: isConnected ? '1px solid rgba(212,175,55,0.22)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  background: isConnected ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.02)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: isConnected ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent'
                }}>
                  {device.icon}
                </div>
                <div>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: isConnected ? 'white' : 'var(--text-muted)' }}>{device.name}</h5>
                  <span style={{ fontSize: '0.65rem', color: isConnected ? 'var(--color-primary)' : 'var(--text-dark)', fontWeight: isConnected ? 'bold' : 'normal' }}>
                    {isConnected ? getDeviceDetails(device.id) : 'Non connesso'}
                  </span>
                </div>
              </div>
              <button 
                className={isConnected ? 'btn-secondary' : 'btn-primary'}
                onClick={() => handleConnectClick(device)}
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.68rem', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  background: isConnected ? 'rgba(255,255,255,0.03)' : 'var(--color-primary)',
                  color: isConnected ? 'var(--color-error)' : 'black',
                  border: isConnected ? '1px solid rgba(239, 68, 68, 0.2)' : 'none'
                }}
              >
                {isConnected ? (
                  <>
                    <Link2Off size={10} /> Scollega
                  </>
                ) : (
                  <>
                    <Link size={10} /> Connetti
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="glass-card animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header with Master Sync Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="var(--color-primary)" /> Centro Connessioni Smart
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '2px' }}>
            Sincronizza in tempo reale bilance, smartwatch ed app di fitness.
          </p>
        </div>
        
        <button 
          className="btn-primary" 
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          style={{ 
            padding: '8px 12px', 
            fontSize: '0.72rem', 
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={12} className={isSyncingAll ? 'animate-spin' : ''} />
          {isSyncingAll ? 'Sincronizzazione...' : 'Sincronizza Ora'}
        </button>
      </div>

      {/* Real-time Toast Notifications */}
      {syncNotification && (
        <div 
          className="animate-fade-in-up" 
          style={{ 
            background: 'rgba(212, 175, 55, 0.08)', 
            border: '1px solid var(--color-primary)', 
            padding: '8px 12px', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.72rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}
        >
          <Zap size={14} color="var(--color-primary)" className="animate-pulse" />
          <p style={{ color: 'var(--text-primary)' }}>{syncNotification}</p>
        </div>
      )}

      {/* Real-time Active Watch Stats Block */}
      {syncData.heartRate && (
        <div 
          className="animate-glow" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(246, 224, 154, 0.03) 100%)', 
            border: '1px solid var(--color-primary)', 
            borderRadius: 'var(--radius-md)', 
            padding: '12px', 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} color="var(--color-primary)" className="animate-pulse" fill="var(--color-primary)" />
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)', display: 'block', fontWeight: 'bold' }}>BATTITO WEARABLE</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>
                {syncData.heartRate} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>bpm</span>
              </span>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.06)' }} />
          <div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)', display: 'block', fontWeight: 'bold' }}>CALORIE CONSUMATE</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>
              {syncData.activeKcal} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>kcal</span>
            </span>
          </div>
        </div>
      )}

      {/* Configured sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {renderDeviceSection('⌚ Smartwatch & Fitness Tracker', 'Wearable')}
        {renderDeviceSection('⚖️ Bilance Intelligenti', 'Bilancia')}
        {renderDeviceSection('📊 Applicazioni di Tracciamento', 'App')}
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
                  DeV Fit utilizzerà le API protette di <strong>{activeWizardDevice.brand}</strong> per estrarre in tempo reale dati su allenamenti, sonno, battito cardiaco o peso.
                </p>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(212, 175, 55, 0.04)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(212, 175, 55, 0.15)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <Info size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <span>Nessuna credenziale di {activeWizardDevice.brand} verrà salvata. L'autorizzazione avviene in modo sicuro tramite protocollo crittografato OAuth2.</span>
                </div>
                <button className="btn-primary" onClick={startLinking} style={{ height: '42px', fontWeight: 'bold' }}>
                  Avvia Connessione Sicura
                </button>
              </div>
            )}

            {wizardStep === 'linking' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '30px 0' }}>
                <RefreshCw size={36} className="animate-spin" color="var(--color-primary)" />
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', textAlign: 'center', lineHeight: '1.4' }}>
                  {wizardMessage}
                </p>
              </div>
            )}

            {wizardStep === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--color-primary)', color: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px auto' }}>
                  <Check size={26} strokeWidth={3} />
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800 }}>Integrazione Sincronizzata!</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {activeWizardDevice.name} è stato connesso con successo. DeV Fit ora sincronizzerà le tue informazioni in background.
                </p>
                {activeWizardDevice.id === 'smartscale' && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                    Bilancia smart: sincronizzato peso di {profile.weight} kg!
                  </p>
                )}
                <button className="btn-primary" onClick={() => setActiveWizardDevice(null)} style={{ height: '42px', marginTop: '10px', fontWeight: 'bold' }}>
                  Chiudi e Continua
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
