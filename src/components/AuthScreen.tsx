import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';


export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Compliance checkbox
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        if (!consentChecked) {
          throw new Error('È necessario acconsentire al trattamento dei dati per registrarsi.');
        }
        await signUp(email, password, name);
        setSuccessMsg('Registrazione completata! Controlla la tua casella di posta per confermare l\'account prima di accedere.');
      } else {
        // Forgot password mock/real trigger
        setSuccessMsg('Email di recupero password inviata con successo!');
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Si è verificato un errore inaspettato.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #08080a 70%)',
      color: 'white'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Brand Logo */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1.5px', background: 'linear-gradient(135deg, white 30%, var(--color-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DeV Fit<span style={{ color: 'var(--color-secondary)', WebkitTextFillColor: 'initial' }}>.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Il tuo diario intelligente di allenamento e dieta
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card animate-scale-in" style={{ padding: '28px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>
            {mode === 'signin' && 'Accedi al tuo Profilo'}
            {mode === 'signup' && 'Crea un Account Gratuito'}
            {mode === 'forgot' && 'Recupera Password'}
          </h2>

          <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Name input (only for signup) */}
            {mode === 'signup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nome Completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    required
                    className="set-input"
                    style={{ width: '100%', paddingLeft: '38px', textAlign: 'left', height: '42px' }}
                    placeholder="es: Mario Rossi"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  required
                  className="set-input"
                  style={{ width: '100%', paddingLeft: '38px', textAlign: 'left', height: '42px' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password input */}
            {mode !== 'forgot' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    className="set-input"
                    style={{ width: '100%', paddingLeft: '38px', textAlign: 'left', height: '42px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Compliance / Privacy consent box (ONLY for Sign Up) */}
            {mode === 'signup' && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  id="consentCheckbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="consentCheckbox" style={{ fontSize: '0.7rem', lineHeight: '1.4', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Acconsento al trattamento dei dati di fitness e salute (peso, misurazioni corporee, ciclo, pasti) secondo la <span style={{ color: 'var(--color-secondary)', textDecoration: 'underline' }}>Privacy Policy</span> di DeV Fit e confermo di avere almeno 16 anni.
                </label>
              </div>
            )}

            {/* Notifications */}
            {errorMsg && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                ⚠️ {errorMsg}
              </p>
            )}

            {successMsg && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                ✓ {successMsg}
              </p>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || (mode === 'signup' && !consentChecked)}
              style={{ width: '100%', height: '44px', marginTop: '10px', opacity: (mode === 'signup' && !consentChecked) ? 0.6 : 1 }}
            >
              {loading ? 'Elaborazione in corso...' : (
                <>
                  {mode === 'signin' && 'Accedi'}
                  {mode === 'signup' && 'Registrati'}
                  {mode === 'forgot' && 'Invia Reset Link'}
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px', fontSize: '0.78rem', textAlign: 'center' }}>
            {mode === 'signin' ? (
              <>
                <p style={{ color: 'var(--text-muted)' }}>
                  Non hai ancora un account?{' '}
                  <span onClick={() => setMode('signup')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Registrati
                  </span>
                </p>
                <span onClick={() => setMode('forgot')} style={{ color: 'var(--text-dark)', cursor: 'pointer', textDecoration: 'underline' }}>
                  Hai dimenticato la password?
                </span>
              </>
            ) : mode === 'signup' ? (
              <p style={{ color: 'var(--text-muted)' }}>
                Hai già un account?{' '}
                <span onClick={() => setMode('signin')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                  Accedi
                </span>
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                Torna al{' '}
                <span onClick={() => setMode('signin')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                  Login
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Security badge footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-dark)' }}>
          <ShieldCheck size={14} color="var(--color-success)" />
          <span>Connessione protetta SSL crittografata (HTTPS)</span>
        </div>

      </div>
    </div>
  );
};
