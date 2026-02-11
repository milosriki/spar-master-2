import React, { useCallback, useEffect, useRef } from 'react';

type ParticleType = 'xp' | 'gold' | 'streak' | 'level-up' | 'complete';

interface ParticleExplosionProps {
  trigger: number;          // increment to trigger new explosion
  type?: ParticleType;
  originX?: number;         // 0-1 relative to container
  originY?: number;
  particleCount?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
}

const COLORS: Record<ParticleType, string[]> = {
  xp: ['#a855f7', '#c084fc', '#7c3aed', '#ddd6fe', '#e9d5ff'],
  gold: ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#d97706'],
  streak: ['#f97316', '#fb923c', '#ea580c', '#fdba74', '#ef4444'],
  'level-up': ['#fbbf24', '#f59e0b', '#fcd34d', '#ffffff', '#a855f7'],
  complete: ['#22c55e', '#4ade80', '#16a34a', '#86efac', '#34d399'],
};

/**
 * Canvas-based 2D particle explosion effect.
 * Triggers a burst of colored particles from a given origin point.
 * Used for: XP gain, level-up, habit completion, streak milestones.
 */
const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
  trigger,
  type = 'xp',
  originX = 0.5,
  originY = 0.5,
  particleCount = 24,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const prevTrigger = useRef(trigger);

  const spawnParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colors = COLORS[type];
    const cx = canvas.width * originX;
    const cy = canvas.height * originY;

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upward bias
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.015 + Math.random() * 0.01,
        life: 1,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, [type, originX, originY, particleCount]);

  // Trigger new particles on prop change
  useEffect(() => {
    if (trigger !== prevTrigger.current && trigger > 0) {
      spawnParticles();
      prevTrigger.current = trigger;
    }
  }, [trigger, spawnParticles]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.life -= p.decay;
        p.alpha = Math.max(0, p.life);
        p.size *= 0.98;

        if (p.life <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-50 ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleExplosion;
