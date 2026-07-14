import React, { useState } from 'react';
import { Heart, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';


export const CycleTracker: React.FC = () => {
  const { cycleData, updateCycleData } = useApp();
  const [editing, setEditing] = useState(false);
  const [periodStart, setPeriodStart] = useState(cycleData.lastPeriodStart);
  const [cycleLen, setCycleLen] = useState(cycleData.cycleLength.toString());
  const [periodLen, setPeriodLen] = useState(cycleData.periodLength.toString());

  // Date variables for calendar
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Helper calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Sunday=0, Monday=1, ...
  // Adjust first day to start with Monday (Monday=0, Sunday=6)
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Determine cycle status for a specific day in the grid
  const getDayStatus = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const startDate = new Date(cycleData.lastPeriodStart);
    
    // Total days difference
    const diffTime = checkDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'normal';

    const dayOfCycle = diffDays % cycleData.cycleLength;

    if (dayOfCycle >= 0 && dayOfCycle < cycleData.periodLength) {
      return 'menstruation';
    }
    // Ovulation occurs roughly 14 days before next period (e.g. Day 13-15 in a 28 day cycle)
    const ovulationDay = cycleData.cycleLength - 14;
    if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) {
      return 'ovulation';
    }
    return 'normal';
  };

  // Calculate current phase today
  const getTodayCyclePhase = () => {
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const startDate = new Date(cycleData.lastPeriodStart);
    startDate.setHours(0,0,0,0);

    const diffDays = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        name: 'Fase Follicolare',
        day: 1,
        advice: 'Nessun dato registrato o data futura selezionata. Sincronizza l\'inizio del ciclo per visualizzare i consigli.',
        color: 'var(--color-secondary)'
      };
    }

    const dayOfCycle = (diffDays % cycleData.cycleLength) + 1; // 1-indexed

    if (dayOfCycle <= cycleData.periodLength) {
      return {
        name: 'Fase Mestruale',
        day: dayOfCycle,
        advice: 'Energia al minimo. Fai allenamenti a bassa intensità, come yoga, stretching o camminate. Privilegia cibi caldi, ferro e idratazione.',
        color: 'var(--color-female)'
      };
    } else if (dayOfCycle <= 11) {
      return {
        name: 'Fase Follicolare',
        day: dayOfCycle,
        advice: 'Energia in forte aumento! Il momento migliore per allenamenti di forza intensi, sollevamento carichi e sessioni HIIT. Ottima tolleranza ai carboidrati.',
        color: 'var(--color-secondary)'
      };
    } else if (dayOfCycle <= 16) {
      return {
        name: 'Fase Ovulatoria',
        day: dayOfCycle,
        advice: 'Picco di forza ed energia! Puoi registrare i tuoi record personali (PR). Fai attenzione al riscaldamento poiché le articolazioni sono leggermente più vulnerabili.',
        color: '#10b981'
      };
    } else {
      return {
        name: 'Fase Luteale',
        day: dayOfCycle,
        advice: 'Energia in discesa. Ottimo per allenamenti cardio a ritmo costante (LISS) o circuiti leggeri. Possono comparire voglie di cibi dolci/sgarri: prediligi grassi sani e fibre.',
        color: '#f59e0b'
      };
    }
  };

  const currentPhase = getTodayCyclePhase();

  const handleSaveSettings = () => {
    const clen = parseInt(cycleLen);
    const plen = parseInt(periodLen);
    if (periodStart && !isNaN(clen) && !isNaN(plen)) {
      updateCycleData({
        lastPeriodStart: periodStart,
        cycleLength: clen,
        periodLength: plen
      });
      setEditing(false);
    }
  };

  // Render calendar grid days
  const renderCalendarDays = () => {
    const grid = [];
    // Blank days at the beginning of grid
    for (let i = 0; i < adjustedFirstDay; i++) {
      grid.push(<div key={`blank-${i}`} />);
    }
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDayStatus(day);
      let statusClass = '';
      if (status === 'menstruation') statusClass = 'cycle-menstruation';
      else if (status === 'ovulation') statusClass = 'cycle-ovulation';

      // Highlight today
      const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
      const borderStyle = isToday ? '2px solid white' : 'none';

      grid.push(
        <button 
          key={`day-${day}`} 
          className={`cycle-day-btn ${statusClass}`}
          style={{ border: borderStyle }}
        >
          {day}
        </button>
      );
    }
    return grid;
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header and edit button */}
      <div className="flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={22} color="var(--color-female)" fill="var(--color-female)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Salute Femminile</h2>
        </div>
        <button className="btn-secondary" onClick={() => setEditing(!editing)} style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
          {editing ? 'Annulla' : 'Impostazioni'}
        </button>
      </div>

      {/* Settings Form */}
      {editing ? (
        <div className="glass-card animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Parametri del Ciclo</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inizio Ultimo Ciclo</label>
            <input 
              type="date" 
              className="set-input" 
              value={periodStart} 
              onChange={e => setPeriodStart(e.target.value)}
              style={{ width: '100%', height: '38px', padding: '8px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Durata Ciclo (gg)</label>
              <input 
                type="number" 
                className="set-input" 
                value={cycleLen} 
                onChange={e => setCycleLen(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Durata Mestruo (gg)</label>
              <input 
                type="number" 
                className="set-input" 
                value={periodLen} 
                onChange={e => setPeriodLen(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleSaveSettings} style={{ padding: '10px' }}>
            <Check size={16} /> Salva Configurazione
          </button>
        </div>
      ) : (
        /* Phase Summary Card */
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(236, 72, 153, 0.25)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="flex-between">
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stato Odierno</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: currentPhase.color }}>{currentPhase.name}</h3>
            </div>
            <div style={{ background: currentPhase.color, color: 'black', width: '38px', height: '38px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
              g. {currentPhase.day}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
            <Sparkles size={18} style={{ color: currentPhase.color, flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
              {currentPhase.advice}
            </p>
          </div>
        </div>
      )}

      {/* Calendar Card */}
      <div className="glass-card">
        {/* Month Selector */}
        <div className="flex-between" style={{ marginBottom: '14px' }}>
          <button className="icon-btn" style={{ width: '30px', height: '30px' }} onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{monthNames[currentMonth]} {currentYear}</h4>
          <button className="icon-btn" style={{ width: '30px', height: '30px' }} onClick={handleNextMonth}><ChevronRight size={16} /></button>
        </div>

        {/* Days of Week */}
        <div className="cycle-calendar-header">
          <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
        </div>

        {/* Days grid */}
        <div className="cycle-calendar-grid">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className="cycle-phase-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--color-female)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Mestruazioni</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--color-secondary)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ovulazione</span>
          </div>
        </div>
      </div>
    </div>
  );
};
