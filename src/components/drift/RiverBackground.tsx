import { Atmosphere } from '@/lib/drift-store';

interface RiverBackgroundProps {
  atmosphere?: Atmosphere;
  children?: React.ReactNode;
}

const RiverBackground = ({ atmosphere, children }: RiverBackgroundProps) => {
  const bgClass = atmosphere
    ? `atmosphere-${atmosphere}`
    : '';

  return (
    <div className={`fixed inset-0 overflow-hidden ${bgClass}`}
      style={!atmosphere ? {
        background: 'linear-gradient(180deg, hsl(200 50% 55%) 0%, hsl(195 45% 50%) 30%, hsl(200 55% 60%) 60%, hsl(195 40% 65%) 100%)',
      } : undefined}
    >
      {/* Animated wave layers */}
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
      {/* Rain overlay */}
      {atmosphere === 'rain' && (
        <div className="absolute inset-0 rain-overlay opacity-40" />
      )}
      {/* Stars for midnight */}
      {atmosphere === 'midnight' && (
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary-foreground"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                opacity: Math.random() * 0.6 + 0.2,
                animation: `stars-twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}
      {/* Sunrise glow */}
      {atmosphere === 'sunrise' && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, hsla(35,80%,60%,0.3) 0%, transparent 70%)',
            animation: 'sunrise-glow 5s ease-in-out infinite',
          }}
        />
      )}
      {children}
    </div>
  );
};

export default RiverBackground;
