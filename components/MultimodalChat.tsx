
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MessageSquare, Loader2, Image as ImageIcon } from 'lucide-react';
import { ChatMessage } from '../types';
import { analyzeImage, transformImageToRender } from '../lib/geminiService';

interface MultimodalChatProps {
  currentCanvasImage: string | null;
  onImageGenerated: (imgUrl: string, prompt: string) => void;
}

const MultimodalChat: React.FC<MultimodalChatProps> = ({ currentCanvasImage, onImageGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setAttachments(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Helper function to resolve various URL types (blob or data) to a pure base64 string
  const getBase64FromUrl = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) {
      return url.split(',')[1];
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to fetch image for base64 conversion:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      images: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Create local copies to avoid state synchronization issues during async calls
    const currentInput = input;
    const currentAttachments = [...attachments];
    
    setInput('');
    setAttachments([]);
    setIsTyping(true);

    try {
      let responseText = '';
      const promptLower = currentInput.toLowerCase();
      const isRenderRequest = promptLower.includes('render') || promptLower.includes('visualize') || promptLower.includes('materialize');

      if (currentAttachments.length > 0 && isRenderRequest) {
        // Transform the first attached image from a sketch to a render
        const base64 = await getBase64FromUrl(currentAttachments[0]);
        const generated = await transformImageToRender(base64, currentInput);
        if (generated) {
            onImageGenerated(generated, currentInput);
            responseText = "I've materialized your sketch based on our architectural DNA. Check the main canvas.";
        } else {
            responseText = "I analyzed the sketch but had trouble generating the render. Could you try a clearer view?";
        }
      } else if (currentAttachments.length > 0) {
        // Perform multimodal analysis on the attached image
        const base64 = await getBase64FromUrl(currentAttachments[0]);
        const analysis = await analyzeImage(base64, currentInput || "What do you see in this architectural context?");
        responseText = analysis || "I've analyzed the image. It looks like a complex architectural layout.";
      } else if (currentCanvasImage && isRenderRequest) {
        // Apply requested material transformations to the current workspace image
        const base64 = await getBase64FromUrl(currentCanvasImage);
        const generated = await transformImageToRender(base64, currentInput);
        if (generated) {
            onImageGenerated(generated, currentInput);
            responseText = "Updated the render with your requested adjustments.";
        } else {
            responseText = "Adjusting the current render failed. Please try a more specific text prompt.";
        }
      } else if (currentCanvasImage) {
        // Analyze the current canvas state
        const base64 = await getBase64FromUrl(currentCanvasImage);
        const analysis = await analyzeImage(base64, currentInput);
        responseText = analysis || "Analysis complete.";
      } else {
          responseText = "Please upload a sketch or render to begin our architectural dialogue.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "My neural architects are experiencing a brief delay. Please try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-96 h-full border-l border-zinc-800 bg-zinc-950 flex flex-col">
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold tracking-tight">Multimodal Architect</span>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 uppercase font-bold tracking-widest">
          AI Live
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <ImageIcon className="w-10 h-10 text-zinc-800" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              Paste a sketch or ask me to materialize your vision. <br/>
              <span className="text-zinc-700 italic">"Render this using walnut and concrete"</span>
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
              m.role === 'user' 
                ? 'bg-zinc-100 text-zinc-950 rounded-tr-none' 
                : 'bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none'
            }`}>
              {m.images && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {m.images.map((img, i) => (
                    <img key={i} src={img} className="w-20 h-20 object-cover rounded-md border border-zinc-700" alt="Attachment" />
                  ))}
                </div>
              )}
              {m.text}
            </div>
            <span className="text-[10px] text-zinc-600 mt-1 uppercase tracking-tighter">
              {m.role === 'user' ? 'You' : 'Architect Pro'}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center text-zinc-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Processing Spatial Context</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-900">
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map((at, idx) => (
              <div key={idx} className="relative w-12 h-12 shrink-0">
                <img src={at} className="w-full h-full object-cover rounded border border-zinc-700" />
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            onPaste={handlePaste}
            placeholder="Type or paste sketch..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-20 text-xs focus:outline-none focus:border-zinc-500 transition-colors resize-none h-24"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
             <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                <Paperclip className="w-4 h-4" />
             </button>
             <button 
              onClick={handleSend}
              className="p-2 bg-zinc-100 text-zinc-950 rounded-lg hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
              disabled={isTyping || (!input.trim() && attachments.length === 0)}
             >
                <Send className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultimodalChat;
