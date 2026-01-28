
import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';

interface MainPreviewProps {
  currentImage: string | null;
}

const MainPreview: React.FC<MainPreviewProps> = ({ currentImage }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentImage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 4));
  };

  const downloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `render-${Date.now()}.png`;
    link.click();
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-zinc-950 relative overflow-hidden flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
    >
      {currentImage ? (
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            transformOrigin: 'center center'
          }}
          className="max-w-[90%] max-h-[90%] flex items-center justify-center shadow-2xl"
        >
          <img 
            src={currentImage} 
            alt="Preview" 
            className="rounded shadow-2xl pointer-events-none select-none h-auto max-h-screen"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-zinc-700">
          <Maximize2 className="w-16 h-16 stroke-[1px]" />
          <p className="text-sm tracking-wide">Ready for your first architectural materialization</p>
        </div>
      )}

      {/* Controls Overlay */}
      {currentImage && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-2 rounded-full shadow-xl">
          <button 
            onClick={() => handleZoom(-0.2)}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="w-12 text-center text-[11px] font-mono text-zinc-500">
            {(scale * 100).toFixed(0)}%
          </div>
          <button 
             onClick={() => handleZoom(0.2)}
             className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-zinc-800 mx-1" />
          <button 
            onClick={downloadImage}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Reference Indicator */}
      {currentImage && (
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur border border-white/10 px-3 py-1.5 rounded-md">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-medium tracking-widest uppercase text-zinc-300">Live Workspace</span>
        </div>
      )}
    </div>
  );
};

export default MainPreview;
