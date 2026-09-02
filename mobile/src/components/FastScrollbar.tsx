import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useTheme } from '@/theme/ThemeContext';

const THUMB = 48;

// Franja de desplazamiento rápido en el borde derecho, con burbuja de contador.
export function FastScrollbar({
  progress,
  label,
  count,
  minCount = 30,
  onSeek,
}: {
  progress: number; // 0..1 posición actual
  label: string; // texto de la burbuja (ej. "45")
  count: number;
  minCount?: number;
  onSeek: (fraction: number) => void; // 0..1
}) {
  const { colors } = useTheme();
  const [h, setH] = useState(0);
  const [dragging, setDragging] = useState(false);

  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => {
      setDragging(true);
      onSeek(clamp(e.y / h));
    })
    .onUpdate((e) => onSeek(clamp(e.y / h)))
    .onFinalize(() => setDragging(false));

  if (count <= minCount) return null;

  const top = clamp(progress) * Math.max(0, h - THUMB);

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.hit} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
        <View
          style={[
            styles.thumb,
            { top, backgroundColor: colors.primary, width: dragging ? 6 : 4 },
          ]}
        />
        {dragging && (
          <View style={[styles.bubble, { top: Math.max(0, top - 6) }]}>
            <Text style={styles.bubbleText}>
              {label}/{count}
            </Text>
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', right: 0, top: 8, bottom: 8, width: 28, alignItems: 'flex-end' },
  thumb: { position: 'absolute', right: 3, height: THUMB, borderRadius: 3 },
  bubble: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bubbleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
