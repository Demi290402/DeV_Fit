import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, Search, Bell, ThumbsUp, MessageSquare, Share2, 
  Dumbbell, MoreHorizontal, Watch, Trophy, Heart, Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, type MuscleGroup } from '../data/mockExercises';
import { WorkoutDetailView, type DetailedWorkout, type DetailedWorkoutExercise } from './WorkoutDetailView';

interface HomeFeedProps {
  setCurrentTab: (tab: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ setCurrentTab }) => {
  const { 
    profile, 
    workoutHistory, 
    likeSocialPost, 
    commentSocialPost,
    updateWorkoutLog,
    deleteWorkoutLog
  } = useApp();

  // Feed Filter: 'all' | 'me' | 'friends'
  const [feedFilter, setFeedFilter] = useState<'all' | 'me' | 'friends'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Selected Workout for opening the detailed view
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<DetailedWorkout | null>(null);

  // Comments state: { [id: string]: string }
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Helper to format relative time
  const formatRelativeDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Poco fa';
      if (diffHours < 24) return `${diffHours} ore fa`;
      if (diffDays === 1) return 'Ieri';
      if (diffDays < 7) return `${diffDays} giorni fa`;
      return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Pre-configured rich workouts matching the attached screenshots
  const curatedCommunityWorkouts: DetailedWorkout[] = useMemo(() => {
    return [
      // 1. demi02's "Allenamento serale 🏋️" matching Screenshot 2 & 3
      {
        id: 'curated-demi-evening',
        isUserPost: true,
        username: profile.name.toLowerCase().replace(/\s+/g, '') || 'demi02',
        userAvatar: profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        date: 'Ieri',
        rawDate: '2026-09-23T19:10:00.000Z',
        workoutName: 'Allenamento serale 🏋️',
        durationMinutes: 48,
        volume: 6181,
        totalSets: 13,
        recordsCount: 2,
        avgHeartRate: 117,
        calories: 388,
        deviceSynced: 'WearOS Watch',
        muscleSplit: [
          { muscle: 'Schiena', percentage: 46 },
          { muscle: 'Braccia', percentage: 43 },
          { muscle: 'Spalle', percentage: 11 }
        ],
        exercises: [
          {
            exerciseId: 'ex-rematore-macchina',
            name: 'Rematore Alto Convergente (Macchina)',
            muscleGroup: 'Dorsali',
            category: 'Schiena',
            sets: [
              { setNumber: 'W', type: 'warmup', weight: 30, reps: 10, completed: true },
              { setNumber: 1, type: 'normal', weight: 40, reps: 10, completed: true },
              { setNumber: 2, type: 'normal', weight: 45, reps: 8, completed: true }
            ]
          },
          {
            exerciseId: 'ex-lat-pulldown-dritte',
            name: 'Lat Pulldown Braccia Dritte (Cavo)',
            muscleGroup: 'Dorsali',
            category: 'Schiena',
            sets: [
              { setNumber: 1, type: 'normal', weight: 50, reps: 10, completed: true },
              { setNumber: 2, type: 'normal', weight: 50, reps: 10, completed: true }
            ]
          },
          {
            exerciseId: 'ex-lat-pulldown-cavo',
            name: 'Lat Pulldown (Cavo)',
            muscleGroup: 'Dorsali',
            category: 'Schiena',
            sets: [
              { setNumber: 1, type: 'normal', weight: 60, reps: 10, completed: true },
              { setNumber: 2, type: 'normal', weight: 65, reps: 10, completed: true }
            ]
          },
          {
            exerciseId: 'ex-croci-deltoide-post',
            name: 'Croci Inverse Deltoide Posteriore (Macchina)',
            muscleGroup: 'Spalle',
            category: 'Spalle',
            sets: [
              { setNumber: 1, type: 'normal', weight: 80, reps: 20, isMaxVolume: true, is1RM: true, completed: true },
              { setNumber: 2, type: 'normal', weight: 60, reps: 20, completed: true }
            ]
          },
          {
            exerciseId: 'ex-skullcrusher-man',
            name: 'Skullcrusher (Manubrio)',
            muscleGroup: 'Tricipiti',
            category: 'Braccia',
            sets: [
              { setNumber: 1, type: 'normal', weight: 12.5, reps: 10, completed: true },
              { setNumber: 2, type: 'normal', weight: 12.5, reps: 8, completed: true }
            ]
          },
          {
            exerciseId: 'ex-curl-scott-man',
            name: 'Curl su Panca Scott (Manubrio)',
            muscleGroup: 'Bicipiti',
            category: 'Braccia',
            notes: 'Ultime prima di cedimento a Martello',
            sets: [
              { setNumber: 1, type: 'normal', weight: 10, reps: 15, completed: true },
              { setNumber: 2, type: 'normal', weight: 12, reps: 8, completed: true }
            ]
          }
        ],
        likes: ['valeriaadream', 'christiantroia'],
        comments: [
          { username: 'valeriaadream', text: 'Ottimo volume dorso e tricipiti! 🔥' }
        ]
      },

      // 2. valeriaadream's "Legs, gluteus and abs" matching Screenshot 1
      {
        id: 'curated-valeria-legs',
        isUserPost: false,
        username: 'valeriaadream',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        date: 'Ieri',
        rawDate: '2026-09-23T21:53:00.000Z',
        workoutName: 'Legs, gluteus and abs',
        durationMinutes: 61,
        volume: 11655,
        totalSets: 19,
        recordsCount: 0,
        avgHeartRate: 115,
        calories: 243,
        muscleSplit: [
          { muscle: 'Gambe', percentage: 83 },
          { muscle: 'Addome', percentage: 17 }
        ],
        exercises: [
          {
            exerciseId: 'ex-tapis-roulant',
            name: 'Tapis Roulant',
            muscleGroup: 'Cardio',
            category: 'Cardio',
            trackingType: 'distance_time',
            sets: [
              { setNumber: 1, distance: 0, timeSeconds: 600, completed: true }
            ]
          },
          {
            exerciseId: 'ex-leg-press-orizzontale',
            name: 'Leg Press Orizzontale (Macchina)',
            muscleGroup: 'Quadricipiti',
            category: 'Gambe',
            sets: [
              { setNumber: 1, weight: 93, reps: 20, completed: true },
              { setNumber: 2, weight: 101, reps: 15, completed: true },
              { setNumber: 3, weight: 109, reps: 15, completed: true }
            ]
          },
          {
            exerciseId: 'ex-leg-curl-sdraiato',
            name: 'Leg Curl Sdraiato (Macchina)',
            muscleGroup: 'Femorali',
            category: 'Gambe',
            sets: [
              { setNumber: 1, weight: 25, reps: 15, completed: true },
              { setNumber: 2, weight: 25, reps: 13, completed: true },
              { setNumber: 3, weight: 25, reps: 6, completed: true }
            ]
          },
          {
            exerciseId: 'ex-leg-extension',
            name: 'Leg Extension (Macchina)',
            muscleGroup: 'Quadricipiti',
            category: 'Gambe',
            sets: [
              { setNumber: 1, weight: 30, reps: 15, completed: true },
              { setNumber: 2, weight: 30, reps: 15, completed: true },
              { setNumber: 3, weight: 35, reps: 15, completed: true }
            ]
          },
          {
            exerciseId: 'ex-abduzione-anche',
            name: 'Abduzione Anche (Macchina)',
            muscleGroup: 'Glutei',
            category: 'Gambe',
            sets: [
              { setNumber: 1, weight: 60, reps: 15, completed: true },
              { setNumber: 2, weight: 60, reps: 15, completed: true },
              { setNumber: 3, weight: 60, reps: 14, completed: true }
            ]
          },
          {
            exerciseId: 'ex-adduzione-anche',
            name: 'Adduzione Anche (Macchina)',
            muscleGroup: 'Adduttori',
            category: 'Gambe',
            sets: [
              { setNumber: 1, weight: 50, reps: 4, completed: true },
              { setNumber: 2, weight: 45, reps: 20, completed: true },
              { setNumber: 3, weight: 45, reps: 14, completed: true }
            ]
          },
          {
            exerciseId: 'ex-crunch',
            name: 'Crunch',
            muscleGroup: 'Addominali',
            category: 'Addome',
            trackingType: 'time_only',
            sets: [
              { setNumber: 1, reps: 15, completed: true },
              { setNumber: 2, reps: 8, completed: true },
              { setNumber: 3, reps: 7, completed: true }
            ]
          }
        ],
        likes: ['demi02'],
        comments: [
          { username: 'demi02', text: '11.600 kg di volume gambe! Impressionante 💪' }
        ]
      },

      // 3. valeriaadream's "Upper Body + cardio"
      {
        id: 'curated-valeria-upper',
        isUserPost: false,
        username: 'valeriaadream',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        date: '2 giorni fa',
        rawDate: '2026-09-22T17:40:00.000Z',
        workoutName: 'Upper Body + cardio',
        durationMinutes: 57,
        volume: 3385,
        totalSets: 12,
        recordsCount: 1,
        avgHeartRate: 121,
        calories: 310,
        muscleSplit: [
          { muscle: 'Schiena', percentage: 40 },
          { muscle: 'Petto', percentage: 35 },
          { muscle: 'Cardio', percentage: 25 }
        ],
        exercises: [
          {
            exerciseId: 'ex-1',
            name: 'Tapis Roulant',
            muscleGroup: 'Cardio',
            category: 'Cardio',
            trackingType: 'distance_time',
            sets: [
              { setNumber: 1, distance: 1.5, timeSeconds: 600, completed: true }
            ]
          },
          {
            exerciseId: 'ex-3',
            name: 'Lat Pulldown (Cavo)',
            muscleGroup: 'Dorsali',
            category: 'Schiena',
            sets: [
              { setNumber: 1, weight: 45, reps: 12, completed: true },
              { setNumber: 2, weight: 50, reps: 10, completed: true },
              { setNumber: 3, weight: 50, reps: 10, completed: true }
            ]
          },
          {
            exerciseId: 'ex-2',
            name: 'Chest Press (Macchina)',
            muscleGroup: 'Pettorali',
            category: 'Petto',
            sets: [
              { setNumber: 1, weight: 35, reps: 12, completed: true },
              { setNumber: 2, weight: 40, reps: 10, is1RM: true, completed: true },
              { setNumber: 3, weight: 40, reps: 8, completed: true }
            ]
          }
        ],
        likes: ['demi02', 'stronglife'],
        comments: []
      }
    ];
  }, [profile]);

  // Convert user's personal workoutHistory into DetailedWorkout format
  const userWorkoutsDetailed: DetailedWorkout[] = useMemo(() => {
    return workoutHistory.map(w => {
      const totalVolume = w.volume || w.exercises.reduce((acc, ex) => {
        return acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
      }, 0);

      const totalSets = w.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
      const recordsCount = w.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.is1RM || s.isMaxVolume || s.isMaxWeight).length, 0);

      const exercisesDetailed: DetailedWorkoutExercise[] = w.exercises.map(ex => {
        const detail = mockExercises.find(m => m.id === ex.exerciseId);
        const name = detail ? detail.name : 'Esercizio';
        const muscleGroup: MuscleGroup = detail ? detail.muscleGroup : 'Pettorali';
        const category = detail ? detail.category : 'Schiena';

        return {
          exerciseId: ex.exerciseId,
          name,
          muscleGroup,
          category,
          notes: ex.notes,
          sets: ex.sets.map((s, idx) => ({
            setNumber: idx + 1,
            type: 'normal',
            weight: s.weight,
            reps: s.reps,
            distance: s.distance,
            timeSeconds: s.time,
            is1RM: s.is1RM,
            isMaxVolume: s.isMaxVolume,
            isMaxWeight: s.isMaxWeight,
            completed: s.completed
          }))
        };
      });

      return {
        id: `user-w-${w.id}`,
        isUserPost: true,
        username: profile.name.toLowerCase().replace(/\s+/g, '') || 'demi02',
        userAvatar: profile.avatarUrl || '',
        date: formatRelativeDate(w.date),
        rawDate: w.date,
        workoutName: w.name || 'Allenamento',
        durationMinutes: Math.max(1, Math.round(w.duration / 60)),
        volume: totalVolume,
        totalSets,
        recordsCount,
        avgHeartRate: w.avgHeartRate && w.avgHeartRate > 0 ? w.avgHeartRate : undefined,
        heartRateData: w.heartRateSamples && w.heartRateSamples.length > 0 ? w.heartRateSamples : undefined,
        calories: w.caloriesBurned,
        deviceSynced: w.deviceSource,
        exercises: exercisesDetailed,
        likes: [],
        comments: [],
        originalWorkoutLog: w
      };
    });
  }, [workoutHistory, profile]);

  // Combined and filtered feed items
  const feedItems = useMemo(() => {
    // If user already has real history, merge with curated community workouts
    let all = [...userWorkoutsDetailed];
    
    // Add curated friend workouts, avoiding duplicate demi02 evening workout if user has logged their own
    curatedCommunityWorkouts.forEach(cw => {
      const alreadyHas = all.some(uw => uw.workoutName === cw.workoutName);
      if (!alreadyHas) {
        all.push(cw);
      }
    });

    if (feedFilter === 'me') {
      all = all.filter(p => p.isUserPost);
    } else if (feedFilter === 'friends') {
      all = all.filter(p => !p.isUserPost);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      all = all.filter(p => 
        p.username.toLowerCase().includes(q) || 
        p.workoutName.toLowerCase().includes(q)
      );
    }

    return all;
  }, [userWorkoutsDetailed, curatedCommunityWorkouts, feedFilter, searchQuery]);

  // Handle Like
  const handleLike = (workoutId: string) => {
    likeSocialPost(workoutId, profile.name);
  };

  // Handle Comment submit
  const handleCommentSubmit = (workoutId: string) => {
    const txt = commentInputs[workoutId];
    if (txt && txt.trim()) {
      commentSocialPost(workoutId, profile.name, txt.trim());
      setCommentInputs(prev => ({ ...prev, [workoutId]: '' }));
    }
  };

  // IF DETAILED WORKOUT VIEW IS ACTIVE:
  // Render WorkoutDetailView matching Screenshots 1 & 3
  if (selectedWorkoutDetail) {
    return (
      <WorkoutDetailView
        workout={selectedWorkoutDetail}
        onBack={() => setSelectedWorkoutDetail(null)}
        onLike={handleLike}
        onComment={(workoutId, text) => commentSocialPost(workoutId, profile.name, text)}
        onEditWorkout={updateWorkoutLog}
        onDeleteWorkout={(id) => {
          const rawId = id.replace('user-w-', '');
          deleteWorkoutLog(rawId);
          setSelectedWorkoutDetail(null);
        }}
      />
    );
  }

  // NORMAL HOME SOCIAL FEED VIEW
  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '70px', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* 1. TOP HEADER (Home ∨, Search, Bell) matching Screenshot 2 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0 16px 0',
        position: 'relative'
      }}>
        {/* Feed Selector Dropdown button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="hevy-topbar-title-btn"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.45rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span>
              {feedFilter === 'all' ? 'Home' : feedFilter === 'me' ? 'I miei' : 'Amici'}
            </span>
            <ChevronDown size={18} strokeWidth={2.5} />
          </button>

          {showFilterDropdown && (
            <div 
              className="glass-card animate-scale-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 100,
                padding: '6px',
                minWidth: '175px',
                background: '#16161c',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
              }}
            >
              <button
                type="button"
                onClick={() => { setFeedFilter('all'); setShowFilterDropdown(false); }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  textAlign: 'left',
                  background: feedFilter === 'all' ? 'rgba(212, 175, 55, 0.15)' : 'none',
                  color: feedFilter === 'all' ? 'var(--color-primary, #d4af37)' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: feedFilter === 'all' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                Tutti gli allenamenti
              </button>
              <button
                type="button"
                onClick={() => { setFeedFilter('me'); setShowFilterDropdown(false); }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  textAlign: 'left',
                  background: feedFilter === 'me' ? 'rgba(212, 175, 55, 0.15)' : 'none',
                  color: feedFilter === 'me' ? 'var(--color-primary, #d4af37)' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: feedFilter === 'me' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                I miei allenamenti
              </button>
              <button
                type="button"
                onClick={() => { setFeedFilter('friends'); setShowFilterDropdown(false); }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  textAlign: 'left',
                  background: feedFilter === 'friends' ? 'rgba(212, 175, 55, 0.15)' : 'none',
                  color: feedFilter === 'friends' ? 'var(--color-primary, #d4af37)' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: feedFilter === 'friends' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                Solo amici
              </button>
            </div>
          )}
        </div>

        {/* Right Search & Bell icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowSearchBar(!showSearchBar)}
            style={{ width: '38px', height: '38px' }}
            title="Cerca atleti o allenamenti"
          >
            <Search size={19} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => alert("Non ci sono nuove notifiche al momento.")}
            style={{ width: '38px', height: '38px' }}
            title="Notifiche"
          >
            <Bell size={19} />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearchBar && (
        <div className="animate-fade-in-up" style={{ marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="Cerca per atleta o nome allenamento..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="set-input"
            style={{
              width: '100%',
              height: '40px',
              padding: '0 14px',
              textAlign: 'left',
              background: '#121217',
              borderRadius: '10px',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
            autoFocus
          />
        </div>
      )}

      {/* 2. POSTS FEED LIST */}
      {feedItems.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 16px' }}>
          <Dumbbell size={36} color="var(--text-dark)" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>
            Nessun allenamento trovato.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setCurrentTab('workout')}
            style={{ marginTop: '12px', padding: '8px 18px', fontSize: '0.8rem' }}
          >
            Inizia il tuo primo allenamento
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {feedItems.map(post => {
            const hasLiked = post.likes.includes(profile.name) || post.likes.includes('demi02');
            const visibleExercises = post.exercises.slice(0, 3);
            const remainingCount = post.exercises.length - 3;

            return (
              <div 
                key={post.id} 
                className="hevy-post-card"
                onClick={() => setSelectedWorkoutDetail(post)}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease, border-color 0.15s ease' }}
              >
                {/* Post Header: Avatar, Username, Date, ••• */}
                <div className="hevy-post-header" onClick={e => e.stopPropagation()}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    onClick={() => setSelectedWorkoutDetail(post)}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1.5px solid var(--color-primary, #d4af37)',
                      background: '#121217',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {post.userAvatar ? (
                        <img
                          src={post.userAvatar}
                          alt={post.username}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary, #d4af37)' }}>
                          {post.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                        {post.username}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#8e8e93' }}>
                        {post.date}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkoutDetail(post);
                    }}
                    style={{ width: '32px', height: '32px' }}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Workout Title */}
                <h3 style={{
                  fontSize: '1.18rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '10px 0 10px 0',
                  letterSpacing: '-0.2px'
                }}>
                  {post.workoutName}
                </h3>

                {/* Summary Metrics Row matching Screenshot 2: Tempo, Volume, Record (optional), Bpm medi (optional), Wearable icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '14px',
                  fontSize: '0.76rem',
                  color: '#8e8e93'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#8e8e93', marginBottom: '1px' }}>Tempo</span>
                    <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff' }}>
                      {post.durationMinutes >= 60 ? `${Math.floor(post.durationMinutes / 60)}h ${post.durationMinutes % 60}m` : `${post.durationMinutes}min`}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#8e8e93', marginBottom: '1px' }}>Volume</span>
                    <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff' }}>
                      {post.volume.toLocaleString('it-IT')} kg
                    </span>
                  </div>

                  {post.recordsCount ? (
                    <div>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8e8e93', marginBottom: '1px' }}>Record</span>
                      <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Trophy size={14} color="var(--color-primary, #d4af37)" />
                        {post.recordsCount}
                      </span>
                    </div>
                  ) : null}

                  {post.avgHeartRate ? (
                    <div>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#8e8e93', marginBottom: '1px' }}>Bpm medi</span>
                      <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Heart size={13} color="#ef4444" fill="#ef4444" />
                        {post.avgHeartRate}
                      </span>
                    </div>
                  ) : null}

                  {post.deviceSynced && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                      <Watch size={18} color="#8e8e93" />
                    </div>
                  )}
                </div>

                {/* Exercise Preview List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {visibleExercises.map((ex, exIdx) => (
                    <div key={exIdx} className="hevy-exercise-preview-row">
                      <div className="hevy-exercise-preview-avatar">
                        {renderMuscleIcon(ex.muscleGroup, 26, '#d4af37')}
                      </div>
                      <span className="hevy-exercise-preview-text">
                        <strong>{ex.sets.length} serie</strong> {ex.name}
                      </span>
                    </div>
                  ))}

                  {/* "Vedi altri X esercizi" link that opens the detailed workout view */}
                  {remainingCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkoutDetail(post);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8e8e93',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        padding: '6px 0',
                        cursor: 'pointer',
                        marginTop: '2px',
                        transition: 'color 0.15s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary, #d4af37)')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#8e8e93')}
                    >
                      Vedi altri {remainingCount} esercizi
                    </button>
                  )}
                </div>

                {/* Social Actions Row: Like, Comment, Share */}
                <div 
                  className="hevy-social-actions"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={`hevy-social-btn ${hasLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                    style={{ color: hasLiked ? 'var(--color-primary, #d4af37)' : '#8e8e93' }}
                  >
                    <ThumbsUp size={18} fill={hasLiked ? 'var(--color-primary, #d4af37)' : 'none'} />
                    <span>{post.likes.length > 0 ? post.likes.length : ''}</span>
                  </button>

                  <button
                    type="button"
                    className="hevy-social-btn"
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                  >
                    <MessageSquare size={18} />
                    <span>{post.comments.length > 0 ? post.comments.length : ''}</span>
                  </button>

                  <button
                    type="button"
                    className="hevy-social-btn"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: post.workoutName,
                          text: `Guarda l'allenamento di ${post.username} su DeV Fit!`,
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copiato negli appunti!");
                      }
                    }}
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                {/* Inline Comments Section if opened */}
                {activeCommentPostId === post.id && (
                  <div 
                    onClick={e => e.stopPropagation()}
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '12px',
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {post.comments.map((c, cIdx) => (
                      <div key={cIdx} style={{ fontSize: '0.76rem', background: '#121217', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary, #d4af37)', marginRight: '6px' }}>
                          {c.username}:
                        </span>
                        <span style={{ color: '#ffffff' }}>{c.text}</span>
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="text"
                        placeholder="Aggiungi un commento..."
                        value={commentInputs[post.id] || ''}
                        onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        className="set-input"
                        style={{ flex: 1, height: '34px', textAlign: 'left', padding: '0 10px', fontSize: '0.78rem' }}
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleCommentSubmit(post.id)}
                        style={{ height: '34px', padding: '0 12px' }}
                      >
                        <Send size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
