import { create } from 'zustand';

import { deleteAssets } from '@/lib/media';
import { trashAll, trashClear, trashInsert, trashRemove, type TrashRow } from '@/lib/db';

type TrashState = {
  items: TrashRow[];
  selected: Set<string>;
  refresh: () => Promise<void>;
  toggle: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  restoreSelected: () => Promise<void>;
  restoreAll: () => Promise<void>;
  deleteSelected: () => Promise<void>;
  emptyTrash: () => Promise<void>;
  // añade elementos a la papelera desde la galería (multi-selección)
  sendToTrash: (rows: TrashRow[]) => Promise<void>;
};

export const useTrashStore = create<TrashState>((set, get) => ({
  items: [],
  selected: new Set(),

  refresh: async () => {
    set({ items: await trashAll() });
  },

  toggle: (id) =>
    set((s) => {
      const next = new Set(s.selected);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selected: next };
    }),

  selectAll: () => set((s) => ({ selected: new Set(s.items.map((i) => i.id)) })),
  clearSelection: () => set({ selected: new Set() }),

  restoreSelected: async () => {
    const ids = [...get().selected];
    await trashRemove(ids);
    set({ selected: new Set() });
    await get().refresh();
  },

  restoreAll: async () => {
    await trashClear();
    set({ selected: new Set() });
    await get().refresh();
  },

  deleteSelected: async () => {
    const ids = [...get().selected];
    const ok = await deleteAssets(ids);
    if (ok) {
      await trashRemove(ids);
      set({ selected: new Set() });
      await get().refresh();
    }
  },

  emptyTrash: async () => {
    const ids = get().items.map((i) => i.id);
    const ok = await deleteAssets(ids);
    if (ok) {
      await trashClear();
      set({ selected: new Set() });
      await get().refresh();
    }
  },

  sendToTrash: async (rows) => {
    for (const r of rows) await trashInsert(r);
    await get().refresh();
  },
}));
