import { type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Indigo, Semantic, radius } from '@/theme/tokens';

const THRESHOLD = 120;

type Props = {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  children: ReactNode;
};

// Card arrastrable estilo Tinder. Derecha = se queda, izquierda = a papelera.
// El fondo y el borde cambian de color mientras arrastras. Portado de ui/components/SwipeCard.kt.
export function SwipeCard({ onSwipeRight, onSwipeLeft, children }: Props) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const gone = useSharedValue(0); // dirección de salida: -1 izq, 1 der

  const fly = (dir: 1 | -1, cb: () => void) => {
    'worklet';
    gone.value = dir;
    x.value = withTiming(dir * width * 1.5, { duration: 220 }, () => {
      runOnJS(cb)();
      // reset para la siguiente card
      x.value = 0;
      y.value = 0;
      gone.value = 0;
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY * 0.2;
    })
    .onEnd(() => {
      if (x.value > THRESHOLD) fly(1, onSwipeRight);
      else if (x.value < -THRESHOLD) fly(-1, onSwipeLeft);
      else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const t = interpolate(x.value, [-THRESHOLD, 0, THRESHOLD], [-1, 0, 1], 'clamp');
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${interpolate(x.value, [-width, width], [-15, 15], 'clamp')}deg` },
      ],
      backgroundColor: interpolateColor(
        t,
        [-1, 0, 1],
        ['#FEE2E2', '#E0E7FF', '#DCFCE7'],
      ),
      borderColor: interpolateColor(
        t,
        [-1, 0, 1],
        [Semantic.danger, Indigo[600], Semantic.success],
      ),
    };
  });

  const keepBadge = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, 80], [0, 1], 'clamp'),
  }));
  const goBadge = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-80, -20], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        {children}
        <Animated.View style={[styles.badge, styles.badgeLeft, keepBadge]}>
          <Text style={styles.badgeText}>SE QUEDA</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.badgeRight, { backgroundColor: Semantic.danger }, goBadge]}>
          <Text style={styles.badgeText}>SE VA</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '90%',
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: Indigo[600],
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: Semantic.success,
  },
  badgeLeft: { left: 16 },
  badgeRight: { right: 16 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

// Wrapper contenido de la card con esquinas redondeadas.
export function CardMedia({ children }: { children: ReactNode }) {
  return <View style={mediaStyles.fill}>{children}</View>;
}
const mediaStyles = StyleSheet.create({ fill: { flex: 1 } });
