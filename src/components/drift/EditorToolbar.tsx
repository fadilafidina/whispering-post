import { useState } from 'react';
import { DriftElement, Atmosphere, STICKERS, ATMOSPHERE_CONFIG, generateId } from '@/lib/drift-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Type, ImagePlus, Smile } from 'lucide-react';

interface EditorToolbarProps {
  elements: DriftElement[];
  onAddElement: (element: DriftElement) => void;
  atmosphere: Atmosphere;
  onAtmosphereChange: (a: Atmosphere) => void;
  senderName: string;
  onSenderNameChange: (name: string) => void;
}

const EditorToolbar = ({
  elements,
  onAddElement,
  atmosphere,
  onAtmosphereChange,
  senderName,
  onSenderNameChange,
}: EditorToolbarProps) => {
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  const addText = () => {
    if (!textInput.trim()) return;
    onAddElement({
      id: generateId(),
      type: 'text',
      content: textInput.trim(),
      x: 0.3 + Math.random() * 0.3,
      y: 0.3 + Math.random() * 0.3,
      scale: 1,
      rotation: Math.random() * 6 - 3,
      zIndex: elements.length,
      opacity: 1,
    });
    setTextInput('');
    setShowTextInput(false);
  };

  const addSticker = (sticker: string) => {
    onAddElement({
      id: generateId(),
      type: 'sticker',
      content: sticker,
      x: 0.2 + Math.random() * 0.5,
      y: 0.2 + Math.random() * 0.5,
      scale: 1,
      rotation: Math.random() * 20 - 10,
      zIndex: elements.length,
      opacity: 1,
    });
    setShowStickers(false);
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        onAddElement({
          id: generateId(),
          type: 'image',
          content: ev.target?.result as string,
          x: 0.2 + Math.random() * 0.4,
          y: 0.2 + Math.random() * 0.4,
          scale: 1,
          rotation: Math.random() * 6 - 3,
          zIndex: elements.length,
          opacity: 1,
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-3 p-4 min-h-[300px] bg-card/90 rounded-xl border border-border shadow-lg">
      {/* Element count */}
      <div className="text-xs text-muted-foreground text-center">
        {elements.length} elements
      </div>

      {/* Add elements */}
      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => { setShowTextInput(!showTextInput); setShowStickers(false); }}
          className="gap-1"
        >
          <Type className="w-4 h-4" /> Text
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={addImage}
          className="gap-1"
        >
          <ImagePlus className="w-4 h-4" /> Image
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => { setShowStickers(!showStickers); setShowTextInput(false); }}
          className="gap-1"
        >
          <Smile className="w-4 h-4" /> Sticker
        </Button>
      </div>

      {/* Text input */}
      {showTextInput && (
        <div className="flex gap-2">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Write something poetic..."
            className="text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addText()}
          />
          <Button size="sm" onClick={addText} disabled={!textInput.trim()}>Add</Button>
        </div>
      )}

      {/* Stickers */}
      {showStickers && (
        <div className="flex gap-2 justify-center">
          {STICKERS.map((s) => (
            <button
              key={s}
              onClick={() => addSticker(s)}
              className="text-2xl hover:scale-125 transition-transform p-1"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Atmosphere */}
      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground mb-2 text-center">Atmosphere</p>
        <div className="flex gap-2 justify-center">
          {(Object.keys(ATMOSPHERE_CONFIG) as Atmosphere[]).map((a) => (
            <button
              key={a}
              onClick={() => onAtmosphereChange(a)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                atmosphere === a
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {ATMOSPHERE_CONFIG[a].emoji} {ATMOSPHERE_CONFIG[a].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sender name */}
      <div className="border-t border-border pt-3">
        <Input
          value={senderName}
          onChange={(e) => onSenderNameChange(e.target.value)}
          placeholder="Your name (optional)"
          className="text-sm text-center"
        />
      </div>
    </div>
  );
};

export default EditorToolbar;
