
import { Dexie, type Table } from 'dexie';
import { ProjectImage } from '../types';

export class SketchupDB extends Dexie {
  images!: Table<ProjectImage>;

  constructor() {
    super('SketchupMaterializerDB');
    // Initialize database schema version
    this.version(1).stores({
      images: '++id, timestamp'
    });
  }
}

export const db = new SketchupDB();

export const saveImageToGallery = async (blob: Blob, prompt: string, metadata: any) => {
  return await db.images.add({
    blob,
    prompt,
    timestamp: Date.now(),
    metadata
  });
};

export const getAllGalleryImages = async () => {
  return await db.images.orderBy('timestamp').reverse().toArray();
};
