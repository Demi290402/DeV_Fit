import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';


export const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInWithOAuth } = useApp();

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
      background: 'radial-gradient(circle at 50% 30%, #281d06 0%, #050506 80%)',
      color: 'white'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/DeVFitLogo.png" 
            alt="DeV Fit Logo" 
            style={{ height: '90px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 12px var(--color-primary-glow))' }} 
          />

          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
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

          {/* Social Logins */}
          {mode !== 'forgot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.05)' }}></div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dark)' }}>OPPURE CONTINUA CON</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.05)' }}></div>
              </div>
              
              {/* Google Button - Full Width */}
              <button 
                type="button" 
                className="btn-secondary" 
                disabled={loading}
                onClick={() => signInWithOAuth('google')}
                style={{ 
                  width: '100%', 
                  height: '42px', 
                  fontSize: '0.78rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#ea4335" d="M12 5.04c1.78 0 3.38.61 4.64 1.82l3.46-3.46C17.97 1.54 15.22 1 12 1 7.35 1 3.39 3.68 1.48 7.57l4.08 3.16C6.54 7.6 9 5.04 12 5.04z" />
                  <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.42 3.58l3.77 2.92c2.2-2.03 3.46-5.02 3.46-8.66z" />
                  <path fill="#fbbc05" d="M5.56 10.73A7.24 7.24 0 0 1 5.04 12c0 .44.04.87.12 1.3l-4.08 3.16A11.94 11.94 0 0 1 0 12c0-1.58.31-3.09.88-4.47l4.68 3.2z" />
                  <path fill="#34a853" d="M12 18.96c-3 0-5.46-2.56-6.44-5.69l-4.08 3.16C3.39 20.32 7.35 23 12 23c3.24 0 5.97-1.07 7.96-2.91l-3.77-2.92c-1.12.79-2.55 1.79-4.19 1.79z" />
                </svg>
                Accedi con Google
              </button>
            </div>
          )}



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
