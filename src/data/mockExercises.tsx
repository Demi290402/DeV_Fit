import { AnatomicalIcon } from '../components/AnatomicalIcon';
import { EquipmentIcon } from '../components/EquipmentIcon';

export type MuscleGroup = 
  | 'Pettorali' 
  | 'Dorsali' 
  | 'Spalle'
  | 'Trapezi'
  | 'Lombari'
  | 'Bicipiti' 
  | 'Tricipiti' 
  | 'Avambracci'
  | 'Addominali' 
  | 'Quadricipiti' 
  | 'Femorali'
  | 'Glutei'
  | 'Polpacci'
  | 'Adduttori' 
  | 'Abduttori' 
  | 'Collo'
  | 'Cardio';

export type EquipmentType = 
  | 'Bilanciere' 
  | 'Manubri' 
  | 'Macchina' 
  | 'Cavi' 
  | 'Niente' 
  | 'Disco'
  | 'Fasce di sospensione'
  | 'Fascia di resistenza'
  | 'Kettlebell'
  | 'Altro';

export type ExerciseTrackingType = 'weight_reps' | 'distance_time' | 'time_only';

export interface Exercise {
  id: string;
  name: string;
  category: 'Petto' | 'Dorso' | 'Gambe' | 'Spalle' | 'Braccia' | 'Core' | 'Cardio';
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  instructions: string;
  videoUrl: string;
  trackingType?: ExerciseTrackingType;
}

export const mockExercises: Exercise[] = [
  // ====================== PETTO ======================
  {
    id: 'ex-panca-piana',
    name: 'Panca Piana con Bilanciere',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Bilanciere',
    instructions: 'Sdraiati sulla panca, afferra il bilanciere con presa leggermente più larga delle spalle. Abbassa la sbarra allo sterno con scapole addotte e spingi verso l\'alto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },
  {
    id: 'ex-panca-inclinata-bil',
    name: 'Panca Inclinata con Bilanciere',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Bilanciere',
    instructions: 'Panca inclinata a 30°-45°. Abbassa il bilanciere sulla parte alta del torace (clavicolare) e spingi verso l\'alto contraendo il petto alto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },
  {
    id: 'ex-panca-declinata-bil',
    name: 'Panca Declinata con Bilanciere',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Bilanciere',
    instructions: 'Panca inclinata verso il basso a -15°/-30°. Abbassa il bilanciere alla parte inferiore del petto per enfatizzare il fascio sternocostale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },
  {
    id: 'ex-spinte-manubri-piana',
    name: 'Spinte con Manubri su Panca Piana',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Scendi con i manubri ai lati del petto fino a sentire un buon allungamento, poi spingi convergendo leggermente verso l\'alto senza toccarli.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },
  {
    id: 'ex-spinte-manubri-inclinata',
    name: 'Panca Inclinata con Manubri',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Panca a 30°. Mantieni il petto alto e i gomiti a circa 60° rispetto al busto. Spingi verso l\'alto focalizzandoti sui fasci superiori.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },
  {
    id: 'ex-chest-press',
    name: 'Chest Press Convergente',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Macchina',
    instructions: 'Regola l\'altezza del sedile affinché le maniglie siano a livello dei capezzoli. Spingi in avanti mantenendo le spalle bloccate indietro.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-his-chest-at-the-gym-flat-40337-large.mp4'
  },
  {
    id: 'ex-croci-manubri-piana',
    name: 'Croci con Manubri su Panca Piana',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Con una leggera flessione fissa dei gomiti, apri le braccia ad arco fino all\'altezza delle spalle per un allungamento profondo del petto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },
  {
    id: 'ex-croci-cavi-alti',
    name: 'Croci ai Cavi Alti',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Cavi',
    instructions: 'Cavi posizionati in alto. Busto leggermente inclinato in avanti, porta le mani verso il basso e l\'ombelico stringendo forte i pettorali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-his-chest-at-the-gym-flat-40337-large.mp4'
  },
  {
    id: 'ex-croci-cavi-bassi',
    name: 'Croci ai Cavi Bassi',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Cavi',
    instructions: 'Cavi posizionati a terra. Porta le mani dal basso verso l\'alto e verso il centro all\'altezza del mento per stimolare il petto clavicolare.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-his-chest-at-the-gym-flat-40337-large.mp4'
  },
  {
    id: 'ex-pectoral-machine',
    name: 'Pectoral Machine (Pec Deck)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Macchina',
    instructions: 'Posiziona gli avambracci o le mani sui cuscinetti. Chiudi le braccia davanti a te focalizzando la massima spremuta al centro del petto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-his-chest-at-the-gym-flat-40337-large.mp4'
  },
  {
    id: 'ex-piegamenti',
    name: 'Piegamenti sulle Braccia (Push-Up)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Niente',
    instructions: 'Corpo dritto in plank, mani leggermente più larghe delle spalle. Scendi sfiorando il pavimento con il petto e distendi con forza.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-dip-parallele',
    name: 'Dip alle Parallele per Petto',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Niente',
    instructions: 'Inclinati in avanti con il busto a circa 30° e allarga leggermente i gomiti per concentrare il carico sul petto inferiore.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },

  // ====================== DORSO & LOMBARI ======================
  {
    id: 'ex-lat-machine',
    name: 'Lat Pulldown al Cavo (Presa Larga)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Tira la sbarra verso la parte alta del petto portando i gomiti verso il basso e indietro, aprendo la cassa toracica.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-lat-presa-inversa',
    name: 'Lat Machine Presa Supina',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Presa inversa (palmi rivolti a te) alla larghezza spalle. Tira focalizzandoti sull\'estensione dei dorsali bassi e coinvolgimento bicipiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-trazioni-sbarra',
    name: 'Trazioni alla Sbarra (Pull-Up)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Niente',
    instructions: 'Presa prona oltre la larghezza spalle. Sollevati fino a superare la sbarra con il mento senza dondolare.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-chin-ups',
    name: 'Trazioni Presa Supina (Chin-Up)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Niente',
    instructions: 'Palmi verso il viso. Sollevati stringendo dorsali e bicipiti con massima escursione di movimento.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-rematore-bilanciere',
    name: 'Rematore con Bilanciere',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Bilanciere',
    instructions: 'Busto inclinato a 45°, schiena dritta. Tira il bilanciere verso l\'ombelico spingendo indietro i gomiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-rematore-manubrio',
    name: 'Rematore Singolo con Manubrio',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Manubri',
    instructions: 'Ginocchio e mano opposta sulla panca. Tira il manubrio verso l\'anca tenendo il gomito vicino al fianco.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-rematore-seduto',
    name: 'Rematore al Cavo da Seduto (Pulley)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Siediti con ginocchia leggermente flesse e schiena dritta. Tira la maniglia all\'ombelico unendo le scapole.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-t-bar-row',
    name: 'T-Bar Row con Supporto',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Macchina',
    instructions: 'Petto appoggiato al cuscinetto. Tira le maniglie verso di te per isolare lo spessore dorsale e i romboidi.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-pullover-cavo',
    name: 'Pullover al Cavo Alto con Corda',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Braccia quasi tese, busto inclinato a 30°. Abbassa la corda verso le cosce ad arco contraendo i dorsali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-stacco-terra',
    name: 'Stacco da Terra Tradizionale (Deadlift)',
    category: 'Dorso',
    muscleGroup: 'Lombari',
    equipment: 'Bilanciere',
    instructions: 'Piedi larghezza anche, schiena neutra. Spingi via il pavimento estendendo contemporaneamente ginocchia e anche.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-hyperextension',
    name: 'Hyperextension per Lombari',
    category: 'Dorso',
    muscleGroup: 'Lombari',
    equipment: 'Macchina',
    instructions: 'Blocca le caviglie sulla panca a 45°. Fletti il busto in avanti e risali fino all\'allineamento con le gambe.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-scrollate-bil',
    name: 'Scrollate con Bilanciere (Shrug)',
    category: 'Dorso',
    muscleGroup: 'Trapezi',
    equipment: 'Bilanciere',
    instructions: 'Braccia tese lungo i fianchi. Solleva le spalle dritto verso le orecchie, trattieni 1 secondo e rilascia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },
  {
    id: 'ex-scrollate-manubri',
    name: 'Scrollate con Manubri',
    category: 'Dorso',
    muscleGroup: 'Trapezi',
    equipment: 'Manubri',
    instructions: 'Tieni i manubri ai lati del corpo. Eleva i trapezi verso l\'alto senza ruotare le spalle all\'indietro.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4'
  },

  // ====================== SPALLE ======================
  {
    id: 'ex-military-press',
    name: 'Military Press con Bilanciere',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Bilanciere',
    instructions: 'In piedi con core e glutei serrati. Spingi il bilanciere dal petto verso l\'alto fin sopra la testa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-lento-manubri-seduto',
    name: 'Lento Avanti Seduto con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Panca a 80°-90°. Spingi i manubri verso l\'alto mantenendo i gomiti leggermente avanti rispetto alle spalle.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-shoulder-press-mach',
    name: 'Lento in Avanti Seduto (Macchina)',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Macchina',
    instructions: 'Regola l\'altezza del sedile. Spingi le impugnature verso l\'alto mantenendo la schiena aderente allo schienale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-arnold-press',
    name: 'Arnold Press con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Inizia con i palmi rivolti a te all\'altezza del petto; ruota i gomiti verso l\'esterno mentre spingi verso l\'alto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-alzate-laterali',
    name: 'Alzate Laterali con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Solleva i manubri verso l\'esterno con gomiti leggermente piegati fino all\'altezza delle spalle. Ritorno controllato.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-alzate-laterali-cavo',
    name: 'Alzate Laterali al Cavo Singolo',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Cavi',
    instructions: 'Cavo basso che passa dietro il corpo o davanti. Tensione costante su tutto il range del deltoide laterale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-alzate-frontali-manubri',
    name: 'Alzate Frontali con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Solleva un manubrio alla volta dritto davanti a te fino al livello degli occhi, isolando il deltoide anteriore.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-alzate-frontali-disco',
    name: 'Alzate Frontali con Disco',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Disco',
    instructions: 'Afferra un disco olimpico a ore 9 e ore 3. Sollevalo davanti al viso mantenendo le braccia tese.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-alzate-posteriori',
    name: 'Alzate Posteriori a 90° con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Busto flesso a 90° con schiena piatta. Apri le braccia a croce concentrandoti sui deltoidi posteriori.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-face-pull',
    name: 'Face Pull al Cavo con Corda',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Cavi',
    instructions: 'Cavo all\'altezza della fronte. Tira la corda verso gli occhi aprendo i gomiti e ruotando esternamente le spalle.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },
  {
    id: 'ex-rear-delt-fly',
    name: 'Rear Delt Fly alla Macchina',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Macchina',
    instructions: 'Petto contro il sedile della pectoral machine. Apri le braccia all\'indietro isolando la cuffia e il retro spalla.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-lateral-raises-40333-large.mp4'
  },

  // ====================== BRACCIA (BICIPITI) ======================
  {
    id: 'ex-curl-bilanciere',
    name: 'Curl Bicipiti con Bilanciere',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Bilanciere',
    instructions: 'Gomiti saldi ai fianchi. Fletti le braccia sollevando il bilanciere verso le spalle senza oscillare con il busto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-curl-bilanciere-ez',
    name: 'Curl Bicipiti con Bilanciere EZ',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Bilanciere',
    instructions: 'L\'angolatura sagomata della barra EZ riduce lo stress sui polsi e massimizza la contrazione del picco del bicipite.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-curl-bicipiti-manubri',
    name: 'Curl Bicipiti Alternato con Manubri',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Inizia con presa a martello e supina il palmo verso l\'alto durante la salita strizzando il bicipite al vertice.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-hammer-curl',
    name: 'Bicipiti a Martello (Hammer Curl)',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Mantieni i palmi sempre rivolti l\'uno verso l\'altro durante tutto il movimento per sviluppare brachiale e avambraccio.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-curl-panca-inclinata',
    name: 'Curl su Panca Inclinata con Manubri',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Panca a 45°-60°. Le braccia partono all\'indietro, massimizzando l\'allungamento del capo lungo del bicipite.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-curl-scott',
    name: 'Curl alla Panca Scott (Preacher Curl)',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Bilanciere',
    instructions: 'Braccia bloccate sul cuscinetto inclinato della panca Scott per impedire qualsiasi cheating con le spalle.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-curl-cavi-basso',
    name: 'Curl Bicipiti al Cavo Basso',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Cavi',
    instructions: 'Tensione elastica costante anche nella parte inferiore del movimento, ideale per un pompaggio continuo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-curl-21',
    name: 'Curl Bicipiti 21',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Bilanciere',
    instructions: '7 ripetizioni dal basso a metà, 7 da metà fino in cima, e 7 ripetizioni con arco di movimento completo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },

  // ====================== BRACCIA (TRICIPITI) ======================
  {
    id: 'ex-pushdown',
    name: 'Pushdown Tricipiti con Cavo (Corda)',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Gomiti fermi e aderenti al busto. Spingi la corda verso il basso aprendola leggermente all\'estremità finale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-triceps-pushdown-at-the-gym-40335-large.mp4'
  },
  {
    id: 'ex-pushdown-barra',
    name: 'Pushdown Tricipiti con Barra a V',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Presa solida sulla barra a V. Distendi le braccia spingendo verso il basso senza alzare le spalle.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-triceps-pushdown-at-the-gym-40335-large.mp4'
  },
  {
    id: 'ex-pushdown-singolo',
    name: 'Pushdown Tricipiti a Braccio Singolo',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Lavora un braccio per volta per correggere asimmetrie muscolari e garantire una contrazione focalizzata.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-triceps-pushdown-at-the-gym-40335-large.mp4'
  },
  {
    id: 'ex-french-press',
    name: 'French Press con Bilanciere EZ',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Bilanciere',
    instructions: 'Sdraiati su panca. Abbassa il bilanciere verso la fronte o dietro la testa flettendo solo i gomiti e poi risali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-triceps-pushdown-at-the-gym-40335-large.mp4'
  },
  {
    id: 'ex-estensioni-sopra-testa',
    name: 'Estensioni Tricipiti Sopra la Testa (Cavo)',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Dalle spalle inclinate in avanti, distendi le braccia sopra la testa enfatizzando il capo lungo del tricipite.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-triceps-pushdown-at-the-gym-40335-large.mp4'
  },
  {
    id: 'ex-dip-tricipiti',
    name: 'Dip tra Due Panche',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Niente',
    instructions: 'Mani su una panca dietro la schiena e talloni sull\'altra. Fletti i gomiti fino a 90° e risali distendendo le braccia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-triceps-pushdown-at-the-gym-40335-large.mp4'
  },
  {
    id: 'ex-panca-stretta',
    name: 'Panca Piana con Presa Stretta',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Bilanciere',
    instructions: 'Presa alla larghezza delle spalle con gomiti vicini al torace per spostare il lavoro dal petto ai tricipiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4'
  },

  // ====================== AVAMBRACCI ======================
  {
    id: 'ex-wrist-curl',
    name: 'Wrist Curl con Bilanciere (Flessione Polsi)',
    category: 'Braccia',
    muscleGroup: 'Avambracci',
    equipment: 'Bilanciere',
    instructions: 'Avambracci poggiati sulle cosce o su una panca con i polsi liberi. Fletti i polsi sollevando il bilanciere.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },
  {
    id: 'ex-farmers-walk',
    name: 'Camminata del Contadino (Farmer\'s Walk)',
    category: 'Braccia',
    muscleGroup: 'Avambracci',
    equipment: 'Manubri',
    instructions: 'Afferra due manubri pesanti lungo i fianchi e cammina mantenendo postura eretta e presa di ferro salda.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-man-doing-biceps-curls-with-dumbbells-40328-large.mp4'
  },

  // ====================== GAMBE (QUADRICIPITI) ======================
  {
    id: 'ex-squat',
    name: 'Squat con Bilanciere (Back Squat)',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Bilanciere',
    instructions: 'Bilanciere sui trapezi, piedi larghezza spalle. Scendi spingendo il bacino indietro e le ginocchia in fuori oltre il parallelo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-front-squat',
    name: 'Front Squat con Bilanciere',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Bilanciere',
    instructions: 'Bilanciere poggiato sui deltoidi anteriori con gomiti alti. Il busto rimane molto eretto, isolando i quadricipiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-leg-press',
    name: 'Leg Press a 45°',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Macchina',
    instructions: 'Piedi a metà pedana larghezza spalle. Abbassa il carrello fino a 90° al ginocchio senza staccare il sacro dallo schienale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-hack-squat',
    name: 'Hack Squat alla Macchina',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Macchina',
    instructions: 'Schiena aderente al supporto inclinato. Scendi in profondità per uno stimolo quadricipite massimale in sicurezza.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension alla Macchina',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Macchina',
    instructions: 'Siediti con ginocchia allineate al perno della macchina. Estendi le gambe fino al blocco orizzontale e controlla la discesa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-affondi-manubri',
    name: 'Affondi Camminati con Manubri',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Manubri',
    instructions: 'Fai un passo in avanti flettendo entrambe le ginocchia a 90°. Spingi con il tallone anteriore per fare il passo successivo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Split Squat Bulgaro con Manubri',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Manubri',
    instructions: 'Piede posteriore poggiato su una panca dietro di te. Scendi in verticale fino a sfiorare il terreno con il ginocchio dietro.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-goblet-squat',
    name: 'Goblet Squat con Kettlebell',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Kettlebell',
    instructions: 'Tieni la kettlebell al petto per le corna. Scendi in squat profondo tenendo i gomiti tra le ginocchia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },

  // ====================== GAMBE (GLUTEI & FEMORALI) ======================
  {
    id: 'ex-hip-thrust',
    name: 'Hip Thrust con Bilanciere',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Bilanciere',
    instructions: 'Scapole contro la panca, bilanciere protetto sul bacino. Spingi sui talloni estendendo l\'anca e contrai forte i glutei in cima.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-slanci-cavi',
    name: 'Slanci ai Cavi per Glutei (Glute Kickback)',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Cavi',
    instructions: 'Cavigliera al cavo basso. Mantieni il busto fermo ed estendi la gamba all\'indietro strizzando il gluteo in fase concentrica.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-abductor-machine',
    name: 'Abductor Machine (Glutei Esterni)',
    category: 'Gambe',
    muscleGroup: 'Abduttori',
    equipment: 'Macchina',
    instructions: 'Siediti con cuscinetti esterni alle cosce. Allarga le gambe spingendo con i glutei e mantieni la massima apertura per 1 secondo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-adductor-machine',
    name: 'Adductor Machine (Interno Coscia)',
    category: 'Gambe',
    muscleGroup: 'Adduttori',
    equipment: 'Macchina',
    instructions: 'Cuscinetti all\'interno delle ginocchia. Chiudi le gambe contraendo con decisione la muscolatura adduttoria.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-stacco-rumeno',
    name: 'Stacco Rumeno con Bilanciere (RDL)',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Bilanciere',
    instructions: 'Ginocchia semirigide. Spingi il bacino indietro mantenendo il bilanciere a contatto con le cosce per allungare i femorali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-stacco-rumeno-manubri',
    name: 'Stacco Rumeno con Manubri',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Manubri',
    instructions: 'Fletti le anche indietro tenendo la colonna neutra. Scendi fino a metà tibia e risali contraendo glutei e femorali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-leg-curl',
    name: 'Leg Curl Seduto alla Macchina',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Macchina',
    instructions: 'Cosce bloccate dal cuscinetto. Fletti le ginocchia portando i talloni sotto il sedile e controlla la fase negativa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-leg-curl-sdraiato',
    name: 'Leg Curl Sdraiato alla Macchina',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Macchina',
    instructions: 'Sdraiati prono con il cuscinetto sopra i talloni. Tira i piedi verso i glutei senza sollevare il bacino dalla panca.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },

  // ====================== GAMBE (POLPACCI) ======================
  {
    id: 'ex-calf-raise-piedi',
    name: 'Calf Raise in Piedi alla Macchina',
    category: 'Gambe',
    muscleGroup: 'Polpacci',
    equipment: 'Macchina',
    instructions: 'Punte sulla pedana e spalle sotto i cuscinetti. Scendi allungando il tendine e sollevati al massimo sulla punta dei piedi.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-calf-raise-seduto',
    name: 'Calf Raise da Seduto alla Macchina',
    category: 'Gambe',
    muscleGroup: 'Polpacci',
    equipment: 'Macchina',
    instructions: 'Ginocchia flesse a 90° sotto il cuscinetto per isolare il muscolo soleo. Massima estensione e pausa in contrazione.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-calf-press',
    name: 'Calf Raise alla Leg Press',
    category: 'Gambe',
    muscleGroup: 'Polpacci',
    equipment: 'Macchina',
    instructions: 'Punte sulla parte inferiore della pedana della leg press con gambe tese. Fletti ed estendi le caviglie controllando il carico.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },

  // ====================== CORE & ADDOMINALI ======================
  {
    id: 'ex-crunch',
    name: 'Crunch Addominale a Terra',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Mani alle tempie o sul petto. Solleva le scapole dal pavimento espirando e contraendo l\'addome senza tirare il collo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },
  {
    id: 'ex-cable-crunch',
    name: 'Crunch al Cavo con Corda da Inginocchiati',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Cavi',
    instructions: 'In ginocchio davanti al cavo alto. Tieni la corda ai lati della testa e fletti la gabbia toracica verso le ginocchia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },
  {
    id: 'ex-leg-raise-parallele',
    name: 'Sollevamento Gambe alle Parallele',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Avambracci appoggiati ai supporti della torre. Solleva le gambe tese o piegate fino a superare i 90° flettendo il bacino.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raise alla Sbarra',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Appeso alla sbarra per trazioni. Solleva le gambe tese fino alla sbarra contraendo con forza gli addominali bassi.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },
  {
    id: 'ex-plank',
    name: 'Plank Addominale Isometrico',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Poggiati sugli avambracci e sulle punte dei piedi. Mantieni il corpo rigido come una tavola stringendo glutei e addome.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-bicycle-crunch',
    name: 'Gomiti sulle Ginocchia (Bicycle Crunch)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Sdraiato sulla schiena, alterna portando il gomito destro al ginocchio sinistro e viceversa per stimolare gli obliqui.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },
  {
    id: 'ex-leg-raise-sdraiato',
    name: 'Leg Raise Sdraiato su Tappetino',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Mani sotto i glutei per proteggere la zona lombare. Solleva le gambe tese a 90° e scendi lentamente senza toccare il pavimento.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },
  {
    id: 'ex-russian-twist',
    name: 'Russian Twist con Disco',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Disco',
    instructions: 'Busto inclinato a 45° con talloni sollevati. Ruota il disco da un fianco all\'altro ruotando il tronco.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },
  {
    id: 'ex-ab-wheel',
    name: 'Rollout con Ruota Addominale',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'In ginocchio, fai scorrere la ruota in avanti estendendo il corpo e richiudi facendo forza unicamente sull\'addome.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-abdominal-crunches-at-home-40319-large.mp4'
  },

  // ====================== CARDIO & FUNZIONALE ======================
  {
    id: 'ex-tapis-roulant',
    name: 'Tapis Roulant (Corsa o Camminata Inclinata)',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Attività cardiovascolare aerobica. Mantieni una cadenza costante o sperimenta intervalli HIIT per massimizzare il consumo calorico.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-cyclette',
    name: 'Cyclette / Spin Bike',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Pedala a ritmo sostenuto regolando la resistenza magnetica per stimolare la capacità polmonare e le gambe senza impatto sulle articolazioni.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-vogatore',
    name: 'Vogatore (Rowing Machine)',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Spingi con le gambe, apri il bacino e poi tira con le braccia verso lo sterno. Coinvolge l\'85% dei muscoli corporei.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-on-lat-pull-down-machine-40336-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-ellittica',
    name: 'Ellittica (Cross Trainer)',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Movimento fluido combinato braccia-gambe a basso impatto articolare per resistenza e consumo calorico.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-corsa-outdoor',
    name: 'Corsa / Camminata all\'Aperto',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Niente',
    instructions: 'Corsa continua all\'aperto per stimolo cardiovascolare e ossigenazione.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-kettlebell-swing',
    name: 'Kettlebell Swing',
    category: 'Cardio',
    muscleGroup: 'Glutei',
    equipment: 'Kettlebell',
    instructions: 'Hip hinge dinamico: spingi il bacino indietro e proietta la kettlebell all\'altezza del petto contraendo glutei e addome.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4'
  },
  {
    id: 'ex-salto-corda',
    name: 'Salto della Corda (Jump Rope)',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Niente',
    instructions: 'Rimbalza sulla punta dei piedi facendo ruotare la corda solo con i polsi, ritmo e coordinazione continui.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'time_only'
  }
];

// Helper to check if an exercise tracks distance & time (e.g. treadmill, bike, rowing)
export const isDistanceTimeExercise = (exercise?: Exercise | null): boolean => {
  if (!exercise) return false;
  if (exercise.trackingType === 'distance_time') return true;
  if (exercise.trackingType === 'weight_reps' || exercise.trackingType === 'time_only') return false;

  const id = exercise.id.toLowerCase();
  const name = exercise.name.toLowerCase();
  return (
    id === 'ex-tapis-roulant' ||
    id === 'ex-cyclette' ||
    id === 'ex-vogatore' ||
    id === 'ex-ellittica' ||
    id === 'ex-corsa-outdoor' ||
    name.includes('tapis') ||
    name.includes('roulant') ||
    name.includes('treadmill') ||
    name.includes('cyclette') ||
    name.includes('spin bike') ||
    name.includes('vogatore') ||
    name.includes('rowing') ||
    name.includes('ellittica') ||
    name.includes('corsa') ||
    name.includes('running')
  );
};

// Helper to check if an exercise is isometric / time only (e.g. plank, jump rope duration)
export const isTimeOnlyExercise = (exercise?: Exercise | null): boolean => {
  if (!exercise) return false;
  if (exercise.trackingType === 'time_only') return true;
  if (exercise.trackingType === 'weight_reps' || exercise.trackingType === 'distance_time') return false;

  const id = exercise.id.toLowerCase();
  const name = exercise.name.toLowerCase();
  return (
    id === 'ex-plank' ||
    name.includes('plank') ||
    name.includes('isometrico') ||
    name.includes('tenuta') ||
    name.includes('hollow')
  );
};

// Helper to check if an exercise uses barbell plates (for Disc calculator icon)
export const isPlateLoadedExercise = (exercise?: Exercise | null): boolean => {
  if (!exercise) return false;
  return exercise.equipment === 'Bilanciere' || exercise.equipment === 'Disco';
};

// Helper to render high definition inline SVG anatomical miniatures
export const renderMuscleIcon = (muscle: MuscleGroup, size: number = 40, highlightColor?: string) => {
  return <AnatomicalIcon muscle={muscle} size={size} highlightColor={highlightColor} />;
};

// Helper to render high definition equipment icons
export const renderEquipmentIcon = (equipment: EquipmentType | 'All', size: number = 32, color?: string) => {
  return <EquipmentIcon equipment={equipment} size={size} color={color} />;
};
