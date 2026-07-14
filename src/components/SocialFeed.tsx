import React, { useState } from 'react';
import { Heart, MessageSquare, Send, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';


export const SocialFeed: React.FC = () => {
  const { socialPosts, likeSocialPost, commentSocialPost, profile } = useApp();
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

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

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Community Feed</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Guarda gli allenamenti e sostieni i tuoi amici dell'app.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {socialPosts.map(post => {
          const hasLiked = post.likes.includes(profile.name);
          const commentText = commentInputs[post.id] || '';

          return (
            <div key={post.id} className="glass-card social-post">
              {/* Profile Header */}
              <div className="post-header">
                <div className="post-avatar">{post.userAvatar}</div>
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
              <div className="comment-input-row">
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
        })}
      </div>
    </div>
  );
};
