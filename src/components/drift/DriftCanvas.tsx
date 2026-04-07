import { useRef, useState, useCallback } from 'react';
import { DriftElement } from '@/lib/drift-store';

interface DriftCanvasProps {
  elements: DriftElement[];
  onUpdateElement: (id: string, updates: Partial<DriftElement>) => void;
  onSelectElement: (id: string | null) => void;
  selectedId: string | null;
  editable?: boolean;
}

const DriftCanvas = ({ elements, onUpdateElement, onSelectElement, selectedId, editable = true }: DriftCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editable, onSelectElement]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left - dragOffset.x) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top - dragOffset.y) / rect.height));
    onUpdateElement(dragging, { x, y });
  }, [dragging, dragOffset, onUpdateElement]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  const renderElement = (el: DriftElement) => {
    const isSelected = selectedId === el.id && editable;
    const isViewMode = !editable;
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x * 100}%`,
      top: `${el.y * 100}%`,
      transform: `scale(${el.scale}) rotate(${el.rotation}deg)`,
      zIndex: el.zIndex,
      opacity: el.opacity,
      cursor: editable ? 'grab' : 'default',
      touchAction: 'none',
      transition: isViewMode ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined,
    };

    const hoverClass = isViewMode ? 'drift-element-alive' : '';

    let content: React.ReactNode;
    switch (el.type) {
      case 'text':
        content = (
          <div className="max-w-[200px] px-3 py-2 rounded-lg bg-card/80 text-shadow-sm text-card-foreground font-body text-sm leading-relaxed">
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
        className={`${isSelected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''} ${hoverClass}`}
      >
        {content}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectElement(null)}
    >
      {elements.map(renderElement)}
    </div>
  );
};

export default DriftCanvas;
