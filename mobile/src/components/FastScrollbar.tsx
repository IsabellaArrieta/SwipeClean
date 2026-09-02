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

// Franja invisible en el borde derecho para desplazamiento rápido, con burbuja
// que muestra el número de elemento (portado del FastScrollBar de Compose).
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
  const [dragging, setDragging] = useState(false);
  const [label, setLabel] = useState('1');
  const y = useSharedValue(0);

  useAnimatedReaction(
    () => (maxScroll > 0 ? Math.min(1, Math.max(0, scrollY.value / maxScroll)) : 0),
    (frac) => {
      if (!dragging) y.value = frac * trackHeight;
    },
    [trackHeight, maxScroll, dragging],
  );

  const scrub = (py: number) => {
    const f = Math.min(1, Math.max(0, py / trackHeight));
    onScrollToOffset(f * maxScroll);
    setLabel(`${Math.min(count, Math.round(f * (count - 1)) + 1)}`);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(setDragging)(true);
      y.value = e.y;
      runOnJS(scrub)(e.y);
    })
    .onUpdate((e) => {
      y.value = Math.min(trackHeight, Math.max(0, e.y));
      runOnJS(scrub)(e.y);
    })
    .onFinalize(() => runOnJS(setDragging)(false));

  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value - 16 }] }));

  if (count <= columns * 6) return null;

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.hit}>
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
  hit: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 32 },
  bubble: {
    position: 'absolute',
    right: 28,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bubbleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
