export interface FitTip {
  id: string;
  category: 'Nutrizione' | 'Allenamento' | 'Salute' | 'Stile di Vita';
  text: string;
  author: string;
}

export const fitTips: FitTip[] = [
  {
    id: 'tip-1',
    category: 'Nutrizione',
    text: 'Le proteine hanno il più alto effetto termico del cibo (TEF). Il tuo corpo brucia circa il 20-30% delle calorie proteiche consumate solo per digerirle!',
    author: 'Dott. Nutrizione'
  },
  {
    id: 'tip-2',
    category: 'Allenamento',
    text: 'Per stimolare l\'ipertrofia, assicurati di avvicinarti al cedimento muscolare (RPE 8-10) nelle tue serie allenanti, mantenendo sempre la tecnica corretta.',
    author: 'Personal Trainer'
  },
  {
    id: 'tip-3',
    category: 'Salute',
    text: 'Il sonno è il miglior integratore per il recupero. Dormire meno di 7 ore a notte riduce i livelli di testosterone e aumenta il cortisolo, ostacolando la crescita muscolare.',
    author: 'Coach del Sonno'
  },
  {
    id: 'tip-4',
    category: 'Nutrizione',
    text: 'Bere acqua prima dei pasti aiuta a regolare l\'appetito e accelera il metabolismo. Cerca di consumare almeno 2.5-3 litri di acqua al giorno, specialmente nei giorni di allenamento.',
    author: 'Dietologo Sportivo'
  },
  {
    id: 'tip-5',
    category: 'Allenamento',
    text: 'Il sovraccarico progressivo (aumentare gradualmente peso, ripetizioni o volume nel tempo) è il fattore primario per l\'aumento della forza e della massa muscolare.',
    author: 'Esperto Biomeccanica'
  },
  {
    id: 'tip-6',
    category: 'Stile di Vita',
    text: 'La costanza batte l\'intensità. È molto meglio allenarsi con moderazione 3 volte a settimana tutto l\'anno piuttosto che 6 volte a settimana per un solo mese e poi mollare.',
    author: 'Psicologo dello Sport'
  },
  {
    id: 'tip-7',
    category: 'Salute',
    text: 'Se avverti dolori articolari persistenti (non il semplice indolenzimento muscolare o DOMS), concediti un giorno di scarico o riduci il carico del 50%. Ascolta il tuo corpo.',
    author: 'Fisioterapista'
  }
];
