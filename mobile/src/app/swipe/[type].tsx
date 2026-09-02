import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CircleIconButton, PillButton } from '@/components/ui';
import { SwipeCard } from '@/components/SwipeCard';
import { VideoCard } from '@/components/VideoCard';
import { useTheme } from '@/theme/ThemeContext';
import { Indigo, Semantic, radius } from '@/theme/tokens';
import { ensurePermission, isDemoMode, requestOrOpenSettings, type MediaKind } from '@/lib/media';
import { getPoster } from '@/lib/videoThumb';
import { VideoPoster } from '@/components/VideoPoster';
import { useSwipeStore } from '@/store/useSwipeStore';

export default function SwipeScreen() {
  const params = useLocalSearchParams<{ type: MediaKind; jump?: string; t?: string }>();
  const kind: MediaKind = params.type === 'video' ? 'video' : 'photo';
  const label = kind === 'photo' ? 'Fotos' : 'Videos';
  const router = useRouter();
  const { colors } = useTheme();

  const [ready, setReady] = useState(false);
  const {
    loading,
    queue,
    index,
    total,
    reviewed,
    history,
    hasMore,
    loadingMore,
    load,
    swipeLeft,
    swipeRight,
    undo,
  } = useSwipeStore();

  const reload = useCallback(
    () => load(kind, params.jump ?? null, params.t ? Number(params.t) : null),
    [load, kind, params.jump, params.t],
  );

  useEffect(() => {
    ensurePermission().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) reload();
  }, [ready, reload]);

  const onBack = useCallback(() => router.back(), [router]);

  // Precarga lo que sigue para que aparezca al instante al deslizar.
  useEffect(() => {
    const upcoming = queue.slice(index + 1, index + 4);
    if (kind === 'photo') {
      Image.prefetch(
        upcoming.map((m) => m.uri),
        { cachePolicy: 'memory-disk' },
      );
    } else {
      upcoming.forEach((m) => getPoster(m.uri));
    }
  }, [queue, index, kind]);

  const waitingMore = index >= queue.length && (hasMore || loadingMore);
  const done = !loading && index >= queue.length && !hasMore && !loadingMore;
  const current = queue[index];
  const next = queue[index + 1];
  const progress = total === 0 ? 0 : reviewed / total;

  const renderMedia = (uri: string) =>
    kind === 'video' ? (
      <VideoCard uri={uri} />
    ) : (
      <Image
        source={{ uri }}
        style={styles.media}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
      />
    );

  return (
    <LinearGradient colors={[colors.background, colors.surface]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <CircleIconButton name="arrow-back" onPress={onBack} />
          <Text style={[styles.title, { color: colors.onSurface }]}>{label}</Text>
          <CircleIconButton name="images-outline" onPress={() => router.push(`/gallery/${kind}`)} />
          <CircleIconButton name="arrow-undo" onPress={undo} disabled={history.length === 0} />
        </View>

        {!loading && isDemoMode() && (
          <Pressable
            style={styles.demo}
            onPress={() => {
              requestOrOpenSettings().then((granted) => {
                if (granted) reload();
              });
            }}
          >
            <Ionicons name="images-outline" size={14} color={Semantic.amber} />
            <Text style={[styles.demoText, { color: Semantic.amber }]}>
              Modo demo — toca para dar acceso a tu galería
            </Text>
          </Pressable>
        )}

        <View style={styles.progressWrap}>
          <Text style={[styles.progressText, { color: colors.primary }]}>
            Revisaste {reviewed} de {total}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.primary + '1A' }]}>
            <LinearGradient
              colors={[Indigo[600], Indigo[400]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.cardArea}>
          {loading || waitingMore ? (
            <ActivityIndicator color={colors.primary} />
          ) : done ? (
            <Text style={[styles.title, { color: colors.onSurface, textAlign: 'center' }]}>
              {total === 0
                ? `No hay ${label.toLowerCase()} para revisar`
                : `¡Terminaste! No quedan ${label.toLowerCase()} por revisar`}
            </Text>
          ) : (
            <SwipeCard
              frontKey={current.id}
              front={renderMedia(current.uri)}
              back={
                next
                  ? kind === 'photo'
                    ? renderMedia(next.uri)
                    : <VideoPoster uri={next.uri} />
                  : null
              }
              onSwipeRight={swipeRight}
              onSwipeLeft={swipeLeft}
            />
          )}
        </View>

        {!loading && !done && !waitingMore && (
          <View style={styles.actions}>
            <PillButton label="✕  A papelera" variant="danger" onPress={swipeLeft} style={styles.actionBtn} />
            <PillButton label="✓  Se queda" variant="primary" onPress={swipeRight} style={styles.actionBtn} />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '600' },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  demoText: { fontSize: 12, fontWeight: '600' },
  progressWrap: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  progressText: { fontSize: 13, fontWeight: '700' },
  track: { height: 4, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: 4, borderRadius: radius.pill },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  media: { flex: 1, width: '100%' },
  actions: { flexDirection: 'row', gap: 14, paddingHorizontal: 24, paddingBottom: 16 },
  actionBtn: { flex: 1, height: 52, borderRadius: radius.xl },
});
