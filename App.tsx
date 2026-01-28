
import React, { useState, useEffect, useCallback } from 'react';
import FactorizationPanel from './components/FactorizationPanel';
import MainPreview from './components/MainPreview';
import MultimodalChat from './components/MultimodalChat';
import ConsistencyCarousel from './components/ConsistencyCarousel';
import { LightingPreset, ProjectImage } from './types';
import { db, saveImageToGallery, getAllGalleryImages } from './lib/db';
import { Box, Layers, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  const [consistency, setConsistency] = useState(0.85);
  const [lighting, setLighting] = useState<LightingPreset>(LightingPreset.OVERCAST);
  const [styleRef, setStyleRef] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<ProjectImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<number | undefined>();

  const refreshGallery = useCallback(async () => {
    const images = await getAllGalleryImages();
    setGallery(images);
  }, []);

  useEffect(() => {
    refreshGallery();
  }, [refreshGallery]);

  const handleImageGenerated = async (imgUrl: string, prompt: string) => {
    setCurrentImage(imgUrl);
    // Convert base64 to Blob for Dexie storage
    const response = await fetch(imgUrl);
    const blob = await response.blob();
    const newId = await saveImageToGallery(blob, prompt, { lighting, consistency, styleRef });
    setActiveImageId(newId as number);
    refreshGallery();
  };

  const handleSelectHistoryItem = (img: ProjectImage) => {
    const url = URL.createObjectURL(img.blob);
    setCurrentImage(url);
    setActiveImageId(img.id);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-200 selection:text-zinc-950">
      {/* Top Header */}
      <header className="h-14 border-b border-zinc-900 px-6 flex items-center justify-between shrink-0 bg-zinc-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
            <Box className="w-5 h-5 text-zinc-950 stroke-[2.5px]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight">SKETCHUP MATERIALIZER</h1>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Architect Pro Edition v4.5</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <button className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors">Project Info</button>
            <button className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors">Shared Assets</button>
            <button className="text-[11px] font-medium text-zinc-200 border border-zinc-800 px-3 py-1 rounded-full bg-zinc-900">Build 2026</button>
          </nav>
          <div className="w-px h-6 bg-zinc-800" />
          <UserCircle className="w-6 h-6 text-zinc-600 cursor-pointer hover:text-zinc-300" />
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex flex-1 overflow-hidden">
        <FactorizationPanel 
          consistency={consistency}
          setConsistency={setConsistency}
          lighting={lighting}
          setLighting={setLighting}
          styleRef={styleRef}
          setStyleRef={setStyleRef}
        />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
           <MainPreview currentImage={currentImage} />
           <ConsistencyCarousel 
            images={gallery} 
            onSelect={handleSelectHistoryItem} 
            activeId={activeImageId}
          />
        </main>

        <MultimodalChat 
          currentCanvasImage={currentImage}
          onImageGenerated={handleImageGenerated}
        />
      </div>

      {/* Footer Status */}
      <footer className="h-8 border-t border-zinc-900 px-6 flex items-center justify-between shrink-0 bg-zinc-950 text-[10px] text-zinc-600 font-mono tracking-tighter">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"/> SYSTEM ONLINE</span>
          <span>LATENCY: 42ms</span>
          <span>GPU: V100 CLUSTER CLOUD</span>
        </div>
        <div>
          &copy; 2026 AI ARCHITECTURAL SOLUTIONS . ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
};

export default App;
