import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Semantic, radius } from '@/theme/tokens';
import type { MediaKind } from '@/lib/media';
import { cachedPoster, getPoster } from '@/lib/videoThumb';

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
  const [thumb, setThumb] = useState<string | null>(() =>
    kind === 'video' ? (cachedPoster(uri) ?? null) : uri,
  );

  useEffect(() => {
    if (kind !== 'video') {
      setThumb(uri);
      return;
    }
    const cached = cachedPoster(uri);
    if (cached !== undefined) {
      setThumb(cached);
      return;
    }
    let alive = true;
    setThumb(null);
    getPoster(uri).then((t) => alive && setThumb(t));
    return () => {
      alive = false;
    };
  }, [uri, kind]);

  return (
    <Pressable style={[styles.cell, { width: size, height: size }]} onPress={onPress}>
      <View style={styles.inner}>
        {thumb ? (
          <Image
            source={{ uri: thumb }}
            style={styles.img}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="low"
            transition={120}
            recyclingKey={uri}
          />
        ) : (
          <View style={styles.placeholder}>
            {kind === 'video' && <Ionicons name="videocam" size={22} color="rgba(99,102,241,0.4)" />}
          </View>
        )}
        {kind === 'video' && thumb && (
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
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
