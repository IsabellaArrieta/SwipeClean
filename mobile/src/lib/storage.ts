import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MediaKind } from './media';

// Checkpoint: recuerda el último elemento revisado por tipo, para retomar
// la revisión donde la dejaste. Guardamos id + fecha (ms) para poder pedir
// directamente "lo más nuevo que sigue sin revisar" sin recorrer todo.

// `count` = cuántos llevas revisados de ese tipo. Se guarda tal cual en vez de
// deducirlo de las fechas: en Android el orden por creationTime no siempre
// coincide con la fecha que devuelve cada asset y el número salía disparado.
export type Checkpoint = { id: string; time: number; count: number };

const key = (kind: MediaKind) => `checkpoint_${kind}`;

export async function getCheckpoint(kind: MediaKind): Promise<Checkpoint | null> {
  const raw = await AsyncStorage.getItem(key(kind));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Checkpoint;
  } catch {
    return null;
  }
}

export async function saveCheckpoint(kind: MediaKind, cp: Checkpoint): Promise<void> {
  await AsyncStorage.setItem(key(kind), JSON.stringify(cp));
}

export async function clearCheckpoint(kind: MediaKind): Promise<void> {
  await AsyncStorage.removeItem(key(kind));
}

// Ancla de la galería: por qué elemento ibas navegando. Guardamos id + fecha
// para reencontrar su posición exacta aunque hayan entrado fotos nuevas.
export type Anchor = { id: string; time: number };
const anchorKey = (kind: MediaKind) => `gallery_anchor_${kind}`;

export async function getGalleryAnchor(kind: MediaKind): Promise<Anchor | null> {
  const raw = await AsyncStorage.getItem(anchorKey(kind));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Anchor;
  } catch {
    return null;
  }
}

export async function saveGalleryAnchor(kind: MediaKind, a: Anchor): Promise<void> {
  await AsyncStorage.setItem(anchorKey(kind), JSON.stringify(a));
}

export async function clearGalleryAnchor(kind: MediaKind): Promise<void> {
  await AsyncStorage.removeItem(anchorKey(kind));
}
