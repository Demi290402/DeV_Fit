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
  {
    id: 'ex-panca-piana',
    name: 'Panca Piana con Bilanciere',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Bilanciere',
    instructions: 'Sdraiati sulla panca piana con piedi ben saldi a terra. Afferra il bilanciere poco più largo delle spalle. Abbassa la sbarra allo sterno adducendo le scapole e spingi in alto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-panca-inclinata-bil',
    name: 'Panca Inclinata con Bilanciere',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Bilanciere',
    instructions: 'Panca a 30°-45°. Impugna il bilanciere e scendi controllando la traiettoria verso la parte alta del petto (clavicolare), quindi distendi le braccia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-panca-declinata-bil',
    name: 'Panca Declinata con Bilanciere',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Bilanciere',
    instructions: 'Panca declinata a 15°-30°. Focalizza il lavoro sui fasci inferiori del grande pettorale, discesa controllata alla base dello sterno.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-spinte-manubri-piana',
    name: 'Spinte con Manubri su Panca Piana',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Disteso su panca piana, spingi i manubri verso l\'alto garantendo un arco di movimento ampio con massimo allungamento in basso.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-spinte-manubri-inclinata',
    name: 'Spinte con Manubri su Panca Inclinata',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Panca inclinata a 30°. Gomiti leggermente chiusi a 45°-60° rispetto al busto, spingi i manubri in convergenza senza farli toccare.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-spinte-manubri-declinata',
    name: 'Spinte con Manubri su Panca Declinata',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Isola i fasci sternocostali inferiori con massima escursione articolare e sicurezza per le cuffie dei rotatori.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-chest-press-macchina',
    name: 'Chest Press (Macchina)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Macchina',
    instructions: 'Regola l\'altezza del sellino in modo che le impugnature siano all\'altezza del centro del petto. Spingi in avanti mantenendo le scapole incollate allo schienale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-chest-press-inclinata',
    name: 'Incline Chest Press (Macchina)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Macchina',
    instructions: 'Traiettoria convergente guidata mirata al fascio clavicolare del pettorale con tensione costante.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-croci-manubri-piana',
    name: 'Croci con Manubri su Panca Piana',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Gomiti leggermente flessi ad angolo fisso. Apri le braccia inspirando fino al massimo allungamento pettorale, richiudi espirando.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-croci-manubri-inclinata',
    name: 'Croci con Manubri su Panca Inclinata',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Enfasi sull\'allungamento della parte superiore del petto. Mantieni il petto in fuori e le spalle basse e retratte.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-croci-cavi-alti',
    name: 'Croci ai Cavi Alti (Crossover)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Cavi',
    instructions: 'Posizionati al centro della torretta cavi, inclina leggermente il busto in avanti. Conduci i cavi verso il basso e l\'avanti incrociando leggermente le mani.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-croci-cavi-bassi',
    name: 'Croci ai Cavi Bassi',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Cavi',
    instructions: 'Cavi posizionati in basso. Porta le maniglie verso l\'alto e verso l\'interno all\'altezza del mento con traiettoria a semicerchio.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-croci-cavi-medi',
    name: 'Croci ai Cavi su Panca Piana',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Cavi',
    instructions: 'Posiziona una panca tra i cavi. Permette una tensione muscolare continua lungo l\'intero arco di movimento.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pectoral-machine',
    name: 'Pectoral Machine (Pec Deck)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Macchina',
    instructions: 'Seduto dritto, avambracci o mani sulle imbottiture. Chiudi le braccia stringendo intensamente il petto per 1 secondo al picco di contrazione.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-dip-parallele-petto',
    name: 'Dip alle Parallele (Focus Petto)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Niente',
    instructions: 'Impugna le sbarre, inclina il busto a 30° in avanti con gomiti leggermente aperti per spostare il focus dal tricipite al grande pettorale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-piegamenti-terra',
    name: 'Piegamenti sulle Braccia (Push-Up)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Niente',
    instructions: 'Mani a terra poco più larghe delle spalle, core contratto a tavola. Scendi fino a sfiorare il pavimento con il petto e risali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pushup-declinati',
    name: 'Push-Up con Piedi Rialzati',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Niente',
    instructions: 'Posiziona i piedi su una panca o rialzo. Aumenta il carico percepito e stimola con intensità i fasci superiori del pettorale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pullover-manubrio',
    name: 'Pullover con Manubrio',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Manubri',
    instructions: 'Disteso trasversalmente sulla panca, impugna un manubrio a due mani a calice. Abbassa lentamente dietro la testa espandendo la cassa toracica.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-panca-smith',
    name: 'Panca Piana al Multipower (Smith Machine)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Macchina',
    instructions: 'Guida rigida che consente di spingere carichi massimali in sicurezza senza richiedere stabilizzazione laterale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-panca-inclinata-smith',
    name: 'Panca Inclinata al Multipower (Smith Machine)',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Macchina',
    instructions: 'Focus sul fascio clavicolare con traiettoria fissa per un sovraccarico progressivo controllato.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-svend-press',
    name: 'Svend Press con Disco',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Disco',
    instructions: 'Stringi uno o due dischi tra i palmi delle mani davanti al petto ed estendi le braccia mantenendo la massima pressione isometrica.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-landmine-chest-press',
    name: 'Landmine Chest Press',
    category: 'Petto',
    muscleGroup: 'Pettorali',
    equipment: 'Bilanciere',
    instructions: 'Impugna l\'estremità libera di un bilanciere ancorato e spingi diagonalmente in avanti e verso l\'alto attivando la porzione alta del petto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-stacco-terra',
    name: 'Stacco da Terra con Bilanciere (Deadlift)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Bilanciere',
    instructions: 'Piedi a larghezza bacino, schiena neutra. Afferra il bilanciere, spingi con i talloni estendendo contemporaneamente ginocchia e anche.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-trazioni-prona',
    name: 'Trazioni alla Sbarra (Pull-Up Presa Prona)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Niente',
    instructions: 'Impugna la sbarra a presa prona più larga delle spalle. Traziona fino a portare il mento sopra la sbarra deprimendo le scapole.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-trazioni-supina',
    name: 'Trazioni alla Sbarra (Chin-Up Presa Supina)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Niente',
    instructions: 'Presa supina a larghezza spalle. Coinvolge con forza il gran dorsale e il bicipite brachiale durante la trazione.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-trazioni-neutra',
    name: 'Trazioni Presa Neutra',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Niente',
    instructions: 'Impugnatura a presa parallela. Riduce lo stress articolare su polsi e spalle consentendo grande sviluppo di spessore dorsale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-lat-pulldown-cavo',
    name: 'Lat Pulldown (Cavo)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Seduto alla lat machine, blocca le cosce sotto i cuscinetti. Tira la barra verso la parte alta dello sterno inclinando leggermente il busto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-lat-machine-inversa',
    name: 'Lat Machine Presa Inversa (Supina)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Presa supina a larghezza spalle. Enfatizza il lavoro sulle fibre inferiori del gran dorsale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-lat-machine-triangolo',
    name: 'Lat Machine con Presa a Triangolo',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Presa stretta neutra. Traziona verso il petto tirando con i gomiti stretti lungo i fianchi.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-lat-pulldown-dritte',
    name: 'Lat Pulldown Braccia Dritte (Cavo)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'In piedi davanti al cavo alto, gomiti quasi tesi. Abbassa la barra fino alle cosce attivando esclusivamente i dorsali in isolamento.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-rematore-bilanciere',
    name: 'Rematore con Bilanciere (Barbell Row)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Bilanciere',
    instructions: 'Busto flesso in avanti a 45°-60°, schiena compatta. Tira il bilanciere verso l\'ombelico stringendo le scapole al massimo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-rematore-pendlay',
    name: 'Pendlay Row con Bilanciere',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Bilanciere',
    instructions: 'Busto parallelo al suolo a 90°. Ogni ripetizione riparte da fermo dal pavimento con trazione esplosiva al petto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-rematore-manubrio',
    name: 'Rematore con Manubrio Singolo',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Manubri',
    instructions: 'Ginocchio e mano in appoggio su panca. Tira il manubrio verso l\'anca mantenendo il busto fermo e adducendo la scapola.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-rematore-macchina',
    name: 'Rematore Alto Convergente (Macchina)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Macchina',
    instructions: 'Seduto con petto contro il cuscino, tira le impugnature verso il busto mantenendo i gomiti alti per colpire trapezio e gran dorsale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pulley-basso',
    name: 'Pulley Basso al Cavo',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Seduto con gambe leggermente piegate, busto eretto. Tira il triangolo verso l\'ombelico aprendo il petto e contraendo i dorsali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pulley-larga',
    name: 'Pulley Basso Presa Larga Prona',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Usa una barra dritta con presa prona larga per spostare il focus sullo spessore del trapezio medio e romboidi.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-t-bar-row',
    name: 'T-Bar Row con Supporto Petto',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Macchina',
    instructions: 'Petto in appoggio su panca inclinata, afferra le maniglie a presa neutra e traziona verso l\'alto senza sovraccaricare la zona lombare.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-seal-row',
    name: 'Seal Row su Panca Orizzontale',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Bilanciere',
    instructions: 'Sdraiato a pancia in giù su panca rialzata, tira il bilanciere fino a toccare il fondo della panca annullando qualsiasi slancio corporeo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-face-pull',
    name: 'Face Pull ai Cavi con Corda',
    category: 'Dorso',
    muscleGroup: 'Trapezi',
    equipment: 'Cavi',
    instructions: 'Cavo posizionato all\'altezza degli occhi, impugna la corda e tira verso la fronte extraruotando le spalle per rinforzare deltoide posteriore e cuffia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-shrug-bilanciere',
    name: 'Shrug con Bilanciere (Scrollate)',
    category: 'Dorso',
    muscleGroup: 'Trapezi',
    equipment: 'Bilanciere',
    instructions: 'In piedi, braccia distese. Eleva le spalle verso le orecchie contraendo intensamente i trapezi superiori senza ruotare le spalle.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-shrug-manubri',
    name: 'Shrug con Manubri',
    category: 'Dorso',
    muscleGroup: 'Trapezi',
    equipment: 'Manubri',
    instructions: 'Manubri lungo i fianchi a presa neutra. Solleva le spalle con movimento verticale puro trattenendo la contrazione per 1 secondo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-hyperextension-lombari',
    name: 'Iperestensioni Lombari (Panca a 45°)',
    category: 'Dorso',
    muscleGroup: 'Lombari',
    equipment: 'Niente',
    instructions: 'Bacino bloccato sull\'imbottitura. Fletti il busto verso il basso e risali estendendo la colonna fino alla linea neutra con il corpo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-good-morning',
    name: 'Good Morning con Bilanciere',
    category: 'Dorso',
    muscleGroup: 'Lombari',
    equipment: 'Bilanciere',
    instructions: 'Bilanciere sui trapezi, ginocchia sbloccate. Spingi il bacino indietro flettendo il busto in avanti mantenendo la schiena lombare perfettamente estesa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-stacco-trap-bar',
    name: 'Stacco con Trap Bar (Hex Bar Deadlift)',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Bilanciere',
    instructions: 'Posizionati all\'interno della trap bar. La presa neutra e il baricentro allineato riducono il momento torcente sulla colonna lombare.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-rematore-cavo-singolo',
    name: 'Rematore Unilaterale al Cavo Basso',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Esegui il rematore con un braccio alla volta per massimizzare la torsione controllata e l\'allungamento laterale del gran dorsale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pullover-cavi',
    name: 'Pullover al Cavo con Corda',
    category: 'Dorso',
    muscleGroup: 'Dorsali',
    equipment: 'Cavi',
    instructions: 'Ginocchia a terra o in piedi con busto inclinato. Porta la corda dalle spalle fino ai fianchi aprendola al termine del movimento.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-squat-bilanciere',
    name: 'Squat con Bilanciere (Back Squat)',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Bilanciere',
    instructions: 'Bilanciere sui trapezi, piedi larghezza spalle con punte leggermente aperte. Scendi fino a rompere il parallelo e risali spingendo sui talloni.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-front-squat',
    name: 'Front Squat con Bilanciere',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Bilanciere',
    instructions: 'Bilanciere posizionato sui deltoidi anteriori con gomiti alti. Il busto rimane molto più eretto caricando fortemente i quadricipiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-leg-press-45',
    name: 'Leg Press a 45°',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Macchina',
    instructions: 'Schiena e glutei ben aderenti al sedile. Piedi a larghezza spalle sulla pedana. Scendi controllando il carico senza staccare l\'osso sacro.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-hack-squat',
    name: 'Hack Squat (Macchina)',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Macchina',
    instructions: 'Spalle sotto i cuscini, schiena aderente. Scendi fino a formare un angolo di 90° o inferiore alle ginocchia con massimo stimolo quadricipitale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension (Macchina)',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Macchina',
    instructions: 'Regola il rullo sopra le caviglie e l\'asse del ginocchio allineato al fulcro. Estendi le gambe contraendo al massimo il quadricipite.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat con Manubri',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Manubri',
    instructions: 'Un piede poggiato indietro su panca, l\'altro avanti. Scendi verticalmente caricando il gluteo e quadricipite della gamba anteriore.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-affondi-camminati',
    name: 'Affondi Camminati con Manubri',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Manubri',
    instructions: 'Fai un passo avanti flettendo entrambe le ginocchia a 90°. Spingi con la gamba anteriore per avanzare con l\'altra gamba.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-affondi-indietro',
    name: 'Affondi all\'Indietro (Reverse Lunge)',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Manubri',
    instructions: 'Fai un passo indietro piegando il ginocchio a sfiorare il suolo. Più sicuro per l\'articolazione del ginocchio rispetto agli affondi frontali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-goblet-squat',
    name: 'Goblet Squat con Manubrio o Kettlebell',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Manubri',
    instructions: 'Sostieni il carico aderente al petto. Mantieni il busto alto e scendi in accosciata profonda allargando le ginocchia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-hip-thrust',
    name: 'Hip Thrust con Bilanciere',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Bilanciere',
    instructions: 'Dorso in appoggio su panca, bilanciere protetto sul bacino. Estendi le anche verso l\'alto contraendo ferocemente i glutei in cima.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-glute-bridge',
    name: 'Glute Bridge a Terra',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Niente',
    instructions: 'Sdraiati supino con ginocchia flesse e piedi a terra. Solleva il bacino allineando cosce e busto stringendo i glutei.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-stacco-rumeno-bil',
    name: 'Stacco Rumeno con Bilanciere (RDL)',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Bilanciere',
    instructions: 'Ginocchia appena piegate. Spingi il bacino indietro scivolando il bilanciere lungo le cosce fino a sentire forte allungamento sui femorali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-stacco-rumeno-man',
    name: 'Stacco Rumeno con Manubri',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Manubri',
    instructions: 'Manubri davanti alle cosce. Discesa lenta e controllata arretrando il sedere, schiena dritta con scapole addotte.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-leg-curl-sdraiato',
    name: 'Leg Curl Sdraiato (Macchina)',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Macchina',
    instructions: 'Sdraiati prono con il cuscinetto dietro le caviglie. Fletti le gambe portando i talloni verso i glutei senza sollevare il bacino.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-leg-curl-seduto',
    name: 'Leg Curl da Seduto (Macchina)',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Macchina',
    instructions: 'L\'anca flessa a 90° massimizza il pre-allungamento del bicipite femorale e semitendinoso per una stimolazione ottimale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-leg-curl-in-piedi',
    name: 'Standing Leg Curl Unilaterale',
    category: 'Gambe',
    muscleGroup: 'Femorali',
    equipment: 'Macchina',
    instructions: 'Lavoro singolo per gamba per correggere asimmetrie di forza nei flessori della coscia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-abduzione-anche',
    name: 'Abduzione Anche (Macchina)',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Macchina',
    instructions: 'Seduto con cuscinetti all\'esterno delle cosce. Spingi le ginocchia verso l\'esterno aprendo le gambe per stimolare il medio gluteo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-adduzione-anche',
    name: 'Adduzione Anche (Macchina)',
    category: 'Gambe',
    muscleGroup: 'Adduttori',
    equipment: 'Macchina',
    instructions: 'Cuscinetti all\'interno delle ginocchia. Chiudi le gambe vincendo la resistenza per rafforzare l\'interno coscia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-slanci-cavo-glutei',
    name: 'Kickback ai Cavi per Glutei',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Cavi',
    instructions: 'Cavigliera ancorata al cavo basso. Slancia la gamba all\'indietro mantenendo il ginocchio quasi esteso e bloccando il bacino.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-calf-in-piedi',
    name: 'Calf Raise in Piedi (Macchina)',
    category: 'Gambe',
    muscleGroup: 'Polpacci',
    equipment: 'Macchina',
    instructions: 'Avampiedi sul bordo della pedana, cuscinetti sulle spalle. Sollevati sulla punta dei piedi al massimo e scendi sotto il livello del gradino.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-calf-seduto',
    name: 'Calf Raise da Seduto (Seated Calf)',
    category: 'Gambe',
    muscleGroup: 'Polpacci',
    equipment: 'Macchina',
    instructions: 'Con ginocchia a 90°, l\'azione isola il muscolo soleo sotto il gastrocnemio.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-step-up-manubri',
    name: 'Step-Up su Panca con Manubri',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Manubri',
    instructions: 'Sali con un piede su un box o panca sollevando il corpo senza spingere con la gamba posteriore.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-sissy-squat',
    name: 'Sissy Squat a Corpo Libero',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Niente',
    instructions: 'Fletti le ginocchia portandole in avanti mentre inclini il busto all\'indietro in un allungamento estremo del retto femorale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-stacco-sumo',
    name: 'Stacco Sumo con Bilanciere',
    category: 'Gambe',
    muscleGroup: 'Glutei',
    equipment: 'Bilanciere',
    instructions: 'Passo molto largo con punte ruotate a 45°. Mani all\'interno delle ginocchia. Focus maggiore su adduttori, glutei e quadricipiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-squat-multipower',
    name: 'Squat al Multipower (Smith Machine)',
    category: 'Gambe',
    muscleGroup: 'Quadricipiti',
    equipment: 'Macchina',
    instructions: 'Posiziona i piedi leggermente avanzati rispetto alla sbarra per isolare i quadricipiti con schiena perfettamente eretta.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-donkey-calf',
    name: 'Donkey Calf Raise',
    category: 'Gambe',
    muscleGroup: 'Polpacci',
    equipment: 'Macchina',
    instructions: 'Busto flesso a 90° con carico sui fianchi. Massimo allungamento del gastrocnemio grazie all\'estensione del femorale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-military-press',
    name: 'Military Press in Piedi con Bilanciere (OHP)',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Bilanciere',
    instructions: 'In piedi con addome e glutei serrati. Spingi il bilanciere dalla clavicola dritto sopra la testa estendendo le braccia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-lento-avanti-manubri',
    name: 'Lento Avanti con Manubri da Seduto',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Schienale a 75°-80°. Spingi i manubri verso l\'alto in traiettoria convergente sopra la testa controllando la discesa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-arnold-press',
    name: 'Arnold Press con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Parti con i manubri davanti al petto a palmi rivolti a te. Mentre spingi in alto ruota i polsi fino a portare i palmi in avanti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-shoulder-press-macchina',
    name: 'Shoulder Press (Macchina)',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Macchina',
    instructions: 'Spinta guidata con impugnature ergonomiche per un lavoro puro sul deltoide anteriore e mediale in totale sicurezza.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-alzate-laterali-manubri',
    name: 'Alzate Laterali con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Gomiti leggermente flessi. Solleva i manubri lateralmente fino all\'altezza delle spalle guidando il movimento con i gomiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-alzate-laterali-cavi',
    name: 'Alzate Laterali al Cavo Basso',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Cavi',
    instructions: 'Cavo posizionato in basso che passa dietro o davanti al corpo. Garantisce tensione continua anche nel punto di partenza.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-alzate-laterali-seduto',
    name: 'Alzate Laterali da Seduto con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'La posizione seduta impedisce il cheating o lo slancio delle gambe, focalizzando lo sforzo sul deltoide laterale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-alzate-frontali-manubri',
    name: 'Alzate Frontali con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Solleva il manubrio in avanti fino all\'altezza degli occhi mantenendo il braccio teso con leggera flessione del gomito.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-alzate-frontali-bilanciere',
    name: 'Alzate Frontali con Bilanciere o Disco',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Bilanciere',
    instructions: 'Impugna il bilanciere a larghezza spalle. Sollevalo frontalmente controllando la fase eccentrica di ritorno.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-croci-deltoide-post',
    name: 'Croci Inverse Deltoide Posteriore (Macchina)',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Macchina',
    instructions: 'Seduto verso la pectoral machine, impugnature all\'altezza delle spalle. Apri le braccia indietro stringendo i deltoidi posteriori.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-alzate-posteriori-manubri',
    name: 'Alzate Posteriori con Manubri a Busto Flesso',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Busto inclinato a 45°-90°, schiena piatta. Apri le braccia lateralmente per isolare il capo posteriore della spalla.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-croci-inverse-cavi',
    name: 'Croci Inverse ai Cavi Alti',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Cavi',
    instructions: 'Impugna i cavi opposti senza maniglie. Apri le braccia all\'infuori e indietro con traiettoria orizzontale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-tirate-al-mento-bil',
    name: 'Tirate al Mento con Bilanciere (Upright Row)',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Bilanciere',
    instructions: 'Presa a larghezza spalle. Tira il bilanciere verso il petto/mento guidando con i gomiti sempre più alti delle mani.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-tirate-al-mento-cavi',
    name: 'Tirate al Mento ai Cavi',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Cavi',
    instructions: 'Tensione costante garantita dal cavo basso per deltoidi laterali e trapezi.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-lu-raises',
    name: 'Lu Raises con Dischi',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Disco',
    instructions: 'Alzate laterali complete fino a toccare i dischi sopra la testa, movimento tipico dei pesisti olimpici per mobilità e deltoidi a 360°.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-overhead-smith',
    name: 'Lento Avanti al Multipower',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Macchina',
    instructions: 'Spinta verticale controllata al multipower con focus sui carichi pesanti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-alzate-y-inclinata',
    name: 'Y-Raise su Panca Inclinata con Manubri',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Manubri',
    instructions: 'Pancia in giù su panca a 30°-45°. Solleva le braccia formando una "Y" per attivare trapezio inferiore e deltoide posteriore.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-landmine-press-monolaterale',
    name: 'Landmine Press Monolaterale per Spalle',
    category: 'Spalle',
    muscleGroup: 'Spalle',
    equipment: 'Bilanciere',
    instructions: 'Spinta angolare a un braccio, eccellente per chi ha fastidi alla cuffia dei rotatori durante le spinte verticali pure.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-curl-bilanciere',
    name: 'Curl con Bilanciere Sagomato EZ',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Bilanciere',
    instructions: 'Gomiti stretti ai fianchi. Fletti le braccia sollevando il bilanciere verso il petto senza dondolare con la schiena.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-curl-bilanciere-dritto',
    name: 'Curl con Bilanciere Dritto',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Bilanciere',
    instructions: 'Presa supina pura per massimo picco di supinazione e stimolo diretto del capo breve e lungo del bicipite.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-curl-manubri-alternato',
    name: 'Curl con Manubri Alternato con Supinazione',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Parti con presa neutra e ruota il palmo verso l\'alto durante la salita strizzando il bicipite in cima.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-hammer-curl',
    name: 'Curl a Martello con Manubri (Hammer Curl)',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Presa neutra costante (palmi che si guardano). Sviluppa con forza il muscolo brachiale e brachioradiale per spessore del braccio.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-curl-panca-inclinata',
    name: 'Curl con Manubri su Panca Inclinata a 45°',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Gomiti che cadono dietro al busto. Offre il massimo allungamento possibile del capo lungo del bicipite brachiale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-curl-scott-bil',
    name: 'Curl su Panca Scott con Bilanciere EZ (Preacher Curl)',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Bilanciere',
    instructions: 'Braccia saldamente poggiate sull\'imbottitura. Isola il bicipite eliminando qualsiasi compensazione dorsale o delle spalle.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-curl-scott-man',
    name: 'Curl su Panca Scott (Manubrio Singolo)',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Lavoro unilaterale su panca Scott per il massimo isolamento e correzione di squilibri tra le braccia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-curl-concentrato',
    name: 'Curl Concentrato con Manubrio da Seduto',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Manubri',
    instructions: 'Gomito poggiato contro la parte interna della coscia. Esegui il curl focalizzando la contrazione di picco.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-spider-curl',
    name: 'Spider Curl con Bilanciere su Panca Inclinata',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Bilanciere',
    instructions: 'Pancia contro lo schienale a 45°. Braccia verticali perpendicolari a terra per un picco di tensione in accorciamento.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-cable-curl-basso',
    name: 'Curl ai Cavi Bassi con Barra Sagomata',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Cavi',
    instructions: 'Tensione continua in ogni punto dell\'arco di movimento grazie alla resistenza elastica del cavo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-cable-curl-alto',
    name: 'High Cable Curl (Doppio Bicipite ai Cavi Alti)',
    category: 'Braccia',
    muscleGroup: 'Bicipiti',
    equipment: 'Cavi',
    instructions: 'In mezzo alla torretta, braccia a croce. Fletti i gomiti portando le maniglie verso le orecchie in posa da culturista.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pushdown-cavi-corda',
    name: 'Pushdown ai Cavi con Corda',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Gomiti fissati ai fianchi. Spingi la corda verso il basso aprendo le estremità al termine per contrarre il capo laterale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pushdown-barra-dritta',
    name: 'Pushdown al Cavo con Barra Dritta o a V',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Presa prona salda. Spingi la sbarra verso il basso fino a completa estensione dei gomiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-french-press-bil',
    name: 'French Press con Bilanciere EZ (Skullcrusher)',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Bilanciere',
    instructions: 'Sdraiato su panca, braccia verticali. Fletti i gomiti portando il bilanciere verso la fronte o oltre la testa e ridistendi.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-skullcrusher-man',
    name: 'Skullcrusher con Manubri su Panca',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Manubri',
    instructions: 'Presa neutra dei manubri, fletti i gomiti ai lati della testa garantendo lavoro indipendente a ciascun braccio.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-estensioni-sopra-testa-man',
    name: 'Estensioni Sopra la Testa con Manubrio a Due Mani',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Manubri',
    instructions: 'Seduto, impugna il manubrio a calice sopra la testa. Abbassalo dietro la nuca per stimolare intensamente il capo lungo del tricipite.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-estensioni-cavo-alto',
    name: 'Estensioni Tricipiti al Cavo Sopra la Testa (Overhead)',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Spalle alla torretta con cavo alto, estendi la corda in avanti sopra la testa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-dip-panca-tricipiti',
    name: 'Dip tra Due Panche per Tricipiti',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Niente',
    instructions: 'Mani su una panca dietro la schiena, talloni poggiati su un\'altra panca. Scendi fino a 90° e spingi con forza sui tricipiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-dip-parallele-tricipiti',
    name: 'Dip alle Parallele (Focus Tricipiti)',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Niente',
    instructions: 'Busto verticale e gomiti stretti lungo il busto per massimizzare il reclutamento del tricipite brachiale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-panca-presa-stretta',
    name: 'Panca Piana a Presa Stretta (Close-Grip Bench)',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Bilanciere',
    instructions: 'Mani a larghezza spalle sul bilanciere. Tieni i gomiti aderenti al corpo durante la discesa e spingi con i tricipiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-kickback-manubrio',
    name: 'Kickback con Manubrio',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Manubri',
    instructions: 'Busto inclinato, gomito alto allineato al busto. Estendi l\'avambraccio indietro strizzando il tricipite al culmine.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-kickback-cavo',
    name: 'Kickback al Cavo Basso Unilaterale',
    category: 'Braccia',
    muscleGroup: 'Tricipiti',
    equipment: 'Cavi',
    instructions: 'Kickback senza maniglie con tensione continua ideale per rifinire il capo laterale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-bench-press-with-barbell-close-up-40321-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-wrist-curl-bil',
    name: 'Wrist Curl con Bilanciere (Flessione Polsi)',
    category: 'Braccia',
    muscleGroup: 'Avambracci',
    equipment: 'Bilanciere',
    instructions: 'Avambracci poggiati sulle cosce a palmi in su. Fletti i polsi sollevando il bilanciere per i flessori dell\'avambraccio.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-reverse-wrist-curl',
    name: 'Reverse Wrist Curl (Estensione Polsi)',
    category: 'Braccia',
    muscleGroup: 'Avambracci',
    equipment: 'Bilanciere',
    instructions: 'Palmi rivolti verso il basso. Estendi i polsi verso l\'alto per rinforzare gli estensori dell\'avambraccio.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-farmers-walk',
    name: 'Farmer\'s Walk con Manubri Pesanti',
    category: 'Braccia',
    muscleGroup: 'Avambracci',
    equipment: 'Manubri',
    instructions: 'Cammina con due manubri molto pesanti lungo i fianchi. Potentissimo esercizio per forza di presa, trapezi e core.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-deadlifts-with-a-barbell-in-a-gym-40323-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-reverse-curl-bil',
    name: 'Reverse Curl con Bilanciere Presa Prona',
    category: 'Braccia',
    muscleGroup: 'Avambracci',
    equipment: 'Bilanciere',
    instructions: 'Curl a presa inversa per sviluppare il muscolo brachioradiale e la parte superiore dell\'avambraccio.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-curling-dumbbells-40325-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-crunch',
    name: 'Crunch a Terra',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Sdraiati supino con ginocchia piegate. Solleva le spalle staccando le scapole da terra espirando profondamente, zona lombare aderente.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-crunch-cavo-inginocchio',
    name: 'Cable Crunch (ai Cavi in Ginocchio)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Cavi',
    instructions: 'In ginocchio davanti al cavo alto con corda alla nuca. Fletti la colonna vertebrale portando i gomiti verso le ginocchia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-leg-raise-sbarra',
    name: 'Hanging Leg Raise (Sollevamento Gambe alla Sbarra)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Appeso alla sbarra per trazioni. Solleva le gambe tese fino all\'altezza del bacino arrotolando il bacino per stimolare il retto addominale.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-hanging-knee-raise',
    name: 'Hanging Knee Raise (Ginocchia al Petto)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Versione controllata dell\'hanging leg raise con flessione delle ginocchia al petto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-40322-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-ab-wheel-rollout',
    name: 'Ab Wheel Rollout (Rotella Addominali)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Altro',
    instructions: 'In ginocchio, impugna la ruota e falla scorrere in avanti mantenendo l\'addome contratto senza inarcare i lombari, poi torna indietro.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-plank',
    name: 'Plank Isometrico Classico',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Appoggio su avambracci e punte dei piedi. Mantieni il corpo in una linea retta perfetta contraendo addome, glutei e quadricipiti.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-side-plank',
    name: 'Side Plank (Ponte Laterale)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'In appoggio su un solo avambraccio laterale. Solleva il bacino allineando il corpo per rafforzare gli obliqui e il quadrato dei lombi.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-russian-twist',
    name: 'Russian Twist con Disco',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Disco',
    instructions: 'Seduto con piedi sollevati e busto a 45°. Ruota il disco da un lato all\'altro toccando il suolo controllando la rotazione del core.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-crunch-inverso',
    name: 'Crunch Inverso su Panca Inclinata',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Mani salde in cima alla panca. Solleva il bacino verso l\'alto staccando i lombari con massima attivazione addominale inferiore.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-mountain-climbers',
    name: 'Mountain Climbers Dinamici',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Dalla posizione di plank alto, porta alternativamente le ginocchia verso il petto a ritmo rapido e coordinato.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-hollow-body-hold',
    name: 'Hollow Body Hold (Tenuta a Barchetta)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Esercizio ginnico: schiena lombare incollata al pavimento, braccia e gambe tese sollevate da terra a formare un arco rigido.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-vacuum-addominale',
    name: 'Stomach Vacuum (Trasverso Addominale)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Espira tutta l\'aria dai polmoni e risucchia l\'ombelico verso la colonna vertebrale trattenendo la tenuta isometrica per 15-30s.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-woodchopper-cavi',
    name: 'Woodchopper ai Cavi (Dall\'Alto in Basso)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Cavi',
    instructions: 'Ruota il busto tirando il cavo dall\'alto verso il basso diagonale per sviluppare potenza e stabilità negli obliqui.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-dragon-flag',
    name: 'Dragon Flag (Bruce Lee)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Sdraiato su panca con mani salde dietro la testa. Solleva l\'intero corpo rigido come una lancia mantenendo il contatto solo con la parte alta della schiena.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-pallof-press',
    name: 'Pallof Press ai Cavi (Anti-Rotazione)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Cavi',
    instructions: 'In piedi lateralmente al cavo all\'altezza dello sterno. Spingi la maniglia in avanti resistendo alla forza di rotazione.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-bicicletta-addominali',
    name: 'Bicycle Crunches (Crunch Bicicletta)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Tocca alternativamente il gomito destro al ginocchio sinistro e viceversa con movimento fluido e continuo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-v-up',
    name: 'V-Up a Corpo Libero',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Niente',
    instructions: 'Parti da disteso e solleva contemporaneamente busto e gambe tese fino a toccare le punte dei piedi formando una V.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-ab-machine',
    name: 'Abdominal Crunch (Macchina)',
    category: 'Core',
    muscleGroup: 'Addominali',
    equipment: 'Macchina',
    instructions: 'Permette di applicare un sovraccarico progressivo con piastre pesanti per l\'ipertrofia dei tasselli addominali.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-crunches-40326-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-corsa-outdoor',
    name: 'Corsa all\'Aperto (Outdoor Running)',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Niente',
    instructions: 'Corsa a ritmo costante o a intervalli all\'aperto con tracciamento di distanza, tempo, passo al chilometro e dislivello.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-tapis-roulant',
    name: 'Tapis Roulant (Treadmill)',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Camminata veloce o corsa su nastro. Ottimo con inclinazione al 4-8% per ridurre l\'impatto articolare e bruciare calorie.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-cyclette',
    name: 'Cyclette / Stationary Bike',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Pedalata a intensità costante o ad alta intensità (HIIT) per salute cardiovascolare e resistenza delle gambe a basso impatto.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-spin-bike',
    name: 'Spin Bike / Indoor Cycling',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Sessione di ciclismo indoor con volano pesante e cambi di resistenza ritmati.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-ellittica',
    name: 'Ellittica (Cross Trainer)',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Movimento fluido sincronizzato di gambe e braccia senza alcuna sollecitazione da impatto su caviglie e ginocchia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-vogatore',
    name: 'Vogatore (Rowing Machine)',
    category: 'Cardio',
    muscleGroup: 'Dorsali',
    equipment: 'Macchina',
    instructions: 'Coinvolge l\'85% dei gruppi muscolari corporei: spinta iniziale delle gambe seguita dalla trazione dorsale e chiusura delle braccia.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'distance_time'
  },
  {
    id: 'ex-stair-climber',
    name: 'Stair Climber (Saliscale / Stairmaster)',
    category: 'Cardio',
    muscleGroup: 'Glutei',
    equipment: 'Macchina',
    instructions: 'Salita continua di gradini per attivazione intensa dei glutei, polpacci e capacità aerobica.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-air-bike',
    name: 'Assault Bike / Air Bike',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Macchina',
    instructions: 'Resistenza ad aria esponenziale: più spingi forte con braccia e gambe più la ventola genera resistenza frenante.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'distance_time'
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
  },
  {
    id: 'ex-kettlebell-swing',
    name: 'Kettlebell Swing',
    category: 'Cardio',
    muscleGroup: 'Glutei',
    equipment: 'Kettlebell',
    instructions: 'Hip hinge dinamico: spingi il bacino indietro e proietta la kettlebell all\'altezza del petto contraendo glutei e addome.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-a-barbell-40324-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-burpees',
    name: 'Burpees Completi',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Niente',
    instructions: 'Dalla posizione eretta scendi a terra in push-up, raccogli le gambe ed esplodi in un salto verticale battendo le mani sopra la testa.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-box-jump',
    name: 'Box Jump Pliometrico',
    category: 'Cardio',
    muscleGroup: 'Quadricipiti',
    equipment: 'Altro',
    instructions: 'Carica le anche e salta con entrambi i piedi sopra un box pliometrico atterrando morbidamente in semi-accosciata.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-jumping-jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    muscleGroup: 'Cardio',
    equipment: 'Niente',
    instructions: 'Saltelli coordinati aprendo contemporaneamente gambe e braccia, ideale per riscaldamento cardio e conditioning.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-battle-ropes',
    name: 'Battle Ropes (Corde Nautiche Ondulatorie)',
    category: 'Cardio',
    muscleGroup: 'Spalle',
    equipment: 'Altro',
    instructions: 'Onde alternate o simultanee con corde pesanti per condizionamento anaerobico, spalle e core.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'time_only'
  },
  {
    id: 'ex-sled-push',
    name: 'Sled Push (Spinta della Slitta Prowler)',
    category: 'Cardio',
    muscleGroup: 'Quadricipiti',
    equipment: 'Altro',
    instructions: 'Spingi la slitta caricata a terra su pista in erba sintetica sviluppando potenza delle gambe e condizionamento metabolico.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'weight_reps'
  },
  {
    id: 'ex-ski-erg',
    name: 'SkiErg (Vogatore Nordico per Sci di Fondo)',
    category: 'Cardio',
    muscleGroup: 'Dorsali',
    equipment: 'Macchina',
    instructions: 'Simulatore di spinta con bastoncini da sci: potente flessione del core e delle braccia ad ogni trazione verso il basso.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-40327-large.mp4',
    trackingType: 'distance_time'
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
