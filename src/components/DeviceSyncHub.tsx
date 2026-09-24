import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bluetooth, Smartphone, ShieldCheck, Heart, Scale, Moon, Download, Upload, Check, AlertCircle, Cloud, RefreshCw, Settings, Database, Key, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DeviceSyncHub: React.FC = () => {
  const {
    user,
    isSupabaseConfigured,
    supabaseUrl,
    supabaseAnonKey,
    saveSupabaseConfig,
    syncAllDataToCloud
  } = useApp();

  // Cloud Sync state
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncFeedback, setCloudSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseAnonKey);
  const [configFeedback, setConfigFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Web Bluetooth state
  const [isBleSupported, setIsBleSupported] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(() => localStorage.getItem('df_ble_device_name'));
  const [bleHeartRate, setBleHeartRate] = useState<number | null>(null);
  const [isConnectingBle, setIsConnectingBle] = useState(false);
  const [bleError, setBleError] = useState<string | null>(null);

  // Backup & Restore state
  const [backupSuccessMsg, setBackupSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsBleSupported('bluetooth' in navigator);
  }, []);

  // Connect to standard Bluetooth SIG Heart Rate Service (0x180D)
  const handleConnectBle = async () => {
    setBleError(null);
    if (!('bluetooth' in navigator)) {
      setBleError('Web Bluetooth non supportato su questo browser (usa Chrome o Edge su Android/PC).');
      return;
    }

    try {
      setIsConnectingBle(true);
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      if (!device || !device.gatt) throw new Error('Nessun dispositivo selezionato');

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let hr = 0;
        if (flags & 0x01) {
          hr = value.getUint16(1, true); // 16-bit HR
        } else {
          hr = value.getUint8(1); // 8-bit HR
        }
        setBleHeartRate(hr);
      });

      const name = device.name || 'Dispositivo Cardio BLE';
      setBleDeviceName(name);
      localStorage.setItem('df_ble_device_name', name);
      setIsConnectingBle(false);
    } catch (err: any) {
      console.warn('Bluetooth connection error:', err);
      setIsConnectingBle(false);
      if (err.name !== 'NotFoundError') {
        setBleError(err.message || 'Impossibile connettersi al dispositivo Bluetooth.');
      }
    }
  };

  const handleDisconnectBle = () => {
    setBleDeviceName(null);
    setBleHeartRate(null);
    localStorage.removeItem('df_ble_device_name');
  };

  // Export full local data backup (for the user and Valeria)
  const handleExportBackup = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('df_')) {
        backupData[key] = localStorage.getItem(key);
      }
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DeV-Fit-Backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupSuccessMsg('Backup scaricato con successo sul tuo dispositivo!');
    setTimeout(() => setBackupSuccessMsg(null), 4000);
  };

  // Import local data backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, val]) => {
            if (key.startsWith('df_') && typeof val === 'string') {
              localStorage.setItem(key, val);
            }
          });
          window.dispatchEvent(new Event('df_data_updated'));
          setBackupSuccessMsg('Dati importati e ripristinati con successo! Ricarico l\'app...');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch {
        alert('File di backup non valido.');
      }
    };
    reader.readAsText(file);
  };

  const handleCloudSync = async () => {
    setCloudSyncFeedback(null);
    setIsCloudSyncing(true);
    try {
      const res = await syncAllDataToCloud();
      setCloudSyncFeedback(res);
      setTimeout(() => setCloudSyncFeedback(null), 5000);
    } catch (err: any) {
      setCloudSyncFeedback({ success: false, message: err.message || 'Errore durante la sincronizzazione.' });
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveSupabaseConfig(inputUrl, inputKey);
    setConfigFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setShowConfigModal(false);
        setConfigFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="glass-card animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={20} color="var(--color-primary)" /> Centro Dispositivi & Sincronizzazione Dati
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: '3px' }}>
          Gestione autentica al 100% dei dati biometrici e dei sensori fisici (Zero dati finti o simulazioni).
        </p>
      </div>

      {/* Honest Technical Notice */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 10, 12, 0.95) 100%)',
        borderLeft: '4px solid var(--color-primary)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} /> Come funziona il tracciamento in DeV Fit (100% Gratuito & Privato)
        </span>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
          Per garantire la massima privacy e mantenere l'app a <strong>costo zero (0 €)</strong> senza richiedere account a pagamento su Apple o Google Store, DeV Fit funziona come Web App (PWA).
          I browser web non hanno il permesso di accedere al database medico criptato di Apple Salute o Samsung Health.
          Per questo motivo, <strong>abbiamo eliminato qualsiasi finta sincronizzazione automatica</strong>: ogni dato registrato riflette unicamente la realtà.
        </p>
      </div>

      {/* 1. Web Bluetooth Real Heart Rate Sensor */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bluetooth size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'white' }}>
                Sensore Cardio Bluetooth (BLE) Reale
              </h4>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dark)', display: 'block' }}>
                Fasce Polar H10, Garmin HRM, o smartwatch in modalità trasmissione BLE (Standard 0x180D)
              </span>
              <span style={{ fontSize: '0.65rem', color: isBleSupported ? '#10b981' : '#f59e0b', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                {isBleSupported ? '● Web Bluetooth Disponibile' : '⚠️ Non disponibile su iOS Safari (Usa Chrome/Edge su Android/PC)'}
              </span>
            </div>
          </div>

          {bleDeviceName ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDisconnectBle}
              style={{ fontSize: '0.7rem', padding: '6px 12px', color: 'var(--color-error)' }}
            >
              Disconnetti
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleConnectBle}
              disabled={isConnectingBle}
              style={{ fontSize: '0.72rem', padding: '6px 12px' }}
            >
              {isConnectingBle ? 'Ricerca...' : 'Collega Sensore'}
            </button>
          )}
        </div>

        {bleDeviceName && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 800, textTransform: 'uppercase' }}>
                ● Collegato in Tempo Reale
              </span>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '2px 0 0 0' }}>{bleDeviceName}</h5>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={16} color="#ef4444" fill="#ef4444" className="animate-pulse" />
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>
                {bleHeartRate ? `${bleHeartRate} BPM` : 'In attesa segnale...'}
              </span>
            </div>
          </div>
        )}

        {bleError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--color-error)' }}>
            <AlertCircle size={14} />
            <span>{bleError}</span>
          </div>
        )}
      </div>

      {/* 2. Direct 1-Tap Dashboard Logging Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={16} /> Metriche di Salute Dirette (Disponibili nella Home)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '4px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <Scale size={16} color="var(--color-primary)" style={{ margin: '0 auto 4px' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Peso & BMI</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dark)' }}>Inseribile in 2 sec dalla bilancia</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <Moon size={16} color="#8b5cf6" style={{ margin: '0 auto 4px' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Ore di Sonno</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dark)' }}>Da orologio (Galaxy/Apple)</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <Heart size={16} color="#ef4444" style={{ margin: '0 auto 4px' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block' }}>Battiti a Riposo</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dark)' }}>RHR reale del mattino</span>
          </div>
        </div>
      </div>

      {/* 2.5 Cloud Sync Card (Supabase) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(10, 10, 14, 0.95) 100%)',
        border: `1px solid ${isSupabaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cloud size={20} color={isSupabaseConfigured ? '#34d399' : '#fbbf24'} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'white' }}>
                Sincronizzazione Cloud Supabase
              </h4>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '4px', margin: 0 }}>
              {isSupabaseConfigured 
                ? `Connesso a ${supabaseUrl.replace('https://', '').split('.')[0]}. Dati sincronizzati nel tuo PostgreSQL.`
                : 'Supabase non è ancora connesso. Configura URL e Anon Key per salvare i dati sul cloud gratuito.'}
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowConfigModal(true)}
            style={{ fontSize: '0.7rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Settings size={13} /> {isSupabaseConfigured ? 'Modifica Chiavi' : 'Configura Chiavi'}
          </button>
        </div>

        {/* User Badge if logged in */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span>Account attivo: <strong style={{ color: 'var(--color-primary)' }}>{user.name}</strong> ({user.email})</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.08)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.72rem', color: '#fbbf24' }}>
            <AlertCircle size={14} />
            <span>Nessun account autenticato al momento. Accedi dal profilo per salvare su cloud.</span>
          </div>
        )}

        {/* Feedback message */}
        {cloudSyncFeedback && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: cloudSyncFeedback.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${cloudSyncFeedback.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: cloudSyncFeedback.success ? 'var(--color-success)' : 'var(--color-error)'
          }}>
            {cloudSyncFeedback.success ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{cloudSyncFeedback.message}</span>
          </div>
        )}

        {/* Sync Trigger Button */}
        {user && isSupabaseConfigured && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleCloudSync}
            disabled={isCloudSyncing}
            style={{
              height: '42px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={15} className={isCloudSyncing ? 'animate-spin' : ''} />
            {isCloudSyncing ? 'Sincronizzazione in corso...' : 'Sincronizza Tutti i Dati sul Cloud Supabase'}
          </button>
        )}
      </div>

      {/* 3. Local Backup & Restore (Zero Server Dependency) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', margin: 0 }}>
            Salvataggio & Sincronizzazione Locale (Backup Personale)
          </h4>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '2px' }}>
            Salva tutti i dati tuoi o di Valeria (schede, allenamenti, pasti, foto) su un file sicuro sul telefono o ripristinali su un altro dispositivo.
          </p>
        </div>

        {backupSuccessMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {backupSuccessMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportBackup}
            style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem' }}
          >
            <Download size={15} /> Esporta Dati (JSON)
          </button>
          <label
            className="btn-secondary"
            style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
          >
            <Upload size={15} /> Importa Backup
            <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Supabase In-App Configuration Modal */}
      {showConfigModal && createPortal(
        <div 
          className="drawer-backdrop" 
          onClick={() => setShowConfigModal(false)}
        >
          <div 
            className="drawer-content animate-scale-in" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '440px', background: '#111116' }}
          >
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Configura Supabase Cloud</h3>
              </div>
              <button 
                type="button" 
                className="drawer-close"
                onClick={() => setShowConfigModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Dove trovare le chiavi:</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  Nel tuo progetto Supabase, clicca sul pulsante in alto <strong>-o- Connect</strong> oppure in <strong>Project Settings &rarr; API</strong>.
                </p>
              </div>

              <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Project URL
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Database size={15} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="url"
                      required
                      placeholder="https://xyzxyzxyz.supabase.co"
                      value={inputUrl}
                      onChange={e => setInputUrl(e.target.value)}
                      className="set-input"
                      style={{ width: '100%', paddingLeft: '36px', textAlign: 'left', height: '40px', fontSize: '0.78rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Anon Public Key
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={15} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={inputKey}
                      onChange={e => setInputKey(e.target.value)}
                      className="set-input"
                      style={{ width: '100%', paddingLeft: '36px', textAlign: 'left', height: '40px', fontSize: '0.78rem' }}
                    />
                  </div>
                </div>

                {configFeedback && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: configFeedback.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${configFeedback.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: configFeedback.success ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {configFeedback.success ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{configFeedback.message}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowConfigModal(false)}
                    style={{ flex: 1, height: '40px', fontSize: '0.78rem' }}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1, height: '40px', fontSize: '0.78rem' }}
                  >
                    Salva & Connetti
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
