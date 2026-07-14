import React, { useState } from 'react';
import { Plus, Trash2, Camera, Search, X, ChevronLeft, ChevronRight, Barcode, Sliders } from 'lucide-react';

import { useApp } from '../context/AppContext';



interface FoodDbItem {
  name: string;
  calories: number; // per 100g
  protein: number;
  carbs: number;
  fat: number;
}

const mockFoodDb: FoodDbItem[] = [
  { name: 'Petto di Pollo alla Piastra', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Riso Basmati Bollito', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Uovo Intero Sodo', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: 'Salmone al Forno', calories: 206, protein: 22, carbs: 0, fat: 12 },
  { name: 'Avocado Fresco', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'Yogurt Greco 0% Fage', calories: 57, protein: 10, carbs: 3, fat: 0 },
  { name: 'Pane Integrale di Segale', calories: 250, protein: 9, carbs: 48, fat: 2 },
  { name: 'Mandorle Sgusciate', calories: 579, protein: 21, carbs: 22, fat: 49 },
  { name: 'Mela Rossa', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Barretta Proteica Choco-Fit', calories: 375, protein: 32, carbs: 38, fat: 9 },
];

export const FoodScanner: React.FC = () => {
  const { foodLogs, addFoodLog, deleteFoodLog, profile, mealsList, updateMealsList } = useApp();
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeMealType, setActiveMealType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customWeight, setCustomWeight] = useState('100');
  
  // Custom meals configuration state
  const [showMealSettings, setShowMealSettings] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);
  const [editingMealName, setEditingMealName] = useState('');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FoodDbItem | null>(null);
  const [scanStatusMessage, setScanStatusMessage] = useState('');

  const dayLogs = foodLogs[selectedDate] || [];

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Search filter
  const filteredFoods = searchQuery
    ? mockFoodDb.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockFoodDb;

  const handleAddFood = (food: FoodDbItem) => {
    if (!activeMealType) return;
    const g = parseFloat(customWeight) || 100;
    
    // Scale macro values based on logged grams (per 100g)
    const scale = g / 100;
    addFoodLog(selectedDate, {
      name: food.name,
      mealType: activeMealType,
      calories: Math.round(food.calories * scale),
      protein: Math.round(food.protein * scale),
      carbs: Math.round(food.carbs * scale),
      fat: Math.round(food.fat * scale),
      weight: g
    });

    setSearchQuery('');
    setCustomWeight('100');
    setActiveMealType(null);
  };

  const triggerSimulatedScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setScanStatusMessage('Inizializzazione fotocamera...');
    
    setTimeout(() => {
      setScanStatusMessage('Rilevamento codice a barre in corso...');
    }, 1000);

    setTimeout(() => {
      // Pick a random mock food item
      const randomIndex = Math.floor(Math.random() * mockFoodDb.length);
      const matchedFood = mockFoodDb[randomIndex];
      setScanResult(matchedFood);
      setScanStatusMessage('Codice a Barre Rilevato con successo!');
      if (navigator.vibrate) navigator.vibrate(100);
    }, 2800);
  };

  const handleSaveScanResult = () => {
    if (scanResult && activeMealType) {
      handleAddFood(scanResult);
      setIsScanning(false);
      setScanResult(null);
    }
  };

  // Meal list handlers
  const handleAddMeal = () => {
    const trimmedName = newMealName.trim();
    if (trimmedName && !mealsList.includes(trimmedName)) {
      updateMealsList([...mealsList, trimmedName]);
      setNewMealName('');
    }
  };

  const handleRemoveMeal = (index: number) => {
    const mealName = mealsList[index];
    const confirmed = window.confirm(
      `Vuoi rimuovere il pasto "${mealName}"? I cibi già inseriti in questo pasto non verranno eliminati ma non potrai più loggare cibi sotto questa categoria.`
    );
    if (confirmed) {
      updateMealsList(mealsList.filter((_, i) => i !== index));
    }
  };

  const handleRenameMeal = (index: number) => {
    const trimmedName = editingMealName.trim();
    if (trimmedName && !mealsList.includes(trimmedName)) {
      const updated = [...mealsList];
      updated[index] = trimmedName;
      updateMealsList(updated);
      setEditingMealIndex(null);
      setEditingMealName('');
    }
  };

  // Total daily stats
  const totalKcal = dayLogs.reduce((sum, i) => sum + i.calories, 0);
  const totalProt = dayLogs.reduce((sum, i) => sum + i.protein, 0);
  const totalCarbs = dayLogs.reduce((sum, i) => sum + i.carbs, 0);

  const mealTypes = mealsList;

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Date Header Switcher */}
      <div className="flex-between">
        <button className="icon-btn" onClick={handlePrevDay}><ChevronLeft size={18} /></button>
        <span style={{ fontSize: '1rem', fontWeight: 800 }}>
          {selectedDate === new Date().toISOString().split('T')[0] 
            ? 'Oggi' 
            : new Date(selectedDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
        <button className="icon-btn" onClick={handleNextDay}><ChevronRight size={18} /></button>
      </div>

      <div className="flex-between" style={{ marginTop: '-8px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Diario Alimentare</span>
        <button 
          className="btn-secondary" 
          onClick={() => setShowMealSettings(!showMealSettings)} 
          style={{ padding: '4px 10px', fontSize: '0.7rem', height: '26px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Sliders size={12} color="var(--color-primary)" />
          {showMealSettings ? 'Chiudi Impostazioni' : 'Personalizza Pasti'}
        </button>
      </div>

      {/* Meals customization panel */}
      {showMealSettings && (
        <div className="glass-card animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.03) 0%, rgba(10, 10, 12, 0.95) 100%)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>Personalizza Pasti della Giornata</h4>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Aggiungi nuovi pasti, rimuovi quelli esistenti o rinominali a tuo piacimento per adattare il diario alimentare al tuo stile di vita (es. Dieta Warrior, Digiuno Intermittente o 6 pasti al giorno).
          </p>

          {/* Meals list editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0' }}>
            {mealsList.map((meal, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                {editingMealIndex === index ? (
                  <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                    <input 
                      type="text" 
                      className="set-input" 
                      value={editingMealName} 
                      onChange={e => setEditingMealName(e.target.value)}
                      style={{ flex: 1, height: '28px', fontSize: '0.75rem', textAlign: 'left', padding: '0 8px' }}
                    />
                    <button className="btn-primary" onClick={() => handleRenameMeal(index)} style={{ padding: '0 10px', height: '28px', fontSize: '0.7rem' }}>Salva</button>
                    <button className="btn-secondary" onClick={() => setEditingMealIndex(null)} style={{ padding: '0 8px', height: '28px', fontSize: '0.7rem' }}>Annulla</button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{meal}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.7rem' }}
                        onClick={() => {
                          setEditingMealIndex(index);
                          setEditingMealName(meal);
                        }}
                      >
                        Rinomina
                      </button>
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.7rem' }}
                        onClick={() => handleRemoveMeal(index)}
                      >
                        Elimina
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add meal input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="set-input" 
              value={newMealName} 
              onChange={e => setNewMealName(e.target.value)}
              placeholder="Aggiungi pasto (es. Spuntino ore 16)"
              style={{ flex: 1, height: '34px', fontSize: '0.78rem', textAlign: 'left', padding: '0 10px' }}
            />
            <button className="btn-primary" onClick={handleAddMeal} style={{ padding: '0 14px', height: '34px', fontSize: '0.72rem' }}>
              Aggiungi
            </button>
          </div>
        </div>
      )}


      {/* Daily Macro Progress in Diary */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', padding: '16px' }}>
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Calorie</span>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{totalKcal} / {profile.targetCalories}</h4>
          <span style={{ fontSize: '0.6rem', color: totalKcal > profile.targetCalories ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 'bold' }}>
            {totalKcal > profile.targetCalories ? `${totalKcal - profile.targetCalories} kcal sopra` : `${profile.targetCalories - totalKcal} kcal rimanenti`}
          </span>
        </div>
        <div style={{ width: '1px', background: 'var(--border-color)' }} />
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Proteine</span>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>{totalProt}g</h4>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)' }}>target: {profile.targetProtein}g</span>
        </div>
        <div style={{ width: '1px', background: 'var(--border-color)' }} />
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Carbi</span>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#eab308' }}>{totalCarbs}g</h4>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)' }}>target: {profile.targetCarbs}g</span>
        </div>
      </div>

      {/* Meals Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {mealTypes.map(mealType => {
          const mealFoods = dayLogs.filter(f => f.mealType === mealType);
          const mealKcal = mealFoods.reduce((sum, f) => sum + f.calories, 0);

          return (
            <div key={mealType} className="glass-card" style={{ padding: '16px' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>{mealType}</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{mealKcal} kcal</span>
                </div>
                <button 
                  className="icon-btn" 
                  onClick={() => setActiveMealType(mealType)} 
                  style={{ width: '32px', height: '32px', background: 'var(--color-secondary-glow)', color: 'var(--color-secondary)' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {mealFoods.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', padding: '6px 0' }}>Nessun alimento registrato</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mealFoods.map(item => (
                    <div key={item.id} className="food-entry-item">
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', marginLeft: '8px' }}>{item.weight}g</span>
                      </div>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.calories} kcal</span>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>P:{item.protein} C:{item.carbs} G:{item.fat}</span>
                        </div>
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                          onClick={() => deleteFoodLog(selectedDate, item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Dialog Overlay */}
      {activeMealType && (
        <div className="drawer-backdrop" onClick={() => setActiveMealType(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh' }}>
            <div className="drawer-header">
              <h3 className="section-title">Aggiungi a {activeMealType}</h3>
              <button className="drawer-close" onClick={() => setActiveMealType(null)}><X size={20} /></button>
            </div>

            {/* Quick Search */}
            <div style={{ display: 'flex', gap: '10px', margin: '14px 0' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="set-input" 
                  style={{ width: '100%', paddingLeft: '36px', textAlign: 'left', height: '42px' }}
                  placeholder="Cerca un alimento..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-secondary" onClick={triggerSimulatedScan} title="Avvia scanner codice a barre" style={{ width: '42px', height: '42px', padding: 0 }}>
                <Camera size={18} color="var(--color-secondary)" />
              </button>
            </div>

            {/* Weight selector */}
            <div className="flex-between" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantità in grammi (g):</span>
              <input 
                type="number" 
                className="set-input" 
                value={customWeight}
                onChange={e => setCustomWeight(e.target.value)}
                style={{ width: '80px', height: '34px' }}
              />
            </div>

            {/* Search list */}
            <h4 style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 700, marginBottom: '8px' }}>RISULTATI RICERCA</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredFoods.map(food => (
                <div 
                  key={food.name} 
                  className="glass-card" 
                  style={{ padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleAddFood(food)}
                >
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{food.name}</h5>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      P:{food.protein}g C:{food.carbs}g F:{food.fat}g (per 100g)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{food.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulated Scanner Viewport Modal */}
      {isScanning && (
        <div className="scanner-modal-overlay">
          <div className="flex-between" style={{ width: '100%' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
              <Barcode size={18} /> SCANNER BARCODE MOCK
            </span>
            <button className="icon-btn" onClick={() => setIsScanning(false)} style={{ color: 'white' }}><X size={20} /></button>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="scanner-viewport">
              <div className="scanner-scan-line"></div>
              <div className="scanner-mock-view">
                <Camera size={42} className="animate-glow" color="var(--text-dark)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Scannerizzatore Attivo...</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-secondary)' }}>Punta il codice a barre del cibo</span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {scanStatusMessage}
            </p>
          </div>

          {/* Scan result display */}
          <div style={{ width: '100%' }}>
            {scanResult ? (
              <div className="glass-card animate-scale-in" style={{ border: '2px solid var(--color-success)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="flex-between">
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-success)', fontWeight: 'bold', textTransform: 'uppercase' }}>Alimento Identificato!</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{scanResult.name}</h4>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-success)' }}>{scanResult.calories} kcal</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Valori (100g): Proteine {scanResult.protein}g | Carboidrati {scanResult.carbs}g | Grassi {scanResult.fat}g
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" onClick={handleSaveScanResult} style={{ flex: 1, padding: '10px' }}>
                    Aggiungi a Pasto
                  </button>
                  <button className="btn-secondary" onClick={triggerSimulatedScan} style={{ padding: '10px' }}>
                    Riprova
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dark)', textAlign: 'center' }}>
                Simulazione fotocamera Cloudflare Zero-Cost
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
