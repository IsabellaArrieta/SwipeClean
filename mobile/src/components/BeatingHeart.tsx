import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Corazoncito con latido suave + una pizca de balanceo.
export function BeatingHeart({ size = 16, color }: { size?: number; color: string }) {
  const beat = useSharedValue(1);
  const tilt = useSharedValue(0);

  useEffect(() => {
    beat.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 220, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 260, easing: Easing.in(Easing.quad) }),
        withTiming(1.12, { duration: 180, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 240, easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
    );
    tilt.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 220 }),
        withTiming(8, { duration: 260 }),
        withTiming(0, { duration: 220 }),
        withTiming(0, { duration: 1100 }),
      ),
      -1,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: beat.value }, { rotate: `${tilt.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name="heart" size={size} color={color} />
    </Animated.View>
  );
}
