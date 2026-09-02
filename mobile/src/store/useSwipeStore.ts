import { create } from 'zustand';

import { getTotalCount, queryMediaPage, type Media, type MediaKind } from '@/lib/media';
import { trashIds, trashInsert, trashRemove } from '@/lib/db';
import { getCheckpoint, saveCheckpoint } from '@/lib/storage';

type Action = { item: Media; kind: 'kept' | 'trashed' };

const PAGE = 60;
const LOAD_AHEAD = 15; // cuando quedan menos de esto en cola, pedimos más

type SwipeState = {
  loading: boolean;
  queue: Media[];
  index: number;
  total: number;
  reviewed: number;
  history: Action[];
  kind: MediaKind;
  cursor?: string;
  hasMore: boolean;
  loadingMore: boolean;
  trashed: Set<string>;
  // `jump` viene de "Saltar aquí": la galería ya sabe la posición exacta del
  // elemento, así que la pasa y no hay que deducirla de las fechas.
  load: (kind: MediaKind, jump?: { id: string; time: number; index: number }) => Promise<void>;
  loadMore: () => Promise<void>;
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
  kind: 'photo',
  hasMore: false,
  loadingMore: false,
  trashed: new Set(),

  load: async (kind, jump) => {
    // El store es compartido entre Fotos y Videos: limpiamos los contadores para
    // no seguir mostrando los del tipo anterior mientras carga el nuevo.
    set({ loading: true, queue: [], index: 0, history: [], kind, total: 0, reviewed: 0 });

    const [total, trashedArr] = await Promise.all([getTotalCount(kind), trashIds()]);
    const trashed = new Set(trashedArr);

    let before: number | undefined;
    let reviewed = 0;

    if (jump) {
      before = jump.time + 1; // incluye el elemento al que saltaste
      reviewed = jump.index; // posición exacta que ya conocía la galería
    } else {
      const cp = await getCheckpoint(kind);
      if (cp) {
        before = cp.time;
        reviewed = cp.count ?? 0;
      }
    }

    const page = await queryMediaPage(kind, { before, first: PAGE });
    let queue = page.items.filter((m) => !trashed.has(m.id));
    if (jump) {
      const i = queue.findIndex((m) => m.id === jump.id);
      if (i > 0) queue = queue.slice(i);
    }

    set({
      loading: false,
      queue,
      index: 0,
      total,
      reviewed,
      history: [],
      cursor: page.cursor,
      hasMore: page.hasMore,
      loadingMore: false,
      trashed,
    });
  },

  loadMore: async () => {
    const s = get();
    if (s.loadingMore || !s.hasMore || s.queue.length - s.index > LOAD_AHEAD) return;
    set({ loadingMore: true });
    const page = await queryMediaPage(s.kind, { after: s.cursor, first: PAGE });
    const cur = get();
    const seen = new Set(cur.queue.map((q) => q.id));
    const fresh = page.items.filter((m) => !cur.trashed.has(m.id) && !seen.has(m.id));
    set({
      queue: [...cur.queue, ...fresh],
      cursor: page.cursor,
      hasMore: page.hasMore,
      loadingMore: false,
    });
  },

  swipeRight: () => {
    const { queue, index } = get();
    const item = queue[index];
    if (!item) return;
    const reviewed = get().reviewed + 1;
    saveCheckpoint(item.kind, { id: item.id, time: item.timeMs, count: reviewed });
    set((s) => ({
      history: [...s.history, { item, kind: 'kept' }],
      index: s.index + 1,
      reviewed,
    }));
    get().loadMore();
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
      dateAdded: Math.round(item.timeMs / 1000),
      trashedAt: Date.now(),
    });
    const reviewed = get().reviewed + 1;
    saveCheckpoint(item.kind, { id: item.id, time: item.timeMs, count: reviewed });
    set((s) => ({
      history: [...s.history, { item, kind: 'trashed' }],
      index: s.index + 1,
      reviewed,
      trashed: new Set(s.trashed).add(item.id),
    }));
    get().loadMore();
  },

  undo: () => {
    const { history, queue, index, reviewed } = get();
    if (history.length === 0) return;
    const last = history[history.length - 1];
    if (last.kind === 'trashed') trashRemove([last.item.id]);

    const newIndex = Math.max(0, index - 1);
    const newReviewed = Math.max(0, reviewed - 1);
    // Retrocede también el checkpoint guardado, si no al reabrir la app
    // el contador quedaría uno adelante.
    const prev = queue[newIndex - 1];
    if (prev) saveCheckpoint(prev.kind, { id: prev.id, time: prev.timeMs, count: newReviewed });

    set((s) => {
      const trashed = new Set(s.trashed);
      trashed.delete(last.item.id);
      return {
        history: s.history.slice(0, -1),
        index: newIndex,
        reviewed: newReviewed,
        trashed,
      };
    });
  },
}));
