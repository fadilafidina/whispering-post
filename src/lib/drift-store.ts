export type Atmosphere = 'rain' | 'sunrise' | 'midnight';
export type ElementType = 'text' | 'image' | 'sticker';

export interface DriftElement {
  id: string;
  type: ElementType;
  content: string;
  x: number; // 0-1 normalized
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

export function saveDrift(drift: DriftData): void {
  const store = getStore();
  store[drift.id] = drift;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getDrift(id: string): DriftData | null {
  const store = getStore();
  return store[id] || null;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function isDriftExpired(drift: DriftData): boolean {
  return Date.now() > drift.expiresAt;
}

export const STICKERS = ['🌸', '🦋', '🌊', '✨', '🍃'];

export const ATMOSPHERE_CONFIG: Record<Atmosphere, { label: string; emoji: string; description: string }> = {
  rain: { label: 'Rain', emoji: '🌧️', description: 'Gentle rainfall' },
  sunrise: { label: 'Sunrise', emoji: '🌅', description: 'Warm morning light' },
  midnight: { label: 'Midnight', emoji: '🌙', description: 'Quiet night sounds' },
};
