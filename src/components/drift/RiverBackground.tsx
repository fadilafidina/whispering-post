import { Atmosphere } from '@/lib/drift-store';
import { useMemo } from 'react';

interface RiverBackgroundProps {
  atmosphere?: Atmosphere;
  children?: React.ReactNode;
}

const RiverBackground = ({ atmosphere, children }: RiverBackgroundProps) => {
  const bgClass = atmosphere ? `atmosphere-${atmosphere}` : '';

  // Generate raindrop data once
  const raindrops = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      height: 15 + Math.random() * 25,
      duration: 0.6 + Math.random() * 0.5,
      delay: Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, []);

  // Generate sunray data
  const sunrays = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = -55 + (i * 110) / 11;
      return {
        angle,
        height: 200 + Math.random() * 250,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2,
        opacity: 0.15 + Math.random() * 0.2,
        width: 2 + Math.random() * 3,
      };
    });
  }, []);

  // Generate stars
  const stars = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      size: 1 + Math.random() * 3,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div
      className={`fixed inset-0 overflow-hidden ${bgClass}`}
      style={!atmosphere ? {
        background: 'linear-gradient(180deg, hsl(200 50% 55%) 0%, hsl(195 45% 50%) 30%, hsl(200 55% 60%) 60%, hsl(195 40% 65%) 100%)',
      } : undefined}
    >
      {/* Animated shimmer layers */}
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

      {/* ===== RAIN EFFECT ===== */}
      {atmosphere === 'rain' && (
        <div className="rain-container">
          {raindrops.map((drop, i) => (
            <div
              key={i}
              className="raindrop"
              style={{
                left: drop.left,
                height: drop.height,
                animationDuration: `${drop.duration}s`,
                animationDelay: `${drop.delay}s`,
                opacity: drop.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* ===== SUNRISE EFFECT ===== */}
      {atmosphere === 'sunrise' && (
        <div className="sunrise-container">
          {/* Sun orb */}
          <div className="sun-orb" />
          {/* Sun glare */}
          <div
            className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[300px] h-[150px] rounded-full"
            style={{
              background: 'radial-gradient(ellipse, hsla(40,100%,80%,0.3) 0%, transparent 70%)',
              filter: 'blur(10px)',
              animation: 'sunray-pulse 4s ease-in-out infinite',
            }}
          />
          {/* Rays */}
          {sunrays.map((ray, i) => (
            <div
              key={i}
              className="sunray"
              style={{
                height: ray.height,
                width: ray.width,
                transform: `translateX(-50%) rotate(${ray.angle}deg)`,
                animationDuration: `${ray.duration}s`,
                animationDelay: `${ray.delay}s`,
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
              }}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );
};

export default RiverBackground;
