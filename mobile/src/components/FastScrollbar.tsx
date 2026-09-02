import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeContext';

const THUMB = 56;

// Barra de desplazamiento rápida con burbuja de contador (portado del FastScrollBar de Compose).
export function FastScrollbar({
  count,
  columns,
  scrollY,
  maxScroll,
  trackHeight,
  onScrollToOffset,
}: {
  count: number;
  columns: number;
  scrollY: SharedValue<number>;
  maxScroll: number;
  trackHeight: number;
  onScrollToOffset: (offset: number) => void;
}) {
  const { colors } = useTheme();
  const [dragging, setDragging] = useState(false);
  const [label, setLabel] = useState('1');
  const y = useSharedValue(0);
  const range = Math.max(1, trackHeight - THUMB);

  // Mueve el thumb según el scroll real de la lista.
  useAnimatedReaction(
    () => (maxScroll > 0 ? scrollY.value / maxScroll : 0),
    (frac) => {
      if (!dragging) y.value = Math.min(1, Math.max(0, frac)) * range;
    },
    [range, maxScroll, dragging],
  );

  const setFromFraction = (frac: number) => {
    const f = Math.min(1, Math.max(0, frac));
    onScrollToOffset(f * maxScroll);
    const approx = Math.min(count, Math.round(f * (count - 1)) + 1);
    setLabel(`${approx}`);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(setDragging)(true);
      y.value = Math.min(range, Math.max(0, e.y - THUMB / 2));
      runOnJS(setFromFraction)(y.value / range);
    })
    .onUpdate((e) => {
      y.value = Math.min(range, Math.max(0, e.y - THUMB / 2));
      runOnJS(setFromFraction)(y.value / range);
    })
    .onFinalize(() => runOnJS(setDragging)(false));

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  if (count <= columns * 4) return null; // lista corta: no hace falta

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.hit}>
        <View style={[styles.track, { backgroundColor: colors.primary + '22' }]} />
        <Animated.View
          style={[styles.thumb, { backgroundColor: colors.primary }, thumbStyle]}
        />
        {dragging && (
          <Animated.View style={[styles.bubble, bubbleStyle]}>
            <Text style={styles.bubbleText}>
              {label}/{count}
            </Text>
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 28, alignItems: 'center' },
  track: { position: 'absolute', top: 0, bottom: 0, width: 3, borderRadius: 2 },
  thumb: { position: 'absolute', top: 0, width: 5, height: THUMB, borderRadius: 3 },
  bubble: {
    position: 'absolute',
    right: 24,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bubbleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
