export interface Exercise {
  id: string;
  name: string;
  category: 'Petto' | 'Dorso' | 'Gambe' | 'Spalle' | 'Braccia' | 'Core';
  instructions: string;
  videoUrl: string; // URL for demonstration
}

export const mockExercises: Exercise[] = [
  {
    id: 'ex-chest-press',
    name: 'Chest Press Convergente (Macchina)',
    category: 'Petto',
    instructions: 'Spingi le maniglie in avanti tenendo le scapole addotte e il petto in fuori. Ritorna controllando il movimento.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-his-chest-at-the-gym-flat-40337-large.mp4'
  },
  {
    id: 'ex-panca-piana',
    name: 'Distensioni su Panca Piana con Bilanciere',
    category: 'Petto',
    instructions: 'Abbassa il bilanciere al petto mantenendo i gomiti a 45 gradi. Spingi verso l\'alto contraendo i pettorali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },
  {
    id: 'ex-lat-machine',
    name: 'Lat Machine Avanti',
    category: 'Dorso',
    instructions: 'Tira la sbarra verso la parte alta del petto, portando indietro i gomiti ed estendendo la cassa toracica.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-squat',
    name: 'Squat con Bilanciere',
    category: 'Gambe',
    instructions: 'Poggia il bilanciere sui trapezi. Scendi spingendo il bacino all\'indietro fino a rompere il parallelo, poi risali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-alzate-laterali',
    name: 'Alzate Laterali con Manubri',
    category: 'Spalle',
    instructions: 'Solleva i manubri verso l\'esterno fino all\'altezza delle spalle. Mantieni una leggera flessione del gomito.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-curl-bicipiti',
    name: 'Curl Bicipiti con Manubri',
    category: 'Braccia',
    instructions: 'Fletti i gomiti portando i manubri verso le spalle, supina la mano durante la salita e controlla la discesa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-pushdown',
    name: 'Pushdown Tricipiti con Cavo',
    category: 'Braccia',
    instructions: 'Spingi la corda verso il basso distendendo completamente le braccia. Tieni i gomiti stretti vicino al corpo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-triceps-pushdown-at-the-gym-40335-large.mp4'
  },
  {
    id: 'ex-crunch',
    name: 'Crunch Addominale',
    category: 'Core',
    instructions: 'Solleva le scapole da terra contraendo gli addominali. Espira durante la contrazione e scendi lentamente.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  }
];
