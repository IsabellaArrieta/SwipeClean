import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/theme/ThemeContext';

// Superficie de cristal: desenfoque real del fondo + un velo de color encima y
// un borde claro que simula el brillo del vidrio.
// En Android hay que pedir `dimezisBlurView` explícitamente; por defecto
// expo-blur no desenfoca, solo pone un translúcido.
export function Glass({
  children,
  style,
  radius = 28,
  intensity = 60,
  tintColor,
  borderColor,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  intensity?: number;
  /** velo de color sobre el desenfoque (usa rgba) */
  tintColor?: string;
  borderColor?: string;
}) {
  const { isDark } = useTheme();

  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? 'dark' : 'light'}
      experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      blurReductionFactor={3}
      style={[
        styles.base,
        {
          borderRadius: radius,
          borderColor: borderColor ?? (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.75)'),
        },
        style,
      ]}
    >
      {tintColor && <View style={[styles.veil, { backgroundColor: tintColor }]} pointerEvents="none" />}
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, overflow: 'hidden' },
  veil: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
