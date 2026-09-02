import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { cachedPoster, getPoster } from '@/lib/videoThumb';

// Frame estático de un video (para la carta de atrás mientras se desliza).
export function VideoPoster({ uri }: { uri: string }) {
  const [poster, setPoster] = useState<string | null>(() => cachedPoster(uri) ?? null);

  useEffect(() => {
    const cached = cachedPoster(uri);
    if (cached !== undefined) {
      setPoster(cached);
      return;
    }
    let alive = true;
    setPoster(null); // evita mostrar el frame del video anterior
    getPoster(uri).then((p) => {
      if (alive) setPoster(p);
    });
    return () => {
      alive = false;
    };
  }, [uri]);

  return (
    <View style={styles.fill}>
      {poster ? (
        <>
          <Image
            source={{ uri: poster }}
            style={styles.blurBg}
            contentFit="cover"
            blurRadius={90}
            transition={0}
          />
          <Image source={{ uri: poster }} style={styles.fill} contentFit="contain" transition={0} />
        </>
      ) : (
        <View style={styles.center}>
          <Ionicons name="videocam" size={40} color="rgba(99,102,241,0.35)" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%' },
  blurBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
