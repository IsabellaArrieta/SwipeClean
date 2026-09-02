import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CircleIconButton, PillButton } from '@/components/ui';
import Thumb from '@/components/Thumb';
import { FastScrollbar } from '@/components/FastScrollbar';
import { useTheme } from '@/theme/ThemeContext';
import {
  getTotalCount,
  isDemoMode,
  queryMediaPage,
  requestOrOpenSettings,
  type Media,
  type MediaKind,
} from '@/lib/media';
import { trashIds } from '@/lib/db';
import { clearCheckpoint } from '@/lib/storage';
import { useTrashStore } from '@/store/useTrashStore';
import { Semantic } from '@/theme/tokens';

const COLS = 3;
const FIRST_PAGE = 150;
const BG_PAGE = 1000;

export default function Gallery() {
  const params = useLocalSearchParams<{ type: MediaKind }>();
  const kind: MediaKind = params.type === 'video' ? 'video' : 'photo';
  const title = kind === 'photo' ? 'Galería de fotos' : 'Galería de videos';
  const noun = kind === 'photo' ? 'fotos' : 'videos';
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const sendToTrash = useTrashStore((s) => s.sendToTrash);

  const rowH = (width - 8) / COLS;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Media[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [firstVisible, setFirstVisible] = useState(0);
  const listRef = useRef<FlatList<Media>>(null);
  const runId = useRef(0);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const i = viewableItems[0]?.index;
    if (i != null) setFirstVisible(i);
  }).current;

  const reload = useCallback(async () => {
    const myRun = ++runId.current;
    setLoading(true);
    setItems([]);
    setSelected(new Set());

    const [count, trashedArr] = await Promise.all([getTotalCount(kind), trashIds()]);
    const trashed = new Set(trashedArr);
    if (myRun !== runId.current) return;
    setTotal(count);

    // Primera página: se muestra ya.
    let page = await queryMediaPage(kind, { first: FIRST_PAGE });
    if (myRun !== runId.current) return;
    let acc = page.items.filter((m) => !trashed.has(m.id));
    setItems(acc);
    setLoading(false);

    // Resto: en segundo plano, sin bloquear la UI.
    while (page.hasMore && myRun === runId.current) {
      await new Promise((r) => setTimeout(r, 0));
      page = await queryMediaPage(kind, { after: page.cursor, first: BG_PAGE });
      if (myRun !== runId.current) return;
      acc = acc.concat(page.items.filter((m) => !trashed.has(m.id)));
      setItems(acc);
    }
  }, [kind]);

  useEffect(() => {
    reload();
    return () => {
      runId.current++;
    };
  }, [reload]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onSendToTrash = async () => {
    const rows = items.filter((m) => selected.has(m.id)).map((m) => ({
      id: m.id,
      uri: m.uri,
      kind: m.kind,
      name: m.name,
      dateAdded: Math.round(m.timeMs / 1000),
      trashedAt: Date.now(),
    }));
    await sendToTrash(rows);
    const gone = new Set(rows.map((r) => r.id));
    setItems((prev) => prev.filter((m) => !gone.has(m.id)));
    setSelected(new Set());
  };

  const onJump = () => {
    const id = [...selected][0];
    const m = items.find((x) => x.id === id);
    if (m) router.replace(`/swipe/${kind}?jump=${encodeURIComponent(m.id)}&t=${m.timeMs}`);
  };

  const onReset = async () => {
    await clearCheckpoint(kind);
    router.dismissAll();
  };

  const progress = total > 1 ? firstVisible / (total - 1) : 0;
  const seek = (f: number) => {
    const target = Math.min(items.length - 1, Math.max(0, Math.round(f * (total - 1))));
    listRef.current?.scrollToIndex({ index: target, animated: false });
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <CircleIconButton name="arrow-back" onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
          {title} ({total})
        </Text>
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/trash')}>
          Papelera
        </Text>
      </View>

      {!loading && isDemoMode() && (
        <Text
          style={[styles.demo, { color: Semantic.amber }]}
          onPress={() => {
            requestOrOpenSettings().then((g) => {
              if (g) reload();
            });
          }}
        >
          Modo demo — toca para dar acceso a tu galería
        </Text>
      )}

      {!loading && total > 0 && (
        <View style={styles.progressRow}>
          <View style={[styles.scrollTrack, { backgroundColor: colors.primary + '1A' }]}>
            <View
              style={[
                styles.scrollFill,
                { backgroundColor: colors.primary, width: `${Math.min(1, progress) * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.counter, { color: colors.onSurfaceVariant }]}>
            {Math.min(total, firstVisible + 1)} / {total} {noun}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.onSurfaceVariant }}>No hay elementos pendientes por revisar</Text>
        </View>
      ) : (
        <View style={styles.flex}>
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(m) => m.id}
            numColumns={COLS}
            contentContainerStyle={{ padding: 4 }}
            getItemLayout={(_, index) => ({
              length: rowH,
              offset: rowH * Math.floor(index / COLS),
              index,
            })}
            onViewableItemsChanged={onViewable}
            viewabilityConfig={{ itemVisiblePercentThreshold: 10 }}
            onScrollToIndexFailed={({ index }) =>
              setTimeout(() => listRef.current?.scrollToIndex({ index, animated: false }), 120)
            }
            removeClippedSubviews
            initialNumToRender={21}
            maxToRenderPerBatch={9}
            windowSize={5}
            renderItem={({ item }) => (
              <Thumb
                uri={item.uri}
                kind={item.kind}
                selected={selected.has(item.id)}
                onPress={() => toggle(item.id)}
              />
            )}
          />
          <FastScrollbar
            progress={progress}
            label={`${Math.min(total, firstVisible + 1)}`}
            count={total}
            onSeek={seek}
          />
        </View>
      )}

      <View style={[styles.footer, { borderColor: colors.border }]}>
        <View style={styles.rowGap}>
          <PillButton label="Saltar aquí" onPress={onJump} disabled={selected.size !== 1} style={styles.grow} />
          <PillButton
            label="A papelera"
            icon="trash-outline"
            variant="danger"
            onPress={onSendToTrash}
            disabled={selected.size === 0}
            style={styles.grow}
          />
        </View>
        <PillButton label="Empezar de nuevo" icon="refresh" onPress={onReset} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  title: { flex: 1, fontSize: 18, fontWeight: '600' },
  link: { fontSize: 13, fontWeight: '600' },
  demo: { fontSize: 12, textAlign: 'center', paddingBottom: 6, fontWeight: '600' },
  progressRow: { paddingHorizontal: 16, paddingBottom: 6, gap: 4 },
  scrollTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  scrollFill: { height: 3, borderRadius: 2 },
  counter: { fontSize: 11, textAlign: 'right' },
  footer: { borderTopWidth: 1, padding: 12, gap: 8 },
  rowGap: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
});
