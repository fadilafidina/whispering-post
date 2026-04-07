import { useNavigate } from 'react-router-dom';
import RiverBackground from '@/components/drift/RiverBackground';
import FloatingBottle from '@/components/drift/FloatingBottle';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <RiverBackground>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="mb-8">
          <FloatingBottle />
        </div>

        <h1 className="font-heading text-5xl md:text-7xl font-light tracking-wide text-foreground mb-3">
          Drift
        </h1>
        <p className="font-heading text-xl md:text-2xl font-light italic text-foreground/80 mb-12 text-center max-w-md">
          Send a moment across the water
        </p>

        <Button
          onClick={() => navigate('/create')}
          className="px-8 py-6 text-lg font-heading font-medium rounded-full bg-card/90 text-foreground hover:bg-card shadow-xl backdrop-blur-sm transition-all hover:scale-105 border-0"
        >
          Create a Drift
        </Button>

        <p className="mt-8 text-sm text-foreground/65 font-body">
          No account needed · Disappears in 24 hours
        </p>
      </div>
    </RiverBackground>
  );
};

export default Landing;
