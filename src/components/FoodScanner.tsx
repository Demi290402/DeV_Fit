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

      {/* ── Date Header Switcher ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(10,10,12,0.9) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 16px'
      }}>
        <button className="icon-btn" onClick={handlePrevDay} style={{ color: 'var(--color-primary)' }}><ChevronLeft size={20} /></button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {selectedDate === new Date().toISOString().split('T')[0]
              ? '✦ Oggi'
              : new Date(selectedDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-dark)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Diario Alimentare</p>
        </div>
        <button className="icon-btn" onClick={handleNextDay} style={{ color: 'var(--color-primary)' }}><ChevronRight size={20} /></button>
      </div>

      {/* ── Personalizza Pasti button ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-secondary"
          onClick={() => setShowMealSettings(!showMealSettings)}
          style={{ padding: '5px 12px', fontSize: '0.7rem', height: '28px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Sliders size={12} color="var(--color-primary)" />
          {showMealSettings ? 'Chiudi Impostazioni' : 'Personalizza Pasti'}
        </button>
      </div>

      {/* ── Meals customization panel ── */}
      {showMealSettings && (
        <div className="glass-card animate-scale-in" style={{
          display: 'flex', flexDirection: 'column', gap: '12px',
          border: '1px solid var(--border-hover)',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(10,10,12,0.97) 100%)',
          borderLeft: '4px solid var(--color-primary)'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} /> Personalizza Pasti della Giornata
          </h4>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Aggiungi, rimuovi o rinomina i tuoi pasti per adattare il diario al tuo stile: Warrior Diet, Digiuno Intermittente, 6 pasti al giorno e così via.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0' }}>
            {mealsList.map((meal, index) => (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(212,175,55,0.03)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                {editingMealIndex === index ? (
                  <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                    <input
                      type="text" className="set-input" value={editingMealName}
                      onChange={e => setEditingMealName(e.target.value)}
                      style={{ flex: 1, height: '28px', fontSize: '0.75rem', textAlign: 'left', padding: '0 8px' }}
                    />
                    <button className="btn-primary" onClick={() => handleRenameMeal(index)} style={{ padding: '0 10px', height: '28px', fontSize: '0.7rem' }}>Salva</button>
                    <button className="btn-secondary" onClick={() => setEditingMealIndex(null)} style={{ padding: '0 8px', height: '28px', fontSize: '0.7rem' }}>Annulla</button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>✦ {meal}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                        onClick={() => { setEditingMealIndex(index); setEditingMealName(meal); }}
                      >Rinomina</button>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.72rem' }}
                        onClick={() => handleRemoveMeal(index)}
                      >Elimina</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" className="set-input" value={newMealName}
              onChange={e => setNewMealName(e.target.value)}
              placeholder="Aggiungi pasto (es. Spuntino ore 16)"
              style={{ flex: 1, height: '36px', fontSize: '0.78rem', textAlign: 'left', padding: '0 10px' }}
            />
            <button className="btn-primary" onClick={handleAddMeal} style={{ padding: '0 14px', height: '36px', fontSize: '0.72rem' }}>
              <Plus size={14} /> Aggiungi
            </button>
          </div>
        </div>
      )}

      {/* ── Daily Macro Summary Card ── */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(10,10,12,0.95) 100%)',
        border: '1px solid var(--border-color)',
        padding: '18px'
      }}>
        {/* Totals row */}
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calorie</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>{totalKcal}<span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)' }}> / {profile.targetCalories}</span></h4>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: totalKcal > profile.targetCalories ? 'var(--color-error)' : 'var(--color-success)' }}>
              {totalKcal > profile.targetCalories ? `+${totalKcal - profile.targetCalories} sopra` : `${profile.targetCalories - totalKcal} rimanenti`}
            </span>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
          <div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proteine</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-secondary)', lineHeight: 1.1 }}>{totalProt}<span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)' }}>g</span></h4>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)' }}>target: {profile.targetProtein}g</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
          <div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Carbi</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1.1 }}>{totalCarbs}<span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)' }}>g</span></h4>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)' }}>target: {profile.targetCarbs}g</span>
          </div>
        </div>

        {/* Calorie progress bar */}
        <div>
          <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min((totalKcal / profile.targetCalories) * 100, 100)}%`,
              background: totalKcal > profile.targetCalories
                ? 'var(--color-error)'
                : 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
              borderRadius: '99px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '0.58rem', color: 'var(--text-dark)' }}>0 kcal</span>
            <span style={{ fontSize: '0.58rem', color: 'var(--text-dark)' }}>{profile.targetCalories} kcal obiettivo</span>
          </div>
        </div>
      </div>

      {/* ── Meals Groups ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {mealTypes.map(mealType => {
          const mealFoods = dayLogs.filter(f => f.mealType === mealType);
          const mealKcal = mealFoods.reduce((sum, f) => sum + f.calories, 0);
          const mealPct = profile.targetCalories > 0 ? Math.min((mealKcal / profile.targetCalories) * 100, 100) : 0;

          return (
            <div key={mealType} className="glass-card" style={{
              padding: '16px',
              borderLeft: '4px solid var(--border-hover)',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.02) 0%, rgba(10,10,12,0.9) 100%)',
              transition: 'border-color 0.2s'
            }}>
              {/* Meal header */}
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{mealType}</h3>
                  <span style={{ fontSize: '0.68rem', color: mealKcal > 0 ? 'var(--color-secondary)' : 'var(--text-dark)', fontWeight: mealKcal > 0 ? 700 : 400 }}>
                    {mealKcal > 0 ? `${mealKcal} kcal` : '0 kcal'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveMealType(mealType)}
                  style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    color: '#050506'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 18px rgba(212,175,55,0.5)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(212,175,55,0.3)'; }}
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>

              {/* Meal mini-bar */}
              {mealKcal > 0 && (
                <div style={{ height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.04)', marginBottom: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${mealPct}%`, background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))', borderRadius: '99px' }} />
                </div>
              )}

              {/* Separator */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', marginBottom: '10px' }} />

              {/* Food entries */}
              {mealFoods.length === 0 ? (
                <p style={{ fontSize: '0.73rem', color: 'var(--text-dark)', fontStyle: 'italic', padding: '4px 0' }}>Nessun alimento registrato</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {mealFoods.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      transition: 'background 0.15s'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dark)', marginLeft: '6px' }}>{item.weight}g</span>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-dark)', marginTop: '1px' }}>
                          P:{item.protein}g · C:{item.carbs}g · G:{item.fat}g
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{item.calories} kcal</span>
                        <button
                          style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer', padding: '2px', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.6)'}
                          onClick={() => deleteFoodLog(selectedDate, item.id)}
                        ><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add Food Drawer ── */}
      {activeMealType && (
        <div className="drawer-backdrop" onClick={() => setActiveMealType(null)}>
          <div
            className="drawer-content animate-fade-in-up"
            onClick={e => e.stopPropagation()}
            style={{
              maxHeight: '82vh',
              background: 'linear-gradient(180deg, rgba(14,14,17,0.98) 0%, #050506 100%)',
              borderTop: '2px solid var(--color-primary)'
            }}
          >
            <div className="drawer-header">
              <div>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Aggiungi a</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{activeMealType}</h3>
              </div>
              <button className="drawer-close" onClick={() => setActiveMealType(null)}><X size={20} /></button>
            </div>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: '10px', margin: '14px 0' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text" className="set-input"
                  style={{ width: '100%', paddingLeft: '36px', textAlign: 'left', height: '44px' }}
                  placeholder="Cerca un alimento..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="btn-secondary"
                onClick={triggerSimulatedScan}
                title="Avvia scanner barcode"
                style={{ width: '44px', height: '44px', padding: 0, flexShrink: 0 }}
              >
                <Camera size={18} color="var(--color-primary)" />
              </button>
            </div>

            {/* Weight selector */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(212,175,55,0.04)', padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantità (grammi):</span>
              <input
                type="number" className="set-input" value={customWeight}
                onChange={e => setCustomWeight(e.target.value)}
                style={{ width: '80px', height: '34px' }}
              />
            </div>

            {/* Results */}
            <h4 style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
              ✦ Risultati Ricerca
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredFoods.map(food => (
                <div
                  key={food.name}
                  onClick={() => handleAddFood(food)}
                  style={{
                    padding: '12px 14px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background 0.15s, border-color 0.15s'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,175,55,0.06)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)'; }}
                >
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{food.name}</h5>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dark)' }}>
                      P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g (100g)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-secondary)', flexShrink: 0, marginLeft: '10px' }}>
                    {food.calories} kcal
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Scanner Modal ── */}
      {isScanning && (
        <div className="scanner-modal-overlay">
          <div className="flex-between" style={{ width: '100%' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              <Barcode size={18} /> Scanner Barcode
            </span>
            <button className="icon-btn" onClick={() => setIsScanning(false)} style={{ color: 'white' }}><X size={20} /></button>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="scanner-viewport" style={{ border: '2px solid var(--color-primary)', boxShadow: '0 0 20px rgba(212,175,55,0.25)' }}>
              <div className="scanner-scan-line" style={{ background: 'var(--color-primary)', boxShadow: '0 0 12px var(--color-primary)' }} />
              <div className="scanner-mock-view">
                <Camera size={42} className="animate-glow" color="var(--color-primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Scannerizzatore Attivo...</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-secondary)' }}>Punta il codice a barre del cibo</span>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>{scanStatusMessage}</p>
          </div>

          <div style={{ width: '100%' }}>
            {scanResult ? (
              <div className="glass-card animate-scale-in" style={{
                border: '1px solid var(--color-primary)',
                background: 'rgba(212,175,55,0.06)',
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div className="flex-between">
                  <div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>✦ Alimento Identificato</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{scanResult.name}</h4>
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-secondary)' }}>{scanResult.calories} kcal</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Valori (100g): Proteine {scanResult.protein}g | Carbi {scanResult.carbs}g | Grassi {scanResult.fat}g
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" onClick={handleSaveScanResult} style={{ flex: 1, padding: '10px' }}>Aggiungi a Pasto</button>
                  <button className="btn-secondary" onClick={triggerSimulatedScan} style={{ padding: '10px' }}>Riprova</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dark)', textAlign: 'center' }}>
                Simulazione fotocamera in corso...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
