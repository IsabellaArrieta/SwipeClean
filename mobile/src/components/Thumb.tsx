import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { Semantic, radius } from '@/theme/tokens';
import type { MediaKind } from '@/lib/media';

// Miniaturas de video ya generadas (fallback cuando expo-image no puede sacar el frame).
const videoThumbCache = new Map<string, string>();

function Thumb({
  uri,
  kind,
  size,
  selected,
  onPress,
}: {
  uri: string;
  kind: MediaKind;
  size: number;
  selected: boolean;
  onPress: () => void;
}) {
  // expo-image (Glide en Android) saca el frame de un video local directamente.
  // Solo si eso falla generamos la miniatura con expo-video-thumbnails.
  const [src, setSrc] = useState<string>(() => videoThumbCache.get(uri) ?? uri);

  const onError = () => {
    if (kind !== 'video' || src !== uri || uri.startsWith('http')) return;
    VideoThumbnails.getThumbnailAsync(uri, { time: 800, quality: 0.3 })
      .then((r) => {
        videoThumbCache.set(uri, r.uri);
        setSrc(r.uri);
      })
      .catch(() => {});
  };

  return (
    <Pressable style={[styles.cell, { width: size, height: size }]} onPress={onPress}>
      <View style={styles.inner}>
        <Image
          source={{ uri: src }}
          style={styles.img}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority="low"
          transition={80}
          recyclingKey={uri}
          placeholder={{ blurhash: 'L6PZfSjE.AyE_3t7t7R**0o#DgR4' }}
          placeholderContentFit="cover"
          onError={onError}
        />
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
  cell: { padding: 3 },
  inner: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  img: { flex: 1 },
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
