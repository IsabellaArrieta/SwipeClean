import * as SQLite from 'expo-sqlite';

import type { MediaKind } from './media';

// Papelera = soft-delete. Guardar aquí NO borra el archivo real:
// solo lo esconde de la revisión y lo lista en Papelera hasta que el
// usuario confirme el borrado definitivo. Portado de Room (TrashDao/TrashEntity).

export type TrashRow = {
  id: string;
  uri: string;
  kind: MediaKind;
  name: string;
  dateAdded: number;
  trashedAt: number;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('swipeclean.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS trash_items (
          id TEXT PRIMARY KEY NOT NULL,
          uri TEXT NOT NULL,
          kind TEXT NOT NULL,
          name TEXT NOT NULL,
          dateAdded INTEGER NOT NULL,
          trashedAt INTEGER NOT NULL
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

export async function trashAll(): Promise<TrashRow[]> {
  const db = await getDb();
  return db.getAllAsync<TrashRow>('SELECT * FROM trash_items ORDER BY trashedAt DESC');
}

export async function trashIds(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM trash_items');
  return rows.map((r) => r.id);
}

export async function trashInsert(row: TrashRow): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO trash_items (id, uri, kind, name, dateAdded, trashedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.uri, row.kind, row.name, row.dateAdded, row.trashedAt],
  );
}

export async function trashRemove(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const marks = ids.map(() => '?').join(',');
  await db.runAsync(`DELETE FROM trash_items WHERE id IN (${marks})`, ids);
}

export async function trashClear(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM trash_items');
}
