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
    "id": "fit-01-pancake-avena",
    "title": "Pancake Proteici all'Avena (3 Ingredienti)",
    "type": "fit",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Ciotola",
      "Frusta a mano"
    ],
    "ingredients": [
      "120g Albume d'uovo",
      "40g Farina d'avena aromatizzata o neutra",
      "1 cucchiaino raso di Lievito per dolci"
    ],
    "instructions": [
      "Sbatti energicamente l'albume con la farina d'avena e il lievito fino ad ottenere una pastella liscia.",
      "Scalda una padella antiaderente a fiamma medio-bassa e versa metà impasto.",
      "Attendi la comparsa delle bollicine in superficie (circa 90 secondi), gira il pancake e cuoci altri 60 secondi.",
      "Ripeti per il secondo pancake e servi caldo."
    ],
    "macros": {
      "calories": 215,
      "protein": 21,
      "carbs": 26,
      "fat": 3
    },
    "imageUrl": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-02-mugcake-cacao",
    "title": "Mug Cake Proteica al Microonde al Cioccolato",
    "type": "fit",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Tazza da colazione (mug)",
      "Forno a Microonde",
      "Forchetta"
    ],
    "ingredients": [
      "1 Banana matura media",
      "1 Uovo intero",
      "15g Cacao amaro in polvere",
      "15g Proteine in polvere o farina d'avena"
    ],
    "instructions": [
      "In una tazza schiaccia accuratamente la banana con una forchetta fino a ridurla in purea.",
      "Aggiungi l'uovo, il cacao amaro e le proteine/avena, mescolando bene per non lasciare grumi.",
      "Cuoci nel microonde a 750W per circa 2 minuti fino a quando la tortina si gonfia.",
      "Lascia intiepidire 1 minuto e gusta direttamente dalla tazza con un cucchiaino."
    ],
    "macros": {
      "calories": 265,
      "protein": 22,
      "carbs": 32,
      "fat": 6
    },
    "imageUrl": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-03-overnight-oats",
    "title": "Overnight Oats Proteico ai Frutti di Bosco",
    "type": "fit",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Barattolo di vetro con coperchio",
      "Cucchiaio",
      "Frigorifero"
    ],
    "ingredients": [
      "50g Fiocchi d'avena baby",
      "100g Yogurt greco 0%",
      "100ml Bevanda di soia o mandorla senza zuccheri",
      "50g Mirtilli o frutti di bosco freschi"
    ],
    "instructions": [
      "Nel barattolo unisci i fiocchi d'avena, il latte vegetale e lo yogurt greco mescolando con cura.",
      "Chiudi ermeticamente e riponi in frigorifero per tutta la notte (almeno 6 ore).",
      "Al mattino l'avena avrà assorbito i liquidi diventando cremosa: guarnisci con i mirtilli freschi e servi freddo."
    ],
    "macros": {
      "calories": 310,
      "protein": 23,
      "carbs": 42,
      "fat": 5
    },
    "imageUrl": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-04-yogurt-burro-arachidi",
    "title": "Coppa Fit Yogurt Greco, Burro d'Arachidi & Cannella",
    "type": "fit",
    "prepTime": 3,
    "difficulty": "Facile",
    "equipment": [
      "Ciotola da dessert",
      "Cucchiaio"
    ],
    "ingredients": [
      "200g Yogurt greco 0% grassi",
      "20g Burro d'arachidi 100% naturale",
      "1 cucchiaino di Cannella in polvere",
      "Gocce di dolcificante stevia (opzionale)"
    ],
    "instructions": [
      "Versa lo yogurt greco in una ciotola.",
      "Scalda il burro d'arachidi per 10 secondi nel microonde per renderlo fluido e colalo a filo sopra lo yogurt.",
      "Spolvera generosamente con la cannella in polvere e gusta immediatamente."
    ],
    "macros": {
      "calories": 255,
      "protein": 26,
      "carbs": 9,
      "fat": 11
    },
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-05-porridge-banana-cacao",
    "title": "Porridge Caldo Cremoso Cacao e Banana",
    "type": "fit",
    "prepTime": 8,
    "difficulty": "Facile",
    "equipment": [
      "Pentolino antiaderente",
      "Cucchiaio di legno"
    ],
    "ingredients": [
      "45g Fiocchi d'avena",
      "180ml Acqua o latte scremato",
      "10g Cacao amaro in polvere",
      "1/2 Banana a fettine"
    ],
    "instructions": [
      "In un pentolino versa l'avena, il cacao e il liquido scelto.",
      "Cuoci a fiamma moderata mescolando continuamente per 4-5 minuti fino a consistenza densa e vellutata.",
      "Trasferisci in una ciotola e disponi in superficie le fettine di banana."
    ],
    "macros": {
      "calories": 240,
      "protein": 9,
      "carbs": 43,
      "fat": 4
    },
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-06-waffle-albume",
    "title": "Waffle Fit Croccanti all'Albume",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Piastra per waffle (o padella)",
      "Ciotola",
      "Frusta"
    ],
    "ingredients": [
      "100g Albume d'uovo pastorizzato",
      "35g Farina d'avena neutra",
      "1 pizzico di Bicarbonato o lievito",
      "Qualche goccia di aroma vaniglia"
    ],
    "instructions": [
      "Accendi la piastra per waffle per farla scaldare bene.",
      "In una ciotola unisci albume, farina d'avena, lievito e vaniglia mescolando energicamente.",
      "Spennella la piastra con un velo d'olio di cocco, versa la pastella e chiudi per circa 4 minuti finché dorato."
    ],
    "macros": {
      "calories": 185,
      "protein": 18,
      "carbs": 23,
      "fat": 2
    },
    "imageUrl": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-07-mousse-cioccolato-ricotta",
    "title": "Mousse Espressa Cioccolato & Ricotta Light",
    "type": "fit",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Ciotola",
      "Frusta o cucchiaio"
    ],
    "ingredients": [
      "150g Ricotta vaccina light",
      "15g Cacao amaro di qualità",
      "1 cucchiaino di Miele o sciroppo d'agave"
    ],
    "instructions": [
      "Lavora la ricotta in una ciotola con una frusta per renderla cremosa e setosa.",
      "Aggiungi il cacao amaro setacciato e il cucchiaino di miele.",
      "Mescola fino a completo assorbimento e riponi in frigo 10 minuti prima di servire."
    ],
    "macros": {
      "calories": 210,
      "protein": 16,
      "carbs": 14,
      "fat": 9
    },
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-08-chia-pudding-cocco",
    "title": "Chia Pudding al Latte di Cocco e Frutti Rossi",
    "type": "fit",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Bicchiere di vetro",
      "Cucchiaino",
      "Frigo"
    ],
    "ingredients": [
      "25g Semi di chia neri",
      "150ml Latte di cocco leggero o bevanda alla mandorla",
      "40g Lamponi o fragole fresche"
    ],
    "instructions": [
      "Versa i semi di chia nel bicchiere assieme al latte vegetale.",
      "Mescola bene per 1 minuto per evitare che i semi si depositino sul fondo.",
      "Lascia riposare in frigo almeno 3 ore (i semi formeranno un gel vellutato). Guarnisci con lamponi."
    ],
    "macros": {
      "calories": 195,
      "protein": 6,
      "carbs": 12,
      "fat": 12
    },
    "imageUrl": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-09-biscotti-banana-avena",
    "title": "Biscotti Fit 2 Ingredienti Senza Zucchero",
    "type": "fit",
    "prepTime": 18,
    "difficulty": "Facile",
    "equipment": [
      "Teglia da forno",
      "Carta da forno",
      "Ciotola"
    ],
    "ingredients": [
      "2 Banane mature",
      "100g Fiocchi d'avena integrali"
    ],
    "instructions": [
      "Preriscalda il forno a 180°C.",
      "Schiaccia le banane in una ciotola con una forchetta e incorpora i fiocchi d'avena fino a formare un composto sodo.",
      "Forma 6 dischetti con le mani e adagiali su una teglia rivestita di carta forno.",
      "Inforna per 12-14 minuti finché i bordi risultano dorati."
    ],
    "macros": {
      "calories": 130,
      "protein": 4,
      "carbs": 26,
      "fat": 2
    },
    "imageUrl": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-10-french-toast-fit",
    "title": "French Toast Proteico alla Cannella",
    "type": "fit",
    "prepTime": 8,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Piatto fondo",
      "Spatola"
    ],
    "ingredients": [
      "2 Fette di pane di segale o bauletto integrale (60g)",
      "100g Albume d'uovo",
      "1 cucchiaino di Cannella in polvere"
    ],
    "instructions": [
      "Sbatti l'albume con la cannella in un piatto fondo.",
      "Immergi ciascuna fetta di pane per 10 secondi per lato facendola ben impregnare.",
      "Cuoci su padella antiaderente rovente a fuoco medio per 2-3 minuti per lato finché dorato e croccante."
    ],
    "macros": {
      "calories": 205,
      "protein": 18,
      "carbs": 28,
      "fat": 2
    },
    "imageUrl": "https://images.unsplash.com/photo-1484723091739-0045615eb40f?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-11-protein-fluff-frutti-bosco",
    "title": "Protein Fluff Soffice ai Frutti di Bosco",
    "type": "fit",
    "prepTime": 6,
    "difficulty": "Facile",
    "equipment": [
      "Sbattitore elettrico con fruste",
      "Ciotola capiente"
    ],
    "ingredients": [
      "150g Frutti di bosco surgelati",
      "30g Proteine whey o isolate alla vaniglia",
      "50ml Latte parzialmente scremato o vegetale freddissimo"
    ],
    "instructions": [
      "Frulla brevemente i frutti di bosco congelati nel mixer con il latte per sminuzzarli.",
      "Aggiungi le proteine in polvere nella ciotola con le fruste elettriche.",
      "Monta ad alta velocità per 4 minuti: il volume quadruplicherà diventando una nuvola soffice come gelato."
    ],
    "macros": {
      "calories": 210,
      "protein": 28,
      "carbs": 18,
      "fat": 2
    },
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-12-crepes-albume-avena",
    "title": "Crepes Leggere di Solo Albume e Avena",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Crepiera o padella larga",
      "Frusta a mano"
    ],
    "ingredients": [
      "120g Albume d'uovo",
      "30g Farina d'avena",
      "30ml Acqua"
    ],
    "instructions": [
      "Mescola l'albume con la farina e l'acqua fino a formare una pastella fluida.",
      "Ungi leggermente una padella larga e scaldala a fuoco medio.",
      "Versa l'impasto ruotando la padella per stenderlo sottile. Cuoci 1 minuto per lato.",
      "Farcisci a piacere con ricotta magra o frutta fresca."
    ],
    "macros": {
      "calories": 170,
      "protein": 17,
      "carbs": 20,
      "fat": 2
    },
    "imageUrl": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-13-yogurt-noci-miele",
    "title": "Bowl Greca con Noci del Brasile e Miele",
    "type": "fit",
    "prepTime": 2,
    "difficulty": "Facile",
    "equipment": [
      "Ciotola",
      "Cucchiaio"
    ],
    "ingredients": [
      "180g Yogurt greco autentico 0% grassi",
      "15g Noci sgusciate",
      "1 cucchiaino di Miele biologico"
    ],
    "instructions": [
      "Disponi lo yogurt greco denso al centro della ciotola.",
      "Sbriciola grossolanamente le noci con le mani in superficie.",
      "Completa colando il filo di miele e gusta subito."
    ],
    "macros": {
      "calories": 235,
      "protein": 20,
      "carbs": 12,
      "fat": 10
    },
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-14-barrette-avena-burro-arachidi",
    "title": "Barrette Proteiche No-Bake Avena e Arachidi",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Ciotola",
      "Stampo rettangolare",
      "Frigorifero"
    ],
    "ingredients": [
      "100g Fiocchi d'avena",
      "60g Burro d'arachidi naturale",
      "30g Miele o sciroppo d'acero",
      "15g Gocce di cioccolato fondente 85%"
    ],
    "instructions": [
      "In una ciotola ammorbidisci il burro d'arachidi con il miele.",
      "Unisci l'avena e le gocce di cioccolato, compattando il composto con il dorso di un cucchiaio.",
      "Stendi l'impasto nello stampo foderato di carta forno e lascia solidificare in freezer per 30 minuti.",
      "Taglia in 4 barrette pronte per lo snack."
    ],
    "macros": {
      "calories": 240,
      "protein": 8,
      "carbs": 28,
      "fat": 11
    },
    "imageUrl": "https://images.unsplash.com/photo-1622484216802-995a5f4d8961?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-15-pollo-limone-rosmarino",
    "title": "Petto di Pollo Scottato al Limone e Rosmarino",
    "type": "fit",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Pinza da cucina",
      "Spremiagrumi"
    ],
    "ingredients": [
      "200g Petto di pollo a fette",
      "1 Limone biologico (succo e scorza)",
      "1 rametto di Rosmarino fresco",
      "1 cucchiaino di Olio extravergine d'oliva"
    ],
    "instructions": [
      "Scalda la padella con il cucchiaino di olio e gli aghi di rosmarino.",
      "Adagia il petto di pollo e scotta a fiamma vivace per 3 minuti per lato.",
      "Versa il succo di limone nella padella, copri e lascia sfumare per 2 minuti creando un sughetto cremoso.",
      "Regola di sale e pepe e servi subito."
    ],
    "macros": {
      "calories": 260,
      "protein": 46,
      "carbs": 2,
      "fat": 7
    },
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-16-salmone-zucchine-airfryer",
    "title": "Trancio di Salmone con Zucchine in Friggitrice ad Aria",
    "type": "fit",
    "prepTime": 14,
    "difficulty": "Facile",
    "equipment": [
      "Friggitrice ad aria (o Forno)",
      "Tagliere"
    ],
    "ingredients": [
      "180g Filetto di salmone fresco",
      "1 Zucchina media a rondelle",
      "1 cucchiaino di Olio EVO, sale e pepe rosa"
    ],
    "instructions": [
      "Condisci le rondelle di zucchina con il cucchiaino di olio, sale e pepe.",
      "Posiziona il trancio di salmone e le zucchine nel cestello della friggitrice ad aria.",
      "Cuoci a 180°C per 12-14 minuti fino a quando la crosticina del salmone risulta croccante e la polpa morbida."
    ],
    "macros": {
      "calories": 380,
      "protein": 36,
      "carbs": 4,
      "fat": 22
    },
    "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-17-omelette-spinaci",
    "title": "Omelette Proteica agli Spinaci Baby",
    "type": "fit",
    "prepTime": 8,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Ciotola",
      "Forchetta"
    ],
    "ingredients": [
      "1 Uovo intero",
      "100g Albume d'uovo",
      "50g Spinacino fresco da insalata",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "Fai appassire gli spinaci in padella con una goccia d'olio per 1 minuto.",
      "Sbatti l'uovo intero con l'albume, un pizzico di sale e pepe.",
      "Versa le uova sopra gli spinaci, copri con un coperchio a fiamma dolce per 3 minuti, quindi piega a mezzaluna."
    ],
    "macros": {
      "calories": 175,
      "protein": 20,
      "carbs": 2,
      "fat": 8
    },
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-18-polpette-tonno-ricotta",
    "title": "Polpettine di Tonno e Ricotta al Forno (4 Ingredienti)",
    "type": "fit",
    "prepTime": 20,
    "difficulty": "Facile",
    "equipment": [
      "Teglia da forno",
      "Ciotola",
      "Carta forno"
    ],
    "ingredients": [
      "160g Tonno al naturale sgocciolato",
      "100g Ricotta vaccina magra",
      "1 Uovo intero",
      "30g Pangrattato integrale"
    ],
    "instructions": [
      "In una ciotola unisci il tonno ben strizzato, la ricotta, l'uovo e un pizzico di sale.",
      "Impasta con le mani e forma delle polpettine grandi come una noce, rotolandole nel pangrattato.",
      "Disponi su una teglia e inforna a 190°C per 15 minuti finché sono dorate e croccanti esternamente."
    ],
    "macros": {
      "calories": 340,
      "protein": 45,
      "carbs": 18,
      "fat": 9
    },
    "imageUrl": "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-19-bowl-basmati-pollo-avocado",
    "title": "Fit Bowl con Riso Basmati, Pollo e Avocado",
    "type": "fit",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Pentolino",
      "Padella",
      "Bowl capiente"
    ],
    "ingredients": [
      "60g Riso Basmati",
      "150g Petto di pollo a bocconcini",
      "40g Avocado a fettine",
      "1 cucchiaino di Salsa di soia a basso contenuto di sodio"
    ],
    "instructions": [
      "Lessa il riso basmati in acqua salata per 10 minuti e scolalo.",
      "Scotta i bocconcini di pollo in padella antiaderente rovente per 5 minuti fino a doratura.",
      "Componi la bowl disponendo il riso, il pollo caldo e l'avocado a ventaglio, terminando con la salsa di soia."
    ],
    "macros": {
      "calories": 430,
      "protein": 39,
      "carbs": 50,
      "fat": 8
    },
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-20-spaghetti-zucchine-gamberi",
    "title": "Zoodles (Spaghetti di Zucchine) con Gamberi e Lime",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Spiralizzatore per verdure o pelapatate",
      "Padella"
    ],
    "ingredients": [
      "2 Zucchine medie spiralizzate",
      "150g Code di gamberi sgusciate",
      "1 spicchio d'Aglio",
      "Succo di 1/2 Lime e 1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "In una padella rosola l'aglio con l'olio, aggiungi i gamberi e cuoci per 2-3 minuti.",
      "Unisci gli spaghetti di zucchine a crudo e salta tutto insieme a fiamma vivace per soli 2 minuti.",
      "Spremi il succo di lime fresco e servi subito con verdure croccanti al dente."
    ],
    "macros": {
      "calories": 210,
      "protein": 32,
      "carbs": 8,
      "fat": 6
    },
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-21-tagliata-manzo-rucola-grana",
    "title": "Tagliata di Manzo con Rucola e Scaglie di Grana",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Bisteccaia o padella in ghisa",
      "Tagliere",
      "Coltello affilato"
    ],
    "ingredients": [
      "200g Taglio magro di manzo (controfiletto o noce)",
      "40g Rucola fresca",
      "20g Grana Padano o Parmigiano a scaglie",
      "1 cucchiaino di Olio EVO e gocce di glassa balsamica"
    ],
    "instructions": [
      "Scalda la piastra in ghisa al punto di fumo.",
      "Cuoci la carne per 2 minuti per lato per una cottura media al sangue.",
      "Fai riposare la carne 2 minuti sul tagliere, affettala a striscioline oblique e servila su un letto di rucola e scaglie di grana."
    ],
    "macros": {
      "calories": 340,
      "protein": 48,
      "carbs": 2,
      "fat": 15
    },
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-22-merluzzo-pomodoro-origano",
    "title": "Cuori di Merluzzo alla Mediterranea",
    "type": "fit",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Padella con coperchio",
      "Cucchiaio"
    ],
    "ingredients": [
      "200g Filetti di merluzzo",
      "120g Polpa di pomodoro fine",
      "1 cucchiaino di Capperi dissalati",
      "Origano secco e 1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "In una padella versa la polpa di pomodoro, i capperi e un filo d'olio.",
      "Adagia i cuori di merluzzo nella salsa e cospargi con abbondante origano.",
      "Copri con coperchio e lascia cuocere a fuoco lento per 10-12 minuti finché il pesce si sfalda teneramente."
    ],
    "macros": {
      "calories": 215,
      "protein": 38,
      "carbs": 5,
      "fat": 5
    },
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-23-wrap-tacchino-hummus",
    "title": "Wrap Integrale Veloce Tacchino ed Hummus",
    "type": "fit",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Padella per scaldare il wrap",
      "Tagliere"
    ],
    "ingredients": [
      "1 Piadina o tortilla 100% integrale (60g)",
      "80g Fesa di tacchino al naturale affettata",
      "30g Hummus di ceci",
      "Qualche foglia di insalata croccante o spinacino"
    ],
    "instructions": [
      "Scalda la piadina 30 secondi per lato su padella calda per renderla flessibile.",
      "Spalma l'hummus al centro della piadina.",
      "Aggiungi la fesa di tacchino e le foglie di insalata, arrotola stretto e taglia a metà in diagonale."
    ],
    "macros": {
      "calories": 290,
      "protein": 26,
      "carbs": 32,
      "fat": 6
    },
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-24-insalata-ceci-tonno-cipolla",
    "title": "Insalata Rustica di Ceci, Tonno e Cipolla Rossa",
    "type": "fit",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Ciotola capiente",
      "Scolapasta"
    ],
    "ingredients": [
      "150g Ceci cotti in barattolo (sciacquati)",
      "110g Tonno al naturale sgocciolato",
      "1/4 di Cipolla rossa di Tropea a fettine sottili",
      "1 cucchiaino di Olio EVO e prezzemolo"
    ],
    "instructions": [
      "Sciacqua bene i ceci sotto l'acqua fredda e trasferiscili in una ciotola.",
      "Unisci il tonno sgranato e la cipolla rossa affettata sottilmente.",
      "Condisci con il cucchiaino di olio, un pizzico di sale e prezzemolo fresco, mescola e gusta subito."
    ],
    "macros": {
      "calories": 345,
      "protein": 37,
      "carbs": 32,
      "fat": 7
    },
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-25-vellutata-zucca-carote",
    "title": "Vellutata Detox Zucca e Carote al Rosmarino",
    "type": "fit",
    "prepTime": 20,
    "difficulty": "Facile",
    "equipment": [
      "Pentola",
      "Frullatore ad immersione (minipimer)"
    ],
    "ingredients": [
      "250g Zucca mondata a cubetti",
      "150g Carote a rondelle",
      "250ml Brodo vegetale leggero",
      "1 cucchiaino di Olio EVO e rosmarino"
    ],
    "instructions": [
      "Metti zucca e carote in una pentola con il brodo caldo e il rametto di rosmarino.",
      "Cuoci con coperchio per 15 minuti finché le verdure sono morbidissime.",
      "Rimuovi il rosmarino, frulla con il minipimer fino a crema densa e vellutata e rifinisci con un filo d'olio a crudo."
    ],
    "macros": {
      "calories": 155,
      "protein": 4,
      "carbs": 28,
      "fat": 4
    },
    "imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-26-riso-venere-salmone-zucchine",
    "title": "Riso Venere Nero con Salmone e Zucchine Saltate",
    "type": "fit",
    "prepTime": 20,
    "difficulty": "Facile",
    "equipment": [
      "Pentolino",
      "Padella antiaderente"
    ],
    "ingredients": [
      "60g Riso Venere integrale",
      "120g Salmone fresco a cubetti",
      "1 Zucchina piccola a cubetti",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "Lessa il riso venere per circa 18 minuti e scolalo.",
      "In padella scotta i dadini di salmone e le zucchine con un cucchiaino d'olio per 5 minuti.",
      "Unisci il riso nero in padella, salta a fiamma vivace per 1 minuto e servi profumato."
    ],
    "macros": {
      "calories": 430,
      "protein": 30,
      "carbs": 46,
      "fat": 14
    },
    "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-27-uova-strapazzate-pomodorini",
    "title": "Uova Strapazzate Morbide con Pomodorini Datterini",
    "type": "fit",
    "prepTime": 7,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Spatola in silicone",
      "Ciotolina"
    ],
    "ingredients": [
      "2 Uova intere + 50g Albume",
      "6 Pomodorini datterini a metà",
      "Qualche foglia di Basilico fresco",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "In una padella calda fai appassire i datterini nell'olio per 2 minuti schiacciandoli leggermente.",
      "Sbatti uova e albume con un pizzico di sale e versali nella padella a fuoco medio-basso.",
      "Muovi costantemente con la spatola per 2 minuti creando fiocchi morbidi e cremosi. Spegni e unisci il basilico."
    ],
    "macros": {
      "calories": 230,
      "protein": 21,
      "carbs": 4,
      "fat": 14
    },
    "imageUrl": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-28-tartare-salmone-avocado",
    "title": "Tartare di Salmone Fresco, Avocado e Lime",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Tagliere",
      "Coltello affilato",
      "Coppapasta (opzionale)"
    ],
    "ingredients": [
      "150g Filetto di salmone abbattuto per crudo",
      "50g Avocado maturo a cubetti",
      "Succo di 1/2 Lime e semi di sesamo"
    ],
    "instructions": [
      "Taglia il salmone e l'avocado a piccoli cubetti regolari con un coltello ben affilato.",
      "Condisci il salmone in una ciotola con succo di lime, un pizzico di sale e semi di sesamo.",
      "Impiatta con un coppapasta posizionando la base di avocado e sopra la tartare di salmone marinato."
    ],
    "macros": {
      "calories": 335,
      "protein": 31,
      "carbs": 4,
      "fat": 22
    },
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-29-tartare-manzo-limone",
    "title": "Battuta al Coltello di Manzo con Limone ed Erba Cipollina",
    "type": "fit",
    "prepTime": 8,
    "difficulty": "Facile",
    "equipment": [
      "Tagliere",
      "Coltello da chef"
    ],
    "ingredients": [
      "180g Scamone o fesa di manzo freschissima di prima scelta",
      "1 cucchiaino di Olio EVO",
      "Succo di 1/3 di Limone fresco",
      "Fili di Erba cipollina fresca tagliuzzata"
    ],
    "instructions": [
      "Batti la carne al coltello finemente senza sfilacciarla.",
      "Condisci al momento con il cucchiaino di olio EVO, fior di sale, pepe nero macinato fresco e il succo di limone.",
      "Mescola con una forchetta, decora con erba cipollina e gusta fredda."
    ],
    "macros": {
      "calories": 250,
      "protein": 40,
      "carbs": 0,
      "fat": 9
    },
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-30-pasta-integrale-tonno-limone",
    "title": "Spaghetti Integrali Espresso Tonno e Limone",
    "type": "fit",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Pentola",
      "Padella per saltare",
      "Grattugia"
    ],
    "ingredients": [
      "70g Spaghetti integrali",
      "100g Tonno al naturale sgocciolato",
      "Scorza e succo di 1/2 Limone biologico",
      "1 cucchiaino di Olio EVO e prezzemolo"
    ],
    "instructions": [
      "Lessa la pasta in abbondante acqua salata.",
      "In una padella intiepidisci il tonno al naturale con il cucchiaino d'olio e 2 cucchiai di acqua di cottura della pasta.",
      "Scola gli spaghetti al dente direttamente in padella, manteca a fuoco spento con succo e scorza di limone e prezzemolo."
    ],
    "macros": {
      "calories": 360,
      "protein": 32,
      "carbs": 48,
      "fat": 5
    },
    "imageUrl": "https://images.unsplash.com/photo-1621996346565-e3d5d628169e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-31-bocconcini-pollo-curry",
    "title": "Bocconcini di Pollo al Curry Leggero (3 Ingredienti)",
    "type": "fit",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Cucchiaio di legno"
    ],
    "ingredients": [
      "200g Petto di pollo a dadini",
      "1 cucchiaio colmo di Polvere di Curry dolce",
      "60ml Latte parzialmente scremato o latte di cocco light",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "Scalda la padella con l'olio e rosola i bocconcini di pollo per 4 minuti a fuoco vivo.",
      "Sciogli il curry nel latte e versalo sopra il pollo.",
      "Abbassa la fiamma e lascia cuocere 3 minuti finché il liquido si restringe in una deliziosa cremina speziata."
    ],
    "macros": {
      "calories": 285,
      "protein": 47,
      "carbs": 3,
      "fat": 9
    },
    "imageUrl": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-32-burger-lenticchie",
    "title": "Burger Vegano di Lenticchie e Avena",
    "type": "fit",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Mixer o forchetta",
      "Padella antiaderente"
    ],
    "ingredients": [
      "200g Lenticchie lesse ben scolate",
      "30g Farina d'avena",
      "1 cucchiaino di Paprika dolce e rosmarino tritato"
    ],
    "instructions": [
      "Schiaccia le lenticchie con una forchetta lasciando qualche pezzo intero per la consistenza.",
      "Unisci la farina d'avena e le spezie, impastando fino a formare un burger compatto.",
      "Cuoci su padella calda con un velo d'olio per 4 minuti per lato finché dorato e croccante."
    ],
    "macros": {
      "calories": 250,
      "protein": 17,
      "carbs": 38,
      "fat": 3
    },
    "imageUrl": "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-33-shakshuka-fit",
    "title": "Shakshuka Fit: Uova in Purgatorio al Pomodoro",
    "type": "fit",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente con coperchio",
      "Cucchiaio"
    ],
    "ingredients": [
      "2 Uova fresche medie",
      "180g Polpa o passata di pomodoro rustica",
      "1 spicchio d'Aglio e peperoncino a piacere",
      "Origano fresco"
    ],
    "instructions": [
      "In una padella scalda l'aglio e aggiungi la passata di pomodoro con un pizzico di sale e origano per 4 minuti.",
      "Crea due piccoli incavi nella salsa col cucchiaio e sgusciaci dentro le due uova.",
      "Copri con il coperchio e lascia cuocere a fuoco dolce per 4-5 minuti finché l'albume è sodo e il tuorlo morbido."
    ],
    "macros": {
      "calories": 195,
      "protein": 15,
      "carbs": 10,
      "fat": 10
    },
    "imageUrl": "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-34-insalata-greca-light",
    "title": "Insalata Greca Fit con Feta Light e Cetrioli",
    "type": "fit",
    "prepTime": 6,
    "difficulty": "Facile",
    "equipment": [
      "Insalatiera",
      "Coltello"
    ],
    "ingredients": [
      "80g Feta DOP in versione Light (12% grassi)",
      "1 Cetriolo medio sbucciato a rondelle",
      "100g Pomodori da insalata a spicchi",
      "1 cucchiaino di Olio EVO e origano secco"
    ],
    "instructions": [
      "Taglia il cetriolo e i pomodori e riponili nell'insalatiera.",
      "Taglia la feta light a cubetti e aggiungila sopra le verdure.",
      "Condisci con il cucchiaino di olio EVO, una spolverata generosa di origano e servi fresco e dissetante."
    ],
    "macros": {
      "calories": 230,
      "protein": 17,
      "carbs": 9,
      "fat": 14
    },
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-35-pollo-patate-dolci",
    "title": "Bocconcini di Pollo e Patate Dolci alla Paprika",
    "type": "fit",
    "prepTime": 20,
    "difficulty": "Facile",
    "equipment": [
      "Friggitrice ad aria o Teglia da forno"
    ],
    "ingredients": [
      "180g Petto di pollo a tocchetti",
      "120g Patata dolce americana a cubetti",
      "1 cucchiaino di Paprika dolce o affumicata",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "Taglia pollo e patata dolce a cubi di dimensioni simili.",
      "Mescola in una ciotola con l'olio, la paprika e un pizzico di sale.",
      "Cuoci in airfryer a 190°C per 16 minuti scuotendo il cestello a metà cottura."
    ],
    "macros": {
      "calories": 330,
      "protein": 42,
      "carbs": 26,
      "fat": 6
    },
    "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-36-hummus-ceci-espresso",
    "title": "Hummus Veloce di Ceci Fatto in Casa (4 Ingredienti)",
    "type": "fit",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Mixer o frullatore"
    ],
    "ingredients": [
      "200g Ceci cotti in barattolo (sciacquati)",
      "15g Tahina (pasta di sesamo)",
      "Succo di 1/2 Limone",
      "1 cucchiaino di Olio EVO e 30ml acqua fredda"
    ],
    "instructions": [
      "Metti tutti gli ingredienti nel bicchiere del mixer.",
      "Frulla per 2 minuti ad alta velocità aggiungendo l'acqua fredda poco alla volta fino a renderlo liscio e spumoso.",
      "Servi con bastoncini di carota o crostini di segale."
    ],
    "macros": {
      "calories": 295,
      "protein": 14,
      "carbs": 32,
      "fat": 12
    },
    "imageUrl": "https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-37-tortino-patate-tonno",
    "title": "Tortino Espresso Patate Schiacciate e Tonno",
    "type": "fit",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Forchetta"
    ],
    "ingredients": [
      "150g Patata precedentemente lessata",
      "100g Tonno al naturale",
      "1 Uovo intero",
      "Prezzemolo tritato e sale"
    ],
    "instructions": [
      "Schiaccia la patata lessa con la forchetta assieme al tonno e all'uovo fino a creare una pasta densa.",
      "Scalda la padella con un velo d'olio e versa il composto schiacciandolo a forma di rosti/frittella spessa.",
      "Cuoci a fiamma media 4 minuti per lato finché crea una crosticina dorata."
    ],
    "macros": {
      "calories": 290,
      "protein": 34,
      "carbs": 26,
      "fat": 6
    },
    "imageUrl": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-38-bistecca-cavolfiore",
    "title": "Steak di Cavolfiore Arrostita alle Spezie",
    "type": "fit",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Padella in ghisa o Forno"
    ],
    "ingredients": [
      "2 Fette spesse di cavolfiore intero (250g)",
      "1 cucchiaino di Olio EVO",
      "1/2 cucchiaino di Curcuma e paprika affumicata",
      "Sale grosso"
    ],
    "instructions": [
      "Spennella le bistecche di cavolfiore con l'olio miscelato alle spezie.",
      "Adagia su piastra caldissima e cuoci 6 minuti per lato con un coperchio per far ammorbidire l'interno.",
      "Servi ben abbrustolito come contorno o piatto leggero ad altissimo potere saziante."
    ],
    "macros": {
      "calories": 95,
      "protein": 5,
      "carbs": 11,
      "fat": 4
    },
    "imageUrl": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-39-spiedini-pollo-peperoni",
    "title": "Spiedini di Pollo e Peperoni Grigliati",
    "type": "fit",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Spiedini di legno",
      "Bisteccaia o Piastra"
    ],
    "ingredients": [
      "200g Petto di pollo a cubotti",
      "1 Peperone rosso a quadretti",
      "1 cucchiaino di Olio EVO e origano"
    ],
    "instructions": [
      "Infila negli spiedini alternando bocconcini di pollo e falde di peperone.",
      "Spennella con l'olio ed erbe aromatiche.",
      "Griglia su piastra rovente per 10 minuti ruotando su tutti e 4 i lati finché il pollo è ben cotto."
    ],
    "macros": {
      "calories": 260,
      "protein": 46,
      "carbs": 6,
      "fat": 6
    },
    "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-40-straccetti-vitello-rucola",
    "title": "Straccetti di Manzo Magro con Rucola Saltata",
    "type": "fit",
    "prepTime": 8,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Pinza"
    ],
    "ingredients": [
      "180g Straccetti di vitellone magro",
      "50g Rucola fresca",
      "1 cucchiaino di Olio EVO e gocce di aceto balsamico"
    ],
    "instructions": [
      "Scalda la padella a fiamma altissima con l'olio.",
      "Butta gli straccetti e salta velocemente per soli 2 minuti affinché rimangano teneri e succosi.",
      "Spegni il fuoco, butta la rucola che appassirà col calore residuo, spruzza con aceto balsamico e servi."
    ],
    "macros": {
      "calories": 245,
      "protein": 39,
      "carbs": 1,
      "fat": 9
    },
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-41-gamberi-zenzero-limone",
    "title": "Gamberi al Vapore con Zenzero Fresco e Limone",
    "type": "fit",
    "prepTime": 8,
    "difficulty": "Facile",
    "equipment": [
      "Cestello per vapore o Padella",
      "Tagliere"
    ],
    "ingredients": [
      "200g Gamberoni o code di gambero",
      "1 radice di Zenzero fresco a fettine",
      "1 Limone a rondelle",
      "Un pizzico di sale e prezzemolo"
    ],
    "instructions": [
      "Disponi i gamberi nel cestello sopra le fette di limone e lo zenzero.",
      "Cuoci a vapore per circa 4-5 minuti finché diventano opachi e rosati.",
      "Condisci con il succo di limone fresco e gusta subito leggeri e profumatissimi."
    ],
    "macros": {
      "calories": 170,
      "protein": 36,
      "carbs": 2,
      "fat": 2
    },
    "imageUrl": "https://images.unsplash.com/photo-1559742811-822863cb4cb7?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-42-piadina-avena-bresaola",
    "title": "Piadina Fit all'Avena con Bresaola e Rucola",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Ciotola"
    ],
    "ingredients": [
      "45g Farina d'avena istantanea",
      "80ml Acqua tiepida e pizzico di sale",
      "60g Bresaola della Valtellina IGP",
      "Un ciuffo di Rucola"
    ],
    "instructions": [
      "Mescola farina d'avena, acqua e sale fino a una pastella omogenea.",
      "Versa in padella calda stendendo a disco e cuoci 2 minuti per lato.",
      "Farcisci con bresaola e rucola fresca, piega a portafoglio e gusta croccante."
    ],
    "macros": {
      "calories": 260,
      "protein": 29,
      "carbs": 28,
      "fat": 4
    },
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-43-tofu-croccante-airfryer",
    "title": "Tofu Croccante alla Soia in Friggitrice ad Aria",
    "type": "fit",
    "prepTime": 14,
    "difficulty": "Facile",
    "equipment": [
      "Friggitrice ad aria",
      "Ciotola"
    ],
    "ingredients": [
      "180g Tofu al naturale compatto",
      "1 cucchiaio di Salsa di soia a basso sale",
      "1 cucchiaino di Amido di mais (maizena)"
    ],
    "instructions": [
      "Asciuga il tofu con carta assorbente e taglialo a cubetti da 1.5cm.",
      "Mescola con la soia e spolvera con la maizena (che creerà la crosta croccante).",
      "Cuoci in airfryer a 200°C per 12 minuti scuotendo a metà cottura."
    ],
    "macros": {
      "calories": 235,
      "protein": 26,
      "carbs": 6,
      "fat": 12
    },
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-44-mini-frittatine-piselli",
    "title": "Muffin di Frittata con Piselli ed Albume",
    "type": "fit",
    "prepTime": 18,
    "difficulty": "Facile",
    "equipment": [
      "Stampo per muffin in silicone",
      "Forno o Friggitrice ad aria"
    ],
    "ingredients": [
      "150g Albume d'uovo",
      "1 Uovo intero",
      "60g Piselli fini cotti a vapore",
      "15g Parmigiano grattugiato"
    ],
    "instructions": [
      "Sbatti albume, uovo, sale e parmigiano.",
      "Distribuisci i piselli nei pirottini per muffin e versa il composto d'uovo sopra.",
      "Inforna a 180°C per 15 minuti finché sono gonfi e dorati."
    ],
    "macros": {
      "calories": 225,
      "protein": 25,
      "carbs": 9,
      "fat": 9
    },
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-45-calamari-piastra-prezzemolo",
    "title": "Calamari Grigliati al Salmoriglio di Limone",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Bisteccaia o padella in ghisa"
    ],
    "ingredients": [
      "220g Calamari freschi puliti",
      "Succo di 1 Limone ed erbe fresche (prezzemolo, aglio)",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "Incidi la superficie dei calamari a griglia senza tagliarli del tutto.",
      "Cuoci su piastra caldissima per 2 minuti per lato (non di più per non indurirli).",
      "Irrora con l'emulsione di limone, aglio tritato, prezzemolo e olio."
    ],
    "macros": {
      "calories": 220,
      "protein": 38,
      "carbs": 3,
      "fat": 6
    },
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-46-couscous-verdure-pollo",
    "title": "Cous Cous Veloce con Pollo e Zucchine",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Ciotola con piattino per coprire",
      "Padella"
    ],
    "ingredients": [
      "60g Cous cous precotto",
      "120g Bocconcini di petto di pollo",
      "1 Zucchina piccola grattugiata a fori larghi",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "Versa il cous cous in una ciotola con 70ml di acqua bollente salata, copri e lascia gonfiare per 5 minuti.",
      "In padella cuoci il pollo e la zucchina grattugiata con l'olio per 5 minuti.",
      "Sgrana il cous cous con una forchetta, unisci il pollo e mescola."
    ],
    "macros": {
      "calories": 375,
      "protein": 36,
      "carbs": 46,
      "fat": 5
    },
    "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-47-fusi-pollo-airfryer",
    "title": "Fusi di Pollo Senza Pelle Croccanti alle Spezie",
    "type": "fit",
    "prepTime": 22,
    "difficulty": "Facile",
    "equipment": [
      "Friggitrice ad aria"
    ],
    "ingredients": [
      "2 Fusi di pollo spellati (circa 250g crudi)",
      "1 cucchiaino di Rosmarino tritato, aglio in polvere e paprika",
      "Sale grosso"
    ],
    "instructions": [
      "Massaggia i fusi di pollo asciutti con le spezie e il sale.",
      "Disponi nel cestello dell'airfryer a 195°C.",
      "Cuoci per 20 minuti girandoli a metà cottura fino a formare una crosticina deliziosa senza grassi aggiunti."
    ],
    "macros": {
      "calories": 290,
      "protein": 44,
      "carbs": 1,
      "fat": 12
    },
    "imageUrl": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-48-poke-salmone-edamame",
    "title": "Mini Poke Bowl Salmone, Riso ed Edamame",
    "type": "fit",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Pentolino",
      "Bowl"
    ],
    "ingredients": [
      "50g Riso per sushi o Basmati",
      "100g Salmone crudo abbattuto a cubi",
      "40g Edamame sgranati cotti a vapore",
      "1 cucchiaino di Salsa di soia e semi di sesamo"
    ],
    "instructions": [
      "Cuoci il riso e lascialo intiepidire.",
      "Disponi il riso nella ciotola, affianca il salmone fresco e gli edamame verdi.",
      "Condisci con soia e una pioggia di sesamo tostato."
    ],
    "macros": {
      "calories": 380,
      "protein": 32,
      "carbs": 42,
      "fat": 10
    },
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-49-crema-ricotta-mirtilli",
    "title": "Crema di Ricotta Soffice ai Mirtilli Caldi",
    "type": "fit",
    "prepTime": 4,
    "difficulty": "Facile",
    "equipment": [
      "Ciotolina",
      "Microonde"
    ],
    "ingredients": [
      "160g Ricotta vaccina fresca",
      "60g Mirtilli freschi o surgelati",
      "Scorza grattugiata di Limone"
    ],
    "instructions": [
      "Scalda i mirtilli al microonde per 40 secondi finché rilasciano il loro succo naturale.",
      "Lavora la ricotta con la scorza di limone fino a renderla spumosa.",
      "Versa i mirtilli caldi sulla ricotta creando un contrasto caldo-freddo favoloso."
    ],
    "macros": {
      "calories": 215,
      "protein": 14,
      "carbs": 14,
      "fat": 11
    },
    "imageUrl": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-50-bocconcini-tacchino-salvia",
    "title": "Bocconcini di Tacchino alla Salvia e Vino Bianco",
    "type": "fit",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Cucchiaio"
    ],
    "ingredients": [
      "200g Fesa di tacchino a bocconcini",
      "5 Foglie di Salvia fresca",
      "40ml Vino bianco secco per sfumare",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "In padella rosola il tacchino con le foglie di salvia e l'olio a fiamma viva per 3 minuti.",
      "Sfuma con il vino bianco lasciando evaporare l'alcol per 2 minuti creando un delizioso fondo di cottura.",
      "Regola di sale e pepe e servi tenerissimo."
    ],
    "macros": {
      "calories": 250,
      "protein": 48,
      "carbs": 1,
      "fat": 5
    },
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-51-vellutata-zucchine-menta",
    "title": "Vellutata Fredda o Calda Zucchine e Menta",
    "type": "fit",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Pentola",
      "Minipimer"
    ],
    "ingredients": [
      "350g Zucchine verdi a pezzi",
      "50g Formaggio fresco spalmabile light o yogurt greco",
      "Foglioline di Menta fresca",
      "1 cucchiaino di Olio EVO"
    ],
    "instructions": [
      "Cuoci le zucchine in 200ml di acqua salata per 8 minuti.",
      "Aggiungi il formaggio spalmabile light, la menta e frulla finemente fino ad ottenere una vellutata verde brillante.",
      "Rifinisci con un filo d'olio a crudo."
    ],
    "macros": {
      "calories": 140,
      "protein": 7,
      "carbs": 12,
      "fat": 7
    },
    "imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "fit-52-avocado-egg-boat",
    "title": "Barchetta di Avocado al Forno con Uovo",
    "type": "fit",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Teglia da forno o Airfryer"
    ],
    "ingredients": [
      "1/2 Avocado maturo scavato leggermente al centro",
      "1 Uovo medio",
      "Sale, pepe e fiocchi di peperoncino"
    ],
    "instructions": [
      "Adagia il mezzo avocado in una teglietta in modo che rimanga stabile.",
      "Rompi l'uovo direttamente nella cavità dell'avocado.",
      "Inforna a 190°C (o airfryer a 180°C) per 12-14 minuti finché l'albume è rappreso e il tuorlo cremoso."
    ],
    "macros": {
      "calories": 230,
      "protein": 9,
      "carbs": 6,
      "fat": 20
    },
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-01-smash-burger",
    "title": "Double Smash Cheeseburger con Bacon Croccante",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Piastra in ghisa o padella pesante",
      "Spatola robusta metallica"
    ],
    "ingredients": [
      "1 Brioche bun per hamburger",
      "200g Macinato di manzo (80/20)",
      "2 fette di Formaggio Cheddar",
      "2 fette di Bacon affumicato"
    ],
    "instructions": [
      "Tosta le due metà del bun sulla piastra calda con un velo di burro.",
      "Forma due polpette da 100g. Scalda la piastra al massimo e schiacciale con forza con la spatola fino a renderle piatte e sottili.",
      "Cuoci 2 minuti a calore infernale finché si forma la crosticina bruna, gira, adagia il cheddar sopra per farlo fondere.",
      "Rosola il bacon fino a renderlo croccante, componi il panino e addenta bollente."
    ],
    "macros": {
      "calories": 880,
      "protein": 48,
      "carbs": 36,
      "fat": 59
    },
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-02-pizza-napoletana-rustica",
    "title": "Pizza Margherita Verace con Bufala Campana",
    "type": "sgarro",
    "prepTime": 25,
    "difficulty": "Medio",
    "equipment": [
      "Forno al massimo o Fornetto pizza",
      "Teglia o pietra"
    ],
    "ingredients": [
      "1 Panetto di pasta pizza lievitata (250g)",
      "120g Mozzarella di bufala o fior di latte",
      "80g Passata di pomodoro San Marzano",
      "Olio EVO e foglie di basilico fresco"
    ],
    "instructions": [
      "Stendi l'impasto con i polpastrelli dal centro verso l'esterno formando il cornicione.",
      "Distribuisci la passata di pomodoro e un filo generoso d'olio EVO.",
      "Inforna alla massima temperatura (250°C o più) per 8-10 minuti.",
      "A metà cottura aggiungi la mozzarella di bufala a pezzi ben scolata e termina con basilico fresco all'uscita."
    ],
    "macros": {
      "calories": 840,
      "protein": 32,
      "carbs": 110,
      "fat": 28
    },
    "imageUrl": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-03-carbonara-romana",
    "title": "Carbonara Tradizionale Romana Autentica (5 Ingredienti)",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Medio",
    "equipment": [
      "Padella antiaderente",
      "Ciotola",
      "Pentola per pasta"
    ],
    "ingredients": [
      "100g Spaghetti o Rigatoni trafilati al bronzo",
      "80g Guanciale di suino a listarelle",
      "2 Tuorli d'uovo freschissimi",
      "40g Pecorino Romano DOP grattugiato",
      "Pepe nero in grani tostato e macinato"
    ],
    "instructions": [
      "Metti a bollire l'acqua per la pasta (sala con moderazione).",
      "Rosola il guanciale a fiamma dolce nella padella senza olio finché è dorato e croccante fuori e morbido dentro. Tieni da parte il grasso fuso.",
      "In una ciotola sbatti i tuorli con il pecorino romano e abbondante pepe nero fino a formare una crema densa (la \"carbocrema\").",
      "Scola la pasta al dente nella padella con il grasso del guanciale, spegni il fuoco e unisci la carbocrema mantecando energicamente lontano dalla fiamma."
    ],
    "macros": {
      "calories": 790,
      "protein": 34,
      "carbs": 75,
      "fat": 38
    },
    "imageUrl": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-04-cacio-e-pepe",
    "title": "Tonnarelli Cacio e Pepe Espresso Cremosi",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Medio",
    "equipment": [
      "Pentola",
      "Padella grande",
      "Ciotola"
    ],
    "ingredients": [
      "100g Tonnarelli o spaghetti alla chitarra",
      "70g Pecorino Romano DOP a media stagionatura",
      "Pepe nero in grani pestato al mortaio"
    ],
    "instructions": [
      "Tosta il pepe nero pestato nella padella a fuoco medio finché sprigiona tutti i suoi profumi, poi aggiungi due mestoli di acqua di cottura della pasta ricca di amido.",
      "In una ciotola stempera il pecorino con poca acqua di cottura fino ad ottenere una pasta cremosa senza grumi.",
      "Scola la pasta al dente nella padella col pepe, togli dal fuoco e versa la crema di pecorino mescolando vigorosamente finché lega formando un'onda vellutata."
    ],
    "macros": {
      "calories": 640,
      "protein": 30,
      "carbs": 74,
      "fat": 24
    },
    "imageUrl": "https://images.unsplash.com/photo-1621996346565-e3d5d628169e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-05-grilled-cheese-filante",
    "title": "Ultimate Grilled Cheese Sandwich Triplo Formaggio",
    "type": "sgarro",
    "prepTime": 8,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Spatola"
    ],
    "ingredients": [
      "2 Fette spesse di pane rustico o pane in cassetta",
      "50g Formaggio Cheddar a fette",
      "40g Scamorza affumicata o Provola",
      "20g Burro a temperatura ambiente"
    ],
    "instructions": [
      "Imburra generosamente l'esterno di ciascuna fetta di pane.",
      "Farcisci l'interno con il cheddar e la scamorza.",
      "Cuoci in padella a fuoco medio-basso per 3-4 minuti per lato coprendo con un coperchio per far fondere completamente il cuore e rendere il pane croccante e dorato."
    ],
    "macros": {
      "calories": 620,
      "protein": 26,
      "carbs": 42,
      "fat": 38
    },
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-06-patatine-parmigiano-tartufo",
    "title": "Patatine Fritte Croccanti al Parmigiano e Tartufo",
    "type": "sgarro",
    "prepTime": 18,
    "difficulty": "Facile",
    "equipment": [
      "Friggitrice ad aria o Friggitrice",
      "Ciotola grande"
    ],
    "ingredients": [
      "250g Patate a fiammifero da friggere",
      "30g Parmigiano Reggiano grattugiato finemente",
      "1 cucchiaio di Olio al tartufo",
      "Prezzemolo tritato e sale fino"
    ],
    "instructions": [
      "Friggi le patatine fino a renderle dorate e super croccanti.",
      "Scolale e versale immediatamente caldissime nella ciotola.",
      "Cospargi con il parmigiano, l'olio al tartufo e prezzemolo, scuotendo la ciotola per mantecarle in modo uniforme."
    ],
    "macros": {
      "calories": 470,
      "protein": 12,
      "carbs": 52,
      "fat": 24
    },
    "imageUrl": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-07-quesadilla-pollo-formaggio",
    "title": "Quesadilla Messicana Filante con Pollo e Salsa BBQ",
    "type": "sgarro",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Padella grande",
      "Spatola"
    ],
    "ingredients": [
      "2 Tortillas di farina di grano",
      "100g Formaggio filante (Gouda o Cheddar grattugiato)",
      "100g Pollo arrosto o grigliato sfilacciato",
      "2 cucchiai di Salsa BBQ o maionese piccante"
    ],
    "instructions": [
      "Adagia una tortilla in padella calda e ricoprila con formaggio, pollo sfilacciato e salsa BBQ.",
      "Chiudi con la seconda tortilla e cuoci 3 minuti per lato a fiamma media finché il formaggio fila ed è ben dorata.",
      "Taglia a 4 spicchi e gusta caldissima."
    ],
    "macros": {
      "calories": 690,
      "protein": 44,
      "carbs": 54,
      "fat": 32
    },
    "imageUrl": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-08-nachos-loaded-cheddar",
    "title": "Loaded Nachos al Forno con Cheddar e Jalapeños",
    "type": "sgarro",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Pirofila o teglia da forno"
    ],
    "ingredients": [
      "150g Tortilla chips di mais salate",
      "120g Formaggio Cheddar fuso o grattugiato",
      "Fettine di Jalapeños sott'aceto",
      "50g Panna acida o salsa guacamole per intingere"
    ],
    "instructions": [
      "Distribuisci i nachos nella pirofila in un unico strato generoso.",
      "Copri interamente con il formaggio grattugiato e i jalapeños a rondelle.",
      "Inforna a 200°C per 6 minuti finché il formaggio è completamente fuso e fa le bolle. Servi con panna acida."
    ],
    "macros": {
      "calories": 820,
      "protein": 22,
      "carbs": 78,
      "fat": 48
    },
    "imageUrl": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-09-focaccia-barese",
    "title": "Focaccia Barese Croccante Pomodorini e Olive",
    "type": "sgarro",
    "prepTime": 25,
    "difficulty": "Facile",
    "equipment": [
      "Teglia tonda in alluminio o ferro",
      "Forno"
    ],
    "ingredients": [
      "300g Impasto per focaccia lievitato",
      "150g Pomodorini ciliegino schiacciati a mano",
      "10 Olive baresi o nere snocciolate",
      "Olio EVO abbondante e origano"
    ],
    "instructions": [
      "Ungi generosamente la teglia con abbondante olio EVO e allarga l'impasto con le dita.",
      "Affonda nell'impasto i pomodorini spaccandoli con le mani e le olive.",
      "Irrora con altro olio EVO, origano e sale grosso, quindi inforna a 220°C per 20 minuti finché il fondo è croccante e dorato."
    ],
    "macros": {
      "calories": 750,
      "protein": 18,
      "carbs": 98,
      "fat": 32
    },
    "imageUrl": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-10-hot-dog-cipolla-caramellata",
    "title": "Hot Dog Newyorkese con Cipolle Caramellate e Senape",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Pinza"
    ],
    "ingredients": [
      "1 Panino morbido per hot dog",
      "1 Wurstel di suino di prima qualità (100g)",
      "1 Cipolla bionda stufata con un filo di burro e zucchero",
      "Senape dolce e cetriolini a rondelle"
    ],
    "instructions": [
      "Rosola la cipolla a fette con burro finché diventa dorata e caramellata.",
      "Griglia il wurstel in padella facendogli formare le classiche striature dorate.",
      "Apri il panino scaldato, inserisci il wurstel, ricopri con abbondante cipolla caramellata e senape."
    ],
    "macros": {
      "calories": 540,
      "protein": 18,
      "carbs": 42,
      "fat": 34
    },
    "imageUrl": "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-11-pasta-amatriciana",
    "title": "Bucatini all'Amatriciana Ricca di Guanciale",
    "type": "sgarro",
    "prepTime": 18,
    "difficulty": "Facile",
    "equipment": [
      "Padella in ferro o antiaderente",
      "Pentola per pasta"
    ],
    "ingredients": [
      "100g Bucatini di semola",
      "80g Guanciale di Amatrice a bastoncini",
      "150g Pomodori pelati schiacciati a mano",
      "40g Pecorino Romano grattugiato e peperoncino"
    ],
    "instructions": [
      "Fai sudare il guanciale in padella con un pizzico di peperoncino fino a renderlo croccante, poi preleva i pezzi tenendoli da parte.",
      "Versa i pelati nel grasso del guanciale e lascia restringere il sugo per 10 minuti.",
      "Scola i bucatini al dente nel sugo, unisci il guanciale croccante e manteca con abbondante pecorino."
    ],
    "macros": {
      "calories": 760,
      "protein": 28,
      "carbs": 78,
      "fat": 37
    },
    "imageUrl": "https://images.unsplash.com/photo-1621996346565-e3d5d628169e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-12-mozzarella-in-carrozza",
    "title": "Mozzarella in Carrozza Dorata Super Filante (4 Ingredienti)",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Padella per friggere",
      "Piatto fondo"
    ],
    "ingredients": [
      "4 Fette di pane in cassetta (senza crosta)",
      "120g Mozzarella fior di latte ben asciutta",
      "2 Uova intere sbattute con un goccio di latte",
      "Pangrattato e olio per friggere"
    ],
    "instructions": [
      "Farcisci due sandwich con le fette di mozzarella al centro premendo bene i bordi.",
      "Passa i sandwich prima nell'uovo sbattuto sigillando i bordi e poi nel pangrattato.",
      "Friggi in olio caldo a 170°C per 2 minuti per lato finché dorati e croccanti."
    ],
    "macros": {
      "calories": 650,
      "protein": 28,
      "carbs": 48,
      "fat": 38
    },
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-13-crocche-patate-provola",
    "title": "Crocchè Napoletani di Patate e Provola Affumicata",
    "type": "sgarro",
    "prepTime": 20,
    "difficulty": "Facile",
    "equipment": [
      "Pentola",
      "Teglia o Friggitrice"
    ],
    "ingredients": [
      "250g Patate a pasta gialla lesse schiacciate",
      "60g Provola affumicata a bastoncini",
      "1 Tuorlo d'uovo e 20g Parmigiano",
      "Pangrattato e pepe"
    ],
    "instructions": [
      "Mescola le patate schiacciate con il tuorlo, il parmigiano, sale e abbondante pepe nero.",
      "Prendi una porzione di impasto, inserisci un bastoncino di provola al centro e chiudi a cilindro.",
      "Passa nel pangrattato e cuoci in friggitrice ad aria a 200°C per 12 minuti (oppure friggi)."
    ],
    "macros": {
      "calories": 430,
      "protein": 18,
      "carbs": 45,
      "fat": 19
    },
    "imageUrl": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-14-chicken-nuggets-cornflakes",
    "title": "Crispy Chicken Nuggets ai Cornflakes Croccanti",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Teglia o Friggitrice ad aria",
      "Ciotola"
    ],
    "ingredients": [
      "200g Petto di pollo macinato o a bocconcini",
      "50g Formaggio fresco spalmabile",
      "1 Uovo sbattuto",
      "40g Cornflakes sbriciolati a mano"
    ],
    "instructions": [
      "Impasta il pollo con il formaggio spalmabile e un pizzico di sale formando delle pepite.",
      "Passa i nuggets nell'uovo e poi nei cornflakes sbriciolati premendo bene per farli aderire.",
      "Cuoci in airfryer a 190°C per 12 minuti fino a doratura ultra croccante."
    ],
    "macros": {
      "calories": 480,
      "protein": 46,
      "carbs": 32,
      "fat": 18
    },
    "imageUrl": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-15-piadina-salsiccia-squacquerone",
    "title": "Piadina Romagnola con Salsiccia, Squacquerone e Rucola",
    "type": "sgarro",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Testo romagnolo o padella larga",
      "Forchetta"
    ],
    "ingredients": [
      "1 Piadina romagnola tradizionale (100g)",
      "1 Salsiccia di suino spellata e sbriciolata",
      "70g Squacquerone DOP",
      "Un pugno di Rucola fresca"
    ],
    "instructions": [
      "In una padella scotta la salsiccia sbriciolata finché è ben rosolata e croccante.",
      "Scalda la piadina sul testo per 1 minuto per lato girandola spesso.",
      "Spalma lo squacquerone caldissimo, unisci la salsiccia e la rucola, piega a metà e addenta."
    ],
    "macros": {
      "calories": 730,
      "protein": 30,
      "carbs": 54,
      "fat": 44
    },
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-16-gnocchi-quattro-formaggi",
    "title": "Gnocchi di Patate ai Quattro Formaggi Ripassati al Forno",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Pirofila da forno",
      "Pentola"
    ],
    "ingredients": [
      "200g Gnocchi di patate freschi",
      "40g Gorgonzola dolce",
      "40g Taleggio o Fontina a cubetti",
      "30g Parmigiano Reggiano grattugiato e 50ml latte"
    ],
    "instructions": [
      "In un pentolino fondi a fuoco dolce il gorgonzola, il taleggio e il latte fino a crema fluida.",
      "Lessa gli gnocchi in acqua bollente salata e scolali appena salgono a galla.",
      "Mescola gli gnocchi alla crema di formaggi, trasferisci in pirofila, cospargi di parmigiano e gratina al grill per 5 minuti."
    ],
    "macros": {
      "calories": 690,
      "protein": 26,
      "carbs": 68,
      "fat": 34
    },
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-17-club-sandwich-classico",
    "title": "Club Sandwich Americano Classico a Tre Piani",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Tostapane o Piastra",
      "Coltello da pane",
      "Stuzzicadenti lunghi"
    ],
    "ingredients": [
      "3 Fette di pane bianco tostato",
      "80g Petto di tacchino o pollo alla piastra",
      "3 Fette di Bacon croccante",
      "1 Uovo all'occhio di bue, maionese e lattuga"
    ],
    "instructions": [
      "Tosta le fette di pane e spalmaci un velo di maionese.",
      "Componi il primo piano con lattuga, pomodoro e tacchino; metti la seconda fetta e farcisci con uovo fritto e bacon croccante.",
      "Chiudi con la terza fetta, infilza con due stuzzicadenti e taglia in due triangoli."
    ],
    "macros": {
      "calories": 720,
      "protein": 42,
      "carbs": 46,
      "fat": 40
    },
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-18-frittata-di-pasta",
    "title": "Frittata di Spaghetti Napoletana Ricca e Croccante",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Piatto piano per girare la frittata"
    ],
    "ingredients": [
      "150g Spaghetti già cotti (anche avanzati)",
      "2 Uova intere grandi",
      "50g Provola o fior di latte a dadini",
      "30g Pancetta a cubetti e parmigiano"
    ],
    "instructions": [
      "Sbatti le uova con parmigiano, sale e pepe.",
      "Unisci gli spaghetti, i cubetti di provola e la pancetta mescolando bene.",
      "Scalda una padella con un filo d'olio, versa la pasta e cuoci 5 minuti a fuoco medio fino a crosticina dorata, gira col piatto e completa l'altro lato."
    ],
    "macros": {
      "calories": 680,
      "protein": 30,
      "carbs": 62,
      "fat": 34
    },
    "imageUrl": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-19-costine-maiale-bbq",
    "title": "Costine di Maiale Glassate in Salsa Barbecue Caramellata",
    "type": "sgarro",
    "prepTime": 30,
    "difficulty": "Facile",
    "equipment": [
      "Forno o Friggitrice ad aria",
      "Pennello da cucina"
    ],
    "ingredients": [
      "350g Costine di maiale (ribs)",
      "4 cucchiai di Salsa BBQ densa e affumicata",
      "1 cucchiaino di Miele e paprika dolce"
    ],
    "instructions": [
      "Massaggia le costine con sale e paprika.",
      "Inforna a 180°C coperte con alluminio per 20 minuti per renderle tenere.",
      "Spennella generosamente con il mix di salsa BBQ e miele, quindi passa sotto il grill a 210°C per 8 minuti fino a glassatura lucida e sfrigolante."
    ],
    "macros": {
      "calories": 720,
      "protein": 42,
      "carbs": 22,
      "fat": 52
    },
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-20-pasta-alla-gricia",
    "title": "Mezze Maniche alla Gricia con Guanciale Croccante",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Padella in alluminio o ferro",
      "Pentola"
    ],
    "ingredients": [
      "100g Mezze maniche rigate",
      "80g Guanciale a fettine",
      "40g Pecorino Romano grattugiato",
      "Pepe nero macinato fresco"
    ],
    "instructions": [
      "Fai sfrigolare il guanciale in padella senza grassi aggiunti fino a renderlo croccante.",
      "Lessa la pasta al dente e scolala direttamente nella padella col guanciale e un mestolo d'acqua di cottura.",
      "Spegni il fuoco, aggiungi il pecorino a pioggia e manteca saltando la pasta fino a creare un'emulsione cremosa."
    ],
    "macros": {
      "calories": 730,
      "protein": 28,
      "carbs": 74,
      "fat": 36
    },
    "imageUrl": "https://images.unsplash.com/photo-1621996346565-e3d5d628169e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-21-panino-porchetta-scamorza",
    "title": "Panino Rustico con Porchetta Calda e Scamorza Fusa",
    "type": "sgarro",
    "prepTime": 8,
    "difficulty": "Facile",
    "equipment": [
      "Piastra elettrica o fornetto"
    ],
    "ingredients": [
      "1 Rosetta o ciabattina croccante",
      "120g Porchetta d'Ariccia a fette con cotenna croccante",
      "50g Scamorza affumicata a fette"
    ],
    "instructions": [
      "Apri il panino a metà e adagia sul fondo le fette di scamorza affumicata.",
      "Aggiungi la porchetta generosa con la sua croccante crosticina.",
      "Chiudi e tosta sulla piastra calda per 4 minuti finché il pane è friabile e il formaggio cola fuso."
    ],
    "macros": {
      "calories": 660,
      "protein": 36,
      "carbs": 44,
      "fat": 38
    },
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-22-salsiccia-e-friarielli",
    "title": "Salsiccia e Friarielli (Cime di Rapa) Napoletana",
    "type": "sgarro",
    "prepTime": 18,
    "difficulty": "Facile",
    "equipment": [
      "Padella capiente",
      "Coperchio"
    ],
    "ingredients": [
      "2 Salsicce di suino campane a punta di coltello",
      "200g Friarielli o cime di rapa fresche pulite",
      "1 spicchio d'Aglio, peperoncino e 1 cucchiaio Olio EVO"
    ],
    "instructions": [
      "In padella fai rosolare le salsicce bucherellate con mezzo bicchiere d'acqua finché l'acqua evapora e dorano nel loro grasso.",
      "Sposta le salsicce, nella stessa padella unisci aglio, olio e peperoncino, poi versa i friarielli crudi con coperchio per 8 minuti.",
      "Riunisci salsicce e friarielli, salta a fiamma viva per 2 minuti e servi caldissimo."
    ],
    "macros": {
      "calories": 640,
      "protein": 32,
      "carbs": 6,
      "fat": 56
    },
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-23-pizza-fritta-montanara",
    "title": "Montanara Fritta Napoletana al Pomodoro e Parmigiano",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Pentola o padella per friggere",
      "Mestolo"
    ],
    "ingredients": [
      "150g Pasta per pizza lievitata a dischetti",
      "60g Sugo di pomodoro ristretto al basilico",
      "25g Parmigiano Reggiano grattugiato",
      "Olio per friggere e basilico fresco"
    ],
    "instructions": [
      "Scalda l'olio per friggere a 175°C.",
      "Immergi il disco di pasta pizza che si gonfierà immediatamente formando una nuvola dorata (1 minuto per lato).",
      "Scola su carta assorbente, metti un cucchiaio di sugo caldo al centro, parmigiano a pioggia e una foglia di basilico."
    ],
    "macros": {
      "calories": 510,
      "protein": 14,
      "carbs": 58,
      "fat": 26
    },
    "imageUrl": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-24-cotoletta-alla-milanese",
    "title": "Cotoletta alla Milanese Burrosa con Patatine",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Padella grande",
      "Piatti per panatura"
    ],
    "ingredients": [
      "1 Costoletta o fetta di lonza di vitello (180g)",
      "1 Uovo sbattuto",
      "60g Pangrattato grosso di pane raffermo",
      "40g Burro chiarificato per friggere"
    ],
    "instructions": [
      "Passa la carne nell'uovo sbattuto e poi nel pangrattato premendo con il palmo della mano.",
      "Fai sciogliere il burro chiarificato in padella fino a farlo spumeggiare.",
      "Cuoci la cotoletta 3-4 minuti per lato nappandola con il burro fuso fino a renderla color nocciola e croccantissima."
    ],
    "macros": {
      "calories": 680,
      "protein": 42,
      "carbs": 32,
      "fat": 42
    },
    "imageUrl": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-25-mac-and-cheese",
    "title": "Mac and Cheese Cremoso Americano al Forno",
    "type": "sgarro",
    "prepTime": 18,
    "difficulty": "Facile",
    "equipment": [
      "Pentola",
      "Teglia da forno"
    ],
    "ingredients": [
      "100g Maccheroncini o cellentani",
      "60g Formaggio Cheddar grattugiato",
      "40g Mozzarella o Gouda",
      "80ml Panna da cucina o latte intero con 10g burro"
    ],
    "instructions": [
      "Lessa la pasta al dente in acqua salata.",
      "In un pentolino scalda la panna con il burro e incorpora il cheddar finché fila liscio.",
      "Mischia la pasta col formaggio fuso, versa in pirofila, cospargi con altra mozzarella e inforna a 200°C per 8 minuti fino a gratinatura dorata."
    ],
    "macros": {
      "calories": 730,
      "protein": 26,
      "carbs": 72,
      "fat": 38
    },
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-26-burrito-supremo",
    "title": "Burrito Supremo con Macinato Speziato, Cheddar e Riso",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Padella",
      "Tagliere"
    ],
    "ingredients": [
      "1 Tortilla maxi di grano (80g)",
      "120g Carne macinata di manzo cotta con spezie taco",
      "40g Fagioli neri o rossi",
      "40g Cheddar grattugiato e 1 cucchiaio salsa piccante"
    ],
    "instructions": [
      "Scalda la tortilla in padella per renderla morbida.",
      "Disponi al centro la carne macinata saporita, i fagioli, il cheddar e la salsa.",
      "Ripiega i lati verso l'interno e arrotola stretto; ripassa il rotolo in padella 1 minuto per lato per sigillarlo."
    ],
    "macros": {
      "calories": 690,
      "protein": 38,
      "carbs": 64,
      "fat": 32
    },
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-27-focaccia-recco-formaggio",
    "title": "Focaccia Tipo Recco al Formaggio Sottile e Caldissima",
    "type": "sgarro",
    "prepTime": 20,
    "difficulty": "Medio",
    "equipment": [
      "Teglia tonda",
      "Forno caldissimo"
    ],
    "ingredients": [
      "180g Pasta matta sottilissima (farina, acqua, olio)",
      "150g Crescenza o Stracchino fresco ligure",
      "Olio EVO e sale grosso"
    ],
    "instructions": [
      "Tira due sfoglie di pasta sottili come veli di seta.",
      "Fodera la teglia con la prima sfoglia e distribuisci ciuffi abbondanti di crescenza.",
      "Copri con la seconda sfoglia, pizzica la pasta creando delle fessure, irrora d'olio e inforna a 250°C per 10 minuti finché si formano bolle croccanti."
    ],
    "macros": {
      "calories": 680,
      "protein": 24,
      "carbs": 62,
      "fat": 38
    },
    "imageUrl": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-28-filetto-maiale-bardato",
    "title": "Medaglioni di Filetto di Maiale Bardati con Pancetta",
    "type": "sgarro",
    "prepTime": 16,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Spago o stuzzicadenti"
    ],
    "ingredients": [
      "200g Filetto di maiale a fette spesse",
      "4 fette di Pancetta tesa affumicata",
      "1 rametto di Rosmarino e 30ml vino bianco"
    ],
    "instructions": [
      "Avvolgi il bordo di ciascun medaglione di filetto con le fette di pancetta fermandole con uno stuzzicadenti.",
      "Cuoci in padella a fiamma viva con rosmarino per 3 minuti per lato finché la pancetta è croccante.",
      "Sfuma col vino bianco e servi con il gustoso sughero di fondo."
    ],
    "macros": {
      "calories": 460,
      "protein": 44,
      "carbs": 1,
      "fat": 30
    },
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-29-panzerotti-fritti",
    "title": "Panzerotto Pugliese Fritto con Pomodoro e Mozzarella",
    "type": "sgarro",
    "prepTime": 18,
    "difficulty": "Facile",
    "equipment": [
      "Pentola per friggere",
      "Forchetta per sigillare"
    ],
    "ingredients": [
      "1 dischetto di Pasta lievitata (100g)",
      "50g Mozzarella fior di latte tritata e strizzata",
      "30g Passata di pomodoro densa, origano e sale",
      "Olio per friggere"
    ],
    "instructions": [
      "Farcisci il centro del disco con mozzarella, pomodoro e origano.",
      "Ripiega a mezzaluna e sigilla i bordi schiacciando bene con i rebbi della forchetta.",
      "Tuffa nell'olio bollente per 2 minuti finché gonfio, dorato e profumato."
    ],
    "macros": {
      "calories": 430,
      "protein": 14,
      "carbs": 46,
      "fat": 22
    },
    "imageUrl": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-30-bagel-salmone-creamcheese",
    "title": "New York Bagel Tostato Salmone e Cream Cheese",
    "type": "sgarro",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Tostapane o Piastra"
    ],
    "ingredients": [
      "1 Bagel artigianale con semi di sesamo",
      "60g Formaggio spalmabile tipo Philadelphia intero",
      "70g Salmone affumicato norvegese",
      "Qualche anello di cipolla rossa e capperi"
    ],
    "instructions": [
      "Taglia il bagel a metà e tosta le facce interne finché sono calde e croccanti.",
      "Spalma uno strato spesso di cream cheese su entrambe le metà.",
      "Adagia il salmone affumicato, anelli di cipolla e capperi, quindi richiudi."
    ],
    "macros": {
      "calories": 530,
      "protein": 26,
      "carbs": 48,
      "fat": 26
    },
    "imageUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-31-tiramisu-tradizionale",
    "title": "Tiramisù Tradizionale Trevigiano al Mascarpone (Monoporzione)",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Coppetta da dessert",
      "Sbattitore o Frusta",
      "Moka"
    ],
    "ingredients": [
      "4 Biscotti Savoiardi",
      "100g Mascarpone fresco autentico",
      "1 Tuorlo d'uovo freschissimo",
      "20g Zucchero semolato",
      "1 tazzina di Caffè espresso amaro e cacao amaro in polvere"
    ],
    "instructions": [
      "Monta il tuorlo con lo zucchero finché diventa chiaro e spumoso, poi incorpora delicatamente il mascarpone fino a crema setosa.",
      "Inzuppa rapidamente i savoiardi nel caffè tiepido.",
      "Alterna nella coppetta strati di savoiardi e crema di mascarpone.",
      "Spolvera la superficie con abbondante cacao amaro e lascia riposare in frigo 1 ora prima di affondare il cucchiaio."
    ],
    "macros": {
      "calories": 580,
      "protein": 11,
      "carbs": 48,
      "fat": 38
    },
    "imageUrl": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-32-french-toast-nutella-rollups",
    "title": "Nutella French Toast Roll-Ups Croccanti allo Zucchero e Cannella",
    "type": "sgarro",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Padella antiaderente",
      "Matterello"
    ],
    "ingredients": [
      "3 Fette di pancarré bianco senza crosta",
      "60g Nutella generosa",
      "1 Uovo sbattuto con 20ml latte",
      "15g Burro, zucchero e cannella per rotolare"
    ],
    "instructions": [
      "Appiattisci le fette di pane col matterello fino a renderle sottili.",
      "Spalma abbondante Nutella su ogni fetta e arrotola stretto a cannolo.",
      "Passa i rotolini nell'uovo sbattuto e falli dorare nel burro fuso in padella per 3 minuti.",
      "Rotola immediatamente nello zucchero e cannella e gusta col cuore di cioccolato fuso che cola."
    ],
    "macros": {
      "calories": 620,
      "protein": 12,
      "carbs": 74,
      "fat": 31
    },
    "imageUrl": "https://images.unsplash.com/photo-1484723091739-0045615eb40f?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-33-brownies-fudgy-cioccolato",
    "title": "Fudgy Brownie al Cioccolato Fondente e Noci",
    "type": "sgarro",
    "prepTime": 25,
    "difficulty": "Facile",
    "equipment": [
      "Teglia quadrata 20x20",
      "Pentolino per bagnomaria",
      "Frusta"
    ],
    "ingredients": [
      "100g Cioccolato fondente 70%",
      "60g Burro",
      "70g Zucchero",
      "2 Uova intere",
      "35g Farina 00 e gherigli di noce"
    ],
    "instructions": [
      "Fondi il cioccolato con il burro a bagnomaria o nel microonde.",
      "Sbatti le uova con lo zucchero, unisci il cioccolato fuso e incorpora la farina e le noci con una spatola.",
      "Versa nella teglia rivestita di carta forno e inforna a 175°C per 18-20 minuti: l'interno deve rimanere umido e scioglievole."
    ],
    "macros": {
      "calories": 490,
      "protein": 8,
      "carbs": 48,
      "fat": 30
    },
    "imageUrl": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-34-torta-tenerina-ferrarese",
    "title": "Torta Tenerina Ferrarese al Cuore Morbido Fondente",
    "type": "sgarro",
    "prepTime": 25,
    "difficulty": "Facile",
    "equipment": [
      "Tortiera da 20cm",
      "Sbattitore elettrico"
    ],
    "ingredients": [
      "120g Cioccolato fondente",
      "60g Burro",
      "2 Uova (tuorli e albumi separati)",
      "60g Zucchero e 25g Farina"
    ],
    "instructions": [
      "Fondi cioccolato e burro insieme.",
      "Monta i tuorli con metà zucchero e gli albumi a neve ferma con l'altra metà.",
      "Unisci il cioccolato ai tuorli, aggiungi la farina e infine incorpora gli albumi montati con movimenti dal basso verso l'alto.",
      "Inforna a 170°C per 18 minuti creando la classica crosticina sottile sopra e il cuore tenerissimo sotto."
    ],
    "macros": {
      "calories": 520,
      "protein": 9,
      "carbs": 49,
      "fat": 33
    },
    "imageUrl": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-35-crepes-nutella-nocciole",
    "title": "Crepes alla Nutella con Granella di Nocciole Tostate",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Crepiera o padella antiaderente",
      "Frusta a mano"
    ],
    "ingredients": [
      "1 Uovo intero",
      "50g Farina 00",
      "100ml Latte intero",
      "10g Burro fuso",
      "50g Nutella e granella di nocciole"
    ],
    "instructions": [
      "Sbatti l'uovo con il latte e la farina fino a pastella liquida senza grumi.",
      "Cuoci le crepes in padella imburrata calda per 1 minuto per lato.",
      "Farcisci con Nutella calda a volontà, piega a ventaglio o a triangolo e cospargi con granella di nocciole tostate."
    ],
    "macros": {
      "calories": 560,
      "protein": 12,
      "carbs": 62,
      "fat": 30
    },
    "imageUrl": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-36-waffle-panna-fragole",
    "title": "Waffle Belga con Nuvola di Panna e Fragole Fresche",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Piastra per waffle",
      "Ciotola"
    ],
    "ingredients": [
      "1 Waffle belga dorato e caldo",
      "50g Panna fresca montata con vaniglia",
      "5 Fragole fresche a spicchi",
      "Sciroppo d'acero o topping al cioccolato"
    ],
    "instructions": [
      "Scalda il waffle nella piastra finché è ben caldo e croccante sui nidi.",
      "Decora la superficie con una generosa nuvola di panna montata fresca.",
      "Aggiungi le fragole a fette e cola abbondante sciroppo d'acero."
    ],
    "macros": {
      "calories": 480,
      "protein": 7,
      "carbs": 56,
      "fat": 26
    },
    "imageUrl": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-37-cheesecake-caramello-salato",
    "title": "Cheesecake Espresso nel Bicchiere al Caramello Salato",
    "type": "sgarro",
    "prepTime": 10,
    "difficulty": "Facile",
    "equipment": [
      "Bicchiere da dessert",
      "Cucchiaio"
    ],
    "ingredients": [
      "40g Biscotti Digestive o Lotus Biscoff sbriciolati",
      "15g Burro fuso",
      "100g Formaggio fresco Philadelphia intero",
      "30g Panna fresca montata con zucchero a velo",
      "2 cucchiai di Salsa al Caramello salato"
    ],
    "instructions": [
      "Mischia i biscotti sbriciolati col burro fuso e pressa sul fondo del bicchiere.",
      "Lavora il Philadelphia con lo zucchero a velo e incorpora la panna.",
      "Versa la crema sui biscotti e corona con una colata generosa di caramello salato tiepido."
    ],
    "macros": {
      "calories": 590,
      "protein": 8,
      "carbs": 52,
      "fat": 39
    },
    "imageUrl": "https://images.unsplash.com/photo-1524351199679-46cddf530c04?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-38-salame-al-cioccolato",
    "title": "Salame al Cioccolato Tradizionale Senza Cottura",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Ciotola",
      "Carta forno",
      "Frigo"
    ],
    "ingredients": [
      "100g Biscotti secchi tipo Oro Saiwa",
      "60g Burro morbido a pomata",
      "60g Cioccolato fondente fuso",
      "30g Zucchero e 15g cacao amaro"
    ],
    "instructions": [
      "Spezza i biscotti con le mani in pezzi irregolari.",
      "In una ciotola mescola il burro con il cioccolato fuso, lo zucchero e il cacao.",
      "Unisci i biscotti all'impasto, dai la forma di un salame avvolgendolo stretto nella carta forno e lascialo rassodare in frigo 2 ore prima di tagliarlo a fette."
    ],
    "macros": {
      "calories": 480,
      "protein": 6,
      "carbs": 58,
      "fat": 26
    },
    "imageUrl": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-39-mousse-cioccolato-soffice",
    "title": "Mousse al Cioccolato Soffice (2 Ingredienti Tradizionale)",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Sbattitore elettrico",
      "Ciotole"
    ],
    "ingredients": [
      "100g Cioccolato fondente 65%",
      "2 Uova freschissime intere (separate)",
      "1 pizzico di sale"
    ],
    "instructions": [
      "Sciogli il cioccolato a bagnomaria e fallo intiepidire.",
      "Unisci i due tuorli al cioccolato uno alla volta mescolando.",
      "Monta gli albumi a neve fermissima con il pizzico di sale e incorporali delicatamente senza smontare il composto.",
      "Riponi in frigo per 2 ore: diventerà una spuma aerata e vellutata."
    ],
    "macros": {
      "calories": 410,
      "protein": 12,
      "carbs": 32,
      "fat": 27
    },
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-40-calzone-fritto-ricotta-cioccolato",
    "title": "Calzone Dolce Fritto con Ricotta di Pecora e Cioccolato",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Padella per friggere",
      "Forchetta"
    ],
    "ingredients": [
      "1 Panetto di pasta pizza (120g)",
      "80g Ricotta di pecora zuccherata",
      "30g Gocce di cioccolato fondente",
      "Zucchero a velo per guarnire"
    ],
    "instructions": [
      "Stendi la pasta a disco e farcisci metà disco con la ricotta mescolata al cioccolato.",
      "Chiudi a mezzaluna sigillando accuratamente i bordi con la forchetta.",
      "Friggi in olio caldo per 2-3 minuti fino a doratura uniforme e spolvera generosamente di zucchero a velo."
    ],
    "macros": {
      "calories": 590,
      "protein": 16,
      "carbs": 68,
      "fat": 28
    },
    "imageUrl": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-41-cinnamon-rolls-glassa",
    "title": "Cinnamon Roll Espressi Caldi con Glassa alla Vaniglia",
    "type": "sgarro",
    "prepTime": 20,
    "difficulty": "Facile",
    "equipment": [
      "Teglia da forno",
      "Pennellino"
    ],
    "ingredients": [
      "1 Rotolo di pasta sfoglia rettangolare",
      "30g Burro fuso",
      "35g Zucchero di canna + 1 cucchiaio colmo di Cannella",
      "Glassa: 40g zucchero a velo + 1 cucchiaio latte"
    ],
    "instructions": [
      "Spennella la sfoglia con il burro fuso e cospargi con lo zucchero di canna e la cannella.",
      "Arrotola stretto per il lato lungo e taglia rondelle spesse 2-3 cm.",
      "Disponi su teglia e inforna a 190°C per 15 minuti finché sono dorate e caramellate. Cola sopra la glassa calda."
    ],
    "macros": {
      "calories": 540,
      "protein": 6,
      "carbs": 64,
      "fat": 29
    },
    "imageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-42-crostata-marmellata-ciliegie",
    "title": "Crostata Friabile della Nonna alla Confettura di Ciliegie",
    "type": "sgarro",
    "prepTime": 30,
    "difficulty": "Facile",
    "equipment": [
      "Stampo per crostate da 22cm",
      "Forno"
    ],
    "ingredients": [
      "1 Rotolo di pasta frolla pronta al burro",
      "180g Confettura extra di ciliegie o visciole"
    ],
    "instructions": [
      "Fodera lo stampo con la frolla tenendo da parte i ritagli per le strisce.",
      "Spalma la confettura di ciliegie livellando con un cucchiaio.",
      "Forma la classica griglia con le losanghe di pasta e inforna a 180°C per 25 minuti fino a doratura biscottata."
    ],
    "macros": {
      "calories": 480,
      "protein": 5,
      "carbs": 72,
      "fat": 19
    },
    "imageUrl": "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-43-tortino-cuore-caldo",
    "title": "Tortino al Cioccolato con Cuore Caldo Fondente",
    "type": "sgarro",
    "prepTime": 18,
    "difficulty": "Medio",
    "equipment": [
      "Pirottini in alluminio monoporzione",
      "Forno statico"
    ],
    "ingredients": [
      "80g Cioccolato fondente",
      "40g Burro",
      "1 Uovo intero",
      "30g Zucchero semolato",
      "15g Farina 00"
    ],
    "instructions": [
      "Fondi cioccolato e burro a bagnomaria.",
      "Monta l'uovo con lo zucchero, unisci il cioccolato fuso intiepidito e la farina setacciata.",
      "Imburra il pirottino, cospargilo di cacao amaro, versa il composto e inforna a 190°C per esattamente 10 minuti.",
      "Sforma su un piattino: l'esterno sarà una tortina soffice e l'interno una fontana di cioccolato fuso bollente."
    ],
    "macros": {
      "calories": 510,
      "protein": 7,
      "carbs": 46,
      "fat": 34
    },
    "imageUrl": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-44-banana-split-suprema",
    "title": "Banana Split Americana Tradizionale con Triplo Gelato",
    "type": "sgarro",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Piatto lungo da banana split",
      "Porzionatore gelato"
    ],
    "ingredients": [
      "1 Banana matura sbucciata e tagliata a metà per lungo",
      "3 Palline di gelato (vaniglia, cioccolato, fragola)",
      "40g Panna montata spray",
      "Cioccolato fondente fuso e ciliegina candita"
    ],
    "instructions": [
      "Disponi le due metà della banana sui lati del piatto.",
      "Posiziona al centro le tre palline di gelato.",
      "Copri con ciuffi generosi di panna montata, cola il cioccolato fuso a filo e incorona con la ciliegina."
    ],
    "macros": {
      "calories": 560,
      "protein": 8,
      "carbs": 78,
      "fat": 25
    },
    "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-45-churros-spagnoli",
    "title": "Churros Caldi Zuccherati con Cioccolata Calda Densa",
    "type": "sgarro",
    "prepTime": 20,
    "difficulty": "Facile",
    "equipment": [
      "Sac à poche con beccuccio a stella",
      "Padella per friggere"
    ],
    "ingredients": [
      "120g Farina 00",
      "150ml Acqua con 20g burro e un pizzico di sale",
      "Olio per friggere",
      "Zucchero semolato, cannella e tazza di cioccolata calda densa"
    ],
    "instructions": [
      "Porta a ebollizione l'acqua con il burro, butta la farina tutta insieme e mescola finché l'impasto si stacca dalle pareti della pentola.",
      "Metti l'impasto nella sac à poche e spremi cordoni di pasta nell'olio bollente tagliandoli con una forbice.",
      "Friggi 3 minuti fino a doratura croccante, rotola nello zucchero e cannella e intingi nella cioccolata."
    ],
    "macros": {
      "calories": 530,
      "protein": 7,
      "carbs": 70,
      "fat": 26
    },
    "imageUrl": "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-46-cookies-pepite-cioccolato",
    "title": "Maxi Cookies Americani Morbidi con Chunks di Cioccolato",
    "type": "sgarro",
    "prepTime": 18,
    "difficulty": "Facile",
    "equipment": [
      "Teglia da forno",
      "Carta forno",
      "Ciotola"
    ],
    "ingredients": [
      "100g Farina 00",
      "50g Burro morbido",
      "40g Zucchero di canna",
      "1 Tuorlo d'uovo",
      "50g Cioccolato fondente a pezzi grossolani"
    ],
    "instructions": [
      "Lavora il burro con lo zucchero fino a crema, unisci il tuorlo e infine la farina e i grossi pezzi di cioccolato.",
      "Forma 3 o 4 palline grandi e disponile ben distanziate sulla teglia.",
      "Inforna a 180°C per 10-12 minuti: toglili appena i bordi dorano anche se il centro sembra morbido (diventeranno perfetti raffreddandosi)."
    ],
    "macros": {
      "calories": 540,
      "protein": 7,
      "carbs": 64,
      "fat": 29
    },
    "imageUrl": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-47-sbriciolata-nutella",
    "title": "Sbriciolata Golosa alla Nutella Senza Cottura",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Stampo a cerniera da 18cm",
      "Ciotola",
      "Frigo"
    ],
    "ingredients": [
      "150g Biscotti secchi al cioccolato o Pan di Stelle",
      "60g Burro fuso",
      "120g Nutella leggermente scaldata"
    ],
    "instructions": [
      "Trita grossolanamente i biscotti e unisci il burro fuso.",
      "Versa metà dei biscotti nello stampo compattando la base con il dorso del cucchiaio.",
      "Colaci sopra tutta la Nutella calda e ricopri con il resto dei biscotti sbriciolati.",
      "Lascia rassodare in frigo per 45 minuti e taglia a quadrotti golosissimi."
    ],
    "macros": {
      "calories": 640,
      "protein": 8,
      "carbs": 70,
      "fat": 37
    },
    "imageUrl": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-48-affogato-caffe-gelato",
    "title": "Affogato al Caffè con Gelato alla Vaniglia e Panna",
    "type": "sgarro",
    "prepTime": 3,
    "difficulty": "Facile",
    "equipment": [
      "Coppa di vetro",
      "Moka o macchina espresso"
    ],
    "ingredients": [
      "2 Palline generose di gelato alla vaniglia artigianale o fior di latte",
      "1 Tazzina di caffè espresso bollente appena estratto",
      "Ciuffo di Panna montata e scaglie di cioccolato"
    ],
    "instructions": [
      "Metti le due palline di gelato freddissimo nella coppa.",
      "Versa l'espresso bollente direttamente sopra il gelato, ammirando il contrasto caldo-freddo che scioglie parzialmente la crema.",
      "Completa con panna e scaglie di cioccolato e gusta subito con il cucchiaino."
    ],
    "macros": {
      "calories": 340,
      "protein": 5,
      "carbs": 36,
      "fat": 20
    },
    "imageUrl": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-49-apple-crumble-cannella",
    "title": "Apple Crumble Caldo alle Mele con Burro e Cannella",
    "type": "sgarro",
    "prepTime": 25,
    "difficulty": "Facile",
    "equipment": [
      "Pirofila monoporzione da forno",
      "Forno"
    ],
    "ingredients": [
      "1 Mela Golden sbucciata a tocchetti",
      "1 cucchiaino di Cannella e 1 cucchiaio zucchero di canna",
      "40g Farina 00",
      "25g Burro freddo a cubetti"
    ],
    "instructions": [
      "Disponi i cubetti di mela nella pirofila mescolati con cannella e un cucchiaino di zucchero.",
      "Lavora con la punta delle dita la farina, il burro freddo e il restante zucchero fino a briciole sabbiose.",
      "Copri le mele con le briciole e inforna a 190°C per 20 minuti finché il crumble è croccante e dorato e le mele borbottano caramellate."
    ],
    "macros": {
      "calories": 430,
      "protein": 4,
      "carbs": 62,
      "fat": 20
    },
    "imageUrl": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-50-cannoli-siciliani",
    "title": "Cannolo Siciliano Espresso alla Ricotta e Pistacchio",
    "type": "sgarro",
    "prepTime": 5,
    "difficulty": "Facile",
    "equipment": [
      "Sac à poche o cucchiaino",
      "Piatto da portata"
    ],
    "ingredients": [
      "2 Cialde di cannolo siciliano croccanti pronte",
      "120g Crema di ricotta di pecora zuccherata",
      "Granella di Pistacchio di Bronte e gocce di cioccolato",
      "Zucchero a velo"
    ],
    "instructions": [
      "Farcisci le cialde di cannolo con la ricotta solo all'ultimo momento per mantenere la cialda croccantissima.",
      "Intingi un'estremità nella granella di pistacchio e l'altra nelle gocce di cioccolato.",
      "Spolvera con zucchero a velo e gusta la regina della pasticceria siciliana."
    ],
    "macros": {
      "calories": 510,
      "protein": 12,
      "carbs": 54,
      "fat": 28
    },
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-51-profiteroles-cioccolato",
    "title": "Profiteroles al Cioccolato con Panna Soffice",
    "type": "sgarro",
    "prepTime": 12,
    "difficulty": "Facile",
    "equipment": [
      "Coppa da dessert",
      "Frusta"
    ],
    "ingredients": [
      "4 Bignè di pasta choux pronti",
      "60g Panna fresca montata zuccherata",
      "70g Glassa calda al cioccolato fondente (cioccolato fuso con un goccio di panna)"
    ],
    "instructions": [
      "Pratica un piccolo foro sul fondo dei bignè e farciscili generosamente con la panna montata.",
      "Impila i bignè a piramide nella coppa da dessert.",
      "Cola sopra la glassa tiepida al cioccolato ricoprendoli interamente."
    ],
    "macros": {
      "calories": 490,
      "protein": 7,
      "carbs": 42,
      "fat": 34
    },
    "imageUrl": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "sgarro-52-fetta-paradiso-nutella",
    "title": "Torta Fetta al Latte e Nutella Soffice come una Nuvola",
    "type": "sgarro",
    "prepTime": 15,
    "difficulty": "Facile",
    "equipment": [
      "Tagliere",
      "Spatola"
    ],
    "ingredients": [
      "2 Fette spesse di pan di spagna al cacao morbido",
      "60g Crema al latte (panna montata con latte condensato e miele)",
      "30g Nutella a strato"
    ],
    "instructions": [
      "Adagia la prima fetta di pan di spagna sul piatto.",
      "Spalma un sottile strato di Nutella e copri con la crema soffice al latte alta 2 cm.",
      "Chiudi con la seconda fetta, lascia in frigo 30 minuti e taglia a trancetti rettangolari."
    ],
    "macros": {
      "calories": 460,
      "protein": 7,
      "carbs": 54,
      "fat": 24
    },
    "imageUrl": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
  }
];
