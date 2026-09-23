import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, Search, Bell, ThumbsUp, MessageSquare, Share2, 
  X, Plus, Dumbbell, MoreHorizontal 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockExercises, renderMuscleIcon, type MuscleGroup } from '../data/mockExercises';

interface HomeFeedProps {
  setCurrentTab: (tab: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ setCurrentTab }) => {
  const { 
    profile, 
    workoutHistory, 
    socialPosts, 
    likeSocialPost, 
    commentSocialPost 
  } = useApp();

  // Feed Filter: 'all' | 'me' | 'friends'
  const [feedFilter, setFeedFilter] = useState<'all' | 'me' | 'friends'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Expanded exercise lists for posts: set of post/workout IDs
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  // Comments state: { [id: string]: string }
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // Invite feedback state
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Local followed athletes state (mock follow toggle)
  const [followedAthletes, setFollowedAthletes] = useState<Record<string, boolean>>({});
  const [dismissedAthletes, setDismissedAthletes] = useState<Record<string, boolean>>({});

  // Atleti consigliati (Recommended athletes matching Screenshot 1 & Hevy community)
  const recommendedAthletes = [
    { id: 'ath-1', username: 'valeriaadream', name: 'Valeria', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'ath-2', username: 'christiantroia', name: 'Christian Troia', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'ath-3', username: 'phildaddy', name: 'Phil D.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'ath-4', username: 'stronglife', name: 'Marco S.', avatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80' },
    { id: 'ath-5', username: 'elena_fit', name: 'Elena Rossi', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  ];

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

  // Convert user's personal workoutHistory into unified feed posts
  const userWorkoutPosts = useMemo(() => {
    return workoutHistory.map(w => {
      const totalVolume = w.volume || w.exercises.reduce((acc, ex) => {
        return acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
      }, 0);

      const exercisesSummary = w.exercises.map(ex => {
        const detail = mockExercises.find(m => m.id === ex.exerciseId);
        const name = detail ? detail.name : 'Esercizio';
        const muscleGroup: MuscleGroup = detail ? detail.muscleGroup : 'Pettorali';
        const setsCount = ex.sets.length;
        return {
          exerciseId: ex.exerciseId,
          name,
          muscleGroup,
          setsCount,
          sets: ex.sets
        };
      });

      return {
        id: `user-w-${w.id}`,
        isUserPost: true,
        username: profile.name.toLowerCase().replace(/\s+/g, '') || 'demi02',
        userAvatar: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        date: w.date,
        workoutName: w.name || 'Allenamento',
        durationMinutes: Math.round((w.duration || 2700) / 60),
        volume: totalVolume,
        exercises: exercisesSummary,
        likes: [] as string[],
        comments: [] as { username: string; text: string }[]
      };
    });
  }, [workoutHistory, profile]);

  // Unified Feed Items
  const feedItems = useMemo(() => {
    const friendPosts = socialPosts.map(sp => {
      const sampleExercises: { exerciseId: string; name: string; muscleGroup: MuscleGroup; setsCount: number }[] = [
        { exerciseId: 'ex-1', name: 'Tapis Roulant', muscleGroup: 'Cardio', setsCount: 1 },
        { exerciseId: 'ex-3', name: 'Lat Pulldown (Cavo)', muscleGroup: 'Dorsali', setsCount: 3 },
        { exerciseId: 'ex-2', name: 'Chest Press (Macchina)', muscleGroup: 'Pettorali', setsCount: 3 }
      ];

      return {
        id: sp.id,
        isUserPost: false,
        username: sp.username,
        userAvatar: sp.userAvatar,
        date: sp.date,
        workoutName: sp.workoutName,
        durationMinutes: parseInt(sp.duration) || 57,
        volume: sp.volume || 3385,
        exercises: sampleExercises,
        likes: sp.likes || [],
        comments: sp.comments || []
      };
    });

    let combined = [...userWorkoutPosts, ...friendPosts];

    if (feedFilter === 'me') {
      combined = combined.filter(p => p.isUserPost);
    } else if (feedFilter === 'friends') {
      combined = combined.filter(p => !p.isUserPost);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(p => 
        p.username.toLowerCase().includes(q) || 
        p.workoutName.toLowerCase().includes(q)
      );
    }

    // Sort by date descending
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userWorkoutPosts, socialPosts, feedFilter, searchQuery]);

  // Handle Web Share / Invite friend
  const handleInviteFriend = async () => {
    const inviteUrl = window.location.origin;
    const shareData = {
      title: 'Allenati con me su DeV Fit!',
      text: 'Unisciti a me su DeV Fit per tracciare i tuoi allenamenti, sfidarci e condividere i tuoi record personali (PR)!',
      url: inviteUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(
        `Ehi! Unisciti a me su DeV Fit per tracciare i tuoi allenamenti e condividere i tuoi record personali: ${inviteUrl}`
      );
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch {
      alert(`Condividi questo link con i tuoi amici: ${inviteUrl}`);
    }
  };

  const toggleExpandPost = (postId: string) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleLikePost = (postId: string, isUserPost: boolean) => {
    if (!isUserPost) {
      likeSocialPost(postId, profile.name);
    }
  };

  const handleCommentSubmit = (postId: string, isUserPost: boolean) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    if (!isUserPost) {
      commentSocialPost(postId, profile.name, text);
    }
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setActiveCommentPostId(null);
  };

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '70px', maxWidth: '540px', margin: '0 auto' }}>
      
      {/* 1. TOP HEADER (Hevy Screenshot 1: Home ∨ | Search | Bell) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 4px',
        marginBottom: '8px',
        position: 'relative'
      }}>
        {/* Feed Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Home
            </h1>
            <ChevronDown size={20} color="#ffffff" />
          </div>

          {showFilterDropdown && (
            <div style={{
              position: 'absolute',
              top: '38px',
              left: 0,
              zIndex: 100,
              background: '#16161d',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '6px',
              minWidth: '190px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
            }}>
              <div 
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: feedFilter === 'all' ? 700 : 500,
                  color: feedFilter === 'all' ? 'var(--color-primary, #d4af37)' : 'white',
                  background: feedFilter === 'all' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => { setFeedFilter('all'); setShowFilterDropdown(false); }}
              >
                Tutti gli allenamenti
              </div>
              <div 
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: feedFilter === 'me' ? 700 : 500,
                  color: feedFilter === 'me' ? 'var(--color-primary, #d4af37)' : 'white',
                  background: feedFilter === 'me' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => { setFeedFilter('me'); setShowFilterDropdown(false); }}
              >
                I miei allenamenti
              </div>
              <div 
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: feedFilter === 'friends' ? 700 : 500,
                  color: feedFilter === 'friends' ? 'var(--color-primary, #d4af37)' : 'white',
                  background: feedFilter === 'friends' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => { setFeedFilter('friends'); setShowFilterDropdown(false); }}
              >
                Amici seguiti
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons: Search & Bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={() => setShowSearchBar(!showSearchBar)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
            title="Cerca allenamenti o utenti"
          >
            <Search size={22} />
          </button>

          <button
            type="button"
            onClick={() => alert('Nessuna nuova notifica.')}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px', position: 'relative' }}
            title="Notifiche"
          >
            <Bell size={22} />
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-primary, #d4af37)'
            }} />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearchBar && (
        <div style={{ marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="Cerca atleti, esercizi o schede..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              background: '#131318',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '10px',
              color: 'white',
              padding: '0 14px',
              fontSize: '0.88rem',
              outline: 'none'
            }}
            autoFocus
          />
        </div>
      )}

      {/* 2. ATLETI CONSIGLIATI CAROUSEL (Hevy Screenshot 1 bottom section) */}
      <div style={{
        background: '#0a0a0e',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '14px 12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
            Atleti consigliati
          </span>
          <button
            type="button"
            onClick={handleInviteFriend}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary, #d4af37)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} strokeWidth={3} />
            <span>{inviteSuccess ? 'Link Copiato!' : 'Invita un amico'}</span>
          </button>
        </div>

        <div className="hevy-athletes-scroll">
          {recommendedAthletes
            .filter(ath => !dismissedAthletes[ath.id])
            .map(ath => {
              const isFollowed = followedAthletes[ath.id];
              return (
                <div key={ath.id} className="hevy-athlete-card">
                  <button
                    type="button"
                    className="close-btn"
                    onClick={() => setDismissedAthletes(prev => ({ ...prev, [ath.id]: true }))}
                    title="Rimuovi suggerimento"
                  >
                    <X size={13} />
                  </button>

                  <img
                    src={ath.avatar}
                    alt={ath.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '8px',
                      border: '1.5px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />

                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    display: 'block',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '8px'
                  }}>
                    {ath.username}
                  </span>

                  <button
                    type="button"
                    onClick={() => setFollowedAthletes(prev => ({ ...prev, [ath.id]: !isFollowed }))}
                    style={{
                      width: '100%',
                      padding: '4px 0',
                      background: isFollowed ? 'rgba(255, 255, 255, 0.08)' : 'var(--color-primary, #d4af37)',
                      color: isFollowed ? '#94a3b8' : '#000000',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isFollowed ? 'Seguito' : 'Segui'}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. WORKOUT FEED POSTS (Hevy Screenshot 1 Style) */}
      {feedItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 16px',
          background: '#0d0d12',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <Dumbbell size={42} color="var(--color-primary, #d4af37)" style={{ margin: '0 auto 12px auto', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: '0 0 6px 0' }}>
            Nessun allenamento da mostrare
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
            Registra una sessione o invita i tuoi amici per vedere qui i progressi condivisi!
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setCurrentTab('workout')}
            style={{ margin: '0 auto', maxWidth: '240px' }}
          >
            Avvia un allenamento
          </button>
        </div>
      ) : (
        feedItems.map(post => {
          const isExpanded = !!expandedPosts[post.id];
          const isLiked = !post.isUserPost && post.likes.includes(profile.name);
          const visibleExercises = isExpanded ? post.exercises : post.exercises.slice(0, 3);
          const hiddenCount = post.exercises.length - 3;

          return (
            <div key={post.id} className="hevy-post-card">
              {/* User Header */}
              <div className="hevy-post-header">
                <div className="hevy-post-user-info">
                  <img src={post.userAvatar} alt={post.username} className="hevy-post-avatar" />
                  <div>
                    <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff', display: 'block' }}>
                      {post.username}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      {formatRelativeDate(post.date)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', padding: '4px' }}
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Workout Title */}
              <h3 className="hevy-post-title">
                {post.workoutName}
              </h3>

              {/* Stats Row: Tempo & Volume */}
              <div className="hevy-post-stats">
                <div>
                  <span style={{ fontSize: '0.75rem', display: 'block', color: '#8e8e93' }}>Tempo</span>
                  <strong>{post.durationMinutes}min</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', display: 'block', color: '#8e8e93' }}>Volume</span>
                  <strong>{post.volume ? post.volume.toLocaleString('it-IT') : 0} kg</strong>
                </div>
              </div>

              {/* Exercise Preview List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                {visibleExercises.map((ex, exIdx) => (
                  <div key={exIdx} className="hevy-exercise-preview-row">
                    <div className="hevy-exercise-preview-avatar">
                      {renderMuscleIcon(ex.muscleGroup, 30, '#d4af37')}
                    </div>
                    <span className="hevy-exercise-preview-text">
                      {ex.setsCount} {ex.setsCount === 1 ? 'serie' : 'serie'} {ex.name}
                    </span>
                  </div>
                ))}

                {hiddenCount > 0 && !isExpanded && (
                  <button
                    type="button"
                    onClick={() => toggleExpandPost(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8e8e93',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '6px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Vedi altri {hiddenCount} esercizi</span>
                    <ChevronDown size={16} />
                  </button>
                )}

                {isExpanded && hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleExpandPost(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #d4af37)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '4px 0'
                    }}
                  >
                    Riduci elenco
                  </button>
                )}
              </div>

              {/* Social Actions Bar (Like / Comment / Share) */}
              <div className="hevy-social-actions">
                <button
                  type="button"
                  className={`hevy-social-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => handleLikePost(post.id, post.isUserPost)}
                >
                  <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
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
                  onClick={handleInviteFriend}
                  style={{ marginLeft: 'auto' }}
                  title="Condividi allenamento"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Inline Comments Section */}
              {activeCommentPostId === post.id && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  {post.comments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                      {post.comments.map((c, cIdx) => (
                        <div key={cIdx} style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                          <strong style={{ color: 'var(--color-primary, #d4af37)' }}>{c.username}: </strong>
                          <span>{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Aggiungi un commento..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommentSubmit(post.id, post.isUserPost);
                      }}
                      style={{
                        flex: 1,
                        background: '#16161c',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCommentSubmit(post.id, post.isUserPost)}
                      style={{
                        background: 'var(--color-primary, #d4af37)',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0 14px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Invia
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
