import React, { forwardRef } from 'react';
import { Trophy, Flame, Zap, Star, Swords } from 'lucide-react';

interface ShareCardProps {
  username: string;
  level: number;
  xp: number;
  streak: number;
  habitsCompleted: number;
  goldEarned: number;
  className?: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({
  username,
  level,
  xp,
  streak,
  habitsCompleted,
  goldEarned,
  className = '',
}, ref) => {
  const levelTitle = level >= 20 ? 'Grandmaster' : level >= 15 ? 'Champion' : level >= 10 ? 'Warrior' : level >= 5 ? 'Apprentice' : 'Novice';

  return (
    <div
      ref={ref}
      className={`share-card ${className}`}
      style={{
        width: '600px',
        height: '1067px',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #2d1b69 60%, #1a0a2e 100%)',
        borderRadius: '24px',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow effects */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-80px',
        left: '-80px',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      {/* Top: Brand */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <Zap style={{ width: '28px', height: '28px', color: '#a78bfa' }} />
          <span style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Spark Mastery
          </span>
        </div>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          Achievement Unlocked
        </div>
      </div>

      {/* Center: Stats */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px' }}>
        {/* Username + Level */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '42px',
            fontWeight: 800,
            letterSpacing: '-1px',
            marginBottom: '8px',
          }}>
            {username || 'Warrior'}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '20px',
            padding: '8px 20px',
          }}>
            <Star style={{ width: '18px', height: '18px', color: '#fbbf24' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              Level {level} -- {levelTitle}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>
          {[
            { icon: Zap, label: 'Total XP', value: xp.toLocaleString(), color: '#60a5fa' },
            { icon: Flame, label: 'Day Streak', value: `${streak} days`, color: '#f97316' },
            { icon: Trophy, label: 'Habits Done', value: habitsCompleted.toString(), color: '#a78bfa' },
            { icon: Star, label: 'Gold Earned', value: goldEarned.toLocaleString(), color: '#fbbf24' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <stat.icon style={{ width: '24px', height: '24px', color: stat.color, margin: '0 auto 8px' }} />
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: CTA */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '16px',
          padding: '16px 24px',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>
            Join me on Spark Mastery -- gamify your fitness
          </span>
        </div>
        <div style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '1px',
        }}>
          sparmastery.app
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
