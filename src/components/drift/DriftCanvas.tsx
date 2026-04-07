import { useRef, useState, useCallback } from 'react';
import { DriftElement } from '@/lib/drift-store';
import { Trash2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface DriftCanvasProps {
  elements: DriftElement[];
  onUpdateElement: (id: string, updates: Partial<DriftElement>) => void;
  onRemoveElement?: (id: string) => void;
  onSelectElement: (id: string | null) => void;
  selectedId: string | null;
  editable?: boolean;
}

const DriftCanvas = ({ elements, onUpdateElement, onRemoveElement, onSelectElement, selectedId, editable = true }: DriftCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [overDelete, setOverDelete] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent, element: DriftElement) => {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(element.id);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = element.x * rect.width;
    const currentY = element.y * rect.height;

    setDragOffset({
      x: e.clientX - rect.left - currentX,
      y: e.clientY - rect.top - currentY,
    });
    setDragging(element.id);
    setOverDelete(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editable, onSelectElement]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left - dragOffset.x) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top - dragOffset.y) / rect.height));
    onUpdateElement(dragging, { x, y });

    // Check if over delete zone (bottom 60px of canvas)
    const relY = e.clientY - rect.top;
    setOverDelete(relY > rect.height - 70);
  }, [dragging, dragOffset, onUpdateElement]);

  const handlePointerUp = useCallback(() => {
    if (dragging && overDelete && onRemoveElement) {
      onRemoveElement(dragging);
    }
    setDragging(null);
    setOverDelete(false);
  }, [dragging, overDelete, onRemoveElement]);

  const renderElement = (el: DriftElement) => {
    const isSelected = selectedId === el.id && editable;
    const isViewMode = !editable;
    const isDraggingThis = dragging === el.id;
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x * 100}%`,
      top: `${el.y * 100}%`,
      transform: `scale(${el.scale}) rotate(${el.rotation}deg)`,
      zIndex: isDraggingThis ? 999 : el.zIndex,
      opacity: isDraggingThis && overDelete ? 0.4 : el.opacity,
      cursor: editable ? (isDraggingThis ? 'grabbing' : 'grab') : 'default',
      touchAction: 'none',
      transition: isViewMode ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : (isDraggingThis ? 'none' : 'opacity 0.2s ease'),
    };

    const hoverClass = isViewMode ? 'drift-element-alive' : '';

    let content: React.ReactNode;
    switch (el.type) {
      case 'text':
        content = (
          <div className="max-w-[200px] px-3 py-2 rounded-lg bg-card/80 text-card-foreground font-body text-sm leading-relaxed shadow-md">
            {el.content}
          </div>
        );
        break;
      case 'image':
        content = (
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden shadow-lg">
            <img src={el.content} alt="" className="w-full h-full object-cover" />
          </div>
        );
        break;
      case 'sticker':
        content = (
          <span className="text-4xl md:text-5xl select-none drop-shadow-md">{el.content}</span>
        );
        break;
    }

    return (
      <div
        key={el.id}
        style={style}
        onPointerDown={(e) => handlePointerDown(e, el)}
        className={`group ${hoverClass}`}
      >
        {content}
        {/* Inline resize/rotate controls — shown on select */}
        {isSelected && !isDraggingThis && (
          <>
            <div className="absolute -inset-1 rounded-lg border-2 border-primary/60 pointer-events-none" />
            {/* Scale up — top */}
            <button
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-card/90 shadow-md flex items-center justify-center text-foreground hover:bg-card hover:scale-110 transition-transform"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onUpdateElement(el.id, { scale: Math.min(el.scale + 0.15, 3) }); }}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {/* Scale down — bottom */}
            <button
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-card/90 shadow-md flex items-center justify-center text-foreground hover:bg-card hover:scale-110 transition-transform"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onUpdateElement(el.id, { scale: Math.max(el.scale - 0.15, 0.3) }); }}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {/* Rotate — right */}
            <button
              className="absolute top-1/2 -right-4 -translate-y-1/2 w-7 h-7 rounded-full bg-card/90 shadow-md flex items-center justify-center text-foreground hover:bg-card hover:scale-110 transition-transform"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onUpdateElement(el.id, { rotation: el.rotation + 15 }); }}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full rounded-xl overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectElement(null)}
    >
      {elements.map(renderElement)}

      {/* Drag-to-delete zone */}
      {editable && dragging && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center gap-2 transition-all duration-200 rounded-b-xl ${
            overDelete
              ? 'bg-destructive/30 border-t-2 border-destructive/60'
              : 'bg-card/20 border-t border-border/40'
          }`}
        >
          <Trash2 className={`w-5 h-5 transition-all ${overDelete ? 'text-destructive scale-125' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-body transition-colors ${overDelete ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            {overDelete ? 'Release to delete' : 'Drag here to delete'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DriftCanvas;
