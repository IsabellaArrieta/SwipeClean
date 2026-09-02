import { Linking } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export type MediaKind = 'photo' | 'video';

export type Media = {
  id: string;
  uri: string;
  kind: MediaKind;
  name: string;
  timeMs: number; // fecha de creación en milisegundos
};

const mediaTypeOf = (kind: MediaKind) => [
  kind === 'photo' ? MediaLibrary.MediaType.photo : MediaLibrary.MediaType.video,
];
const SORT: MediaLibrary.SortByValue[] = [[MediaLibrary.SortBy.creationTime, false]]; // más nuevo primero

// --- Modo demo -----------------------------------------------------------
const DEMO_PREFIX = 'demo:';
export const isDemoId = (id: string) => id.startsWith(DEMO_PREFIX);

let _demoMode = false;
export const isDemoMode = () => _demoMode;

function demoMedia(kind: MediaKind): Media[] {
  if (kind === 'photo') {
    const ids = [10, 1003, 1015, 1025, 1039, 1043, 1057, 106, 1074, 111, 129, 133, 164, 175, 180];
    return ids.map((n, i) => ({
      id: `${DEMO_PREFIX}p${n}`,
      uri: `https://picsum.photos/id/${n}/500/750`,
      kind,
      name: `foto_demo_${i + 1}.jpg`,
      timeMs: Date.now() - i * 3_600_000,
    }));
  }
  const vids = [
    'https://media.w3.org/2010/05/video/movie_300.mp4',
    'https://samplelib.com/mp4/sample-5s.mp4',
    'https://media.w3.org/2010/05/sintel/trailer.mp4',
    'https://samplelib.com/mp4/sample-10s.mp4',
  ];
  return vids.map((uri, i) => ({
    id: `${DEMO_PREFIX}v${i}`,
    uri,
    kind,
    name: `video_demo_${i + 1}.mp4`,
    timeMs: Date.now() - i * 3_600_000,
  }));
}

// --- Galería real (paginada) -------------------------------------------

const toMedia = (a: MediaLibrary.Asset, kind: MediaKind): Media => ({
  id: a.id,
  uri: a.uri,
  kind,
  name: a.filename,
  timeMs: a.creationTime,
});

export type MediaPage = { items: Media[]; cursor?: string; hasMore: boolean; demo: boolean };

// Una página de la galería. `after` = cursor de la página anterior;
// `before` = solo elementos anteriores a esa fecha (para retomar revisión).
export async function queryMediaPage(
  kind: MediaKind,
  opts: { after?: string; before?: number; first?: number } = {},
): Promise<MediaPage> {
  try {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: mediaTypeOf(kind),
      sortBy: SORT,
      first: opts.first ?? 120,
      after: opts.after,
      createdBefore: opts.before,
    });
    _demoMode = false;
    return {
      items: page.assets.map((a) => toMedia(a, kind)),
      cursor: page.endCursor,
      hasMore: page.hasNextPage,
      demo: false,
    };
  } catch {
    _demoMode = true;
    return { items: demoMedia(kind), hasMore: false, demo: true };
  }
}

// Total de elementos del tipo, sin cargar la lista (barato).
export async function getTotalCount(kind: MediaKind): Promise<number> {
  try {
    const r = await MediaLibrary.getAssetsAsync({ mediaType: mediaTypeOf(kind), first: 1 });
    return r.totalCount ?? 0;
  } catch {
    return demoMedia(kind).length;
  }
}

// Cuántos elementos son anteriores a `beforeMs` (= cuántos quedan por revisar).
export async function countBefore(kind: MediaKind, beforeMs: number): Promise<number> {
  try {
    const r = await MediaLibrary.getAssetsAsync({
      mediaType: mediaTypeOf(kind),
      first: 1,
      createdBefore: beforeMs,
    });
    return r.totalCount ?? 0;
  } catch {
    return 0;
  }
}

// --- Borrado ----------------------------------------------------------
export async function deleteAssets(ids: string[]): Promise<boolean> {
  const real = ids.filter((id) => !isDemoId(id));
  if (real.length === 0) return true;
  try {
    return await MediaLibrary.deleteAssetsAsync(real);
  } catch {
    return false;
  }
}

// --- Permisos -------------------------------------------------------
const GRANULAR = ['photo', 'video'] as const;
const ok = (r: MediaLibrary.PermissionResponse) => r.granted || r.accessPrivileges === 'limited';

export async function ensurePermission(): Promise<boolean> {
  try {
    const current = await MediaLibrary.getPermissionsAsync(false, [...GRANULAR]);
    if (ok(current)) return true;
    if (!current.canAskAgain) return false;
    return ok(await MediaLibrary.requestPermissionsAsync(false, [...GRANULAR]));
  } catch {
    try {
      return ok(await MediaLibrary.requestPermissionsAsync(false, [...GRANULAR]));
    } catch {
      return false;
    }
  }
}

export async function requestOrOpenSettings(): Promise<boolean> {
  try {
    const res = await MediaLibrary.requestPermissionsAsync(false, [...GRANULAR]);
    if (ok(res)) return true;
    if (!res.canAskAgain) await Linking.openSettings();
    return false;
  } catch {
    await Linking.openSettings();
    return false;
  }
}
