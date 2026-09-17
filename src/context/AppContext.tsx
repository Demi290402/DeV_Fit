import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { createClient } from '@supabase/supabase-js';

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
  completed: boolean;
  is1RM?: boolean;
  isMaxVolume?: boolean;
  isMaxWeight?: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
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
    defaultSets: { weight: number; reps: number }[];
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
  deleteRoutine: (id: string) => void;
  workoutHistory: WorkoutLog[];
  activeWorkout: {
    name: string;
    startTime: number | null;
    exercises: ExerciseLog[];
  } | null;
  startWorkout: (routineId?: string, repeatWorkout?: WorkoutLog) => void;
  updateActiveWorkoutSet: (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  updateActiveWorkoutExercises: (updater: (prev: ExerciseLog[]) => ExerciseLog[]) => void;

  toggleCompleteSet: (exerciseId: string, setIndex: number) => void;
  addExerciseToActiveWorkout: (exerciseId: string) => void;
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
  getPreviousPerformances: (exerciseId: string) => { weight: number; reps: number }[];
  isSupabaseConfigured: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  saveSupabaseConfig: (url: string, anonKey: string) => { success: boolean; message: string };
  syncAllDataToCloud: () => Promise<{ success: boolean; message: string }>;
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

  const [hasConsented, setHasConsentedState] = useState<boolean>(() => {
    return localStorage.getItem('df_consent') === 'true';
  });

  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('df_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

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

  const syncProfileFromCloud = useCallback(async (userId: string, client = supabaseClient) => {
    if (!client || !userId) return;
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Errore lettura profilo da Supabase:', error);
        return;
      }

      if (data) {
        setProfile(prev => ({
          ...prev,
          name: data.name || prev.name,
          gender: (data.gender as 'female' | 'male') || prev.gender,
          height: typeof data.height === 'number' ? data.height : prev.height,
          weight: typeof data.weight === 'number' ? data.weight : prev.weight,
          bodyFat: typeof data.body_fat === 'number' ? data.body_fat : prev.bodyFat,
          waist: typeof data.waist === 'number' ? data.waist : prev.waist,
          arms: typeof data.arms === 'number' ? data.arms : prev.arms,
          thighs: typeof data.thighs === 'number' ? data.thighs : prev.thighs,
          avatarUrl: data.avatar_url ?? prev.avatarUrl,
          bannerUrl: data.banner_url ?? prev.bannerUrl,
          targetCalories: typeof data.target_calories === 'number' ? data.target_calories : prev.targetCalories,
          targetProtein: typeof data.target_protein === 'number' ? data.target_protein : prev.targetProtein,
          targetCarbs: typeof data.target_carbs === 'number' ? data.target_carbs : prev.targetCarbs,
          targetFat: typeof data.target_fat === 'number' ? data.target_fat : prev.targetFat,
          streak: typeof data.streak === 'number' ? data.streak : prev.streak,
          lastLoggedDate: data.last_logged_date || prev.lastLoggedDate
        }));
      } else {
        await syncProfileToCloud(userId, profile, client);
      }
    } catch (err) {
      console.warn('Errore durante syncProfileFromCloud:', err);
    }
  }, [supabaseClient, profile, syncProfileToCloud]);

  const syncAllDataToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!supabaseClient) {
      return { success: false, message: 'Supabase non è configurato. Inserisci URL e Anon Key prima di sincronizzare.' };
    }
    if (!user) {
      return { success: false, message: 'Devi aver effettuato l\'accesso con un account per sincronizzare i dati su Supabase.' };
    }

    try {
      // 1. Sync Profile
      await syncProfileToCloud(user.id, profile, supabaseClient);

      // 2. Sync Routines
      if (routines.length > 0) {
        const routinesPayload = routines.map(r => ({
          id: r.id,
          user_id: user.id,
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
          user_id: user.id,
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
            user_id: user.id,
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

  // --- SUPABASE SESSION WATCH ---
  useEffect(() => {
    if (!supabaseClient) return;
    
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const name = session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utente';
        const u = {
          id: session.user.id,
          email: session.user.email || '',
          name
        };
        setUser(u);
        syncProfileFromCloud(session.user.id, supabaseClient);
      }
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const name = session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utente';
        const u = {
          id: session.user.id,
          email: session.user.email || '',
          name
        };
        setUser(u);
        syncProfileFromCloud(session.user.id, supabaseClient);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient, syncProfileFromCloud]);

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
          ...profile,
          name
        };
        await syncProfileToCloud(data.user.id, initialProf, supabaseClient);
      }
    } else {
      // Mock SignUp
      const mockId = `usr-${Date.now()}`;
      const newUser = { id: mockId, email, name };
      setUser(newUser);
      setProfile(prev => ({ ...prev, name }));
    }
  };

  const signIn = async (email: string, pass: string) => {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data.user) {
        await syncProfileFromCloud(data.user.id, supabaseClient);
      }
    } else {
      // Mock SignIn
      const savedUser = localStorage.getItem('df_user');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (u && u.email === email) {
        setUser(u);
        setProfile(prev => ({ ...prev, name: u.name }));
      } else {
        const mockUser = { id: `usr-${Date.now()}`, email, name: email.split('@')[0] };
        setUser(mockUser);
        setProfile(prev => ({ ...prev, name: mockUser.name }));
      }
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
    const map: Record<string, { weight: number; reps: number }[]> = {};
    const sortedHistory = [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const log of sortedHistory) {
      for (const ex of log.exercises) {
        if (!map[ex.exerciseId] && ex.sets.length > 0) {
          map[ex.exerciseId] = ex.sets.map(s => ({ weight: s.weight, reps: s.reps }));
        }
      }
    }
    return map;
  }, [workoutHistory]);

  const getPreviousPerformances = useCallback((exerciseId: string): { weight: number; reps: number }[] => {
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
      if (user && supabaseClient) {
        syncProfileToCloud(user.id, updated, supabaseClient);
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

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    if (user && supabaseClient) {
      supabaseClient.from('routines').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Errore delete routine cloud:', error);
      });
    }
  };

  const startWorkout = (routineId?: string, repeatWorkout?: WorkoutLog) => {
    if (repeatWorkout) {
      const exercises: ExerciseLog[] = repeatWorkout.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets.map((s, idx) => ({
          id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          weight: s.weight,
          reps: s.reps,
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
          sets: ex.defaultSets.map((s, idx) => ({
            id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            weight: s.weight,
            reps: s.reps,
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

  const updateActiveWorkoutSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
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

    const updatedExercises = activeWorkout.exercises.map(ex => {
      if (ex.exerciseId === exerciseId) {
        const updatedSets = [...ex.sets];
        const isCompleting = !updatedSets[setIndex].completed;
        
        if (isCompleting) {
          const currentSet = updatedSets[setIndex];
          const current1RM = currentSet.weight * (1 + currentSet.reps / 30);
          const currentVol = currentSet.weight * currentSet.reps;

          let historicalMax1RM = 0;
          let historicalMaxVol = 0;
          let historicalMaxWeight = 0;

          workoutHistory.forEach(log => {
            const pastEx = log.exercises.find(pe => pe.exerciseId === exerciseId);
            if (pastEx) {
              pastEx.sets.forEach(ps => {
                const past1RM = ps.weight * (1 + ps.reps / 30);
                const pastVol = ps.weight * ps.reps;
                if (past1RM > historicalMax1RM) historicalMax1RM = past1RM;
                if (pastVol > historicalMaxVol) historicalMaxVol = pastVol;
                if (ps.weight > historicalMaxWeight) historicalMaxWeight = ps.weight;
              });
            }
          });

          const is1RM = current1RM > 0 && current1RM >= historicalMax1RM;
          const isMaxVolume = currentVol > 0 && currentVol >= historicalMaxVol;
          const isMaxWeight = currentSet.weight > 0 && currentSet.weight >= historicalMaxWeight;

          updatedSets[setIndex] = {
            ...currentSet,
            completed: true,
            is1RM,
            isMaxVolume,
            isMaxWeight
          };

          if (is1RM || isMaxVolume || isMaxWeight) {
            recordTriggered = true;
          }
        } else {
          updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            completed: false,
            is1RM: false,
            isMaxVolume: false,
            isMaxWeight: false
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

  const addExerciseToActiveWorkout = (exerciseId: string) => {
    if (!activeWorkout) return;
    
    const exists = activeWorkout.exercises.some(e => e.exerciseId === exerciseId);
    if (exists) return;

    const prevSets = getPreviousPerformances(exerciseId);
    const defaultSets = prevSets.length > 0
      ? prevSets.map((ps, idx) => ({ id: `s-${Date.now()}-${idx}`, weight: ps.weight, reps: ps.reps, completed: false }))
      : [{ id: `s-${Date.now()}-0`, weight: 0, reps: 0, completed: false }];

    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, { exerciseId, sets: defaultSets }]
    });
  };

  const addExercisesToActiveWorkout = (exerciseIds: string[]) => {
    if (!activeWorkout) return;
    
    const newExercises = [...activeWorkout.exercises];
    let addedCount = 0;

    exerciseIds.forEach((exId, exIdx) => {
      if (!newExercises.some(e => e.exerciseId === exId)) {
        const prevSets = getPreviousPerformances(exId);
        const defaultSets = prevSets.length > 0
          ? prevSets.map((ps, idx) => ({ id: `s-${Date.now()}-${exIdx}-${idx}`, weight: ps.weight, reps: ps.reps, completed: false }))
          : [{ id: `s-${Date.now()}-${exIdx}-0`, weight: 0, reps: 0, completed: false }];
        newExercises.push({ exerciseId: exId, sets: defaultSets });
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
      ex.sets.forEach(s => {
        if (s.completed) {
          totalVolume += s.weight * s.reps;
          if (s.is1RM || s.isMaxVolume || s.isMaxWeight) {
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
      deleteRoutine,
      workoutHistory,
      activeWorkout,
      startWorkout,
      updateActiveWorkoutSet,
      updateActiveWorkoutExercises,

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
      syncAllDataToCloud
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
