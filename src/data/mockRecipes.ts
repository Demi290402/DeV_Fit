export interface Recipe {
  id: string;
  title: string;
  type: 'fit' | 'sgarro';
  prepTime: number; // in minutes
  difficulty: 'Facile' | 'Medio' | 'Difficile';
  equipment: string[];
  ingredients: string[];
  instructions: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl: string;
}

export const mockRecipes: Recipe[] = [
  {
    id: 'rec-pancake-proteici',
    title: 'Pancake Proteici Fit all\'Avena',
    type: 'fit',
    prepTime: 15,
    difficulty: 'Facile',
    equipment: ['Padella antiaderente', 'Ciotola', 'Frusta'],
    ingredients: [
      '100g Albume d\'uovo',
      '40g Farina d\'avena',
      '50g Yogurt greco 0%',
      '10g Proteine in polvere (opzionali)',
      '1 cucchiaino di Lievito per dolci'
    ],
    instructions: [
      'In una ciotola, mescola albume, farina d\'avena, yogurt greco e lievito fino ad ottenere un composto omogeneo.',
      'Scalda una padella antiaderente a fuoco medio.',
      'Versa un mestolo di pastella nella padella.',
      'Quando si formano le bollicine in superficie, gira il pancake e cuoci l\'altro lato per 1-2 minuti.',
      'Guarnisci a piacere con frutta fresca o sciroppo d\'acero zero calorie.'
    ],
    macros: {
      calories: 280,
      protein: 26,
      carbs: 32,
      fat: 4
    },
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'rec-cheesecake-light',
    title: 'Cheesecake Fredda Light ai Frutti di Bosco',
    type: 'fit',
    prepTime: 20,
    difficulty: 'Medio',
    equipment: ['Frullatore', 'Stampo a cerniera', 'Frigorifero'],
    ingredients: [
      '150g Yogurt greco 0%',
      '100g Ricotta light',
      '40g Biscotti integrali senza zucchero',
      '15g Burro fuso light',
      '2 fogli di Colla di pesce',
      '50g Frutti di bosco'
    ],
    instructions: [
      'Trita i biscotti nel frullatore e uniscili al burro fuso, compattando il tutto sul fondo dello stampo.',
      'Lascia rassodare la base in frigorifero per 10 minuti.',
      'Ammolla la colla di pesce in acqua fredda, poi strizzala e scioglila in 2 cucchiai di latte caldo.',
      'Mescola yogurt greco, ricotta e dolcificante, poi unisci la colla di pesce sciolta.',
      'Versa il composto sulla base e riponi in frigo per almeno 3 ore. Decora con frutti di bosco cotti a fuoco lento.'
    ],
    macros: {
      calories: 320,
      protein: 22,
      carbs: 28,
      fat: 8
    },
    imageUrl: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'rec-pizza-sgarro',
    title: 'Pizza Napoletana Fatta in Casa (Lo Sgarro Sacro)',
    type: 'sgarro',
    prepTime: 120,
    difficulty: 'Difficile',
    equipment: ['Forno statico', 'Ciotola capiente', 'Spianatoia'],
    ingredients: [
      '300g Farina tipo 00',
      '200ml Acqua tiepida',
      '2g Lievito di birra fresco',
      '8g Sale fino',
      '100g Mozzarella di bufala campana',
      '80g Passata di pomodoro',
      '1 cucchiaio di Olio extravergine d\'oliva',
      'Foglie di Basilico fresco'
    ],
    instructions: [
      'Sciogli il lievito nell\'acqua. Aggiungi metà farina, mescola, unisci il sale e poi il resto della farina.',
      'Impasta energicamente per 15 minuti finché non diventa liscio. Lascia lievitare per 8-24 ore.',
      'Stendi l\'impasto con le mani partendo dal centro verso il bordo per creare il cornicione.',
      'Condisci con passata di pomodoro, un filo d\'olio ed inforna alla massima temperatura (preferibilmente su pietra refrattaria).',
      'Aggiungi la mozzarella di bufala a metà cottura e basilico fresco all\'uscita dal forno.'
    ],
    macros: {
      calories: 890,
      protein: 34,
      carbs: 128,
      fat: 25
    },
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'rec-hamburger-completo',
    title: 'Double Smash Burger Cheeseburger',
    type: 'sgarro',
    prepTime: 25,
    difficulty: 'Medio',
    equipment: ['Piastra o Padella in ghisa', 'Spatola metallica robusta'],
    ingredients: [
      '1 Brioche Bun',
      '240g Carne macinata di manzo (20% grasso)',
      '2 fette di Formaggio Cheddar',
      '2 fette di Bacon croccante',
      '1 fetta di Pomodoro',
      '1 foglia di Lattuga',
      '10g Salsa Burger segreta (maionese, ketchup, senape)'
    ],
    instructions: [
      'Dividi la carne in due palline da 120g l\'una. Tosta il pane sulla piastra con un velo di burro.',
      'Scalda la piastra in ghisa al massimo. Adagia le polpette e schiacciale con la spatola fino a renderle sottilissime.',
      'Cuoci per 2 minuti per lato finché non si forma una crosticina scura. Sala e metti il cheddar su ciascun patty.',
      'Impila le due polpette con il cheddar sciolto una sull\'altra.',
      'Componi il panino spalmando la salsa alla base, poi lattuga, pomodoro, le polpette, il bacon croccante e chiudi.'
    ],
    macros: {
      calories: 950,
      protein: 52,
      carbs: 45,
      fat: 62
    },
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80'
  }
];
