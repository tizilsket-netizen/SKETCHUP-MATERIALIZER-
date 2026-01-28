
export interface ProjectImage {
  id?: number;
  blob: Blob;
  prompt: string;
  timestamp: number;
  metadata: {
    lighting?: string;
    consistency?: number;
    styleReference?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: string[];
  isThinking?: boolean;
}

export enum LightingPreset {
  GOLDEN_HOUR = 'Golden Hour',
  OVERCAST = 'Overcast',
  STUDIO = 'Studio',
  INTERIOR_ARTIFICIAL = 'Interior Artificial'
}
