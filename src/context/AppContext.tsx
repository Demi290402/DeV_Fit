import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';


export interface ProfileData {
  name: string;
  gender: 'female' | 'male';
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
  mealType: 'Colazione' | 'Pranzo' | 'Spuntino' | 'Cena';
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
  profile: ProfileData;
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
  // --- MOCK INITIATORS ---
  const initialProfile: ProfileData = {
    name: 'DevFit User',
    gender: 'female',
    weight: 65.4,
    bodyFat: 21.5,
    waist: 68,
    arms: 29.5,
    thighs: 54,
    targetCalories: 1800,
    targetProtein: 120,
    targetCarbs: 185,
    targetFat: 55,
    streak: 5,
    lastLoggedDate: new Date().toISOString().split('T')[0]
  };

  const initialRoutines: Routine[] = [
    {
      id: 'rot-1',
      name: 'Gambe & Glutei Tonificazione',
      description: 'Creata da Coach Alessia. Focus su forza submassimale e stimolo glutei.',
      exercises: [
        { exerciseId: 'ex-squat', defaultSets: [{ weight: 40, reps: 10 }, { weight: 45, reps: 10 }, { weight: 50, reps: 8 }] },
        { exerciseId: 'ex-crunch', defaultSets: [{ weight: 0, reps: 15 }, { weight: 0, reps: 15 }] }
      ]
    },
    {
      id: 'rot-2',
      name: 'Spinta & Petto Sviluppo',
      description: 'Ideata da Trainer Fabio. Per spessore pettorali e tricipiti.',
      exercises: [
        { exerciseId: 'ex-chest-press', defaultSets: [{ weight: 45, reps: 12 }, { weight: 55, reps: 10 }, { weight: 65, reps: 8 }, { weight: 70, reps: 6 }] },
        { exerciseId: 'ex-alzate-laterali', defaultSets: [{ weight: 8, reps: 12 }, { weight: 8, reps: 12 }, { weight: 8, reps: 10 }] },
        { exerciseId: 'ex-pushdown', defaultSets: [{ weight: 20, reps: 12 }, { weight: 25, reps: 10 }] }
      ]
    }
  ];

  const initialHistory: WorkoutLog[] = [
    {
      id: 'log-prev-1',
      name: 'Spinta & Petto Sviluppo',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 2700,
      volume: 1680,
      exercises: [
        {
          exerciseId: 'ex-chest-press',
          sets: [
            { id: '1', weight: 40, reps: 12, completed: true },
            { id: '2', weight: 50, reps: 10, completed: true },
            { id: '3', weight: 60, reps: 8, completed: true }
          ]
        }
      ]
    },
    {
      id: 'log-prev-2',
      name: 'Gambe & Glutei Tonificazione',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 3200,
      volume: 1200,
      exercises: [
        {
          exerciseId: 'ex-squat',
          sets: [
            { id: '4', weight: 35, reps: 10, completed: true },
            { id: '5', weight: 40, reps: 10, completed: true }
          ]
        }
      ]
    }
  ];

  const initialFoodLogs: FoodLogs = {
    [new Date().toISOString().split('T')[0]]: [
      { id: 'f-1', name: 'Yogurt Greco 0% Fage', mealType: 'Colazione', calories: 114, protein: 20, carbs: 6, fat: 0, weight: 200 },
      { id: 'f-2', name: 'Farina d\'Avena Integrale', mealType: 'Colazione', calories: 150, protein: 5, carbs: 26, fat: 3, weight: 40 },
      { id: 'f-3', name: 'Riso Basmati con Pollo e Zucchine', mealType: 'Pranzo', calories: 480, protein: 38, carbs: 60, fat: 8, weight: 350 }
    ]
  };

  const initialCycleData: CycleData = {
    lastPeriodStart: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days ago
    cycleLength: 28,
    periodLength: 5
  };

  const initialSocial: SocialPost[] = [
    {
      id: 'soc-1',
      username: 'Marco_Gains',
      userAvatar: 'MG',
      date: '2 ore fa',
      workoutName: 'Gambe Devastanti (Domenica)',
      duration: '1h 15m',
      volume: 4850,
      recordsCount: 2,
      likes: ['DevFit User', 'Sarah_Fit'],
      comments: [
        { username: 'Sarah_Fit', text: 'Grande volume di squat! 🔥' },
        { username: 'FabioTrainer', text: 'Ottima profondità su quelle rep!' }
      ]
    },
    {
      id: 'soc-2',
      username: 'Sarah_Fit',
      userAvatar: 'SF',
      date: '5 ore fa',
      workoutName: 'Upper Body Focus Spalle',
      duration: '52m',
      volume: 2150,
      recordsCount: 1,
      likes: ['Marco_Gains'],
      comments: []
    }
  ];

  // --- STATE ---
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('df_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('df_routines');
    return saved ? JSON.parse(saved) : initialRoutines;
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('df_history');
    return saved ? JSON.parse(saved) : initialHistory;
  });

  const [activeWorkout, setActiveWorkout] = useState<AppContextType['activeWorkout']>(() => {
    const saved = localStorage.getItem('df_active_workout');
    return saved ? JSON.parse(saved) : null;
  });

  const [foodLogs, setFoodLogs] = useState<FoodLogs>(() => {
    const saved = localStorage.getItem('df_food_logs');
    return saved ? JSON.parse(saved) : initialFoodLogs;
  });

  const [cycleData, setCycleData] = useState<CycleData>(() => {
    const saved = localStorage.getItem('df_cycle_data');
    return saved ? JSON.parse(saved) : initialCycleData;
  });

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('df_social_posts');
    return saved ? JSON.parse(saved) : initialSocial;
  });

  // --- PERSISTENCE EFFECT ---
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
    localStorage.setItem('df_social_posts', JSON.stringify(socialPosts));
  }, [socialPosts]);

  // --- HELPER FUNCTION: PREVIOUS EXERCISE VALUES ---
  const getPreviousPerformances = (exerciseId: string): { weight: number; reps: number }[] => {
    // Search history for last workout containing this exercise
    const sortedHistory = [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const log of sortedHistory) {
      const match = log.exercises.find(e => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        return match.sets.map(s => ({ weight: s.weight, reps: s.reps }));
      }
    }
    return [];
  };

  // --- ACTIONS ---
  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile(prev => {
      const updated = { ...prev, ...data };
      // Check for streak calculation on new log dates
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
    // Launch an empty workout (circunstance workout)
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
          completed: false // Reset completed on change to allow re-evaluating records
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

          // Look at historical logs for records
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

          // Check if current values beat the history
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
    
    // Check if exercise already in active list
    const exists = activeWorkout.exercises.some(e => e.exerciseId === exerciseId);
    if (exists) return;

    // Load previous set default template or simple empty set
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
    
    // Calculate total volume and count records
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

    // Add to history
    setWorkoutHistory(prev => [newLog, ...prev]);

    // Add to social feed
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

    // Update streak and last active log
    const todayStr = new Date().toISOString().split('T')[0];
    updateProfile({ lastLoggedDate: todayStr });

    // Clean up active workout
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

    // Update streak and last active log
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
      getPreviousPerformances
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
