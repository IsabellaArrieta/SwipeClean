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

// Actividad diaria: cuántos elementos revisaste cada día, para la gráfica de
// Estadísticas. Se guarda un mapa { 'YYYY-MM-DD': { kept, trashed } } y se
// podan los días viejos al escribir.
export type DayActivity = { kept: number; trashed: number };
export type Activity = Record<string, DayActivity>;

const ACTIVITY_KEY = 'activity_v1';
const KEEP_DAYS = 30;

export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function getActivity(): Promise<Activity> {
  const raw = await AsyncStorage.getItem(ACTIVITY_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Activity;
  } catch {
    return {};
  }
}

export async function bumpActivity(kind: 'kept' | 'trashed'): Promise<void> {
  const activity = await getActivity();
  const today = dayKey();
  const day = activity[today] ?? { kept: 0, trashed: 0 };
  activity[today] = { ...day, [kind]: day[kind] + 1 };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  const min = dayKey(cutoff);
  for (const k of Object.keys(activity)) if (k < min) delete activity[k];

  await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
}
