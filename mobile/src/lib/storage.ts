import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MediaKind } from './media';

// Checkpoint: recuerda el último elemento revisado por tipo, para retomar
// la revisión donde la dejaste. Portado de CheckpointManager (DataStore).

const key = (kind: MediaKind) => `last_id_${kind}`;

export async function getCheckpoint(kind: MediaKind): Promise<string | null> {
  return AsyncStorage.getItem(key(kind));
}

export async function saveCheckpoint(kind: MediaKind, id: string): Promise<void> {
  await AsyncStorage.setItem(key(kind), id);
}

export async function clearCheckpoint(kind: MediaKind): Promise<void> {
  await AsyncStorage.removeItem(key(kind));
}
