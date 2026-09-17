import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Check, Dumbbell, Activity, Filter, ChevronLeft } from 'lucide-react';
import { mockExercises, renderMuscleIcon, renderEquipmentIcon } from '../data/mockExercises';
import type { MuscleGroup, EquipmentType } from '../data/mockExercises';

interface ExerciseBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (id: string) => void;
  selectedIds?: string[];
  isMultiSelect?: boolean;
}

export const ExerciseBrowserModal: React.FC<ExerciseBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  selectedIds = [],
  isMultiSelect = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'All'>('All');
  
  // Sheet states
  const [showMuscleSheet, setShowMuscleSheet] = useState(false);
  const [showEquipmentSheet, setShowEquipmentSheet] = useState(false);

  if (!isOpen) return null;

  // Filter exercises
  const filteredExercises = mockExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const muscleGroups: (MuscleGroup | 'All')[] = [
    'All', 'Pettorali', 'Dorsali', 'Quadricipiti', 'Femorali', 'Glutei', 'Polpacci', 'Spalle', 
    'Bicipiti', 'Tricipiti', 'Addominali', 'Cardio', 
    'Adduttori', 'Abduttori', 'Avambracci'
  ];

  const equipments: (EquipmentType | 'All')[] = [
    'All', 'Bilanciere', 'Manubri', 'Macchina', 'Cavi', 
    'Niente', 'Fascia di resistenza', 'Fasce di sospensione', 'Kettlebell'
  ];

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        height: '100dvh',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.95)'
      }}
    >
      {/* 1. Modal Top Bar (Always visible at top, native Hevy style) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#121215',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'white' }}>
            Aggiungi esercizio
          </h3>
        </div>

        <button 
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 8px'
          }}
        >
          Annulla
        </button>
      </div>

      {/* 2. Pinned Search Bar & Filter Badges (NEVER cut off, ALWAYS pinned) */}
      <div 
        style={{
          padding: '12px 16px',
          background: '#0d0d10',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Cerca per nome esercizio..."
            className="set-input"
            style={{ 
              width: '100%', 
              paddingLeft: '38px', 
              paddingRight: searchQuery ? '36px' : '14px', 
              textAlign: 'left', 
              height: '42px',
              background: '#16161a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)'
            }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* The 2 Filter Buttons in Cima (Tutta l'attrezzatura & Tutti i muscoli) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Button 1: Equipment */}
          <button 
            type="button"
            className="btn-secondary" 
            onClick={() => setShowEquipmentSheet(true)}
            style={{ 
              flex: 1, 
              height: '38px', 
              padding: '0 10px', 
              fontSize: '0.76rem', 
              fontWeight: 700,
              background: selectedEquipment !== 'All' ? 'rgba(212, 175, 55, 0.15)' : '#16161a',
              borderColor: selectedEquipment !== 'All' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.08)',
              color: selectedEquipment !== 'All' ? 'var(--color-primary)' : 'white',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Filter size={13} color={selectedEquipment !== 'All' ? 'var(--color-primary)' : 'var(--text-muted)'} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedEquipment === 'All' ? "Tutta l'attrezzatura" : selectedEquipment}
            </span>
          </button>

          {/* Button 2: Muscle */}
          <button 
            type="button"
            className="btn-secondary" 
            onClick={() => setShowMuscleSheet(true)}
            style={{ 
              flex: 1, 
              height: '38px', 
              padding: '0 10px', 
              fontSize: '0.76rem', 
              fontWeight: 700,
              background: selectedMuscle !== 'All' ? 'rgba(212, 175, 55, 0.15)' : '#16161a',
              borderColor: selectedMuscle !== 'All' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.08)',
              color: selectedMuscle !== 'All' ? 'var(--color-primary)' : 'white',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Activity size={13} color={selectedMuscle !== 'All' ? 'var(--color-primary)' : 'var(--text-muted)'} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedMuscle === 'All' ? 'Tutti i muscoli' : selectedMuscle}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Exercises List (Smoothly scrollable, bottom padded) */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          padding: '14px 16px 40px 16px' 
        }}
      >
        {filteredExercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Nessun esercizio corrisponde ai filtri selezionati.
          </div>
        ) : (
          filteredExercises.map(ex => {
            const isSelected = selectedIds.includes(ex.id);
            return (
              <div 
                key={ex.id}
                onClick={() => onSelectExercise(ex.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#131317',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                className="exercise-item-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Circle diagram showing muscle highlight */}
                  <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                    {renderMuscleIcon(ex.muscleGroup)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', margin: 0 }}>{ex.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {ex.muscleGroup} • {ex.equipment}
                    </span>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isMultiSelect ? (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: isSelected ? 'var(--color-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#050506'
                  }}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={15} color={isSelected ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.15)'} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* BOTTOM SHEET 1: Muscle Group Selector */}
      {showMuscleSheet && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100000, 
            background: 'rgba(0, 0, 0, 0.8)', 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center' 
          }} 
          onClick={() => setShowMuscleSheet(false)}
        >
          <div 
            className="drawer-content animate-fade-in-up" 
            onClick={e => e.stopPropagation()}
            style={{ 
              maxHeight: '75vh', 
              paddingBottom: '30px', 
              background: '#121216', 
              borderTop: '1px solid rgba(255,255,255,0.1)' 
            }}
          >
            <div className="drawer-header" style={{ marginBottom: '16px' }}>
              <h3 className="section-title" style={{ margin: 0, fontSize: '1.05rem' }}>Gruppo muscolare</h3>
              <button className="drawer-close" onClick={() => setShowMuscleSheet(false)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {muscleGroups.map(muscle => {
                const isCurSelected = selectedMuscle === muscle;
                return (
                  <div 
                    key={muscle}
                    onClick={() => {
                      setSelectedMuscle(muscle);
                      setShowMuscleSheet(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: isCurSelected ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: isCurSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px' }}>
                        {muscle === 'All' ? <Dumbbell size={20} color="var(--text-muted)" style={{ margin: '6px' }} /> : renderMuscleIcon(muscle)}
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: isCurSelected ? 800 : 600, color: isCurSelected ? 'var(--color-primary)' : 'white' }}>
                        {muscle === 'All' ? 'Tutti i muscoli' : muscle}
                      </span>
                    </div>
                    {isCurSelected && <Check size={18} color="var(--color-primary)" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SHEET 2: Equipment Selector */}
      {showEquipmentSheet && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100000, 
            background: 'rgba(0, 0, 0, 0.8)', 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center' 
          }} 
          onClick={() => setShowEquipmentSheet(false)}
        >
          <div 
            className="drawer-content animate-fade-in-up" 
            onClick={e => e.stopPropagation()}
            style={{ 
              maxHeight: '75vh', 
              paddingBottom: '30px', 
              background: '#121216', 
              borderTop: '1px solid rgba(255,255,255,0.1)' 
            }}
          >
            <div className="drawer-header" style={{ marginBottom: '16px' }}>
              <h3 className="section-title" style={{ margin: 0, fontSize: '1.05rem' }}>Tipo di attrezzatura</h3>
              <button className="drawer-close" onClick={() => setShowEquipmentSheet(false)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {equipments.map(eq => {
                const isCurSelected = selectedEquipment === eq;
                return (
                  <div 
                    key={eq}
                    onClick={() => {
                      setSelectedEquipment(eq);
                      setShowEquipmentSheet(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: isCurSelected ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: isCurSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px' }}>
                        {eq === 'All' ? <Dumbbell size={20} color="var(--text-muted)" style={{ margin: '6px' }} /> : renderEquipmentIcon(eq)}
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: isCurSelected ? 800 : 600, color: isCurSelected ? 'var(--color-primary)' : 'white' }}>
                        {eq === 'All' ? "Tutta l'attrezzatura" : eq}
                      </span>
                    </div>
                    {isCurSelected && <Check size={18} color="var(--color-primary)" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
