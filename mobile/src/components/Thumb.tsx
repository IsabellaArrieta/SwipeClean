import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { Semantic, radius } from '@/theme/tokens';
import type { MediaKind } from '@/lib/media';

// Cache de miniaturas de video ya generadas (uri video -> uri jpg).
const videoThumbCache = new Map<string, string>();

function Thumb({
  uri,
  kind,
  selected,
  onPress,
}: {
  uri: string;
  kind: MediaKind;
  selected: boolean;
  onPress: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(
    kind === 'video' ? (videoThumbCache.get(uri) ?? null) : uri,
  );

  useEffect(() => {
    if (kind !== 'video' || videoThumbCache.has(uri)) return;
    let alive = true;
    VideoThumbnails.getThumbnailAsync(uri, { time: 1000, quality: 0.4 })
      .then((r) => {
        videoThumbCache.set(uri, r.uri);
        if (alive) setThumb(r.uri);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [uri, kind]);

  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <View style={styles.inner}>
        {thumb ? (
          <Image
            source={{ uri: thumb }}
            style={styles.img}
            contentFit="cover"
            transition={120}
            cachePolicy="memory-disk"
            recyclingKey={uri}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
        {kind === 'video' && (
          <View style={styles.playBadge}>
            <Ionicons name="play" size={12} color="#fff" />
          </View>
        )}
        {selected && (
          <>
            <View style={styles.dim} />
            <View style={styles.check}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

export default memo(Thumb);
export { Thumb };

const styles = StyleSheet.create({
  cell: { width: '33.333%', aspectRatio: 1, padding: 4 },
  inner: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  img: { flex: 1 },
  placeholder: { flex: 1, backgroundColor: 'rgba(99,102,241,0.1)' },
  playBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Semantic.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
