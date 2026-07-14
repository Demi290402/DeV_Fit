import React, { useState } from 'react';
import { Search, X, Check, Dumbbell, Activity, Filter } from 'lucide-react';
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
    'All', 'Pettorali', 'Dorsali', 'Quadricipiti', 'Spalle', 
    'Bicipiti', 'Tricipiti', 'Addominali', 'Cardio', 
    'Adduttori', 'Abduttori', 'Avambracci'
  ];

  const equipments: (EquipmentType | 'All')[] = [
    'All', 'Bilanciere', 'Manubri', 'Macchina', 'Cavi', 
    'Niente', 'Fascia di resistenza', 'Fasce di sospensione', 'Kettlebell'
  ];

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="drawer-content animate-fade-in-up" 
        onClick={e => e.stopPropagation()} 
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '20px 16px' }}
      >
        {/* Header */}
        <div className="drawer-header" style={{ marginBottom: '16px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Aggiungi esercizio</h3>
          <button className="drawer-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Cerca esercizio"
            className="set-input"
            style={{ width: '100%', paddingLeft: '38px', textAlign: 'left', height: '42px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {/* Equipment Filter Button */}
          <button 
            className="btn-secondary" 
            onClick={() => setShowEquipmentSheet(true)}
            style={{ 
              flex: 1, 
              height: '38px', 
              padding: '0 12px', 
              fontSize: '0.78rem', 
              background: selectedEquipment !== 'All' ? 'var(--color-primary-glow)' : 'var(--background-card)',
              borderColor: selectedEquipment !== 'All' ? 'var(--color-primary)' : 'var(--border-color)',
              justifyContent: 'center'
            }}
          >
            <Filter size={12} color={selectedEquipment !== 'All' ? 'var(--color-primary)' : 'white'} />
            {selectedEquipment === 'All' ? 'Tutta l\'attrezzatura' : selectedEquipment}
          </button>

          {/* Muscle Filter Button */}
          <button 
            className="btn-secondary" 
            onClick={() => setShowMuscleSheet(true)}
            style={{ 
              flex: 1, 
              height: '38px', 
              padding: '0 12px', 
              fontSize: '0.78rem', 
              background: selectedMuscle !== 'All' ? 'var(--color-secondary-glow)' : 'var(--background-card)',
              borderColor: selectedMuscle !== 'All' ? 'var(--color-secondary)' : 'var(--border-color)',
              justifyContent: 'center'
            }}
          >
            <Activity size={12} color={selectedMuscle !== 'All' ? 'var(--color-secondary)' : 'white'} />
            {selectedMuscle === 'All' ? 'Tutti i muscoli' : selectedMuscle}
          </button>
        </div>

        {/* Exercises List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {filteredExercises.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dark)', fontSize: '0.85rem' }}>
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
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  className="exercise-item-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Circle diagram showing muscle highlight */}
                    <div style={{ width: '42px', height: '42px', flexShrink: 0 }}>
                      {renderMuscleIcon(ex.muscleGroup)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', margin: 0 }}>{ex.name}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {ex.muscleGroup} • {ex.equipment}
                      </span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isMultiSelect ? (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: isSelected ? 'var(--color-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {isSelected && <Check size={12} />}
                    </div>
                  ) : (
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color={isSelected ? 'var(--color-primary)' : 'var(--text-dark)'} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM SHEET 1: Muscle Group Selector */}
        {showMuscleSheet && (
          <div className="drawer-backdrop" onClick={() => setShowMuscleSheet(false)} style={{ zIndex: 1100 }}>
            <div 
              className="drawer-content animate-fade-in-up" 
              onClick={e => e.stopPropagation()}
              style={{ maxHeight: '70vh', paddingBottom: '30px' }}
            >
              <div className="drawer-header" style={{ marginBottom: '16px' }}>
                <h3 className="section-title">Gruppo muscolare</h3>
                <button className="drawer-close" onClick={() => setShowMuscleSheet(false)}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
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
                        padding: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px' }}>
                          {muscle === 'All' ? <Dumbbell size={20} color="var(--text-muted)" style={{ margin: '6px' }} /> : renderMuscleIcon(muscle)}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {muscle === 'All' ? 'Tutti i muscoli' : muscle}
                        </span>
                      </div>
                      {isCurSelected && <Check size={16} color="var(--color-secondary)" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM SHEET 2: Equipment Selector */}
        {showEquipmentSheet && (
          <div className="drawer-backdrop" onClick={() => setShowEquipmentSheet(false)} style={{ zIndex: 1100 }}>
            <div 
              className="drawer-content animate-fade-in-up" 
              onClick={e => e.stopPropagation()}
              style={{ maxHeight: '70vh', paddingBottom: '30px' }}
            >
              <div className="drawer-header" style={{ marginBottom: '16px' }}>
                <h3 className="section-title">Tipo di categoria</h3>
                <button className="drawer-close" onClick={() => setShowEquipmentSheet(false)}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
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
                        padding: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px' }}>
                          {eq === 'All' ? <Dumbbell size={20} color="var(--text-muted)" style={{ margin: '6px' }} /> : renderEquipmentIcon(eq)}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {eq === 'All' ? 'Tutta l\'attrezzatura' : eq}
                        </span>
                      </div>
                      {isCurSelected && <Check size={16} color="var(--color-primary)" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
