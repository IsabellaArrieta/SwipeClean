import AsyncStorage from '@react-native-async-storage/async-storage';
import * as VideoThumbnails from 'expo-video-thumbnails';

// Caché persistente de miniaturas de video (uri del video -> uri del jpg en cache
// dir) + limitador de concurrencia. Sin persistir, cada reinicio volvía a
// generarlas todas (lento). Con persistir, la 2a vez es instantánea.

const STORE_KEY = 'video_thumbs_v1';
const MAX = 3;

const cache = new Map<string, string | null>();
let running = 0;
const queue: (() => void)[] = [];
let hydrated = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, string>;
      for (const [k, v] of Object.entries(obj)) cache.set(k, v);
    }
  } catch {}
}
hydrate();

function persistSoon() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const obj: Record<string, string> = {};
    for (const [k, v] of cache) if (v) obj[k] = v;
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(obj)).catch(() => {});
  }, 1500);
}

export function cachedPoster(uri: string): string | null | undefined {
  return cache.get(uri);
}

// Marca una miniatura como inválida (el archivo desapareció) para regenerarla.
export function invalidatePoster(uri: string) {
  cache.delete(uri);
}

export async function getPoster(uri: string): Promise<string | null> {
  await hydrate();
  if (cache.has(uri)) return cache.get(uri) ?? null;
  if (uri.startsWith('http')) {
    cache.set(uri, null);
    return null;
  }
  if (running >= MAX) await new Promise<void>((r) => queue.push(r));
  running++;
  try {
    const r = await VideoThumbnails.getThumbnailAsync(uri, { time: 0, quality: 0.3 });
    cache.set(uri, r.uri);
    persistSoon();
    return r.uri;
  } catch {
    cache.set(uri, null);
    return null;
  } finally {
    running--;
    queue.shift()?.();
  }
}
