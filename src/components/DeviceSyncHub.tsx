import React, { useState, useEffect } from 'react';
import { Bluetooth, Smartphone, ShieldCheck, Heart, Scale, Moon, Download, Upload, Check, AlertCircle } from 'lucide-react';

export const DeviceSyncHub: React.FC = () => {
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
    </div>
  );
};
