import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDrift, isDriftExpired, DriftData } from '@/lib/drift-store';
import { ambientAudio } from '@/lib/ambient-audio';
import RiverBackground from '@/components/drift/RiverBackground';
import FloatingBottle from '@/components/drift/FloatingBottle';
import DriftCanvas from '@/components/drift/DriftCanvas';
import { Volume2, VolumeX } from 'lucide-react';

type Phase = 'loading' | 'river' | 'opening' | 'revealed' | 'expired';

const OpenDrift = () => {
  const { id } = useParams<{ id: string }>();
  const [drift, setDrift] = useState<DriftData | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [muted, setMuted] = useState(false);
  const [visibleElements, setVisibleElements] = useState<number>(0);

  useEffect(() => {
    if (!id) {
      setPhase('expired');
      return;
    }
    const d = getDrift(id);
    if (!d) {
      setPhase('expired');
      return;
    }
    if (isDriftExpired(d)) {
      setPhase('expired');
      return;
    }
    setDrift(d);
    setPhase('river');
  }, [id]);

  const handleBottleTap = () => {
    setPhase('opening');
    // Start audio
    if (drift) {
      ambientAudio.play(drift.scene.atmosphere);
    }
    // Transition to revealed after envelope animation
    setTimeout(() => {
      setPhase('revealed');
      // Stagger element fade-in
      if (drift) {
        drift.scene.elements.forEach((_, i) => {
          setTimeout(() => setVisibleElements(prev => prev + 1), i * 200);
        });
      }
    }, 900);
  };

  const toggleMute = () => {
    const nowMuted = ambientAudio.toggleMute();
    setMuted(nowMuted);
  };

  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  // Expired state
  if (phase === 'expired') {
    return (
      <RiverBackground>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <p className="font-heading text-4xl md:text-5xl font-light text-primary-foreground/80 mb-4 italic">
            This drift has passed
          </p>
          <p className="text-primary-foreground/50 text-sm font-body max-w-xs">
            Like all things, it was beautiful because it was fleeting.
          </p>
        </div>
      </RiverBackground>
    );
  }

  // Loading
  if (phase === 'loading' || !drift) {
    return (
      <RiverBackground>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <p className="text-primary-foreground/60 font-heading text-xl animate-gentle-pulse">
            Finding your drift...
          </p>
        </div>
      </RiverBackground>
    );
  }

  // River + bottle
  if (phase === 'river') {
    return (
      <RiverBackground atmosphere={drift.scene.atmosphere}>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <p className="text-primary-foreground/60 font-heading text-lg mb-8 animate-gentle-pulse">
            You've received something...
          </p>
          <FloatingBottle onClick={handleBottleTap} driftIn />
          <p className="mt-8 text-primary-foreground/40 text-sm font-body">
            Tap the bottle
          </p>
        </div>
      </RiverBackground>
    );
  }

  // Opening animation
  if (phase === 'opening') {
    return (
      <RiverBackground atmosphere={drift.scene.atmosphere}>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="animate-envelope-open text-8xl">
            ✉️
          </div>
        </div>
      </RiverBackground>
    );
  }

  // Revealed
  return (
    <RiverBackground atmosphere={drift.scene.atmosphere}>
      <div className="relative z-10 flex flex-col h-screen">
        {/* Mute toggle */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-card/30 backdrop-blur-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Canvas with staggered elements */}
        <div className="flex-1 p-4 min-h-0">
          <DriftCanvas
            elements={drift.scene.elements.slice(0, visibleElements).map((el) => ({
              ...el,
            }))}
            onUpdateElement={() => {}}
            onSelectElement={() => {}}
            selectedId={null}
            editable={false}
          />
        </div>

        {/* Sender name */}
        {drift.senderName && (
          <div className="text-center pb-8 animate-element-fade-in" style={{ animationDelay: `${drift.scene.elements.length * 200 + 300}ms`, animationFillMode: 'forwards' }}>
            <p className="font-heading text-lg text-primary-foreground/70 italic">
              From {drift.senderName}
            </p>
          </div>
        )}
      </div>
    </RiverBackground>
  );
};

export default OpenDrift;
