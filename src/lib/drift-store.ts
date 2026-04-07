import { getDriftFromSupabase, saveDriftToSupabase } from './supabase';

export type Atmosphere = 'rain' | 'sunrise' | 'midnight';
export type ElementType = 'text' | 'image' | 'sticker';

export interface DriftElement {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  opacity: number;
}

export interface DriftData {
  id: string;
  createdAt: number;
  expiresAt: number;
  senderName: string | null;
  scene: {
    atmosphere: Atmosphere;
    elements: DriftElement[];
  };
}

const STORAGE_KEY = 'drift_store';

function getStore(): Record<string, DriftData> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

// Compress images before storing to avoid localStorage quota issues
function compressDataUrl(dataUrl: string, maxSize = 100000): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:image') || dataUrl.length <= maxSize) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Scale down to fit
      const scale = Math.min(1, Math.sqrt(maxSize / dataUrl.length));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function saveDrift(drift: DriftData): Promise<void> {
  // Compress any image elements
  const compressedElements = await Promise.all(
    drift.scene.elements.map(async (el) => {
      if (el.type === 'image') {
        return { ...el, content: await compressDataUrl(el.content) };
      }
      return el;
    })
  );

  const compressedDrift = {
    ...drift,
    scene: { ...drift.scene, elements: compressedElements },
  };

  // Clean old expired drifts first
  const store = getStore();
  const now = Date.now();
  for (const key of Object.keys(store)) {
    if (store[key].expiresAt < now) {
      delete store[key];
    }
  }
  store[compressedDrift.id] = compressedDrift;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // If still too large, only keep this drift
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ [compressedDrift.id]: compressedDrift }));
  }

  try {
    await saveDriftToSupabase(compressedDrift);
  } catch {
    // Keep UX resilient even if remote save fails
  }
}

export async function getDrift(id: string): Promise<DriftData | null> {
  const store = getStore();
  if (store[id]) return store[id];

  try {
    const remoteDrift = await getDriftFromSupabase(id);
    if (!remoteDrift) return null;
    store[id] = remoteDrift;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return remoteDrift;
  } catch {
    return null;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function isDriftExpired(drift: DriftData): boolean {
  return Date.now() > drift.expiresAt;
}

export const STICKERS = ['🌸', '🍁', '🌙', '🌟', '🌊', '✨', '🍃', '☁️'];

export const ATMOSPHERE_CONFIG: Record<Atmosphere, { label: string; emoji: string; description: string }> = {
  rain: { label: 'Rain', emoji: '🌧️', description: 'Gentle rainfall' },
  sunrise: { label: 'Sunrise', emoji: '🌅', description: 'Warm morning light' },
  midnight: { label: 'Midnight', emoji: '🌙', description: 'Quiet night sounds' },
};
