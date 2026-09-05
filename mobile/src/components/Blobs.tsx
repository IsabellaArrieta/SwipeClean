import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Indigo, Rose, Semantic } from '@/theme/tokens';
import { BLOB_GLOW } from '@/components/blobAsset';

const AnimatedImage = Animated.createAnimatedComponent(Image);

// Manchas de fondo tipo "aurora": un glow radial real (PNG con gradiente
// blanco -> transparente, ver scripts/gen-blob.mjs) teñido por color, con una
// deriva lenta y continua para que se sientan vivas detrás del contenido.
function Blob({
  color,
  size,
  opacity,
  top,
  left,
  right,
  bottom,
  driftX = 24,
  driftY = 18,
  duration = 9000,
}: {
  color: string;
  size: number;
  opacity: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  driftX?: number;
  driftY?: number;
  duration?: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration }), withTiming(0, { duration })), -1, false);
  }, [t, duration]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: (t.value - 0.5) * 2 * driftX },
      { translateY: (t.value - 0.5) * 2 * driftY },
    ],
  }));

  return (
    <AnimatedImage
      source={BLOB_GLOW}
      tintColor={color}
      contentFit="cover"
      style={[{ position: 'absolute', width: size, height: size, top, left, right, bottom, opacity }, style]}
    />
  );
}

export function Blobs({ isDark }: { isDark: boolean }) {
  const o = isDark ? 0.8 : 1;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Blob color={Rose[600]} size={520} opacity={0.95 * o} top={-190} right={-170} duration={10000} />
      <Blob color={Indigo[400]} size={470} opacity={0.8 * o} top={300} left={-200} duration={12500} />
      <Blob color={Semantic.amberLight} size={450} opacity={0.75 * o} bottom={-150} right={-150} duration={9500} />
    </View>
  );
}
