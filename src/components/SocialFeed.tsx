import React, { useState } from 'react';
import { Heart, MessageSquare, Send, Award, Search, UserPlus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SocialFeed: React.FC = () => {
  const { socialPosts, likeSocialPost, commentSocialPost, profile } = useApp();
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleLike = (postId: string) => {
    likeSocialPost(postId, profile.name);
  };

  const handleCommentSubmit = (postId: string) => {
    const txt = commentInputs[postId];
    if (txt && txt.trim()) {
      commentSocialPost(postId, profile.name, txt);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    }
  };

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
      } catch (err) {
        // Fallback to clipboard if share was cancelled or failed
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

  const filteredPosts = socialPosts.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.username.toLowerCase().includes(q) || p.workoutName.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in-up social-feed-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Header and Invite Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Community & Amici</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '3px', margin: 0 }}>
            Guarda gli allenamenti e sostieni i tuoi amici dell'app.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleInviteFriend}
          style={{
            padding: '8px 14px',
            fontSize: '0.78rem',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0
          }}
          title="Invita un amico ad allenarsi con te"
        >
          {inviteSuccess ? <Check size={15} /> : <UserPlus size={15} />}
          <span>{inviteSuccess ? 'Link Copiato!' : 'Invita Amico'}</span>
        </button>
      </div>

      {/* Invite feedback banner */}
      {inviteSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#34d399',
          fontSize: '0.82rem'
        }}>
          <Check size={16} />
          <span>Link di invito per DeV Fit copiato negli appunti! Incollalo a un amico su WhatsApp, Telegram o Instagram.</span>
        </div>
      )}

      {/* Search Friends & Workouts Bar */}
      <div style={{ position: 'relative' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="set-input"
          placeholder="Cerca amici o tipologie di allenamento..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 40px',
            textAlign: 'left',
            height: '42px',
            fontSize: '0.86rem',
            borderRadius: '10px'
          }}
        />
      </div>

      {/* Posts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filteredPosts.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Nessun post trovato.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dark)', marginTop: '6px', margin: 0 }}>
              {searchQuery ? 'Prova con un altro nome utente o allenamento.' : 'Completa un allenamento o invita degli amici per animare la community!'}
            </p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const hasLiked = post.likes.includes(profile.name);
            const commentText = commentInputs[post.id] || '';

            return (
              <div key={post.id} className="glass-card social-post">
                {/* Profile Header */}
                <div className="post-header">
                  <div className="post-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {post.userAvatar && (post.userAvatar.startsWith('data:') || post.userAvatar.startsWith('http')) ? (
                      <img src={post.userAvatar} alt={post.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      post.userAvatar
                    )}
                  </div>
                  <div className="post-user-info">
                    <span className="post-username">{post.username}</span>
                    <span className="post-time">{post.date}</span>
                  </div>
                </div>

                {/* Workout details card */}
                <div style={{ padding: '2px 0' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏃‍♂️ Ha completato: <span style={{ color: 'var(--color-primary)' }}>{post.workoutName}</span>
                  </h4>
                </div>

                <div className="post-workout-summary">
                  <div className="post-metric">
                    <h6>Durata</h6>
                    <p>{post.duration}</p>
                  </div>
                  <div className="post-metric">
                    <h6>Volume Totale</h6>
                    <p>{post.volume} kg</p>
                  </div>
                  {post.recordsCount > 0 && (
                    <div className="post-metric">
                      <h6>Record PR</h6>
                      <p style={{ color: 'var(--badge-1rm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Award size={16} fill="var(--badge-1rm)" /> {post.recordsCount}
                      </p>
                    </div>
                  )}
                </div>

                {/* Like and comment stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dark)' }}>
                  <span>{post.likes.length} Like</span>
                  <span>{post.comments.length} Commenti</span>
                </div>

                {/* Action Buttons */}
                <div className="post-actions">
                  <button 
                    className={`post-action-btn ${hasLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart size={16} fill={hasLiked ? 'var(--color-error)' : 'none'} />
                    <span>Sostieni</span>
                  </button>
                  <button className="post-action-btn">
                    <MessageSquare size={16} />
                    <span>Commenta</span>
                  </button>
                </div>

                {/* Comments list */}
                {post.comments.length > 0 && (
                  <div className="comments-section">
                    {post.comments.map((c, i) => (
                      <div key={i} className="comment-row">
                        <span className="comment-user">{c.username}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{c.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment write-in */}
                <div className="comment-input-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid var(--color-primary)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(212, 175, 55, 0.1)'
                  }}>
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="comment-input" 
                    placeholder="Scrivi un commento di incoraggiamento..."
                    value={commentText}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCommentSubmit(post.id);
                    }}
                  />
                  <button 
                    className="icon-btn" 
                    onClick={() => handleCommentSubmit(post.id)}
                    style={{ width: '30px', height: '30px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}
                  >
                    <Send size={12} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
