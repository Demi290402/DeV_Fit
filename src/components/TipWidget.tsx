import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { fitTips } from '../data/fitTips';

export const TipWidget: React.FC = () => {
  const [currentTip, setCurrentTip] = useState(fitTips[0]);

  const rotateTip = () => {
    const currentIndex = fitTips.findIndex(t => t.id === currentTip.id);
    let nextIndex = Math.floor(Math.random() * fitTips.length);
    while (nextIndex === currentIndex && fitTips.length > 1) {
      nextIndex = Math.floor(Math.random() * fitTips.length);
    }
    setCurrentTip(fitTips[nextIndex]);
  };

  useEffect(() => {
    // Initial random tip
    const rand = Math.floor(Math.random() * fitTips.length);
    setCurrentTip(fitTips[rand]);
  }, []);

  return (
    <div className="glass-card tip-widget animate-scale-in">
      <div className="flex-between" style={{ marginBottom: '10px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
          <Sparkles size={14} />
          CONSIGLIO DEL GIORNO • {currentTip.category.toUpperCase()}
        </span>
        <button 
          onClick={rotateTip} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Mostra un altro consiglio"
        >
          <RefreshCw size={12} />
        </button>
      </div>
      <p className="tip-content">"{currentTip.text}"</p>
      <span className="tip-author">{currentTip.author}</span>
    </div>
  );
};
