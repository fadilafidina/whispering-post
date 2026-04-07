import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DriftElement, Atmosphere, saveDrift, generateId } from '@/lib/drift-store';
import RiverBackground from '@/components/drift/RiverBackground';
import DriftCanvas from '@/components/drift/DriftCanvas';
import EditorToolbar from '@/components/drift/EditorToolbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Send } from 'lucide-react';

const Create = () => {
  const navigate = useNavigate();
  const [elements, setElements] = useState<DriftElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('sunrise');
  const [senderName, setSenderName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleSend = () => {
    if (elements.length === 0) return;
    const id = generateId();
    const drift = {
      id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      senderName: senderName.trim() || null,
      scene: {
        atmosphere,
        elements,
      },
    };
    saveDrift(drift);
    const link = `${window.location.origin}/d/${id}`;
    setGeneratedLink(link);
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (generatedLink) {
    return (
      <RiverBackground atmosphere={atmosphere}>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <div className="bg-card/90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-border">
            <h2 className="font-heading text-3xl font-light text-foreground mb-2">Your drift is ready</h2>
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

  return (
    <RiverBackground atmosphere={atmosphere}>
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-primary-foreground/80 hover:text-primary-foreground gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="font-heading text-xl text-primary-foreground/80 font-light">Create your drift</h2>
          <div className="flex gap-2">
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

        {/* Canvas area */}
        <div className="flex-1 px-4 pb-4">
          <DriftCanvas
            elements={elements}
            onUpdateElement={updateElement}
            onSelectElement={setSelectedId}
            selectedId={selectedId}
            editable={!showPreview}
          />
        </div>

        {/* Bottom toolbar */}
        {!showPreview && (
          <div className="p-4 max-w-lg mx-auto w-full">
            <EditorToolbar
              elements={elements}
              onAddElement={addElement}
              onRemoveElement={removeElement}
              onUpdateElement={updateElement}
              selectedId={selectedId}
              atmosphere={atmosphere}
              onAtmosphereChange={setAtmosphere}
              senderName={senderName}
              onSenderNameChange={setSenderName}
            />
          </div>
        )}

        {/* Send button */}
        <div className="p-4 flex justify-center">
          <Button
            onClick={handleSend}
            disabled={elements.length === 0}
            className="px-8 py-5 text-lg font-heading rounded-full bg-card/90 text-foreground hover:bg-card shadow-xl backdrop-blur-sm transition-all hover:scale-105 gap-2 border-0"
          >
            <Send className="w-5 h-5" /> Set Adrift
          </Button>
        </div>
      </div>
    </RiverBackground>
  );
};

export default Create;
