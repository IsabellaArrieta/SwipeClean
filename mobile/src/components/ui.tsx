import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeContext';
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
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary + (disabled ? '0D' : '1A'),
      }}
    >
      <Ionicons name={name} size={20} color={disabled ? colors.primary + '66' : colors.primary} />
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
  const bg =
    variant === 'primary' ? colors.primary : variant === 'danger' ? Semantic.danger : 'transparent';
  const fg = filled ? '#fff' : colors.primary;
  const opacity = disabled ? 0.4 : 1;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.pill,
        {
          backgroundColor: bg,
          borderWidth: filled ? 0 : 1.5,
          borderColor: colors.primary + '4D',
          opacity,
        },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={14} color={fg} style={{ marginRight: 6 }} />}
      <Text style={{ color: fg, fontWeight: '700', fontSize: 13 }}>{label}</Text>
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
