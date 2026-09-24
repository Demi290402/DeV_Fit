import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Share2, Sparkles, Award, Dumbbell, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface StoryCardData {
  workoutName: string;
  duration: string;
  totalVolume: number;
  totalSets: number;
  exercisesCount: number;
  recordsCount?: number;
  date: string;
}

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StoryCardData | null;
}

export const StoryCardModal: React.FC<StoryCardModalProps> = ({ isOpen, onClose, data }) => {
  const { profile } = useApp();
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !data) return null;

  const handleDownload = () => {
    // Generate high resolution canvas representation
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient (Obsidian luxury)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0c0c0f');
    bgGradient.addColorStop(0.4, '#050506');
    bgGradient.addColorStop(1, '#1a1408');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial glow
    const radial = ctx.createRadialGradient(width / 2, 600, 50, width / 2, 600, 700);
    radial.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Outer Gold Border Frame
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, width - 110, height - 110);

    // Brand Header
    ctx.fillStyle = '#d4af37';
    ctx.font = '900 68px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DeV FIT', width / 2, 220);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '600 28px "Inter", "Segoe UI", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('POWER & LUXURY TRACKER', width / 2, 275);

    // Divider
    const divGrad = ctx.createLinearGradient(200, 0, width - 200, 0);
    divGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
    divGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.8)');
    divGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200, 320);
    ctx.lineTo(width - 200, 320);
    ctx.stroke();

    // User greeting & date
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 42px "Inter", sans-serif';
    ctx.fillText(profile.name.toUpperCase(), width / 2, 420);

    ctx.fillStyle = '#71717a';
    ctx.font = '500 28px "Inter", sans-serif';
    ctx.fillText(data.date, width / 2, 470);

    // Workout Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 64px "Inter", sans-serif';
    ctx.fillText(data.workoutName, width / 2, 600);

    // Main Stat: Total Tonnage Sollevato
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '700 32px "Inter", sans-serif';
    ctx.fillText('VOLUME TOTALE SPOSTATO', width / 2, 780);

    ctx.fillStyle = '#d4af37';
    ctx.font = '900 130px "Inter", sans-serif';
    ctx.fillText(`${data.totalVolume.toLocaleString('it-IT')} kg`, width / 2, 910);

    // Secondary Stats Grid Box (Duration, Sets, Exercises)
    const boxY = 1060;
    const boxH = 340;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, boxY, width - 200, boxH, 24);
    ctx.fill();
    ctx.stroke();

    // 3 Columns inside box
    const colW = (width - 200) / 3;
    
    // Duration
    ctx.fillStyle = '#71717a';
    ctx.font = '600 26px "Inter", sans-serif';
    ctx.fillText('DURATA', 100 + colW * 0.5, boxY + 110);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px "Inter", sans-serif';
    ctx.fillText(data.duration, 100 + colW * 0.5, boxY + 185);

    // Sets
    ctx.fillStyle = '#71717a';
    ctx.font = '600 26px "Inter", sans-serif';
    ctx.fillText('SERIE TOTALI', 100 + colW * 1.5, boxY + 110);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px "Inter", sans-serif';
    ctx.fillText(`${data.totalSets}`, 100 + colW * 1.5, boxY + 185);

    // Exercises
    ctx.fillStyle = '#71717a';
    ctx.font = '600 26px "Inter", sans-serif';
    ctx.fillText('ESERCIZI', 100 + colW * 2.5, boxY + 110);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px "Inter", sans-serif';
    ctx.fillText(`${data.exercisesCount}`, 100 + colW * 2.5, boxY + 185);

    // Badges / Personal Records if any
    if (data.recordsCount && data.recordsCount > 0) {
      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(140, 1460, width - 280, 100, 50);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.font = '800 36px "Inter", sans-serif';
      ctx.fillText(`⭐ ${data.recordsCount} NUOVI RECORD PERSONALI INFRANTI`, width / 2, 1524);
    }

    // Motivational Motto / Footer
    ctx.fillStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.font = '700 28px "Inter", sans-serif';
    ctx.fillText('ALLENATI PER L\'ECCELLENZA • DEV FIT', width / 2, 1760);

    // Download PNG trigger
    const link = document.createElement('a');
    link.download = `DeV-Fit-Story-${data.date.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Workout completato: ${data.workoutName}`,
          text: `Ho completato ${data.workoutName} con DeV Fit! Ho sollevato ${data.totalVolume} kg in ${data.duration}. 🔥`,
          url: window.location.origin
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleDownload();
    }
  };

  return createPortal(
    <div className="drawer-backdrop" onClick={onClose}>
      <div 
        className="drawer-content animate-scale-in"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 10px 45px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.2)'
        }}
      >
        {/* Modal Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'white' }}>
              Condividi Story di Lusso
            </h3>
          </div>
          <button 
            type="button" 
            className="drawer-close"
            onClick={onClose} 
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">

        {/* 9:16 Story Card Visual Preview */}
        <div 
          ref={cardRef}
          style={{
            width: '100%',
            aspectRatio: '9 / 16',
            maxHeight: '520px',
            margin: '0 auto',
            background: 'linear-gradient(145deg, #0c0c0f 0%, #050506 50%, #1a1408 100%)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(212,175,55,0.08)',
            padding: '24px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle gold watermark emblem */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '14rem',
            color: 'rgba(212, 175, 55, 0.025)',
            fontWeight: 900,
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            DF
          </div>

          {/* Top Brand Banner */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: 900, 
              color: 'var(--color-primary)', 
              letterSpacing: '2px', 
              display: 'block' 
            }}>
              DeV FIT
            </span>
            <span style={{ fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Power & Luxury Tracker
            </span>
            <div style={{ width: '40px', height: '2px', background: 'var(--color-primary)', margin: '8px auto 0 auto', opacity: 0.7 }} />
          </div>

          {/* User & Workout Info */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid var(--color-primary)'
              }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{profile.name}</span>
            </div>

            <span style={{ fontSize: '0.68rem', color: 'var(--text-dark)' }}>{data.date}</span>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-secondary)', margin: '4px 0 0 0' }}>
              {data.workoutName}
            </h2>
          </div>

          {/* Hero Volume Sollevato */}
          <div style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            width: '100%'
          }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Volume Totale Spostato
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1.1, marginTop: '2px' }}>
              {data.totalVolume.toLocaleString('it-IT')} <span style={{ fontSize: '1rem', fontWeight: 700 }}>kg</span>
            </div>
          </div>

          {/* Stats 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
              <Clock size={14} color="var(--color-primary)" style={{ margin: '0 auto 2px' }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)', display: 'block' }}>Durata</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{data.duration}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
              <Dumbbell size={14} color="var(--color-primary)" style={{ margin: '0 auto 2px' }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)', display: 'block' }}>Serie</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{data.totalSets}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
              <Award size={14} color="var(--color-primary)" style={{ margin: '0 auto 2px' }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)', display: 'block' }}>Esercizi</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{data.exercisesCount}</span>
            </div>
          </div>

          {/* PR badge if present */}
          {data.recordsCount && data.recordsCount > 0 ? (
            <div style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Award size={13} color="var(--color-primary)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {data.recordsCount} Nuovi Record Personali!
              </span>
            </div>
          ) : null}

          {/* Footer Branding */}
          <div style={{ fontSize: '0.62rem', color: 'var(--color-primary)', letterSpacing: '1px', opacity: 0.8 }}>
            ALLENATI PER L'ECCELLENZA • DEV FIT
          </div>
        </div>
        </div>

        {/* Action Buttons Sticky Footer */}
        <div className="drawer-footer" style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={16} /> Salva Immagine HD
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleShare}
            style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Share2 size={16} /> Condividi
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
