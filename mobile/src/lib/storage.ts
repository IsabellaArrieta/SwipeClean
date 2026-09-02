import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MediaKind } from './media';

// Checkpoint: recuerda el último elemento revisado por tipo, para retomar
// la revisión donde la dejaste. Guardamos id + fecha (ms) para poder pedir
// directamente "lo más nuevo que sigue sin revisar" sin recorrer todo.

export type Checkpoint = { id: string; time: number };

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
