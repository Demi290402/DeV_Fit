import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { createClient } from '@supabase/supabase-js';
import { mockExercises, isDistanceTimeExercise, isTimeOnlyExercise, type Exercise } from '../data/mockExercises';

// Supabase client configuration & initialization (reads from localStorage fallback or Vite .env)
export const getStoredSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem('df_supabase_url') || '';
  const localKey = localStorage.getItem('df_supabase_anon_key') || '';

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

export interface WorkoutLog {
  id: string;
  name: string;
  date: string; // ISO string
  duration: number; // in seconds
  volume: number; // total kg
  exercises: ExerciseLog[];
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
  addRoutine: (routine: Routine) => void;
  updateRoutine: (routine: Routine) => void;
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
  saveActiveWorkout: (customName?: string) => void;
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
    streak: 1,
    lastLoggedDate: new Date().toISOString().split('T')[0]
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
      lastPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      const { data: routinesData } = await client
        .from('routines')
        .select('*')
        .eq('user_id', targetId);

      if (routinesData && routinesData.length > 0) {
        const parsedRoutines: Routine[] = routinesData.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          exercises: Array.isArray(r.exercises) ? r.exercises : []
        }));
        setRoutines(parsedRoutines);
      }

      // 3. Fetch Workout Logs
      const { data: workoutsData } = await client
        .from('workout_logs')
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false });

      if (workoutsData && workoutsData.length > 0) {
        const parsedWorkouts: WorkoutLog[] = workoutsData.map((w: any) => ({
          id: w.id,
          name: w.name,
          date: w.date,
          duration: w.duration || 0,
          volume: w.volume || 0,
          exercises: Array.isArray(w.exercises) ? w.exercises : []
        }));
        setWorkoutHistory(parsedWorkouts);
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
    const targetUser = userRef.current;
    if (!targetUser) {
      return { success: false, message: 'Devi aver effettuato l\'accesso con un account per sincronizzare i dati su Supabase.' };
    }

    try {
      // 1. Sync Profile
      await syncProfileToCloud(targetUser.id, profileRef.current, supabaseClient);

      // 2. Sync Routines
      if (routines.length > 0) {
        const routinesPayload = routines.map(r => ({
          id: r.id,
          user_id: targetUser.id,
          name: r.name,
          description: r.description,
          exercises: r.exercises
        }));
        await supabaseClient.from('routines').upsert(routinesPayload, { onConflict: 'id' });
      }

      // 3. Sync Workout Logs
      if (workoutHistory.length > 0) {
        const historyPayload = workoutHistory.map(w => ({
          id: w.id,
          user_id: targetUser.id,
          name: w.name,
          date: w.date,
          duration: w.duration,
          volume: w.volume,
          exercises: w.exercises
        }));
        await supabaseClient.from('workout_logs').upsert(historyPayload, { onConflict: 'id' });
      }

      // 4. Sync Food Logs
      const foodEntries: any[] = [];
      Object.entries(foodLogs).forEach(([date, items]) => {
        items.forEach(item => {
          foodEntries.push({
            id: item.id,
            user_id: targetUser.id,
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
        await supabaseClient.from('food_logs').upsert(foodEntries, { onConflict: 'id' });
      }

      return {
        success: true,
        message: `Sincronizzazione completata! Profilo, ${routines.length} schede, ${workoutHistory.length} allenamenti e ${foodEntries.length} alimenti salvati sul cloud Supabase.`
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
      // Mock OAuth Login
      const mockUser = {
        id: `oauth-${provider}-${Date.now()}`,
        email: `${provider}-user@example.com`,
        name: `${provider === 'google' ? 'Google' : 'Facebook'} User`
      };
      setUser(mockUser);
      setProfile(prev => ({ ...prev, name: mockUser.name }));
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

  const addRoutine = (routine: Routine) => {
    setRoutines(prev => [routine, ...prev]);
    if (user && supabaseClient) {
      supabaseClient.from('routines').upsert({
        id: routine.id,
        user_id: user.id,
        name: routine.name,
        description: routine.description,
        exercises: routine.exercises
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.warn('Errore sync routine cloud:', error);
      });
    }
  };

  const updateRoutine = (routine: Routine) => {
    setRoutines(prev => prev.map(r => r.id === routine.id ? routine : r));
    if (user && supabaseClient) {
      supabaseClient.from('routines').upsert({
        id: routine.id,
        user_id: user.id,
        name: routine.name,
        description: routine.description,
        exercises: routine.exercises
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.warn('Errore update routine cloud:', error);
      });
    }
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    if (user && supabaseClient) {
      supabaseClient.from('routines').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Errore delete routine cloud:', error);
      });
    }
  };

  const updateWorkoutLog = (updatedLog: WorkoutLog) => {
    setWorkoutHistory(prev => prev.map(w => w.id === updatedLog.id ? updatedLog : w));
    if (user && supabaseClient) {
      supabaseClient.from('workout_logs').upsert({
        id: updatedLog.id,
        user_id: user.id,
        name: updatedLog.name,
        date: updatedLog.date,
        duration: updatedLog.duration,
        volume: updatedLog.volume,
        exercises: updatedLog.exercises
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.warn('Errore update workout cloud:', error);
      });
    }
  };

  const deleteWorkoutLog = (id: string) => {
    setWorkoutHistory(prev => prev.filter(w => w.id !== id));
    if (user && supabaseClient) {
      supabaseClient.from('workout_logs').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Errore delete workout cloud:', error);
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
        const updatedSets = [...ex.sets];
        const isCompleting = !updatedSets[setIndex].completed;
        
        if (isCompleting) {
          const currentSet = updatedSets[setIndex];

          let is1RM = false;
          let isMaxVolume = false;
          let isMaxWeight = false;
          let isMaxReps = false;
          let isMaxDistance = false;
          let isMaxTime = false;

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
                // Strength / Weight 1RM (with 1 rep fix)
                const past1RM = ps.weight > 0 ? (ps.reps === 1 ? ps.weight : ps.weight * (1 + ps.reps / 30)) : 0;
                const pastVol = ps.weight * ps.reps;
                if (past1RM > historicalMax1RM) historicalMax1RM = past1RM;
                if (pastVol > historicalMaxVol) historicalMaxVol = pastVol;
                if (ps.weight > historicalMaxWeight) historicalMaxWeight = ps.weight;
                if (ps.reps > historicalMaxReps) historicalMaxReps = ps.reps;
                if ((ps.distance || 0) > historicalMaxDistance) historicalMaxDistance = ps.distance || 0;
                if ((ps.time || 0) > historicalMaxTime) historicalMaxTime = ps.time || 0;
              });
            }
          });

          if (isCardio) {
            // Cardio: check distance and time
            const curDist = currentSet.distance || 0;
            const curTime = currentSet.time || 0;
            isMaxDistance = curDist > 0 && curDist >= historicalMaxDistance;
            isMaxTime = curTime > 0 && curTime >= historicalMaxTime;
            if (isMaxDistance || isMaxTime) recordTriggered = true;
          } else if (isIso) {
            // Isometric: check time
            const curTime = currentSet.time || 0;
            isMaxTime = curTime > 0 && curTime >= historicalMaxTime;
            if (isMaxTime) recordTriggered = true;
          } else if (isBodyweight && currentSet.weight === 0) {
            // Bodyweight reps record
            isMaxReps = currentSet.reps > 0 && currentSet.reps >= historicalMaxReps;
            if (isMaxReps) recordTriggered = true;
          } else {
            // Standard weightlifting (reps === 1 gives exact weight as 1RM)
            const current1RM = currentSet.reps === 1 
              ? currentSet.weight 
              : currentSet.weight * (1 + currentSet.reps / 30);
            const currentVol = currentSet.weight * currentSet.reps;

            is1RM = current1RM > 0 && current1RM >= historicalMax1RM;
            isMaxVolume = currentVol > 0 && currentVol >= historicalMaxVol;
            isMaxWeight = currentSet.weight > 0 && currentSet.weight >= historicalMaxWeight;

            if (is1RM || isMaxVolume || isMaxWeight) recordTriggered = true;
          }

          updatedSets[setIndex] = {
            ...currentSet,
            completed: true,
            is1RM,
            isMaxVolume,
            isMaxWeight,
            isMaxReps,
            isMaxDistance,
            isMaxTime
          };
        } else {
          updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            completed: false,
            is1RM: false,
            isMaxVolume: false,
            isMaxWeight: false,
            isMaxReps: false,
            isMaxDistance: false,
            isMaxTime: false
          };
        }
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

  const saveActiveWorkout = (customName?: string) => {
    if (!activeWorkout || !activeWorkout.startTime) return;

    const duration = Math.round((Date.now() - activeWorkout.startTime) / 1000);
    let totalVolume = 0;
    let recordsCount = 0;
    const exercisesToSave = activeWorkout.exercises
      .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.completed) }))
      .filter(ex => ex.sets.length > 0);

    exercisesToSave.forEach(ex => {
      const exDetail = mockExercises.find(e => e.id === ex.exerciseId);
      const isCardio = isDistanceTimeExercise(exDetail);
      const isIso = isTimeOnlyExercise(exDetail);

      ex.sets.forEach(s => {
        if (s.completed) {
          if (!isCardio && !isIso) {
            totalVolume += s.weight * s.reps;
          }
          if (s.is1RM || s.isMaxVolume || s.isMaxWeight || s.isMaxReps || s.isMaxDistance || s.isMaxTime) {
            recordsCount++;
          }
        }
      });
    });

    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      name: customName || activeWorkout.name,
      date: new Date().toISOString(),
      duration,
      volume: totalVolume,
      exercises: exercisesToSave
    };

    setWorkoutHistory(prev => [newLog, ...prev]);

    if (user && supabaseClient) {
      supabaseClient.from('workout_logs').upsert({
        id: newLog.id,
        user_id: user.id,
        name: newLog.name,
        date: newLog.date,
        duration: newLog.duration,
        volume: newLog.volume,
        exercises: newLog.exercises
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.warn('Errore salvataggio workout cloud:', error);
      });
    }

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

    if (user && supabaseClient) {
      supabaseClient.from('food_logs').upsert({
        id: newItem.id,
        user_id: user.id,
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
      syncAllDataFromCloud
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
