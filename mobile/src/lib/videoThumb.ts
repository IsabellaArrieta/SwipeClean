import * as VideoThumbnails from 'expo-video-thumbnails';

// Caché de miniaturas de video + limitador de concurrencia. Generar muchas a la
// vez satura MediaMetadataRetriever y traba el scroll.
const cache = new Map<string, string | null>();
let running = 0;
const queue: (() => void)[] = [];
const MAX = 3;

export function cachedPoster(uri: string): string | null | undefined {
  return cache.get(uri);
}

export async function getPoster(uri: string): Promise<string | null> {
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
    return r.uri;
  } catch {
    cache.set(uri, null);
    return null;
  } finally {
    running--;
    queue.shift()?.();
  }
}
