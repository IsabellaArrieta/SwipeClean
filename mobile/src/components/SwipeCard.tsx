import { forwardRef, useEffect, useImperativeHandle, type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
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
  frontKey: string;
  front: ReactNode;
  back?: ReactNode | null;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
};

// Permite disparar el swipe desde fuera (los botones de abajo).
export type SwipeCardHandle = { swipe: (dir: 1 | -1) => void };

// Card arrastrable estilo Tinder con la siguiente carta detrás (no se desmonta
// al avanzar, así no hay parpadeo). Portado de ui/components/SwipeCard.kt.
export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { frontKey, front, back, onSwipeRight, onSwipeLeft },
  ref,
) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  // Al cambiar de elemento, la carta ya voló fuera de pantalla: la devolvemos
  // a su sitio sin animación (invisible) con el contenido nuevo ya montado.
  useEffect(() => {
    x.value = 0;
    y.value = 0;
  }, [frontKey]);

  const fly = (dir: 1 | -1, cb: () => void) => {
    'worklet';
    x.value = withTiming(dir * width * 1.5, { duration: 200 }, (done) => {
      if (done) runOnJS(cb)();
    });
    y.value = withTiming(y.value + 40, { duration: 200 });
  };

  // Misma animación que el gesto, pero lanzada desde los botones.
  useImperativeHandle(
    ref,
    () => ({
      swipe: (dir: 1 | -1) => {
        const cb = dir === 1 ? onSwipeRight : onSwipeLeft;
        x.value = withTiming(dir * width * 1.5, { duration: 260 }, (done) => {
          'worklet';
          if (done) runOnJS(cb)();
        });
        y.value = withTiming(y.value + 40, { duration: 260 });
      },
    }),
    [width, onSwipeRight, onSwipeLeft],
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY * 0.15;
    })
    .onEnd(() => {
      if (x.value > THRESHOLD) fly(1, onSwipeRight);
      else if (x.value < -THRESHOLD) fly(-1, onSwipeLeft);
      else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const frontStyle = useAnimatedStyle(() => {
    const t = interpolate(x.value, [-THRESHOLD, 0, THRESHOLD], [-1, 0, 1], 'clamp');
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${interpolate(x.value, [-width, width], [-14, 14], 'clamp')}deg` },
      ],
      backgroundColor: interpolateColor(t, [-1, 0, 1], ['#FEE2E2', '#E0E7FF', '#DCFCE7']),
      borderColor: interpolateColor(t, [-1, 0, 1], [Semantic.danger, Indigo[600], Semantic.success]),
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const p = interpolate(Math.abs(x.value), [0, THRESHOLD], [0, 1], 'clamp');
    return { transform: [{ scale: interpolate(p, [0, 1], [0.94, 1]) }], opacity: interpolate(p, [0, 1], [0.6, 1]) };
  });

  const keepBadge = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [20, 80], [0, 1], 'clamp') }));
  const goBadge = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-80, -20], [1, 0], 'clamp') }));

  return (
    <Animated.View style={styles.stack}>
      {back != null && (
        <Animated.View style={[styles.card, styles.behind, backStyle]} pointerEvents="none">
          {back}
        </Animated.View>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, frontStyle]}>
          {front}
          <Animated.View style={[styles.badge, styles.badgeLeft, keepBadge]}>
            <Text style={styles.badgeText}>SE QUEDA</Text>
          </Animated.View>
          <Animated.View
            style={[styles.badge, styles.badgeRight, { backgroundColor: Semantic.danger }, goBadge]}
          >
            <Text style={styles.badgeText}>SE VA</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  stack: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    width: '92%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Indigo[600],
    backgroundColor: '#E0E7FF',
    overflow: 'hidden',
    shadowColor: Indigo[600],
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  behind: {},
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
