import { Linking } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export type MediaKind = 'photo' | 'video';

export type Media = {
  id: string;
  uri: string;
  kind: MediaKind;
  name: string;
  dateAdded: number; // segundos
};

// --- Modo demo -------------------------------------------------------------
// Expo Go en Android moderno ya no da acceso completo a la galería. Cuando no
// hay acceso real, usamos estos elementos de prueba para poder practicar la UI.
// En el APK compilado (EAS) esto no se usa: se lee la galería real.

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
      dateAdded: Math.round(Date.now() / 1000) - i * 3600,
    }));
  }
  const vids = [
    'https://media.w3.org/2010/05/video/movie_300.mp4', // ~2.7 MB
    'https://samplelib.com/mp4/sample-5s.mp4', // ~2.8 MB
    'https://media.w3.org/2010/05/sintel/trailer.mp4', // ~4.4 MB
    'https://samplelib.com/mp4/sample-10s.mp4', // ~5.5 MB
  ];
  return vids.map((uri, i) => ({
    id: `${DEMO_PREFIX}v${i}`,
    uri,
    kind,
    name: `video_demo_${i + 1}.mp4`,
    dateAdded: Math.round(Date.now() / 1000) - i * 3600,
  }));
}

// --- Galería real --------------------------------------------------------

// Lee todas las fotos o videos del dispositivo, más nuevo primero.
// Equivale a MediaRepository.queryMedia() del proyecto Android.
export async function queryMedia(kind: MediaKind): Promise<Media[]> {
  try {
    const out: Media[] = [];
    let after: string | undefined;
    let hasNext = true;

    while (hasNext) {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType: [kind === 'photo' ? MediaLibrary.MediaType.photo : MediaLibrary.MediaType.video],
        sortBy: [[MediaLibrary.SortBy.creationTime, false]], // false = descendente (más nuevo primero)
        first: 1000,
        after,
      });
      for (const a of page.assets) {
        out.push({
          id: a.id,
          uri: a.uri,
          kind,
          name: a.filename,
          dateAdded: Math.round(a.creationTime / 1000),
        });
      }
      hasNext = page.hasNextPage;
      after = page.endCursor;
    }

    if (out.length === 0) {
      _demoMode = true;
      return demoMedia(kind);
    }
    _demoMode = false;
    return out;
  } catch {
    _demoMode = true;
    return demoMedia(kind);
  }
}

// Borrado real: muestra el diálogo de confirmación del sistema (iOS y Android).
// Devuelve true si el usuario confirmó y se borró. Los elementos demo no se borran de verdad.
export async function deleteAssets(ids: string[]): Promise<boolean> {
  const real = ids.filter((id) => !isDemoId(id));
  if (real.length === 0) return true;
  try {
    return await MediaLibrary.deleteAssetsAsync(real);
  } catch {
    return false;
  }
}

// Solo pedimos fotos y video (nunca AUDIO): pedir todos los permisos granulares
// hace fallar getPermissionsAsync en Expo Go porque no declara AUDIO en el manifest.
const GRANULAR = ['photo', 'video'] as const;

const ok = (r: MediaLibrary.PermissionResponse) =>
  r.granted || r.accessPrivileges === 'limited';

// Pide el permiso (muestra el diálogo del sistema si se puede). No bloquea:
// si lo deniegan, la app sigue en modo demo.
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

// Segundo intento desde el banner "Modo demo": pide de nuevo y, si ya no se
// puede preguntar, abre los ajustes del sistema para dar el permiso a mano.
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
