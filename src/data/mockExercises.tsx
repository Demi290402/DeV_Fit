

export type MuscleGroup = 
  | 'Pettorali' 
  | 'Dorsali' 
  | 'Quadricipiti' 
  | 'Spalle' 
  | 'Bicipiti' 
  | 'Tricipiti' 
  | 'Addominali' 
  | 'Cardio' 
  | 'Adduttori' 
  | 'Abduttori' 
  | 'Avambracci';

export type EquipmentType = 
  | 'Bilanciere' 
  | 'Manubri' 
  | 'Macchina' 
  | 'Cavi' 
  | 'Niente' 
  | 'Fascia di resistenza'
  | 'Fasce di sospensione'
  | 'Kettlebell';

export interface Exercise {
  id: string;
  name: string;
  category: 'Petto' | 'Dorso' | 'Gambe' | 'Spalle' | 'Braccia' | 'Core';
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  instructions: string;
  videoUrl: string;
}

export const mockExercises: Exercise[] = [
  {
    id: 'ex-chest-press',
    name: 'Chest Press Convergente',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Macchina',
    instructions: 'Spingi le maniglie in avanti tenendo le scapole addotte e il petto in fuori. Ritorna controllando il movimento.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-his-chest-at-the-gym-flat-40337-large.mp4'
  },
  {
    id: 'ex-panca-piana',
    name: 'Panca Piana Bilanciere',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Bilanciere',
    instructions: 'Abbassa il bilanciere al petto mantenendo i gomiti a 45 gradi. Spingi verso l\'alto contraendo i pettorali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },
  {
    id: 'ex-lat-machine',
    name: 'Lat Pulldown (Cavo)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Tira la sbarra verso la parte alta del petto, portando indietro i gomiti ed estendendo la cassa toracica.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-rematore-seduto',
    name: 'Rematore al Cavo da Seduto',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Siediti con la schiena dritta. Afferra la maniglia e tirala verso l\'ombelico portando indietro le spalle e contraendo i dorsali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-squat',
    name: 'Squat con Bilanciere',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Bilanciere',
    instructions: 'Poggia il bilanciere sui trapezi. Scendi spingendo il bacino all\'indietro fino a rompere il parallelo, poi risali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-alzate-laterali',
    name: 'Alzate Laterali con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Solleva i manubri verso l\'esterno fino all\'altezza delle spalle. Mantieni una leggera flessione del gomito.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-curl-bicipiti',
    name: 'Curl Bicipiti con Manubri',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Fletti i gomiti portando i manubri verso le spalle, supina la mano durante la salita e controlla la discesa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-pushdown',
    name: 'Pushdown Tricipiti con Cavo',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Spingi la corda verso il basso distendendo completamente le braccia. Tieni i gomiti stretti vicino al corpo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-triceps-pushdown-at-the-gym-40335-large.mp4'
  },
  {
    id: 'ex-crunch',
    name: 'Crunch Addominale',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Solleva le scapole da terra contraendo gli addominali. Espira durante la contrazione e scendi lentamente.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },
  {
    id: 'ex-tapis-roulant',
    name: 'Tapis Roulant',
    category: 'Gambe',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Cammina o corri a ritmo costante per stimolare l\'attività cardiovascolare e bruciare calorie.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  }
];

// Helper to render inline SVG diagrams for muscles (anatomical maps)
export const renderMuscleIcon = (muscle: MuscleGroup) => {
  const getHighlightColor = () => {
    switch (muscle) {
      case 'Pettorali': return '#ef4444'; // Red
      case 'Dorsali': return '#3b82f6'; // Blue
      case 'Quadricipiti': return '#10b981'; // Emerald
      case 'Spalle': return '#a855f7'; // Purple
      case 'Bicipiti': return '#f59e0b'; // Yellow
      case 'Tricipiti': return '#ec4899'; // Pink
      case 'Addominali': return '#06b6d4'; // Cyan
      case 'Cardio': return '#f43f5e'; // Rose
      default: return '#e2e8f0';
    }
  };

  const color = getHighlightColor();

  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ background: '#1c1c24', borderRadius: '50%', padding: '4px' }}>
      {/*Torso outline silhouette */}
      <path d="M 32,10 C 35,10 36,15 36,18 C 36,21 33,23 32,23 C 31,23 28,21 28,18 C 28,15 29,10 32,10 Z" fill="#4b5563" /> {/* head */}
      <path d="M 23,26 C 25,23 39,23 41,26 C 43,29 42,42 41,50 L 23,50 C 22,42 21,29 23,26 Z" fill="#374151" /> {/* torso */}
      <path d="M 18,26 L 22,26 L 20,44 L 17,44 Z" fill="#1f2937" /> {/* left arm */}
      <path d="M 46,26 L 42,26 L 44,44 L 47,44 Z" fill="#1f2937" /> {/* right arm */}
      <path d="M 24,51 H 29 V 64 H 24 Z" fill="#111827" /> {/* left leg */}
      <path d="M 35,51 H 40 V 64 H 35 Z" fill="#111827" /> {/* right leg */}

      {/* Highlights based on target muscle */}
      {muscle === 'Pettorali' && (
        <>
          <ellipse cx="27" cy="30" rx="3" ry="2" fill={color} />
          <ellipse cx="37" cy="30" rx="3" ry="2" fill={color} />
        </>
      )}
      {muscle === 'Addominali' && (
        <rect x="29" y="34" width="6" height="12" rx="1" fill={color} />
      )}
      {muscle === 'Spalle' && (
        <>
          <circle cx="21" cy="27" r="2.5" fill={color} />
          <circle cx="43" cy="27" r="2.5" fill={color} />
        </>
      )}
      {muscle === 'Bicipiti' && (
        <>
          <ellipse cx="19.5" cy="32" rx="1.8" ry="3" fill={color} />
          <ellipse cx="44.5" cy="32" rx="1.8" ry="3" fill={color} />
        </>
      )}
      {muscle === 'Tricipiti' && (
        <>
          <ellipse cx="20.5" cy="32" rx="1.5" ry="3" fill={color} />
          <ellipse cx="43.5" cy="32" rx="1.5" ry="3" fill={color} />
        </>
      )}
      {muscle === 'Dorsali' && (
        <>
          <path d="M 23,28 C 24,31 27,37 27,42 L 24,44 Z" fill={color} />
          <path d="M 41,28 C 40,31 37,37 37,42 L 40,44 Z" fill={color} />
        </>
      )}
      {muscle === 'Quadricipiti' && (
        <>
          <rect x="24.5" y="52" width="4" height="7" rx="1" fill={color} />
          <rect x="35.5" y="52" width="4" height="7" rx="1" fill={color} />
        </>
      )}
      {muscle === 'Cardio' && (
        <path d="M 32,32 C 32,32 30,30 28,30 C 26,30 25,31.5 25,33 C 25,36 29,39 32,41 C 35,39 39,36 39,33 C 39,31.5 38,30 36,30 C 34,30 32,32 32,32 Z" fill={color} className="animate-pulse" />
      )}
    </svg>
  );
};

// Helper to render inline SVG diagrams for equipment (dumbbells, barbells, etc.)
export const renderEquipmentIcon = (eq: EquipmentType) => {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ background: '#1c1c24', borderRadius: '50%', padding: '8px' }}>
      {eq === 'Bilanciere' && (
        <g stroke="white" strokeWidth="3" fill="none">
          <line x1="8" y1="32" x2="56" y2="32" strokeWidth="4" />
          <rect x="14" y="22" width="4" height="20" rx="1" fill="gray" stroke="none" />
          <rect x="46" y="22" width="4" height="20" rx="1" fill="gray" stroke="none" />
          <rect x="8" y="26" width="3" height="12" rx="1" fill="darkgray" stroke="none" />
          <rect x="53" y="26" width="3" height="12" rx="1" fill="darkgray" stroke="none" />
        </g>
      )}
      {eq === 'Manubri' && (
        <g stroke="white" strokeWidth="3" fill="none">
          <line x1="16" y1="24" x2="48" y2="40" strokeWidth="4" />
          <rect x="10" y="14" width="8" height="16" rx="2" fill="gray" stroke="none" transform="rotate(27 14 22)" />
          <rect x="46" y="32" width="8" height="16" rx="2" fill="gray" stroke="none" transform="rotate(27 50 40)" />
        </g>
      )}
      {eq === 'Macchina' && (
        <g stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <rect x="16" y="12" width="32" height="40" rx="4" />
          <line x1="24" y1="28" x2="40" y2="28" />
          <line x1="24" y1="38" x2="40" y2="38" />
          <circle cx="32" cy="20" r="3" fill="white" />
        </g>
      )}
      {eq === 'Cavi' && (
        <g stroke="white" strokeWidth="2.5" fill="none">
          <line x1="32" y1="12" x2="32" y2="38" strokeDasharray="3,3" />
          <circle cx="32" cy="12" r="3" fill="white" />
          <path d="M 22,44 C 27,41 37,41 42,44" strokeWidth="4" />
          <line x1="22" y1="44" x2="32" y2="38" />
          <line x1="42" y1="44" x2="32" y2="38" />
        </g>
      )}
      {eq === 'Niente' && (
        <g stroke="white" strokeWidth="3" fill="none">
          <circle cx="32" cy="22" r="8" />
          <path d="M 18,50 C 22,42 42,42 46,50" />
          <line x1="32" y1="30" x2="32" y2="40" />
        </g>
      )}
      {eq === 'Fascia di resistenza' && (
        <ellipse cx="32" cy="32" rx="22" ry="8" stroke="var(--color-secondary)" strokeWidth="4" fill="none" transform="rotate(-15 32 32)" />
      )}
      {eq === 'Fasce di sospensione' && (
        <g stroke="white" strokeWidth="3" fill="none">
          <line x1="32" y1="10" x2="20" y2="44" />
          <line x1="32" y1="10" x2="44" y2="44" />
          <rect x="14" y="44" width="12" height="6" rx="1" />
          <rect x="38" y="44" width="12" height="6" rx="1" />
        </g>
      )}
      {eq === 'Kettlebell' && (
        <g fill="white" stroke="none">
          <path d="M 32,12 C 24,12 24,24 24,24 H 40 C 40,24 40,12 32,12 Z" stroke="white" strokeWidth="3" fill="none" />
          <circle cx="32" cy="38" r="18" fill="gray" />
          <text x="32" y="43" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">KB</text>
        </g>
      )}
    </svg>
  );
};
