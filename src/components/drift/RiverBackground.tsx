import { Atmosphere } from '@/lib/drift-store';
import { useMemo, useState } from 'react';

interface RiverBackgroundProps {
  atmosphere?: Atmosphere;
  children?: React.ReactNode;
}

const RiverBackground = ({ atmosphere, children }: RiverBackgroundProps) => {
  const bgClass = atmosphere ? `atmosphere-${atmosphere}` : '';
  const [pointer, setPointer] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const raindrops = useMemo(() => {
    return Array.from({ length: 60 }).map(() => ({
      left: `${Math.random() * 100}%`,
      height: 15 + Math.random() * 25,
      duration: 0.6 + Math.random() * 0.5,
      delay: Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      size: 1 + Math.random() * 3,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 4,
    }));
  }, []);

  const sunriseRays = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: `${8 + i * 12}%`,
      delay: `${i * 0.9}s`,
      duration: `${9 + (i % 3) * 2}s`,
      height: `${28 + (i % 4) * 6}%`,
      opacity: 0.08 + (i % 3) * 0.03,
    }));
  }, []);

  const getRepel = (leftPct: number, topPct: number, strength: number) => {
    if (!pointer.active) return { x: 0, y: 0 };
    const dx = leftPct - pointer.x;
    const dy = topPct - pointer.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    const influence = Math.max(0, 1 - dist / 28);
    return {
      x: (dx / dist) * influence * strength,
      y: (dy / dist) * influence * strength,
    };
  };

  return (
    <div
      className={`fixed inset-0 overflow-hidden ${bgClass}`}
      style={!atmosphere ? {
        background: 'linear-gradient(180deg, hsl(38 52% 92%) 0%, hsl(36 45% 88%) 45%, hsl(34 40% 84%) 100%)',
      } : undefined}
      onMouseMove={(e) => {
        const target = e.currentTarget.getBoundingClientRect();
        setPointer({
          x: ((e.clientX - target.left) / target.width) * 100,
          y: ((e.clientY - target.top) / target.height) * 100,
          active: true,
        });
      }}
      onMouseLeave={() => setPointer((prev) => ({ ...prev, active: false }))}
    >
      {/* Animated shimmer layers for atmosphere scenes only */}
      {atmosphere && (
        <>
          <div className="absolute inset-0 animate-river-flow"
            style={{
              background: 'linear-gradient(135deg, hsla(195,50%,60%,0.15) 0%, hsla(200,60%,50%,0.1) 25%, hsla(195,50%,65%,0.15) 50%, hsla(200,55%,55%,0.1) 75%, hsla(195,50%,60%,0.15) 100%)',
              backgroundSize: '400% 400%',
            }}
          />
          <div className="absolute inset-0 animate-river-shimmer"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, hsla(195,60%,80%,0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 40%, hsla(200,50%,75%,0.15) 0%, transparent 50%)',
            }}
          />

          {/* Stream current lines */}
          <div className="absolute inset-0 stream-current" />
        </>
      )}

      {/* ===== RAIN EFFECT ===== */}
      {atmosphere === 'rain' && (
        <div className="rain-container">
          {raindrops.map((drop, i) => (
            (() => {
              const left = parseFloat(drop.left);
              const repel = getRepel(left, 55, 18);
              return (
            <div
              key={i}
              className="raindrop"
              style={{
                left: drop.left,
                height: drop.height,
                animationDuration: `${drop.duration}s`,
                animationDelay: `${drop.delay}s`,
                opacity: drop.opacity,
                transform: `translate(${repel.x}px, ${repel.y * 0.35}px)`,
                transition: 'transform 140ms ease-out',
              }}
            />
              );
            })()
          ))}
        </div>
      )}

      {/* ===== SUNRISE EFFECT ===== */}
      {atmosphere === 'sunrise' && (
        <div className="sunrise-container sunrise-flow" />
      )}

      {atmosphere === 'sunrise' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="sunrise-band sunrise-band-1" />
          <div className="sunrise-band sunrise-band-2" />
          {sunriseRays.map((ray) => (
            <div
              key={ray.id}
              className="sunrise-ray"
              style={{
                left: ray.left,
                height: ray.height,
                animationDelay: ray.delay,
                animationDuration: ray.duration,
                opacity: ray.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* ===== MIDNIGHT STARS ===== */}
      {atmosphere === 'midnight' && (
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((star, i) => (
            (() => {
              const left = parseFloat(star.left);
              const top = parseFloat(star.top);
              const repel = getRepel(left, top, 12);
              const pulseBoost = pointer.active
                ? Math.max(0, 1 - Math.sqrt((left - pointer.x) ** 2 + (top - pointer.y) ** 2) / 30) * 0.35
                : 0;
              return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                background: 'hsla(220, 80%, 95%, 0.9)',
                boxShadow: `0 0 ${star.size * 2}px hsla(220, 80%, 90%, 0.5)`,
                animation: `stars-twinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
                transform: `translate(${repel.x}px, ${repel.y}px) scale(${1 + pulseBoost})`,
                transition: 'transform 180ms ease-out',
              }}
            />
              );
            })()
          ))}
        </div>
      )}

      {children}
    </div>
  );
};

export default RiverBackground;
