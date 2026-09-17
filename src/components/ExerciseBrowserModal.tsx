import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Check, ChevronLeft, Info, Plus } from 'lucide-react';
import { mockExercises, renderMuscleIcon } from '../data/mockExercises';
import type { MuscleGroup, EquipmentType, Exercise } from '../data/mockExercises';
import { AnatomicalIcon } from './AnatomicalIcon';
import { EquipmentIcon } from './EquipmentIcon';

export interface ExerciseBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise?: (id: string) => void;
  onAddExercises?: (ids: string[]) => void;
  selectedIds?: string[];
  isMultiSelect?: boolean;
}

export const ExerciseBrowserModal: React.FC<ExerciseBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  onAddExercises,
  selectedIds = [],
  isMultiSelect = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'All'>('All');
  
  // Sheet states
  const [showMuscleSheet, setShowMuscleSheet] = useState(false);
  const [showEquipmentSheet, setShowEquipmentSheet] = useState(false);
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Custom Exercise state
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Pettorali');
  const [customEquip, setCustomEquip] = useState<EquipmentType>('Bilanciere');
  const [customList, setCustomList] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem('devfit_custom_exercises');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Local selection state (array of IDs)
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (isOpen) {
      setLocalSelected(selectedIds);
      setSearchQuery('');
    }
  }, [isOpen, selectedIds]);

  if (!isOpen) return null;

  const allExercises: Exercise[] = [...customList, ...mockExercises];

  // Filter exercises
  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.instructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'All' || 
                             (selectedEquipment === 'Manubri' && ex.equipment === 'Manubri') ||
                             ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  // Toggle exercise selection
  const handleToggleSelect = (id: string) => {
    if (isMultiSelect) {
      setLocalSelected(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setLocalSelected([id]);
    }
  };

  // Confirm addition of selected exercises
  const handleConfirmAdd = () => {
    if (localSelected.length === 0) return;

    if (onAddExercises) {
      onAddExercises(localSelected);
    } else if (onSelectExercise) {
      localSelected.forEach(id => onSelectExercise(id));
    }
    onClose();
  };

  // Create custom exercise handler
  const handleSaveCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newEx: Exercise = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: 'Petto',
      muscleGroup: customMuscle,
      equipment: customEquip,
      instructions: 'Esercizio personalizzato creato da te.',
      videoUrl: ''
    };

    const updated = [newEx, ...customList];
    setCustomList(updated);
    try {
      localStorage.setItem('devfit_custom_exercises', JSON.stringify(updated));
    } catch {
      // Storage error fallback
    }

    setLocalSelected(prev => [...prev, newEx.id]);
    setCustomName('');
    setShowCreateModal(false);
  };

  const muscleCategories = {
    upper: [
      { name: 'Pettorali' as MuscleGroup, label: 'Petto' },
      { name: 'Dorsali' as MuscleGroup, label: 'Dorsali' },
      { name: 'Spalle' as MuscleGroup, label: 'Spalle' },
      { name: 'Bicipiti' as MuscleGroup, label: 'Bicipiti' },
      { name: 'Tricipiti' as MuscleGroup, label: 'Tricipiti' },
      { name: 'Addominali' as MuscleGroup, label: 'Addominali' },
      { name: 'Trapezi' as MuscleGroup, label: 'Trapezi' },
      { name: 'Lombari' as MuscleGroup, label: 'Lombari' },
      { name: 'Avambracci' as MuscleGroup, label: 'Avambracci' },
      { name: 'Collo' as MuscleGroup, label: 'Collo' }
    ],
    lower: [
      { name: 'Quadricipiti' as MuscleGroup, label: 'Quadricipiti' },
      { name: 'Femorali' as MuscleGroup, label: 'Femorali' },
      { name: 'Glutei' as MuscleGroup, label: 'Glutei' },
      { name: 'Polpacci' as MuscleGroup, label: 'Polpacci' },
      { name: 'Adduttori' as MuscleGroup, label: 'Adduttori' },
      { name: 'Abduttori' as MuscleGroup, label: 'Abduttori' }
    ],
    other: [
      { name: 'Cardio' as MuscleGroup, label: 'Cardio' }
    ]
  };

  const equipmentsList: { type: EquipmentType; label: string }[] = [
    { type: 'Niente', label: 'Nessuna (Corpo libero)' },
    { type: 'Bilanciere', label: 'Bilanciere' },
    { type: 'Manubri', label: 'Manubrio' },
    { type: 'Macchina', label: 'Macchina' },
    { type: 'Cavi', label: 'Cavi' },
    { type: 'Disco', label: 'Disco' },
    { type: 'Kettlebell', label: 'Kettlebell' },
    { type: 'Fascia di resistenza', label: 'Fascia di resistenza' },
    { type: 'Fasce di sospensione', label: 'Fasce sospensione' },
    { type: 'Altro', label: 'Altro' }
  ];

  return createPortal(
    <div 
      className="modal-portal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
      }}
      onClick={onClose}
    >
      <div 
        className="modal-portal-card"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#09090b',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '520px',
          height: '100dvh',
          boxShadow: '0 10px 60px rgba(0, 0, 0, 0.95)',
          color: '#ffffff',
          fontFamily: 'inherit',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
      {/* 1. Modal Top Bar (Native Hevy Style: Annulla | Titolo | Crea) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#121216',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}
      >
        <button 
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary, #d4af37)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ChevronLeft size={18} />
          <span>Annulla</span>
        </button>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
          Aggiungi esercizio
        </h3>

        <button 
          type="button"
          onClick={() => setShowCreateModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary, #d4af37)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 6px'
          }}
        >
          Crea
        </button>
      </div>

      {/* 2. Pinned Search Bar & Filter Buttons */}
      <div 
        style={{
          padding: '12px 16px',
          background: '#0d0d11',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={17} color="var(--text-muted, #94a3b8)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Cerca per nome o muscolo..."
            style={{ 
              width: '100%', 
              paddingLeft: '40px', 
              paddingRight: searchQuery ? '36px' : '14px', 
              textAlign: 'left', 
              height: '42px',
              background: '#16161c',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box'
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

        {/* 2 Filter Buttons in Cima (Tutta l'attrezzatura & Tutti i muscoli) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Button 1: Equipment */}
          <button 
            type="button"
            onClick={() => setShowEquipmentSheet(true)}
            style={{ 
              flex: 1, 
              height: '40px', 
              padding: '0 12px', 
              fontSize: '0.82rem', 
              fontWeight: 700,
              background: selectedEquipment !== 'All' ? 'rgba(212, 175, 55, 0.15)' : '#16161c',
              border: selectedEquipment !== 'All' ? '1px solid var(--color-primary, #d4af37)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: selectedEquipment !== 'All' ? 'var(--color-primary, #d4af37)' : '#ffffff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <EquipmentIcon equipment={selectedEquipment} size={18} color={selectedEquipment !== 'All' ? 'var(--color-primary, #d4af37)' : '#94a3b8'} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedEquipment === 'All' ? "Tutta l'attrezzatura" : selectedEquipment}
            </span>
          </button>

          {/* Button 2: Muscle */}
          <button 
            type="button"
            onClick={() => setShowMuscleSheet(true)}
            style={{ 
              flex: 1, 
              height: '40px', 
              padding: '0 12px', 
              fontSize: '0.82rem', 
              fontWeight: 700,
              background: selectedMuscle !== 'All' ? 'rgba(212, 175, 55, 0.15)' : '#16161c',
              border: selectedMuscle !== 'All' ? '1px solid var(--color-primary, #d4af37)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: selectedMuscle !== 'All' ? 'var(--color-primary, #d4af37)' : '#ffffff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <AnatomicalIcon muscle={selectedMuscle} size={22} highlightColor={selectedMuscle !== 'All' ? '#d4af37' : '#00a8ff'} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedMuscle === 'All' ? 'Tutti i muscoli' : selectedMuscle}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Exercises List */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          padding: '14px 16px 100px 16px' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #94a3b8)' }}>
            {searchQuery || selectedMuscle !== 'All' || selectedEquipment !== 'All' ? 'Risultati ricerca' : 'Tutti gli esercizi'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
            {filteredExercises.length} esercizi
          </span>
        </div>

        {filteredExercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Nessun esercizio corrisponde ai filtri.</p>
            <button 
              onClick={() => { setSelectedMuscle('All'); setSelectedEquipment('All'); setSearchQuery(''); }}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Azzera filtri
            </button>
          </div>
        ) : (
          filteredExercises.map(ex => {
            const isSelected = localSelected.includes(ex.id);
            return (
              <div 
                key={ex.id}
                onClick={() => handleToggleSelect(ex.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: isSelected ? 'rgba(212, 175, 55, 0.08)' : '#131317',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid var(--color-primary, #d4af37)' : '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  {/* High definition anatomical miniature icon */}
                  <div style={{ width: '42px', height: '42px', flexShrink: 0 }}>
                    {renderMuscleIcon(ex.muscleGroup, 42, '#00a8ff')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                    <h4 style={{ 
                      fontSize: '0.88rem', 
                      fontWeight: 700, 
                      color: '#ffffff', 
                      margin: 0, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {ex.name}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)' }}>
                      {ex.muscleGroup} • {ex.equipment}
                    </span>
                  </div>
                </div>

                {/* Right actions: Info button + Selection checkmark */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailExercise(ex);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted, #94a3b8)',
                      padding: '6px',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Dettagli e istruzioni"
                  >
                    <Info size={17} />
                  </button>

                  {/* Selection Checkbox */}
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid var(--color-primary, #d4af37)' : '1.5px solid rgba(255, 255, 255, 0.25)',
                    background: isSelected ? 'var(--color-primary, #d4af37)' : 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#09090b',
                    transition: 'all 0.15s ease'
                  }}>
                    {isSelected && <Check size={16} strokeWidth={3} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. FLOATING STICKY CONFIRMATION BUTTON (Always visible when items selected) */}
      {localSelected.length > 0 && (
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '16px',
            right: '16px',
            zIndex: 100001,
            animation: 'fadeInUp 0.2s ease-out'
          }}
        >
          <button 
            type="button"
            onClick={handleConfirmAdd}
            style={{
              width: '100%',
              height: '52px',
              padding: '0 20px',
              fontSize: '0.98rem',
              fontWeight: 800,
              borderRadius: '26px',
              background: 'linear-gradient(135deg, #e5c053 0%, #d4af37 100%)',
              color: '#09090b',
              border: 'none',
              boxShadow: '0 8px 30px rgba(212, 175, 55, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              letterSpacing: '0.01em'
            }}
          >
            <Check size={20} strokeWidth={3} />
            <span>Aggiungi {localSelected.length} {localSelected.length === 1 ? 'esercizio' : 'esercizi'}</span>
          </button>
        </div>
      )}

      {/* ================= BOTTOM SHEET 1: Gruppo Muscolare (Screenshot 1) ================= */}
      {showMuscleSheet && (
        <div 
          className="drawer-desktop-center"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100005, 
            background: 'rgba(0, 0, 0, 0.8)', 
            backdropFilter: 'blur(6px)',
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center' 
          }} 
          onClick={() => setShowMuscleSheet(false)}
        >
          <div 
            className="drawer-desktop-card"
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '100%',
              maxWidth: '480px',
              maxHeight: '85vh', 
              background: '#121217', 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
              overflow: 'hidden'
            }}
          >
            {/* Pull handle & header */}
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginBottom: '12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>Gruppo muscolare</h3>
                <button 
                  onClick={() => setShowMuscleSheet(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Muscle Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 20px 14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Upper Body */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Upper Body
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {muscleCategories.upper.map(m => {
                    const isSelected = selectedMuscle === m.name;
                    return (
                      <div 
                        key={m.name}
                        onClick={() => setSelectedMuscle(m.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          background: isSelected ? 'rgba(212, 175, 55, 0.15)' : '#1a1a22',
                          border: isSelected ? '1px solid var(--color-primary, #d4af37)' : '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <AnatomicalIcon muscle={m.name} size={36} highlightColor={isSelected ? '#d4af37' : '#00a8ff'} />
                        <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--color-primary, #d4af37)' : 'white' }}>
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lower Body */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Lower Body
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {muscleCategories.lower.map(m => {
                    const isSelected = selectedMuscle === m.name;
                    return (
                      <div 
                        key={m.name}
                        onClick={() => setSelectedMuscle(m.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          background: isSelected ? 'rgba(212, 175, 55, 0.15)' : '#1a1a22',
                          border: isSelected ? '1px solid var(--color-primary, #d4af37)' : '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <AnatomicalIcon muscle={m.name} size={36} highlightColor={isSelected ? '#d4af37' : '#00a8ff'} />
                        <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--color-primary, #d4af37)' : 'white' }}>
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Other / Cardio */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Altro
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {muscleCategories.other.map(m => {
                    const isSelected = selectedMuscle === m.name;
                    return (
                      <div 
                        key={m.name}
                        onClick={() => setSelectedMuscle(m.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          background: isSelected ? 'rgba(212, 175, 55, 0.15)' : '#1a1a22',
                          border: isSelected ? '1px solid var(--color-primary, #d4af37)' : '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <AnatomicalIcon muscle={m.name} size={36} highlightColor={isSelected ? '#d4af37' : '#00a8ff'} />
                        <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--color-primary, #d4af37)' : 'white' }}>
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom action bar: Cancella filtri | Mostra risultati */}
            <div style={{ 
              padding: '12px 16px', 
              borderTop: '1px solid rgba(255,255,255,0.06)', 
              background: '#0d0d11',
              display: 'flex', 
              gap: '10px' 
            }}>
              <button 
                type="button"
                onClick={() => { setSelectedMuscle('All'); setShowMuscleSheet(false); }}
                style={{
                  flex: 1,
                  height: '46px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                Cancella i filtri
              </button>
              <button 
                type="button"
                onClick={() => setShowMuscleSheet(false)}
                style={{
                  flex: 1.5,
                  height: '46px',
                  background: 'var(--color-primary, #d4af37)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#09090b',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Mostra {filteredExercises.length} risultati
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM SHEET 2: Attrezzatura (Screenshot 2) ================= */}
      {showEquipmentSheet && (
        <div 
          className="drawer-desktop-center"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100005, 
            background: 'rgba(0, 0, 0, 0.8)', 
            backdropFilter: 'blur(6px)',
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center' 
          }} 
          onClick={() => setShowEquipmentSheet(false)}
        >
          <div 
            className="drawer-desktop-card"
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '100%',
              maxWidth: '480px',
              maxHeight: '85vh', 
              background: '#121217', 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
              overflow: 'hidden'
            }}
          >
            {/* Pull handle & header */}
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginBottom: '12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>Attrezzatura</h3>
                <button 
                  onClick={() => setShowEquipmentSheet(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Equipment 2-column Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 20px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {equipmentsList.map(eq => {
                  const isSelected = selectedEquipment === eq.type;
                  return (
                    <div 
                      key={eq.type}
                      onClick={() => setSelectedEquipment(eq.type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: isSelected ? 'rgba(212, 175, 55, 0.15)' : '#1a1a22',
                        border: isSelected ? '1px solid var(--color-primary, #d4af37)' : '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.06)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <EquipmentIcon equipment={eq.type} size={22} color={isSelected ? 'var(--color-primary, #d4af37)' : '#ffffff'} />
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--color-primary, #d4af37)' : 'white' }}>
                        {eq.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom action bar: Cancella filtri | Mostra risultati */}
            <div style={{ 
              padding: '12px 16px', 
              borderTop: '1px solid rgba(255,255,255,0.06)', 
              background: '#0d0d11',
              display: 'flex', 
              gap: '10px' 
            }}>
              <button 
                type="button"
                onClick={() => { setSelectedEquipment('All'); setShowEquipmentSheet(false); }}
                style={{
                  flex: 1,
                  height: '46px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                Cancella i filtri
              </button>
              <button 
                type="button"
                onClick={() => setShowEquipmentSheet(false)}
                style={{
                  flex: 1.5,
                  height: '46px',
                  background: 'var(--color-primary, #d4af37)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#09090b',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Mostra {filteredExercises.length} risultati
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXERCISE DETAIL MODAL ================= */}
      {detailExercise && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100010, 
            background: 'rgba(0, 0, 0, 0.85)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '16px'
          }} 
          onClick={() => setDetailExercise(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '100%',
              maxWidth: '400px',
              background: '#16161d', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AnatomicalIcon muscle={detailExercise.muscleGroup} size={48} highlightColor="#d4af37" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{detailExercise.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-primary, #d4af37)', fontWeight: 700 }}>
                    {detailExercise.muscleGroup} • {detailExercise.equipment}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setDetailExercise(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Istruzioni di esecuzione
              </h4>
              <p style={{ fontSize: '0.88rem', lineHeight: '1.5', color: '#e2e8f0', margin: 0 }}>
                {detailExercise.instructions}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!localSelected.includes(detailExercise.id)) {
                  handleToggleSelect(detailExercise.id);
                }
                setDetailExercise(null);
              }}
              style={{
                width: '100%',
                height: '44px',
                background: localSelected.includes(detailExercise.id) ? 'rgba(255,255,255,0.1)' : 'var(--color-primary, #d4af37)',
                color: localSelected.includes(detailExercise.id) ? 'white' : '#09090b',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {localSelected.includes(detailExercise.id) ? 'Già selezionato' : 'Seleziona esercizio'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODALE CREA ESERCIZIO ================= */}
      {showCreateModal && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100010, 
            background: 'rgba(0, 0, 0, 0.85)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '16px'
          }} 
          onClick={() => setShowCreateModal(false)}
        >
          <form 
            onSubmit={handleSaveCustomExercise}
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '100%',
              maxWidth: '400px',
              background: '#16161d', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>Crea Esercizio</h3>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Nome dell'esercizio
              </label>
              <input 
                type="text" 
                placeholder="Es. Panca Piana con Catene" 
                value={customName} 
                onChange={e => setCustomName(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '42px',
                  background: '#121216',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Gruppo Muscolare
              </label>
              <select
                value={customMuscle}
                onChange={e => setCustomMuscle(e.target.value as MuscleGroup)}
                style={{
                  width: '100%',
                  height: '42px',
                  background: '#121216',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              >
                {muscleCategories.upper.map(m => <option key={m.name} value={m.name}>{m.label}</option>)}
                {muscleCategories.lower.map(m => <option key={m.name} value={m.name}>{m.label}</option>)}
                {muscleCategories.other.map(m => <option key={m.name} value={m.name}>{m.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Attrezzatura
              </label>
              <select
                value={customEquip}
                onChange={e => setCustomEquip(e.target.value as EquipmentType)}
                style={{
                  width: '100%',
                  height: '42px',
                  background: '#121216',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0 12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              >
                {equipmentsList.map(eq => <option key={eq.type} value={eq.type}>{eq.label}</option>)}
              </select>
            </div>

            <button 
              type="submit"
              style={{
                width: '100%',
                height: '46px',
                background: 'var(--color-primary, #d4af37)',
                color: '#09090b',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <Plus size={18} strokeWidth={3} />
              <span>Salva e Aggiungi</span>
            </button>
          </form>
        </div>
      )}
      </div>
    </div>,
    document.body
  );
};
