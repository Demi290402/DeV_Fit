import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { createClient } from '@supabase/supabase-js';
import { mockExercises, isDistanceTimeExercise, isTimeOnlyExercise, type Exercise } from '../data/mockExercises';
import { mockRecipes, type Recipe } from '../data/mockRecipes';
import { calculateWorkoutCalories } from '../utils/calorieCalculator';

// Supabase client configuration & initialization (reads from localStorage fallback or Vite .env)
export const getStoredSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  let localUrl = localStorage.getItem('df_supabase_url') || '';
  let localKey = localStorage.getItem('df_supabase_anon_key') || '';

  // Pairing 1-click tra dispositivi tramite link con parametri URL
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const qUrl = params.get('sb_url') || params.get('supabase_url');
      const qKey = params.get('sb_key') || params.get('supabase_key');
      if (qUrl && qKey) {
        const cleanQUrl = decodeURIComponent(qUrl).trim();
        const cleanQKey = decodeURIComponent(qKey).trim();
        if (cleanQUrl.startsWith('https://') && cleanQUrl.includes('.supabase.co')) {
          localStorage.setItem('df_supabase_url', cleanQUrl);
          localStorage.setItem('df_supabase_anon_key', cleanQKey);
          localUrl = cleanQUrl;
          localKey = cleanQKey;
          // Pulisce i parametri dalla barra degli indirizzi mantenendo lo stato
          const cleanPath = window.location.pathname;
          window.history.replaceState({}, document.title, cleanPath);
        }
      }
    } catch {
      // Ignora errori di parsing parametri URL
    }
  }

  const url = (localUrl || envUrl).trim();
  const anonKey = (localKey || envKey).trim();

  const isValid = url.startsWith('https://') && url.includes('.supabase.co') && !url.includes('IL_TUO_PROJECT_URL');
  return {
    url: isValid ? url : '',
    anonKey: isValid && anonKey && !anonKey.includes('LA_TUA_CHIAVE') ? anonKey : ''
  };
};

export const createSupabaseInstance = (url: string, key: string) => {
  if (url && key) {
    try {
      return createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      });
    } catch (err) {
      console.warn('Errore inizializzazione client Supabase:', err);
      return null;
    }
  }
  return null;
};

const initialSupabaseCfg = getStoredSupabaseConfig();
export let supabase = createSupabaseInstance(initialSupabaseCfg.url, initialSupabaseCfg.anonKey);

export interface ProfileData {
  name: string;
  gender: 'female' | 'male';
  height: number; // in cm
  weight: number; // in kg
  bodyFat: number; // in %
  waist: number; // in cm
  arms: number; // in cm
  thighs: number; // in cm
  avatarUrl?: string;
  bannerUrl?: string;

  targetCalories: number;
  targetProtein: number; // g
  targetCarbs: number; // g
  targetFat: number; // g
  streak: number;
  lastLoggedDate: string;
}

export interface SetLog {
  id: string;
  weight: number;
  reps: number;
  time?: number; // duration in minutes (for cardio) or seconds (for isometric)
  distance?: number; // distance in km
  completed: boolean;
  is1RM?: boolean;
  isMaxVolume?: boolean;
  isMaxWeight?: boolean;
  isMaxReps?: boolean;
  isMaxDistance?: boolean;
  isMaxTime?: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  restSeconds?: number;
  notes?: string;
  sets: SetLog[];
}

export interface HeartRateSample {
  time: number; // in seconds from start
  bpm: number;
}

export interface WorkoutLog {
  id: string;
  name: string;
  date: string; // ISO string
  duration: number; // in seconds
  volume: number; // total kg
  exercises: ExerciseLog[];
  avgHeartRate?: number;
  heartRateSamples?: HeartRateSample[];
  caloriesBurned?: number;
  deviceSource?: string;
  activityType?: 'strength' | 'running' | 'other';
  distanceKm?: number;
  elevationMeters?: number;
  pace?: string;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: {
    exerciseId: string;
    restSeconds?: number;
    defaultSets: {
      weight: number;
      reps: number;
      time?: number;
      distance?: number;
    }[];
  }[];
}

export interface FoodLogItem {
  id: string;
  name: string;
  mealType: string; // Dynamic meal type (Colazione, Pranzo, etc.)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight: number; // in grams
}

export interface FoodLogs {
  [dateStr: string]: FoodLogItem[];
}

export interface CycleData {
  lastPeriodStart: string; // YYYY-MM-DD
  cycleLength: number; // default 28
  periodLength: number; // default 5
}

export interface SocialPost {
  id: string;
  username: string;
  userAvatar: string;
  date: string;
  workoutName: string;
  duration: string;
  volume: number;
  recordsCount: number;
  likes: string[]; // usernames who liked
  comments: { username: string; text: string }[];
}

interface AppContextType {
  user: { id: string; email: string; name: string } | null;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccountAndData: () => Promise<void>;
  hasConsented: boolean;
  setHasConsented: (consent: boolean) => void;
  profile: ProfileData;
  mealsList: string[];
  updateMealsList: (list: string[]) => void;
  updateProfile: (data: Partial<ProfileData>) => void;
  routines: Routine[];
  addRoutine: (routine: Routine) => Promise<{ cloudSynced: boolean; error?: string }>;
  updateRoutine: (routine: Routine) => Promise<{ cloudSynced: boolean; error?: string }>;
  deleteRoutine: (id: string) => void;
  workoutHistory: WorkoutLog[];
  updateWorkoutLog: (updatedLog: WorkoutLog) => void;
  deleteWorkoutLog: (id: string) => void;
  customExercises: Exercise[];
  addCustomExercise: (ex: Exercise) => Promise<void>;
  deleteCustomExercise: (id: string) => Promise<void>;
  activeWorkout: {
    name: string;
    startTime: number | null;
    exercises: ExerciseLog[];
  } | null;
  startWorkout: (routineId?: string, repeatWorkout?: WorkoutLog) => void;
  updateActiveWorkoutSet: (exerciseId: string, setIndex: number, field: 'weight' | 'reps' | 'time' | 'distance', value: number) => void;
  updateActiveWorkoutExercises: (updater: (prev: ExerciseLog[]) => ExerciseLog[]) => void;
  updateActiveWorkoutExerciseRest: (exerciseId: string, restSeconds: number) => void;

  toggleCompleteSet: (exerciseId: string, setIndex: number) => void;
  addExerciseToActiveWorkout: (exerciseId: string, restSeconds?: number) => void;
  addExercisesToActiveWorkout: (exerciseIds: string[]) => void;
  saveActiveWorkout: (customName?: string, metrics?: { avgHeartRate?: number; heartRateSamples?: HeartRateSample[]; caloriesBurned?: number; deviceSource?: string }) => Promise<{ cloudSynced: boolean; error?: string }>;
  addPastWorkoutLog: (pastLog: WorkoutLog) => Promise<{ cloudSynced: boolean; error?: string }>;
  cancelActiveWorkout: () => void;
  foodLogs: FoodLogs;
  addFoodLog: (dateStr: string, item: Omit<FoodLogItem, 'id'>) => void;
  deleteFoodLog: (dateStr: string, id: string) => void;
  cycleData: CycleData;
  updateCycleData: (data: Partial<CycleData>) => void;
  socialPosts: SocialPost[];
  addSocialPost: (post: Omit<SocialPost, 'id' | 'likes' | 'comments'>) => void;
  likeSocialPost: (postId: string, username: string) => void;
  commentSocialPost: (postId: string, username: string, commentText: string) => void;
  triggerConfetti: () => void;
  getPreviousPerformances: (exerciseId: string) => { weight: number; reps: number; time?: number; distance?: number }[];
  isSupabaseConfigured: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  saveSupabaseConfig: (url: string, anonKey: string) => { success: boolean; message: string };
  syncAllDataToCloud: () => Promise<{ success: boolean; message: string }>;
  syncAllDataFromCloud: (userId?: string) => Promise<{ success: boolean; message: string }>;
  recipes: Recipe[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- MOCK CONSTANTS ---
  const defaultProfile: ProfileData = {
    name: 'Utente DeV Fit',
    gender: 'female',
    height: 165,
    weight: 60.0,
    bodyFat: 22.0,
    avatarUrl: '',
    bannerUrl: '',
    waist: 66,
    arms: 28,
    thighs: 52,
    targetCalories: 1800,
    targetProtein: 110,
    targetCarbs: 190,
    targetFat: 50,
    streak: 0,
    lastLoggedDate: ''
  };

  // --- STATE ---
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('df_user');
    return saved ? JSON.parse(saved) : null;
  });
  const userRef = useRef(user);
  userRef.current = user;

  const [hasConsented, setHasConsentedState] = useState<boolean>(() => {
    return localStorage.getItem('df_consent') === 'true';
  });

  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('df_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('df_routines');
    return saved ? JSON.parse(saved) : [];
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('df_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeWorkout, setActiveWorkout] = useState<AppContextType['activeWorkout']>(() => {
    const saved = localStorage.getItem('df_active_workout');
    return saved ? JSON.parse(saved) : null;
  });

  const [foodLogs, setFoodLogs] = useState<FoodLogs>(() => {
    const saved = localStorage.getItem('df_food_logs');
    return saved ? JSON.parse(saved) : {};
  });

  const [cycleData, setCycleData] = useState<CycleData>(() => {
    const saved = localStorage.getItem('df_cycle_data');
    return saved ? JSON.parse(saved) : {
      lastPeriodStart: '',
      cycleLength: 28,
      periodLength: 5
    };
  });

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('df_social_posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [mealsList, setMealsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('df_meals_list');
    return saved ? JSON.parse(saved) : ['Colazione', 'Pranzo', 'Spuntino', 'Cena'];
  });

  const [customExercises, setCustomExercises] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem('devfit_custom_exercises');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('devfit_custom_exercises', JSON.stringify(customExercises));
  }, [customExercises]);

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('df_recipes');
      return saved ? JSON.parse(saved) : mockRecipes;
    } catch {
      return mockRecipes;
    }
  });

  useEffect(() => {
    if (recipes && recipes.length > 0) {
      localStorage.setItem('df_recipes', JSON.stringify(recipes));
    }
  }, [recipes]);


  // --- PERSISTENCE ---
  useEffect(() => {
    if (user) {
      localStorage.setItem('df_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('df_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('df_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('df_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('df_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('df_active_workout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('df_active_workout');
    }
  }, [activeWorkout]);

  useEffect(() => {
    localStorage.setItem('df_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('df_cycle_data', JSON.stringify(cycleData));
  }, [cycleData]);

  useEffect(() => {
    localStorage.setItem('df_meals_list', JSON.stringify(mealsList));
  }, [mealsList]);

  const updateMealsList = (newList: string[]) => {
    setMealsList(newList);
  };

  useEffect(() => {
    localStorage.setItem('df_social_posts', JSON.stringify(socialPosts));
  }, [socialPosts]);

  // Sincronizzazione automatica in tempo reale tra schede o modifiche esterne
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === 'df_profile') setProfile(JSON.parse(e.newValue));
        if (e.key === 'df_food_logs') setFoodLogs(JSON.parse(e.newValue));
        if (e.key === 'df_history') setWorkoutHistory(JSON.parse(e.newValue));
        if (e.key === 'df_routines') setRoutines(JSON.parse(e.newValue));
        if (e.key === 'df_cycle_data') setCycleData(JSON.parse(e.newValue));
        if (e.key === 'df_meals_list') setMealsList(JSON.parse(e.newValue));
      } catch {
        // Ignora errori di parsing su payload parziali
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);


  // --- SUPABASE CLIENT STATE & DYNAMIC CONFIG ---
  const [supabaseConfig, setSupabaseConfig] = useState(() => getStoredSupabaseConfig());
  const [supabaseClient, setSupabaseClient] = useState(() => supabase);
  const isSupabaseConfigured = Boolean(supabaseClient && supabaseConfig.url && supabaseConfig.anonKey);

  const saveSupabaseConfig = (newUrl: string, newKey: string): { success: boolean; message: string } => {
    const cleanUrl = newUrl.trim();
    const cleanKey = newKey.trim();
    if (!cleanUrl || !cleanKey) {
      return { success: false, message: 'URL e Anon Key non possono essere vuoti.' };
    }
    if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
      return { success: false, message: 'L\'URL deve essere un indirizzo Supabase valido (es. https://xyz.supabase.co).' };
    }

    try {
      const client = createSupabaseInstance(cleanUrl, cleanKey);
      if (!client) throw new Error('Inizializzazione client fallita.');
      localStorage.setItem('df_supabase_url', cleanUrl);
      localStorage.setItem('df_supabase_anon_key', cleanKey);
      supabase = client;
      setSupabaseConfig({ url: cleanUrl, anonKey: cleanKey });
      setSupabaseClient(client);
      return { success: true, message: 'Credenziali salvate! Connessione a Supabase attiva.' };
    } catch (err: any) {
      return { success: false, message: `Errore: ${err.message}` };
    }
  };

  // --- CLOUD SYNC HELPERS ---
  const resolveSupabaseUserId = useCallback(async (client = supabaseClient, fallbackId?: string): Promise<string | null> => {
    if (!client) return null;
    try {
      const { data: { user: authUser } } = await client.auth.getUser();
      if (authUser?.id) return authUser.id;

      const { data: { session } } = await client.auth.getSession();
      if (session?.user?.id) return session.user.id;
    } catch (e) {
      console.warn('Errore verifica utente auth Supabase:', e);
    }
    return fallbackId || userRef.current?.id || null;
  }, [supabaseClient]);

  const upsertWorkoutLogSafely = useCallback(async (client: any, logPayload: any): Promise<{ success: boolean; error?: string }> => {
    if (!client || !logPayload) return { success: false, error: 'Client o dati non validi' };

    // 1. First attempt: upsert with all extended columns (bpm, samples, calories, device, notes, etc.)
    const { error } = await client.from('workout_logs').upsert(logPayload, { onConflict: 'id' });
    if (!error) return { success: true };

    const errMsg = (error.message || '').toLowerCase();

    // 2. If table in Supabase doesn't have extended columns yet (e.g. column "avg_heart_rate" does not exist)
    if (errMsg.includes('does not exist') || error.code === '42703' || errMsg.includes('column')) {
      console.warn('Colonne estese non presenti in workout_logs, salvataggio con campi base...', error.message);
      const basePayload = {
        id: logPayload.id,
        user_id: logPayload.user_id,
        name: logPayload.name,
        date: logPayload.date,
        duration: logPayload.duration,
        volume: logPayload.volume,
        exercises: logPayload.exercises
      };
      const { error: baseError } = await client.from('workout_logs').upsert(basePayload, { onConflict: 'id' });
      if (!baseError) return { success: true };
      return { success: false, error: baseError.message };
    }

    if (error.code === '42501' || errMsg.includes('row-level security') || errMsg.includes('policy')) {
      return { 
        success: false, 
        error: 'Permesso negato da Supabase (RLS): accedi con il tuo account o esegui il fix SQL nel pannello Supabase.' 
      };
    }

    if (error.code === '23503' || errMsg.includes('foreign key')) {
      return { 
        success: false, 
        error: 'Utente non presente in auth.users di Supabase. Effettua la registrazione o il login dall\'app.' 
      };
    }

    if (error.code === '22P02' || errMsg.includes('uuid')) {
      return { 
        success: false, 
        error: 'Incompatibilità tipo colonna ID su Supabase (richiesto TEXT anziché UUID). Esegui il file supabase_fix_routines_and_workouts.sql.' 
      };
    }

    return { success: false, error: error.message };
  }, []);

  const syncProfileToCloud = useCallback(async (userId: string, prof: ProfileData, client = supabaseClient) => {
    if (!client || !userId) return;
    try {
      const payload = {
        id: userId,
        name: prof.name,
        gender: prof.gender,
        height: prof.height,
        weight: prof.weight,
        body_fat: prof.bodyFat,
        waist: prof.waist,
        arms: prof.arms,
        thighs: prof.thighs,
        avatar_url: prof.avatarUrl || null,
        banner_url: prof.bannerUrl || null,
        target_calories: prof.targetCalories,
        target_protein: prof.targetProtein,
        target_carbs: prof.targetCarbs,
        target_fat: prof.targetFat,
        streak: prof.streak,
        last_logged_date: prof.lastLoggedDate,
        updated_at: new Date().toISOString()
      };
      await client.from('profiles').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.warn('Errore syncProfileToCloud:', err);
    }
  }, [supabaseClient]);

  const isSyncingRef = useRef(false);

  const syncAllDataFromCloud = useCallback(async (userId?: string, client = supabaseClient): Promise<{ success: boolean; message: string }> => {
    const targetId = userId || userRef.current?.id;
    if (!client || !targetId) {
      return { success: false, message: 'Supabase non è configurato o utente non loggato.' };
    }

    if (isSyncingRef.current) {
      return { success: false, message: 'Sincronizzazione già in corso.' };
    }

    isSyncingRef.current = true;
    try {
      // 1. Fetch Profile
      const { data: profData, error: profError } = await client
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (profData) {
        setProfile(prev => ({
          ...prev,
          name: profData.name || prev.name,
          gender: (profData.gender as 'female' | 'male') || prev.gender,
          height: typeof profData.height === 'number' ? profData.height : prev.height,
          weight: typeof profData.weight === 'number' ? profData.weight : prev.weight,
          bodyFat: typeof profData.body_fat === 'number' ? profData.body_fat : prev.bodyFat,
          waist: typeof profData.waist === 'number' ? profData.waist : prev.waist,
          arms: typeof profData.arms === 'number' ? profData.arms : prev.arms,
          thighs: typeof profData.thighs === 'number' ? profData.thighs : prev.thighs,
          avatarUrl: profData.avatar_url ?? prev.avatarUrl,
          bannerUrl: profData.banner_url ?? prev.bannerUrl,
          targetCalories: typeof profData.target_calories === 'number' ? profData.target_calories : prev.targetCalories,
          targetProtein: typeof profData.target_protein === 'number' ? profData.target_protein : prev.targetProtein,
          targetCarbs: typeof profData.target_carbs === 'number' ? profData.target_carbs : prev.targetCarbs,
          targetFat: typeof profData.target_fat === 'number' ? profData.target_fat : prev.targetFat,
          streak: typeof profData.streak === 'number' ? profData.streak : prev.streak,
          lastLoggedDate: profData.last_logged_date || prev.lastLoggedDate
        }));
      } else if (!profError && profileRef.current) {
        await syncProfileToCloud(targetId, profileRef.current, client);
      }

      // 2. Fetch Routines
      const { data: routinesData, error: routinesError } = await client
        .from('routines')
        .select('*')
        .eq('user_id', targetId);

      if (routinesError) {
        console.warn('Errore fetch routines dal cloud:', routinesError);
      } else if (routinesData) {
        const parsedRoutines: Routine[] = routinesData.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          exercises: Array.isArray(r.exercises) ? r.exercises : []
        }));

        setRoutines(prev => {
          const map = new Map<string, Routine>();
          parsedRoutines.forEach(r => map.set(r.id, r));
          const localRoutines: Routine[] = prev && prev.length > 0 ? prev : JSON.parse(localStorage.getItem('df_routines') || '[]');
          const unpushedRoutines: Routine[] = [];
          localRoutines.forEach(lr => {
            if (!map.has(lr.id)) {
              map.set(lr.id, lr);
              unpushedRoutines.push(lr);
            }
          });

          // Se ci sono routine salvate in locale che mancano su Supabase, pushale automaticamente al cloud
          if (unpushedRoutines.length > 0) {
            const payload = unpushedRoutines.map((r: Routine) => ({
              id: r.id,
              user_id: targetId,
              name: r.name,
              description: r.description || '',
              exercises: r.exercises
            }));
            client.from('routines').upsert(payload, { onConflict: 'id' }).then(({ error }: any) => {
              if (error) console.warn('Errore salvataggio routine locali su cloud:', error);
            });
          }

          return Array.from(map.values());
        });
      }

      // 3. Fetch Workout Logs
      const { data: workoutsData, error: workoutsError } = await client
        .from('workout_logs')
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false });

      if (workoutsError) {
        console.warn('Errore fetch workout logs dal cloud:', workoutsError);
      } else if (workoutsData) {
        const parsedWorkouts: WorkoutLog[] = workoutsData.map((w: any) => ({
          id: w.id,
          name: w.name,
          date: w.date,
          duration: w.duration || 0,
          volume: w.volume || 0,
          exercises: Array.isArray(w.exercises) ? w.exercises : [],
          avgHeartRate: w.avg_heart_rate ? Number(w.avg_heart_rate) : undefined,
          heartRateSamples: Array.isArray(w.heart_rate_samples) ? w.heart_rate_samples : undefined,
          caloriesBurned: w.calories_burned ? Number(w.calories_burned) : undefined,
          deviceSource: w.device_source || undefined,
          activityType: w.activity_type || 'strength',
          distanceKm: w.distance_km ? Number(w.distance_km) : undefined,
          elevationMeters: w.elevation_meters ? Number(w.elevation_meters) : undefined,
          pace: w.pace || undefined,
          notes: w.notes || undefined
        }));

        setWorkoutHistory(prev => {
          const map = new Map<string, WorkoutLog>();
          parsedWorkouts.forEach(w => map.set(w.id, w));
          const localHistory: WorkoutLog[] = prev && prev.length > 0 ? prev : JSON.parse(localStorage.getItem('df_history') || '[]');
          const unpushedWorkouts: WorkoutLog[] = [];
          localHistory.forEach(lw => {
            if (!map.has(lw.id)) {
              map.set(lw.id, lw);
              unpushedWorkouts.push(lw);
            }
          });

          // Se ci sono allenamenti salvati in locale che mancano su Supabase, pushali al cloud
          if (unpushedWorkouts.length > 0) {
            unpushedWorkouts.forEach(uw => {
              upsertWorkoutLogSafely(client, {
                id: uw.id,
                user_id: targetId,
                name: uw.name,
                date: uw.date,
                duration: uw.duration,
                volume: uw.volume,
                exercises: uw.exercises,
                avg_heart_rate: uw.avgHeartRate ?? null,
                heart_rate_samples: uw.heartRateSamples ? JSON.stringify(uw.heartRateSamples) : null,
                calories_burned: uw.caloriesBurned ?? null,
                device_source: uw.deviceSource ?? null,
                activity_type: uw.activityType ?? 'strength',
                distance_km: uw.distanceKm ?? null,
                elevation_meters: uw.elevationMeters ?? null,
                pace: uw.pace ?? null,
                notes: uw.notes ?? null
              });
            });
          }

          const merged = Array.from(map.values());
          return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      }

      // 4. Fetch Food Logs
      const { data: foodData } = await client
        .from('food_logs')
        .select('*')
        .eq('user_id', targetId);

      if (foodData && foodData.length > 0) {
        const grouped: FoodLogs = {};
        foodData.forEach((f: any) => {
          if (!grouped[f.date]) grouped[f.date] = [];
          grouped[f.date].push({
            id: f.id,
            name: f.name,
            mealType: f.meal_type || 'Pranzo',
            calories: f.calories || 0,
            protein: f.protein || 0,
            carbs: f.carbs || 0,
            fat: f.fat || 0,
            weight: f.weight || 0
          });
        });
        setFoodLogs(grouped);
      }

      // 5. Fetch Custom Exercises
      const { data: customExData } = await client
        .from('exercises')
        .select('*')
        .or(`created_by.eq.${targetId},is_custom.eq.true`);

      if (customExData && customExData.length > 0) {
        const parsedCustom: Exercise[] = customExData.map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          category: ex.category as any,
          muscleGroup: ex.muscle_group as any,
          equipment: ex.equipment as any,
          instructions: ex.instructions || '',
          videoUrl: ex.video_url || '',
          trackingType: ex.tracking_type || 'weight_reps'
        }));
        setCustomExercises(parsedCustom);
      }

      // 6. Fetch Recipes from Supabase (if table exists)
      try {
        const { data: cloudRecipes, error: recErr } = await client
          .from('recipes')
          .select('*')
          .order('type', { ascending: true });

        if (!recErr && cloudRecipes && cloudRecipes.length > 0) {
          const parsedRecipes: Recipe[] = cloudRecipes.map((r: any) => ({
            id: r.id,
            title: r.title,
            type: r.type,
            prepTime: r.prep_time || 15,
            difficulty: r.difficulty || 'Facile',
            equipment: Array.isArray(r.equipment) ? r.equipment : [],
            ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
            instructions: Array.isArray(r.instructions) ? r.instructions : [],
            macros: {
              calories: Number(r.calories) || 0,
              protein: Number(r.protein) || 0,
              carbs: Number(r.carbs) || 0,
              fat: Number(r.fat) || 0
            },
            imageUrl: r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
          }));
          setRecipes(parsedRecipes);
        }
      } catch (errRec) {
        console.warn('Avviso caricamento ricette cloud:', errRec);
      }

      return { success: true, message: 'Dati sincronizzati con successo dal cloud Supabase!' };
    } catch (err: any) {
      console.warn('Errore syncAllDataFromCloud:', err);
      return { success: false, message: err.message || 'Errore durante la sincronizzazione.' };
    } finally {
      isSyncingRef.current = false;
    }
  }, [supabaseClient, syncProfileToCloud]);

  const syncAllDataToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!supabaseClient) {
      return { success: false, message: 'Supabase non è configurato. Inserisci URL e Anon Key prima di sincronizzare.' };
    }
    const resolvedId = await resolveSupabaseUserId(supabaseClient, userRef.current?.id);
    if (!resolvedId) {
      return { success: false, message: 'Devi aver effettuato l\'accesso con un account per sincronizzare i dati su Supabase.' };
    }

    try {
      const errors: string[] = [];

      // 1. Sync Profile
      try {
        await syncProfileToCloud(resolvedId, profileRef.current, supabaseClient);
      } catch (pErr: any) {
        errors.push(`Profilo: ${pErr.message}`);
      }

      // 2. Sync Routines
      if (routines.length > 0) {
        const routinesPayload = routines.map(r => ({
          id: r.id,
          user_id: resolvedId,
          name: r.name,
          description: r.description || '',
          exercises: r.exercises
        }));
        const { error: routErr } = await supabaseClient.from('routines').upsert(routinesPayload, { onConflict: 'id' });
        if (routErr) {
          console.warn('Avviso: sincronizzazione routine cloud:', routErr);
          errors.push(`Schede: ${routErr.message}`);
        }
      }

      // 3. Sync Workout Logs (resilient to missing columns)
      if (workoutHistory.length > 0) {
        for (const w of workoutHistory) {
          const wRes = await upsertWorkoutLogSafely(supabaseClient, {
            id: w.id,
            user_id: resolvedId,
            name: w.name,
            date: w.date,
            duration: w.duration,
            volume: w.volume,
            exercises: w.exercises,
            avg_heart_rate: w.avgHeartRate ?? null,
            heart_rate_samples: w.heartRateSamples ? JSON.stringify(w.heartRateSamples) : null,
            calories_burned: w.caloriesBurned ?? null,
            device_source: w.deviceSource ?? null,
            activity_type: w.activityType ?? 'strength',
            distance_km: w.distanceKm ?? null,
            elevation_meters: w.elevationMeters ?? null,
            pace: w.pace ?? null,
            notes: w.notes ?? null
          });
          if (!wRes.success) {
            errors.push(`Allenamenti: ${wRes.error}`);
            break; // evita messaggi ripetitivi
          }
        }
      }

      // 4. Sync Food Logs
      const foodEntries: any[] = [];
      Object.entries(foodLogs).forEach(([date, items]) => {
        items.forEach(item => {
          foodEntries.push({
            id: item.id,
            user_id: resolvedId,
            date,
            name: item.name,
            meal_type: item.mealType,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            weight: item.weight
          });
        });
      });
      if (foodEntries.length > 0) {
        const { error: fErr } = await supabaseClient.from('food_logs').upsert(foodEntries, { onConflict: 'id' });
        if (fErr) {
          errors.push(`Pasti: ${fErr.message}`);
        }
      }

      // 5. Sync Recipes
      if (recipes && recipes.length > 0) {
        try {
          const recipesPayload = recipes.map(r => ({
            id: r.id,
            title: r.title,
            type: r.type,
            prep_time: r.prepTime,
            difficulty: r.difficulty,
            equipment: r.equipment,
            ingredients: r.ingredients,
            instructions: r.instructions,
            calories: r.macros.calories,
            protein: r.macros.protein,
            carbs: r.macros.carbs,
            fat: r.macros.fat,
            image_url: r.imageUrl
          }));
          await supabaseClient.from('recipes').upsert(recipesPayload, { onConflict: 'id' });
        } catch (rErr) {
          console.warn('Avviso: sincronizzazione ricette sul cloud:', rErr);
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `Errore sincronizzazione Supabase: ${errors.join(' | ')}`
        };
      }

      return {
        success: true,
        message: `Sincronizzazione completata con successo! Profilo, ${routines.length} schede, ${workoutHistory.length} allenamenti e ${foodEntries.length} alimenti salvati sul cloud Supabase.`
      };
    } catch (err: any) {
      return { success: false, message: `Errore durante la sincronizzazione: ${err.message}` };
    }
  };

  const syncAllDataRef = useRef(syncAllDataFromCloud);
  syncAllDataRef.current = syncAllDataFromCloud;

  const lastSyncedUserIdRef = useRef<string | null>(null);

  // --- SUPABASE SESSION WATCH ---
  useEffect(() => {
    if (!supabaseClient) return;

    let isMounted = true;

    const handleSession = (session: any, shouldSync = false) => {
      if (!isMounted) return;
      if (session?.user) {
        const name = session.user.user_metadata?.name || 
                     session.user.user_metadata?.full_name || 
                     session.user.email?.split('@')[0] || 
                     'Utente';
        const userId = session.user.id;
        const email = session.user.email || '';

        setUser(prev => {
          if (prev && prev.id === userId && prev.email === email && prev.name === name) {
            return prev;
          }
          return { id: userId, email, name };
        });

        if (shouldSync && lastSyncedUserIdRef.current !== userId) {
          lastSyncedUserIdRef.current = userId;
          syncAllDataRef.current(userId, supabaseClient);
        }
      } else {
        lastSyncedUserIdRef.current = null;
        setUser(null);
      }
    };

    // 1. Check existing session on mount or client change
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      handleSession(session, true);
    });

    // 2. Listen for auth state transitions
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      const shouldSync = event === 'SIGNED_IN' || event === 'USER_UPDATED';
      handleSession(session, shouldSync);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  // --- AUTH ACTIONS ---
  const signUp = async (email: string, pass: string, name: string) => {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password: pass,
        options: { data: { name, full_name: name } }
      });
      if (error) throw error;
      if (data.user) {
        const initialProf: ProfileData = {
          ...profileRef.current,
          name
        };
        await syncProfileToCloud(data.user.id, initialProf, supabaseClient);
        lastSyncedUserIdRef.current = data.user.id;
        await syncAllDataFromCloud(data.user.id, supabaseClient);
      }
    } else {
      throw new Error(
        'Supabase non è configurato su questo dispositivo. Clicca sul pulsante in alto per inserire Project URL e Anon Key prima di registrarti.'
      );
    }
  };

  const signIn = async (email: string, pass: string) => {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email non ancora confermata. Controlla la tua casella di posta oppure disattiva "Confirm email" nel pannello Supabase (Authentication -> Providers -> Email).');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenziali non valide. Verifica email e password.');
        }
        throw error;
      }
      if (data.user) {
        const uName = data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Utente';
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: uName
        });
        lastSyncedUserIdRef.current = data.user.id;
        await syncAllDataFromCloud(data.user.id, supabaseClient);
      }
    } else {
      throw new Error(
        'Supabase non è configurato su questo dispositivo. Clicca sul pulsante "Configura Supabase" in cima allo schermo per inserire Project URL e Anon Key del tuo database.'
      );
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    if (supabaseClient) {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase non è configurato. Inserisci URL e Anon Key per accedere.');
    }
  };

  const signOut = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    lastSyncedUserIdRef.current = null;
    setUser(null);
  };

  const deleteAccountAndData = async () => {
    if (supabaseClient && user) {
      await supabaseClient.from('profiles').delete().eq('id', user.id);
      await supabaseClient.from('food_logs').delete().eq('user_id', user.id);
      await supabaseClient.from('workout_logs').delete().eq('user_id', user.id);
      await supabaseClient.from('routines').delete().eq('user_id', user.id);
      await supabaseClient.auth.signOut();
    }
    
    // Clear LocalStorage data (right to be forgotten / data deletion compliance)
    localStorage.removeItem('df_user');
    localStorage.removeItem('df_profile');
    localStorage.removeItem('df_routines');
    localStorage.removeItem('df_history');
    localStorage.removeItem('df_food_logs');
    localStorage.removeItem('df_cycle_data');
    localStorage.removeItem('df_active_workout');
    localStorage.removeItem('df_consent');
    localStorage.removeItem('df_meals_list');

    // Reset state to default values
    setUser(null);
    setHasConsentedState(false);
    setProfile(defaultProfile);
    setRoutines([]);
    setWorkoutHistory([]);
    setFoodLogs({});
    setActiveWorkout(null);
    setMealsList(['Colazione', 'Pranzo', 'Spuntino', 'Cena']);
  };

  const setHasConsented = (consent: boolean) => {
    setHasConsentedState(consent);
    localStorage.setItem('df_consent', consent ? 'true' : 'false');
  };

  // --- PREVIOUS EXERCISE VALUES (Memoized O(1) lookup) ---
  const previousPerformancesMap = useMemo(() => {
    const map: Record<string, { weight: number; reps: number; time?: number; distance?: number }[]> = {};
    const sortedHistory = [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const log of sortedHistory) {
      for (const ex of log.exercises) {
        if (!map[ex.exerciseId] && ex.sets.length > 0) {
          map[ex.exerciseId] = ex.sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            time: s.time,
            distance: s.distance
          }));
        }
      }
    }
    return map;
  }, [workoutHistory]);

  const getPreviousPerformances = useCallback((exerciseId: string): { weight: number; reps: number; time?: number; distance?: number }[] => {
    return previousPerformancesMap[exerciseId] || [];
  }, [previousPerformancesMap]);

  // --- PROFILE ACTIONS ---
  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile(prev => {
      const updated = { ...prev, ...data };
      if (data.lastLoggedDate && data.lastLoggedDate !== prev.lastLoggedDate) {
        const lastDate = new Date(prev.lastLoggedDate);
        const newDate = new Date(data.lastLoggedDate);
        const diffTime = Math.abs(newDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          updated.streak = prev.streak + 1;
        } else if (diffDays > 1) {
          updated.streak = 1;
        }
      }
      if (userRef.current && supabaseClient) {
        syncProfileToCloud(userRef.current.id, updated, supabaseClient);
      }
      return updated;
    });
  };

  const addRoutine = async (routine: Routine): Promise<{ cloudSynced: boolean; error?: string }> => {
    setRoutines(prev => [routine, ...prev]);
    if (supabaseClient) {
      const targetId = await resolveSupabaseUserId(supabaseClient, userRef.current?.id);
      if (!targetId) {
        return { cloudSynced: false, error: 'Sessione Supabase non attiva. Effettua il login.' };
      }
      const { error } = await supabaseClient.from('routines').upsert({
        id: routine.id,
        user_id: targetId,
        name: routine.name,
        description: routine.description || '',
        exercises: routine.exercises
      }, { onConflict: 'id' });
      if (error) {
        console.warn('Errore sync routine cloud:', error);
        return { cloudSynced: false, error: error.message };
      }
      return { cloudSynced: true };
    }
    return { cloudSynced: false };
  };

  const updateRoutine = async (routine: Routine): Promise<{ cloudSynced: boolean; error?: string }> => {
    setRoutines(prev => prev.map(r => r.id === routine.id ? routine : r));
    if (supabaseClient) {
      const targetId = await resolveSupabaseUserId(supabaseClient, userRef.current?.id);
      if (!targetId) {
        return { cloudSynced: false, error: 'Sessione Supabase non attiva. Effettua il login.' };
      }
      const { error } = await supabaseClient.from('routines').upsert({
        id: routine.id,
        user_id: targetId,
        name: routine.name,
        description: routine.description || '',
        exercises: routine.exercises
      }, { onConflict: 'id' });
      if (error) {
        console.warn('Errore update routine cloud:', error);
        return { cloudSynced: false, error: error.message };
      }
      return { cloudSynced: true };
    }
    return { cloudSynced: false };
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    if (supabaseClient) {
      resolveSupabaseUserId(supabaseClient, userRef.current?.id).then(targetId => {
        if (targetId) {
          supabaseClient.from('routines').delete().eq('id', id).then(({ error }) => {
            if (error) console.warn('Errore delete routine cloud:', error);
          });
        }
      });
    }
  };

  const updateWorkoutLog = async (updatedLog: WorkoutLog) => {
    setWorkoutHistory(prev => prev.map(w => w.id === updatedLog.id ? updatedLog : w));
    if (supabaseClient) {
      const targetId = await resolveSupabaseUserId(supabaseClient, userRef.current?.id);
      if (targetId) {
        await upsertWorkoutLogSafely(supabaseClient, {
          id: updatedLog.id,
          user_id: targetId,
          name: updatedLog.name,
          date: updatedLog.date,
          duration: updatedLog.duration,
          volume: updatedLog.volume,
          exercises: updatedLog.exercises,
          avg_heart_rate: updatedLog.avgHeartRate ?? null,
          heart_rate_samples: updatedLog.heartRateSamples ? JSON.stringify(updatedLog.heartRateSamples) : null,
          calories_burned: updatedLog.caloriesBurned ?? null,
          device_source: updatedLog.deviceSource ?? null,
          activity_type: updatedLog.activityType ?? 'strength',
          distance_km: updatedLog.distanceKm ?? null,
          elevation_meters: updatedLog.elevationMeters ?? null,
          pace: updatedLog.pace ?? null,
          notes: updatedLog.notes ?? null
        });
      }
    }
  };

  const deleteWorkoutLog = (id: string) => {
    setWorkoutHistory(prev => prev.filter(w => w.id !== id));
    if (supabaseClient) {
      resolveSupabaseUserId(supabaseClient, userRef.current?.id).then(targetId => {
        if (targetId) {
          supabaseClient.from('workout_logs').delete().eq('id', id).then(({ error }) => {
            if (error) console.warn('Errore delete workout cloud:', error);
          });
        }
      });
    }
  };

  const addCustomExercise = async (ex: Exercise) => {
    setCustomExercises(prev => [...prev.filter(e => e.id !== ex.id), ex]);
    if (user && supabaseClient) {
      try {
        await supabaseClient.from('exercises').upsert({
          id: ex.id,
          name: ex.name,
          category: ex.category,
          muscle_group: ex.muscleGroup,
          equipment: ex.equipment,
          instructions: ex.instructions || '',
          video_url: ex.videoUrl || '',
          tracking_type: ex.trackingType || 'weight_reps',
          is_custom: true,
          created_by: user.id
        }, { onConflict: 'id' });
      } catch (err) {
        console.warn('Errore aggiunta esercizio custom su Supabase:', err);
      }
    }
  };

  const deleteCustomExercise = async (id: string) => {
    setCustomExercises(prev => prev.filter(e => e.id !== id));
    if (user && supabaseClient) {
      try {
        await supabaseClient.from('exercises').delete().eq('id', id);
      } catch (err) {
        console.warn('Errore rimozione esercizio custom da Supabase:', err);
      }
    }
  };

  const updateActiveWorkoutExerciseRest = (exerciseId: string, restSeconds: number) => {
    if (!activeWorkout) return;
    const updatedExercises = activeWorkout.exercises.map(ex => {
      if (ex.exerciseId === exerciseId) {
        return { ...ex, restSeconds };
      }
      return ex;
    });
    setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  const startWorkout = (routineId?: string, repeatWorkout?: WorkoutLog) => {
    if (repeatWorkout) {
      const exercises: ExerciseLog[] = repeatWorkout.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        restSeconds: ex.restSeconds || 90,
        sets: ex.sets.map((s, idx) => ({
          id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          weight: s.weight,
          reps: s.reps,
          time: s.time,
          distance: s.distance,
          completed: false
        }))
      }));
      setActiveWorkout({
        name: repeatWorkout.name,
        startTime: Date.now(),
        exercises
      });
      return;
    }
    if (routineId) {
      const routine = routines.find(r => r.id === routineId);
      if (routine) {
        const exercises: ExerciseLog[] = routine.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          restSeconds: ex.restSeconds || 90,
          sets: ex.defaultSets.map((s, idx) => ({
            id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            weight: s.weight,
            reps: s.reps,
            time: s.time,
            distance: s.distance,
            completed: false
          }))
        }));
        setActiveWorkout({
          name: routine.name,
          startTime: Date.now(),
          exercises
        });
        return;
      }
    }
    setActiveWorkout({
      name: 'Allenamento di Circostanza',
      startTime: Date.now(),
      exercises: []
    });
  };

  const updateActiveWorkoutSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps' | 'time' | 'distance', value: number) => {
    if (!activeWorkout) return;
    const updatedExercises = activeWorkout.exercises.map(ex => {
      if (ex.exerciseId === exerciseId) {
        const updatedSets = [...ex.sets];
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          [field]: value,
          completed: false
        };
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });
    setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
  };

  // Immutable updater for exercises array — avoids direct state mutation in child components
  const updateActiveWorkoutExercises = (updater: (prev: ExerciseLog[]) => ExerciseLog[]) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => prev ? { ...prev, exercises: updater(prev.exercises) } : null);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#06b6d4', '#ec4899', '#fbbf24', '#10b981']
    });
  };

  const toggleCompleteSet = (exerciseId: string, setIndex: number) => {
    if (!activeWorkout) return;
    let recordTriggered = false;
    const exDetail = mockExercises.find(e => e.id === exerciseId);
    const isCardio = isDistanceTimeExercise(exDetail);
    const isIso = isTimeOnlyExercise(exDetail);
    const isBodyweight = exDetail?.equipment === 'Niente';

    const updatedExercises = activeWorkout.exercises.map(ex => {
      if (ex.exerciseId === exerciseId) {
        let updatedSets = [...ex.sets];
        const isCompleting = !updatedSets[setIndex].completed;
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          completed: isCompleting
        };

        // Single-Trophy Rule: calculate historical PRs
        let historicalMax1RM = 0;
        let historicalMaxVol = 0;
        let historicalMaxWeight = 0;
        let historicalMaxReps = 0;
        let historicalMaxDistance = 0;
        let historicalMaxTime = 0;

        workoutHistory.forEach(log => {
          const pastEx = log.exercises.find(pe => pe.exerciseId === exerciseId);
          if (pastEx) {
            pastEx.sets.forEach(ps => {
              if (!ps.completed) return;
              const past1RM = ps.weight > 0 ? (ps.reps === 1 ? ps.weight : ps.weight * (1 + ps.reps / 30)) : 0;
              const pastVol = (ps.weight || 0) * (ps.reps || 0);
              if (past1RM > historicalMax1RM) historicalMax1RM = past1RM;
              if (pastVol > historicalMaxVol) historicalMaxVol = pastVol;
              if (ps.weight > historicalMaxWeight) historicalMaxWeight = ps.weight;
              if (ps.reps > historicalMaxReps) historicalMaxReps = ps.reps;
              if ((ps.distance || 0) > historicalMaxDistance) historicalMaxDistance = ps.distance || 0;
              if ((ps.time || 0) > historicalMaxTime) historicalMaxTime = ps.time || 0;
            });
          }
        });

        // Determine the SINGLE BEST set for each PR metric among completed sets
        let best1RMIdx = -1;
        let max1RMVal = historicalMax1RM;

        let bestVolIdx = -1;
        let maxVolVal = historicalMaxVol;

        let bestWeightIdx = -1;
        let maxWeightVal = historicalMaxWeight;

        let bestRepsIdx = -1;
        let maxRepsVal = historicalMaxReps;

        let bestDistIdx = -1;
        let maxDistVal = historicalMaxDistance;

        let bestTimeIdx = -1;
        let maxTimeVal = historicalMaxTime;

        updatedSets.forEach((s, idx) => {
          if (!s.completed) return;

          if (isCardio) {
            const curDist = s.distance || 0;
            const curTime = s.time || 0;
            if (curDist > 0 && curDist >= maxDistVal) {
              maxDistVal = curDist;
              bestDistIdx = idx;
            }
            if (curTime > 0 && curTime >= maxTimeVal) {
              maxTimeVal = curTime;
              bestTimeIdx = idx;
            }
          } else if (isIso) {
            const curTime = s.time || 0;
            if (curTime > 0 && curTime >= maxTimeVal) {
              maxTimeVal = curTime;
              bestTimeIdx = idx;
            }
          } else if (isBodyweight && s.weight === 0) {
            if (s.reps > 0 && s.reps >= maxRepsVal) {
              maxRepsVal = s.reps;
              bestRepsIdx = idx;
            }
          } else {
            const current1RM = s.reps === 1 ? s.weight : s.weight * (1 + s.reps / 30);
            const currentVol = (s.weight || 0) * (s.reps || 0);

            if (current1RM > 0 && current1RM >= max1RMVal) {
              max1RMVal = current1RM;
              best1RMIdx = idx;
            }
            if (currentVol > 0 && currentVol >= maxVolVal) {
              maxVolVal = currentVol;
              bestVolIdx = idx;
            }
            if ((s.weight || 0) > 0 && (s.weight || 0) >= maxWeightVal) {
              maxWeightVal = s.weight;
              bestWeightIdx = idx;
            }
          }
        });

        if (isCompleting && (best1RMIdx === setIndex || bestVolIdx === setIndex || bestWeightIdx === setIndex || bestRepsIdx === setIndex || bestDistIdx === setIndex || bestTimeIdx === setIndex)) {
          recordTriggered = true;
        }

        updatedSets = updatedSets.map((s, idx) => {
          if (!s.completed) {
            return {
              ...s,
              is1RM: false,
              isMaxVolume: false,
              isMaxWeight: false,
              isMaxReps: false,
              isMaxDistance: false,
              isMaxTime: false
            };
          }
          return {
            ...s,
            is1RM: idx === best1RMIdx && best1RMIdx !== -1,
            isMaxVolume: idx === bestVolIdx && bestVolIdx !== -1,
            isMaxWeight: idx === bestWeightIdx && bestWeightIdx !== -1,
            isMaxReps: idx === bestRepsIdx && bestRepsIdx !== -1,
            isMaxDistance: idx === bestDistIdx && bestDistIdx !== -1,
            isMaxTime: idx === bestTimeIdx && bestTimeIdx !== -1
          };
        });

        return { ...ex, sets: updatedSets };
      }
      return ex;
    });

    setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });

    if (recordTriggered) {
      triggerConfetti();
    }
  };

  const addExerciseToActiveWorkout = (exerciseId: string, restSeconds: number = 90) => {
    if (!activeWorkout) return;
    
    const exists = activeWorkout.exercises.some(e => e.exerciseId === exerciseId);
    if (exists) return;

    const exDetail = mockExercises.find(e => e.id === exerciseId);
    const isCardio = isDistanceTimeExercise(exDetail);
    const isIso = isTimeOnlyExercise(exDetail);
    const prevSets = getPreviousPerformances(exerciseId);

    let defaultSets: SetLog[];
    if (prevSets.length > 0) {
      defaultSets = prevSets.map((ps, idx) => ({
        id: `s-${Date.now()}-${idx}`,
        weight: ps.weight,
        reps: ps.reps,
        time: ps.time,
        distance: ps.distance,
        completed: false
      }));
    } else if (isCardio) {
      defaultSets = [{ id: `s-${Date.now()}-0`, weight: 0, reps: 0, time: 20, distance: 3.0, completed: false }];
    } else if (isIso) {
      defaultSets = [{ id: `s-${Date.now()}-0`, weight: 0, reps: 0, time: 60, completed: false }];
    } else {
      defaultSets = [{ id: `s-${Date.now()}-0`, weight: 0, reps: 10, completed: false }];
    }

    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, { exerciseId, restSeconds, sets: defaultSets }]
    });
  };

  const addExercisesToActiveWorkout = (exerciseIds: string[]) => {
    if (!activeWorkout) return;
    
    const newExercises = [...activeWorkout.exercises];
    let addedCount = 0;

    exerciseIds.forEach((exId, exIdx) => {
      if (!newExercises.some(e => e.exerciseId === exId)) {
        const exDetail = mockExercises.find(e => e.id === exId);
        const isCardio = isDistanceTimeExercise(exDetail);
        const isIso = isTimeOnlyExercise(exDetail);
        const prevSets = getPreviousPerformances(exId);

        let defaultSets: SetLog[];
        if (prevSets.length > 0) {
          defaultSets = prevSets.map((ps, idx) => ({
            id: `s-${Date.now()}-${exIdx}-${idx}`,
            weight: ps.weight,
            reps: ps.reps,
            time: ps.time,
            distance: ps.distance,
            completed: false
          }));
        } else if (isCardio) {
          defaultSets = [{ id: `s-${Date.now()}-${exIdx}-0`, weight: 0, reps: 0, time: 20, distance: 3.0, completed: false }];
        } else if (isIso) {
          defaultSets = [{ id: `s-${Date.now()}-${exIdx}-0`, weight: 0, reps: 0, time: 60, completed: false }];
        } else {
          defaultSets = [{ id: `s-${Date.now()}-${exIdx}-0`, weight: 0, reps: 10, completed: false }];
        }
        newExercises.push({ exerciseId: exId, restSeconds: 90, sets: defaultSets });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setActiveWorkout({
        ...activeWorkout,
        exercises: newExercises
      });
    }
  };

  const saveActiveWorkout = async (
    customName?: string,
    metrics?: { avgHeartRate?: number; heartRateSamples?: HeartRateSample[]; caloriesBurned?: number; deviceSource?: string }
  ): Promise<{ cloudSynced: boolean; error?: string }> => {
    if (!activeWorkout || !activeWorkout.startTime) {
      return { cloudSynced: false, error: 'Nessun allenamento attivo in corso.' };
    }

    const duration = Math.round((Date.now() - activeWorkout.startTime) / 1000);
    let totalVolume = 0;
    let recordsCount = 0;
    let totalCompletedSets = 0;
    const exercisesToSave = activeWorkout.exercises
      .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.completed) }))
      .filter(ex => ex.sets.length > 0);

    exercisesToSave.forEach(ex => {
      const exDetail = mockExercises.find(e => e.id === ex.exerciseId);
      const isCardio = isDistanceTimeExercise(exDetail);
      const isIso = isTimeOnlyExercise(exDetail);

      ex.sets.forEach(s => {
        if (s.completed) {
          totalCompletedSets++;
          if (!isCardio && !isIso) {
            totalVolume += (s.weight || 0) * (s.reps || 0);
          }
          if (s.is1RM || s.isMaxVolume || s.isMaxWeight || s.isMaxReps || s.isMaxDistance || s.isMaxTime) {
            recordsCount++;
          }
        }
      });
    });

    // Calculate calories scientifically
    const calculatedCalories = metrics?.caloriesBurned ?? calculateWorkoutCalories(
      { weightKg: profile.weight, gender: profile.gender },
      {
        durationSeconds: duration,
        avgHeartRate: metrics?.avgHeartRate,
        totalVolumeKg: totalVolume,
        completedSetsCount: totalCompletedSets,
        activityType: 'strength'
      }
    );

    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      name: customName || activeWorkout.name,
      date: new Date().toISOString(),
      duration,
      volume: totalVolume,
      exercises: exercisesToSave,
      avgHeartRate: metrics?.avgHeartRate && metrics.avgHeartRate > 0 ? Math.round(metrics.avgHeartRate) : undefined,
      heartRateSamples: metrics?.heartRateSamples && metrics.heartRateSamples.length > 0 ? metrics.heartRateSamples : undefined,
      caloriesBurned: calculatedCalories,
      deviceSource: metrics?.deviceSource,
      activityType: 'strength'
    };

    setWorkoutHistory(prev => [newLog, ...prev.filter(w => w.id !== newLog.id)]);

    const durationMin = `${Math.floor(duration / 60)}m`;
    addSocialPost({
      username: profile.name,
      userAvatar: profile.avatarUrl || profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
      date: 'Giusto ora',
      workoutName: newLog.name,
      duration: durationMin,
      volume: totalVolume,
      recordsCount
    });

    const todayStr = new Date().toISOString().split('T')[0];
    updateProfile({ lastLoggedDate: todayStr });

    setActiveWorkout(null);
    triggerConfetti();

    if (!supabaseClient) {
      return { cloudSynced: false, error: 'Supabase non configurato su questo dispositivo.' };
    }

    const targetId = await resolveSupabaseUserId(supabaseClient, userRef.current?.id);
    if (!targetId) {
      return { cloudSynced: false, error: 'Sessione Supabase non attiva. Effettua il login dall\'app.' };
    }

    const res = await upsertWorkoutLogSafely(supabaseClient, {
      id: newLog.id,
      user_id: targetId,
      name: newLog.name,
      date: newLog.date,
      duration: newLog.duration,
      volume: newLog.volume,
      exercises: newLog.exercises,
      avg_heart_rate: newLog.avgHeartRate ?? null,
      heart_rate_samples: newLog.heartRateSamples ? JSON.stringify(newLog.heartRateSamples) : null,
      calories_burned: newLog.caloriesBurned ?? null,
      device_source: newLog.deviceSource ?? null,
      activity_type: newLog.activityType ?? 'strength'
    });

    if (!res.success) {
      console.warn('Errore salvataggio workout cloud:', res.error);
      return { cloudSynced: false, error: res.error };
    }

    return { cloudSynced: true };
  };

  const addPastWorkoutLog = async (pastLog: WorkoutLog): Promise<{ cloudSynced: boolean; error?: string }> => {
    setWorkoutHistory(prev => {
      const merged = [pastLog, ...prev.filter(w => w.id !== pastLog.id)];
      return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    triggerConfetti();

    if (!supabaseClient) {
      return { 
        cloudSynced: false, 
        error: 'Supabase non è configurato su questo dispositivo.' 
      };
    }

    const targetId = await resolveSupabaseUserId(supabaseClient, userRef.current?.id);
    if (!targetId) {
      return { 
        cloudSynced: false, 
        error: 'Sessione utente Supabase non attiva. Effettua l\'accesso con email e password dall\'app.' 
      };
    }

    const res = await upsertWorkoutLogSafely(supabaseClient, {
      id: pastLog.id,
      user_id: targetId,
      name: pastLog.name,
      date: pastLog.date,
      duration: pastLog.duration,
      volume: pastLog.volume,
      exercises: pastLog.exercises,
      avg_heart_rate: pastLog.avgHeartRate ?? null,
      heart_rate_samples: pastLog.heartRateSamples ? JSON.stringify(pastLog.heartRateSamples) : null,
      calories_burned: pastLog.caloriesBurned ?? null,
      device_source: pastLog.deviceSource ?? null,
      activity_type: pastLog.activityType ?? 'strength',
      distance_km: pastLog.distanceKm ?? null,
      elevation_meters: pastLog.elevationMeters ?? null,
      pace: pastLog.pace ?? null,
      notes: pastLog.notes ?? null
    });

    if (!res.success) {
      console.warn('Errore salvataggio past workout cloud:', res.error);
      return { cloudSynced: false, error: res.error };
    }

    return { cloudSynced: true };
  };

  const cancelActiveWorkout = () => {
    setActiveWorkout(null);
  };

  const addFoodLog = (dateStr: string, item: Omit<FoodLogItem, 'id'>) => {
    const newItem: FoodLogItem = {
      ...item,
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };

    setFoodLogs(prev => {
      const dayLogs = prev[dateStr] ? [...prev[dateStr]] : [];
      return {
        ...prev,
        [dateStr]: [...dayLogs, newItem]
      };
    });

    if (supabaseClient) {
      resolveSupabaseUserId(supabaseClient, userRef.current?.id).then(targetId => {
        if (targetId) {
          supabaseClient.from('food_logs').upsert({
            id: newItem.id,
            user_id: targetId,
            date: dateStr,
            name: newItem.name,
            meal_type: newItem.mealType,
            calories: newItem.calories,
            protein: newItem.protein,
            carbs: newItem.carbs,
            fat: newItem.fat,
            weight: newItem.weight
          }, { onConflict: 'id' }).then(({ error }) => {
            if (error) console.warn('Errore salvataggio alimento cloud:', error);
          });
        }
      });
    }

    updateProfile({ lastLoggedDate: dateStr });
  };

  const deleteFoodLog = (dateStr: string, id: string) => {
    setFoodLogs(prev => {
      if (!prev[dateStr]) return prev;
      return {
        ...prev,
        [dateStr]: prev[dateStr].filter(item => item.id !== id)
      };
    });

    if (user && supabaseClient) {
      supabaseClient.from('food_logs').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Errore eliminazione alimento cloud:', error);
      });
    }
  };

  const updateCycleData = (data: Partial<CycleData>) => {
    setCycleData(prev => ({ ...prev, ...data }));
  };

  const addSocialPost = (post: Omit<SocialPost, 'id' | 'likes' | 'comments'>) => {
    const newPost: SocialPost = {
      ...post,
      id: `soc-${Date.now()}`,
      likes: [],
      comments: []
    };
    setSocialPosts(prev => [newPost, ...prev]);
  };

  const likeSocialPost = (postId: string, username: string) => {
    setSocialPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(username);
        const newLikes = hasLiked
          ? post.likes.filter(name => name !== username)
          : [...post.likes, username];
        return { ...post, likes: newLikes };
      }
      return post;
    }));
  };

  const commentSocialPost = (postId: string, username: string, commentText: string) => {
    if (!commentText.trim()) return;
    setSocialPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, { username, text: commentText }]
        };
      }
      return post;
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      signUp,
      signIn,
      signInWithOAuth,
      signOut,
      deleteAccountAndData,
      hasConsented,
      setHasConsented,
      profile,
      updateProfile,
      routines,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      workoutHistory,
      updateWorkoutLog,
      deleteWorkoutLog,
      customExercises,
      addCustomExercise,
      deleteCustomExercise,
      activeWorkout,
      startWorkout,
      updateActiveWorkoutSet,
      updateActiveWorkoutExercises,
      updateActiveWorkoutExerciseRest,
      toggleCompleteSet,
      addExerciseToActiveWorkout,
      addExercisesToActiveWorkout,
      saveActiveWorkout,
      addPastWorkoutLog,
      cancelActiveWorkout,
      foodLogs,
      addFoodLog,
      deleteFoodLog,
      cycleData,
      updateCycleData,
      socialPosts,
      addSocialPost,
      likeSocialPost,
      commentSocialPost,
      triggerConfetti,
      getPreviousPerformances,
      mealsList,
      updateMealsList,
      isSupabaseConfigured,
      supabaseUrl: supabaseConfig.url,
      supabaseAnonKey: supabaseConfig.anonKey,
      saveSupabaseConfig,
      syncAllDataToCloud,
      syncAllDataFromCloud,
      recipes
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve essere usato all\'interno di un AppProvider');
  }
  return context;
};
