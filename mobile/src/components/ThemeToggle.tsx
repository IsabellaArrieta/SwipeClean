import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeContext';
import { Semantic } from '@/theme/tokens';

// Botón sol/luna con transición de semirrotación fluida.
export function ThemeToggle({ size = 24 }: { size?: number }) {
  const { isDark, colors, toggle } = useTheme();
  const p = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    p.value = withTiming(isDark ? 1 : 0, { duration: 480, easing: Easing.inOut(Easing.cubic) });
  }, [isDark]);

  const scale = useSharedValue(1);
  const onPress = () => {
    scale.value = withSequence(
      withTiming(0.82, { duration: 110 }),
      withTiming(1, { duration: 260, easing: Easing.out(Easing.back(2)) }),
    );
    toggle();
  };

  const wrap = useAnimatedStyle(() => ({
    // Gira media vuelta hacia cada lado pero termina recto (0° o 360°).
    transform: [
      { rotate: `${interpolate(p.value, [0, 0.5, 1], [0, 180, 360])}deg` },
      { scale: scale.value },
    ],
  }));
  const sun = useAnimatedStyle(() => ({ opacity: 1 - p.value }));
  const moon = useAnimatedStyle(() => ({ opacity: p.value }));

  return (
    <Pressable onPress={onPress} hitSlop={14}>
      <Animated.View style={[styles.box, { width: size + 8, height: size + 8 }, wrap]}>
        <Animated.View style={[styles.layer, sun]}>
          <Ionicons name="sunny" size={size} color={Semantic.amber} />
        </Animated.View>
        <Animated.View style={[styles.layer, moon]}>
          <Ionicons name="moon" size={size} color={colors.primary} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  layer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
