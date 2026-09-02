import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CircleIconButton, PillButton } from '@/components/ui';
import Thumb from '@/components/Thumb';
import { FastScrollbar } from '@/components/FastScrollbar';
import { useTheme } from '@/theme/ThemeContext';
import { queryMedia, isDemoMode, requestOrOpenSettings, type Media, type MediaKind } from '@/lib/media';
import { trashIds } from '@/lib/db';
import { clearCheckpoint, getCheckpoint } from '@/lib/storage';
import { useTrashStore } from '@/store/useTrashStore';
import { Semantic } from '@/theme/tokens';

const COLS = 3;
const AList = Animated.createAnimatedComponent(FlatList<Media>);

export default function Gallery() {
  const params = useLocalSearchParams<{ type: MediaKind }>();
  const kind: MediaKind = params.type === 'video' ? 'video' : 'photo';
  const title = kind === 'photo' ? 'Galería de fotos' : 'Galería de videos';
  const router = useRouter();
  const { colors } = useTheme();
  const sendToTrash = useTrashStore((s) => s.sendToTrash);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Media[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const listRef = useRef<FlatList<Media>>(null);
  const scrolled = useRef(false);

  const scrollY = useSharedValue(0);
  const [contentH, setContentH] = useState(0);
  const [viewH, setViewH] = useState(0);
  const maxScroll = Math.max(0, contentH - viewH);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const barStyle = useAnimatedStyle(() => ({
    width: `${maxScroll > 0 ? Math.min(1, Math.max(0, scrollY.value / maxScroll)) * 100 : 0}%`,
  }));

  const reload = useCallback(async () => {
    setLoading(true);
    const all = await queryMedia(kind);
    const trashed = new Set(await trashIds());
    const pending = all.filter((m) => !trashed.has(m.id));
    setItems(pending);
    setSelected(new Set());
    setLoading(false);

    const last = await getCheckpoint(kind);
    const idx = last ? pending.findIndex((m) => m.id === last) : 0;
    if (idx > 0 && !scrolled.current) {
      scrolled.current = true;
      requestAnimationFrame(() =>
        listRef.current?.scrollToIndex({ index: Math.floor(idx / COLS), animated: false }),
      );
    }
  }, [kind]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onSendToTrash = async () => {
    const rows = items.filter((m) => selected.has(m.id)).map((m) => ({ ...m, trashedAt: Date.now() }));
    await sendToTrash(rows);
    await reload();
  };

  const onJump = () => {
    const id = [...selected][0];
    if (id) router.replace(`/swipe/${kind}?jump=${encodeURIComponent(id)}`);
  };

  const onReset = async () => {
    await clearCheckpoint(kind);
    router.dismissAll();
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <CircleIconButton name="arrow-back" onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
          {title} ({items.length})
        </Text>
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/trash')}>
          Papelera
        </Text>
      </View>

      {!loading && isDemoMode() && (
        <Text
          style={[styles.demo, { color: Semantic.amber }]}
          onPress={() => {
            requestOrOpenSettings().then((granted) => {
              if (granted) reload();
            });
          }}
        >
          Modo demo — toca para dar acceso a tu galería
        </Text>
      )}

      {!loading && items.length > 0 && (
        <View style={[styles.scrollTrack, { backgroundColor: colors.primary + '1A' }]}>
          <Animated.View style={[styles.scrollFill, { backgroundColor: colors.primary }, barStyle]} />
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
        <View style={styles.flex} onLayout={(e) => setViewH(e.nativeEvent.layout.height)}>
          <AList
            ref={listRef as never}
            data={items}
            keyExtractor={(m) => m.id}
            numColumns={COLS}
            contentContainerStyle={{ padding: 4 }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(_w, h) => setContentH(h)}
            onScrollToIndexFailed={() => {}}
            removeClippedSubviews
            initialNumToRender={24}
            windowSize={7}
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
            count={items.length}
            columns={COLS}
            scrollY={scrollY}
            maxScroll={maxScroll}
            trackHeight={viewH}
            onScrollToOffset={(offset) => listRef.current?.scrollToOffset({ offset, animated: false })}
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
  scrollTrack: { height: 3, marginHorizontal: 16, marginBottom: 4, borderRadius: 2, overflow: 'hidden' },
  scrollFill: { height: 3, borderRadius: 2 },
  footer: { borderTopWidth: 1, padding: 12, gap: 8 },
  rowGap: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
});
