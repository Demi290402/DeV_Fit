import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization (automatic fallback if env variables are missing)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export interface ProfileData {
  name: string;
  gender: 'female' | 'male';
  height: number; // in cm
  weight: number; // in kg
  bodyFat: number; // in %
  waist: number; // in cm
  arms: number; // in cm
  thighs: number; // in cm

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
  startWorkout: (routineId?: string) => void;
  updateActiveWorkoutSet: (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  toggleCompleteSet: (exerciseId: string, setIndex: number) => void;
  addExerciseToActiveWorkout: (exerciseId: string) => void;
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

  // --- SUPABASE SESSION WATCH ---
  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.name || 'Utente'
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.name || 'Utente'
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- AUTH ACTIONS ---
  const signUp = async (email: string, pass: string, name: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name } }
      });
      if (error) throw error;
    } else {
      // Mock SignUp
      const mockId = `usr-${Date.now()}`;
      const newUser = { id: mockId, email, name };
      setUser(newUser);
      setProfile(prev => ({ ...prev, name }));
    }
  };

  const signIn = async (email: string, pass: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } else {
      // Mock SignIn
      const savedUser = localStorage.getItem('df_user');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (u && u.email === email) {
        setUser(u);
        setProfile(prev => ({ ...prev, name: u.name }));
      } else {
        // Create user on fly for demonstration in mock mode
        const mockUser = { id: `usr-${Date.now()}`, email, name: email.split('@')[0] };
        setUser(mockUser);
        setProfile(prev => ({ ...prev, name: mockUser.name }));
      }
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
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
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const deleteAccountAndData = async () => {
    if (supabase) {
      // 1. Delete user database rows
      if (user) {
        await supabase.from('profiles').delete().eq('id', user.id);
        // Note: other tables cascade delete if configured in Postgres,
        // otherwise we manually delete them:
        await supabase.from('food_logs').delete().eq('user_id', user.id);
        await supabase.from('workout_logs').delete().eq('user_id', user.id);
        await supabase.from('routines').delete().eq('user_id', user.id);
      }
      // Note: Supabase free tier doesn't allow users to delete themselves from Auth easily without an admin API,
      // so we call a custom edge function if implemented, or we sign out and let user settings trigger:
      await supabase.auth.signOut();
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

  // --- PREVIOUS EXERCISE VALUES ---
  const getPreviousPerformances = (exerciseId: string): { weight: number; reps: number }[] => {
    const sortedHistory = [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const log of sortedHistory) {
      const match = log.exercises.find(e => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        return match.sets.map(s => ({ weight: s.weight, reps: s.reps }));
      }
    }
    return [];
  };

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
      return updated;
    });
  };

  const addRoutine = (routine: Routine) => {
    setRoutines(prev => [routine, ...prev]);
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const startWorkout = (routineId?: string) => {
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

  const saveActiveWorkout = (customName?: string) => {
    if (!activeWorkout || !activeWorkout.startTime) return;

    const duration = Math.round((Date.now() - activeWorkout.startTime) / 1000);
    let totalVolume = 0;
    let recordsCount = 0;
    const exercisesToSave = activeWorkout.exercises.filter(ex => ex.sets.some(s => s.completed));

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

    const durationMin = `${Math.floor(duration / 60)}m`;
    addSocialPost({
      username: profile.name,
      userAvatar: profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
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
      toggleCompleteSet,
      addExerciseToActiveWorkout,
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
      updateMealsList
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
