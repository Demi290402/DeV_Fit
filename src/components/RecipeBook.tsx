import React, { useState } from 'react';
import { Search, Clock, ChefHat, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockRecipes } from '../data/mockRecipes';
import type { Recipe } from '../data/mockRecipes';


export const RecipeBook: React.FC = () => {
  const { addFoodLog } = useApp();
  
  // Filter states
  const [selectedType, setSelectedType] = useState<'all' | 'fit' | 'sgarro'>('all');
  const [selectedDiff, setSelectedDiff] = useState<'all' | 'Facile' | 'Medio' | 'Difficile'>('all');
  const [selectedTime, setSelectedTime] = useState<'all' | '20' | '60'>('all'); // max minutes
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Meal log assignment
  const [showMealSelector, setShowMealSelector] = useState(false);

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesType = selectedType === 'all' || recipe.type === selectedType;
    const matchesDiff = selectedDiff === 'all' || recipe.difficulty === selectedDiff;
    
    let matchesTime = true;
    if (selectedTime === '20') matchesTime = recipe.prepTime <= 20;
    else if (selectedTime === '60') matchesTime = recipe.prepTime <= 60;

    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          recipe.equipment.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesDiff && matchesTime && matchesSearch;
  });

  const handleAddRecipeToDiary = (mealType: 'Colazione' | 'Pranzo' | 'Spuntino' | 'Cena') => {
    if (!selectedRecipe) return;

    const todayStr = new Date().toISOString().split('T')[0];
    addFoodLog(todayStr, {
      name: selectedRecipe.title,
      mealType,
      calories: selectedRecipe.macros.calories,
      protein: selectedRecipe.macros.protein,
      carbs: selectedRecipe.macros.carbs,
      fat: selectedRecipe.macros.fat,
      weight: 100 // standard reference weight for recipes
    });

    setShowMealSelector(false);
    setSelectedRecipe(null);
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          className="set-input" 
          style={{ width: '100%', paddingLeft: '36px', textAlign: 'left', height: '42px' }}
          placeholder="Cerca ingredienti o strumenti (es. forno)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Chips Scroll */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Type Filter */}
        <div className="recipes-filter-scroll">
          <button className={`filter-badge ${selectedType === 'all' ? 'active' : ''}`} onClick={() => setSelectedType('all')}>Tutte le ricette</button>
          <button className={`filter-badge ${selectedType === 'fit' ? 'active' : ''}`} onClick={() => setSelectedType('fit')}>Fit / Leggere</button>
          <button className={`filter-badge ${selectedType === 'sgarro' ? 'active' : ''}`} onClick={() => setSelectedType('sgarro')}>Sgarro / Golose</button>
        </div>

        {/* Extra Filters Row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Difficulty */}
          <select 
            className="set-input" 
            style={{ height: '34px', fontSize: '0.78rem', padding: '0 8px', flex: 1 }}
            value={selectedDiff}
            onChange={e => setSelectedDiff(e.target.value as any)}
          >
            <option value="all">Tutte le difficoltà</option>
            <option value="Facile">Facile</option>
            <option value="Medio">Medio</option>
            <option value="Difficile">Difficile</option>
          </select>

          {/* Time */}
          <select 
            className="set-input" 
            style={{ height: '34px', fontSize: '0.78rem', padding: '0 8px', flex: 1 }}
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value as any)}
          >
            <option value="all">Qualsiasi tempo</option>
            <option value="20">Veloci (≤ 20 min)</option>
            <option value="60">Medie (≤ 60 min)</option>
          </select>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="recipes-grid">
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="glass-card recipe-thumb-card animate-scale-in" onClick={() => setSelectedRecipe(recipe)}>
            <div className="recipe-image-wrapper">
              <img src={recipe.imageUrl} alt={recipe.title} onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} />
              <span className={`recipe-type-tag ${recipe.type === 'fit' ? 'tag-fit' : 'tag-cheat'}`}>
                {recipe.type === 'fit' ? 'Fit' : 'Sgarro'}
              </span>
            </div>
            <h4 className="recipe-title">{recipe.title}</h4>
            <div style={{ padding: '0 12px 12px 12px', display: 'flex', gap: '10px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {recipe.prepTime} min</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><ChefHat size={10} /> {recipe.difficulty}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-dark)', padding: '24px 0', fontSize: '0.82rem' }}>
          Nessuna ricetta corrisponde ai filtri selezionati.
        </p>
      )}

      {/* Recipe Detail Drawer */}
      {selectedRecipe && (
        <div className="drawer-backdrop" onClick={() => setSelectedRecipe(null)}>
          <div className="drawer-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
            
            <div className="drawer-header">
              <div>
                <span className={`recipe-type-tag ${selectedRecipe.type === 'fit' ? 'tag-fit' : 'tag-cheat'}`} style={{ position: 'static' }}>
                  {selectedRecipe.type === 'fit' ? 'Ricetta Fit' : 'Sgarro'}
                </span>
                <h3 className="section-title" style={{ marginTop: '8px', marginBottom: '2px' }}>{selectedRecipe.title}</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {selectedRecipe.prepTime} min</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ChefHat size={12} /> {selectedRecipe.difficulty}</span>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setSelectedRecipe(null)}><X size={20} /></button>
            </div>

            {/* Photo */}
            <div style={{ width: '100%', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '18px', border: '1px solid var(--border-color)' }}>
              <img src={selectedRecipe.imageUrl} alt={selectedRecipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Macros Card */}
            <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', padding: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Calorie</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{selectedRecipe.macros.calories} kcal</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pro</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#3b82f6' }}>{selectedRecipe.macros.protein}g</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carb</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#eab308' }}>{selectedRecipe.macros.carbs}g</h4>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Grass</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ef4444' }}>{selectedRecipe.macros.fat}g</h4>
              </div>
            </div>

            {/* Tools and ingredients */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 700, marginBottom: '6px' }}>INGREDIENTI</h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 700, marginBottom: '6px' }}>STRUMENTI</h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px', listStyleType: 'square' }}>
                  {selectedRecipe.equipment.map((eq, i) => <li key={i}>{eq}</li>)}
                </ul>
              </div>
            </div>

            {/* Preparation */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '8px' }}>PROCEDIMENTO</h4>
              <ol style={{ paddingLeft: '16px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.4 }}>
                {selectedRecipe.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
              </ol>
            </div>

            {/* Log Quick Button */}
            {!showMealSelector ? (
              <button 
                className="btn-primary" 
                onClick={() => setShowMealSelector(true)}
                style={{ width: '100%', background: 'linear-gradient(135deg, var(--color-secondary) 0%, #0891b2 100%)', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)' }}
              >
                Aggiungi al Diario
              </button>
            ) : (
              <div className="glass-card animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
                <div className="flex-between">
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Seleziona il Pasto:</span>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-dark)', cursor: 'pointer' }} onClick={() => setShowMealSelector(false)}><X size={14} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {(['Colazione', 'Pranzo', 'Spuntino', 'Cena'] as const).map(type => (
                    <button 
                      key={type} 
                      className="btn-secondary" 
                      onClick={() => handleAddRecipeToDiary(type)}
                      style={{ padding: '8px 2px', fontSize: '0.68rem' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
