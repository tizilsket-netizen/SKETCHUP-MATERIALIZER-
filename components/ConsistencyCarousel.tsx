
import React from 'react';
import { ProjectImage } from '../types';
import { History, Clock } from 'lucide-react';

interface ConsistencyCarouselProps {
  images: ProjectImage[];
  onSelect: (img: ProjectImage) => void;
  activeId?: number;
}

const ConsistencyCarousel: React.FC<ConsistencyCarouselProps> = ({ images, onSelect, activeId }) => {
  if (images.length === 0) return null;

  return (
    <div className="h-40 border-t border-zinc-900 bg-zinc-950 flex flex-col shrink-0">
      <div className="px-6 py-2 border-b border-zinc-900 flex items-center gap-2">
        <History className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Render History & Consistency Reference</span>
      </div>
      <div className="flex-1 overflow-x-auto p-4 flex gap-4 scrollbar-hide">
        {images.map((img) => (
          <div 
            key={img.id}
            onClick={() => onSelect(img)}
            className={`relative h-full aspect-video rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
              activeId === img.id ? 'border-zinc-200 scale-105 shadow-xl ring-4 ring-white/5' : 'border-zinc-800 grayscale hover:grayscale-0 hover:border-zinc-600'
            }`}
          >
            <img 
              src={URL.createObjectURL(img.blob)} 
              alt="History item" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
               <div className="flex items-center gap-1 text-[8px] text-zinc-400">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
               <p className="text-[9px] text-zinc-200 truncate w-full">{img.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsistencyCarousel;
