import { create } from 'zustand';

import { queryMedia, type Media, type MediaKind } from '@/lib/media';
import { trashIds, trashInsert, trashRemove } from '@/lib/db';
import { getCheckpoint, saveCheckpoint } from '@/lib/storage';

type Action = { item: Media; kind: 'kept' | 'trashed' };

type SwipeState = {
  loading: boolean;
  queue: Media[];
  index: number;
  total: number;
  reviewed: number;
  history: Action[];
  load: (kind: MediaKind, jumpToId?: string | null) => Promise<void>;
  swipeRight: () => void;
  swipeLeft: () => void;
  undo: () => void;
};

export const useSwipeStore = create<SwipeState>((set, get) => ({
  loading: true,
  queue: [],
  index: 0,
  total: 0,
  reviewed: 0,
  history: [],

  load: async (kind, jumpToId) => {
    set({ loading: true });
    const all = await queryMedia(kind);
    const trashed = new Set(await trashIds());
    const pending = all.filter((m) => !trashed.has(m.id));

    let start = 0;
    if (jumpToId) {
      const i = pending.findIndex((m) => m.id === jumpToId);
      start = i >= 0 ? i : 0;
    } else {
      const last = await getCheckpoint(kind);
      if (last) {
        const i = pending.findIndex((m) => m.id === last);
        start = i >= 0 ? i + 1 : 0;
      }
    }

    set({
      loading: false,
      queue: pending,
      index: start,
      total: pending.length,
      reviewed: start,
      history: [],
    });
  },

  swipeRight: () => {
    const { queue, index } = get();
    const item = queue[index];
    if (!item) return;
    saveCheckpoint(item.kind, item.id);
    set((s) => ({
      history: [...s.history, { item, kind: 'kept' }],
      index: s.index + 1,
      reviewed: s.reviewed + 1,
    }));
  },

  swipeLeft: () => {
    const { queue, index } = get();
    const item = queue[index];
    if (!item) return;
    trashInsert({
      id: item.id,
      uri: item.uri,
      kind: item.kind,
      name: item.name,
      dateAdded: item.dateAdded,
      trashedAt: Date.now(),
    });
    saveCheckpoint(item.kind, item.id);
    set((s) => ({
      history: [...s.history, { item, kind: 'trashed' }],
      index: s.index + 1,
      reviewed: s.reviewed + 1,
    }));
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;
    const last = history[history.length - 1];
    if (last.kind === 'trashed') trashRemove([last.item.id]);
    set((s) => ({
      history: s.history.slice(0, -1),
      index: Math.max(0, s.index - 1),
      reviewed: Math.max(0, s.reviewed - 1),
    }));
  },
}));
