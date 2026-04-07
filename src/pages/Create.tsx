import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DriftElement, Atmosphere, saveDrift, generateId } from '@/lib/drift-store';
import { ambientAudio } from '@/lib/ambient-audio';
import RiverBackground from '@/components/drift/RiverBackground';
import DriftCanvas from '@/components/drift/DriftCanvas';
import EditorToolbar from '@/components/drift/EditorToolbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Send, Volume2, VolumeX } from 'lucide-react';

type SendPhase = 'editing' | 'sealing' | 'floating' | 'done';

const Create = () => {
  const navigate = useNavigate();
  const [elements, setElements] = useState<DriftElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('sunrise');
  const [senderName, setSenderName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sendPhase, setSendPhase] = useState<SendPhase>('editing');
  const [muted, setMuted] = useState(false);

  // Play ambient audio when atmosphere changes
  useEffect(() => {
    ambientAudio.play(atmosphere);
    return () => { ambientAudio.stop(); };
  }, [atmosphere]);

  const toggleMute = () => {
    const nowMuted = ambientAudio.toggleMute();
    setMuted(nowMuted);
  };

  const addElement = useCallback((el: DriftElement) => {
    setElements(prev => [...prev, el]);
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const updateElement = useCallback((id: string, updates: Partial<DriftElement>) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const handleSend = async () => {
    if (elements.length === 0) return;
    setSendPhase('sealing');

    const id = generateId();
    const drift = {
      id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      senderName: senderName.trim() || null,
      scene: { atmosphere, elements },
    };

    await saveDrift(drift);
    const link = `${window.location.origin}/d/${id}`;

    setTimeout(() => setSendPhase('floating'), 700);
    setTimeout(() => {
      setGeneratedLink(link);
      setSendPhase('done');
    }, 3400);
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ===== SEND ANIMATION PHASES =====
  if (sendPhase === 'sealing' || sendPhase === 'floating') {
    return (
      <RiverBackground atmosphere={atmosphere}>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          {sendPhase === 'floating' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {[0, 0.3, 0.6].map((delay, i) => (
                <div
                  key={i}
                  className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 animate-ripple"
                  style={{ borderColor: 'hsla(195, 60%, 80%, 0.4)', animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          )}
          <div className={`text-8xl ${sendPhase === 'sealing' ? 'animate-envelope-seal' : 'animate-envelope-float-away'}`}>
            ✉️
          </div>
          <p className="mt-8 font-heading text-xl text-primary-foreground/70 italic animate-gentle-pulse">
            {sendPhase === 'sealing' ? 'Sealing your drift...' : 'Setting adrift...'}
          </p>
        </div>
      </RiverBackground>
    );
  }

  // ===== LINK SCREEN =====
  if (generatedLink) {
    return (
      <RiverBackground atmosphere={atmosphere}>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <div className="bg-card/90 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-border animate-element-fade-in">
            <div className="text-5xl mb-4">🌊</div>
            <h2 className="font-heading text-3xl font-light text-foreground mb-2">Your drift is on its way</h2>
            <p className="text-muted-foreground text-sm mb-6">Share this link — it will float for 24 hours</p>
            <div className="bg-muted rounded-lg p-3 mb-4 font-mono text-sm text-foreground break-all">
              {generatedLink}
            </div>
            <Button onClick={copyLink} className="w-full mb-3">
              {copied ? '✓ Copied!' : 'Copy Link'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
              Back to shore
            </Button>
          </div>
        </div>
      </RiverBackground>
    );
  }

  // ===== EDITOR =====
  return (
    <RiverBackground atmosphere={atmosphere}>
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-3 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-primary-foreground/80 hover:text-primary-foreground gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="font-heading text-xl text-primary-foreground/80 font-light">Create your drift</h2>
          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-card/30 backdrop-blur-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-primary-foreground/80 hover:text-primary-foreground gap-1"
            >
              <Eye className="w-4 h-4" /> {showPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>

        {/* Canvas — fills all available space */}
        <div className="flex-1 px-3 pb-2 min-h-0">
          <DriftCanvas
            elements={elements}
            onUpdateElement={updateElement}
            onRemoveElement={removeElement}
            onSelectElement={setSelectedId}
            selectedId={selectedId}
            editable={!showPreview}
          />
        </div>

        {/* Toolbar + Send — compact bottom section */}
        <div className="shrink-0 px-3 pb-3 space-y-2">
          {!showPreview && (
            <div className="max-w-lg mx-auto w-full">
              <EditorToolbar
                elements={elements}
                onAddElement={addElement}
                atmosphere={atmosphere}
                onAtmosphereChange={setAtmosphere}
                senderName={senderName}
                onSenderNameChange={setSenderName}
              />
            </div>
          )}
          <div className="flex justify-center">
            <Button
              onClick={handleSend}
              disabled={elements.length === 0}
              className="px-8 py-5 text-lg font-heading rounded-full bg-card/90 text-foreground hover:bg-card shadow-xl transition-all hover:scale-105 gap-2 border-0"
            >
              <Send className="w-5 h-5" /> Set Adrift
            </Button>
          </div>
        </div>
      </div>
    </RiverBackground>
  );
};

export default Create;
