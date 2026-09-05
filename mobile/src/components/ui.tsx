import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeContext';
import { Glass } from '@/components/Glass';
import { Semantic, Indigo, radius } from '@/theme/tokens';

export function CircleIconButton({
  name,
  onPress,
  disabled,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Glass
        radius={20}
        intensity={disabled ? 15 : 25}
        tintColor={colors.primary + (disabled ? '08' : '12')}
        style={styles.circleBtn}
      >
        <Ionicons name={name} size={20} color={disabled ? colors.primary + '66' : colors.primary} />
      </Glass>
    </Pressable>
  );
}

export function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      {onBack && <CircleIconButton name="arrow-back" onPress={onBack} />}
      <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

type Variant = 'primary' | 'secondary' | 'danger';

export function PillButton({
  label,
  onPress,
  variant = 'secondary',
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const filled = variant === 'primary' || variant === 'danger';
  const fg = filled ? '#fff' : colors.primary;
  const opacity = disabled ? 0.4 : 1;
  const content = (
    <>
      {icon && <Ionicons name={icon} size={14} color={fg} style={{ marginRight: 6 }} />}
      <Text style={{ color: fg, fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </>
  );

  // Velo translúcido: en los rellenos ~55% del color, suficiente para que el
  // texto blanco se lea pero dejando ver el fondo por detrás.
  const tint = filled
    ? (variant === 'primary' ? colors.primary : Semantic.danger) + '8C'
    : colors.primary + '0F';

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ opacity }, style]}>
      <Glass
        radius={radius.md}
        intensity={filled ? 35 : 22}
        tintColor={tint}
        borderColor={filled ? '#ffffff59' : colors.primary + '40'}
        style={styles.pill}
      >
        {content}
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  title: { flex: 1, fontSize: 18, fontWeight: '600' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  circleBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pill: {
    height: 40,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});

export { Indigo };
