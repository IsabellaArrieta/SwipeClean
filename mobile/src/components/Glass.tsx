import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/theme/ThemeContext';

// Superficie de cristal: un velo translúcido con borde claro, opcionalmente
// sobre un desenfoque real del fondo.
//
// Sobre `blur` en Android: el desenfoque real de expo-blur (`dimezisBlurView`)
// está marcado como experimental y redibuja el árbol de vistas dentro de su
// propio bitmap, así que además de devolver un lavado plano —en vez de dejar
// reconocer lo que hay detrás— arrastra el contenido que va encima y lo deja
// borroso. Para superficies con texto conviene `blur={false}`: queda
// translúcida de verdad y las letras nítidas. En iOS el desenfoque es nativo
// y no tiene ese problema.
export function Glass({
  children,
  style,
  radius = 28,
  intensity = 60,
  tintColor,
  borderColor,
  blur = true,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  intensity?: number;
  /** velo de color sobre el desenfoque (usa rgba) */
  tintColor?: string;
  borderColor?: string;
  /** desenfoque real del fondo; ver nota de arriba antes de activarlo con texto */
  blur?: boolean;
}) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: radius,
          borderColor: borderColor ?? (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.75)'),
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        experimentalBlurMethod={blur && Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        blurReductionFactor={1}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {tintColor && <View style={[styles.veil, { backgroundColor: tintColor }]} pointerEvents="none" />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, overflow: 'hidden' },
  veil: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
