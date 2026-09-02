import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeContext';
import { Indigo, Semantic, radius } from '@/theme/tokens';
import { useTrashStore } from '@/store/useTrashStore';

export default function Home() {
  const { colors, isDark, toggle } = useTheme();
  const router = useRouter();
  const items = useTrashStore((s) => s.items);
  const refresh = useTrashStore((s) => s.refresh);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  return (
    <LinearGradient colors={[colors.background, colors.backgroundEnd]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topRow}>
            <View>
              <Text style={[styles.brand, { color: colors.primary }]}>SwipeClean</Text>
              <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>
                Organiza tu galería con un desliz
              </Text>
            </View>
            <Pressable onPress={toggle} hitSlop={12}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={24}
                color={isDark ? Semantic.amber : colors.primary}
              />
            </Pressable>
          </View>

          <View style={[styles.banner, { borderColor: Semantic.amber + '33' }]}>
            <Ionicons name="time-outline" size={18} color={Semantic.amber} />
            <Text style={[styles.bannerText, { color: colors.onSurface }]}>
              Cálculo de espacio: función próximamente
            </Text>
          </View>

          <OptionCard
            icon="image-outline"
            grad={[Indigo[600], Indigo[400]]}
            title="Fotos"
            subtitle="Desliza para revisar y eliminar las fotos que ya no necesitas"
            footer="Comenzar"
            onPress={() => router.push('/swipe/photo')}
          />
          <OptionCard
            icon="videocam-outline"
            grad={[Semantic.amber, Semantic.amberLight]}
            title="Videos"
            subtitle="Desliza para revisar y eliminar los videos que ya no necesitas"
            footer="Comenzar"
            onPress={() => router.push('/swipe/video')}
          />
          <OptionCard
            icon="trash-outline"
            grad={[Semantic.danger, Semantic.dangerLight]}
            title="Papelera"
            subtitle="Archivos esperando ser eliminados permanentemente"
            footer={`${items.length} elementos`}
            onPress={() => router.push('/trash')}
          />
        </ScrollView>

        <View style={[styles.tabBar, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Tab icon="home" label="Inicio" active />
          <Tab icon="bar-chart" label="Estadísticas" onPress={() => router.push('/stats')} />
          <Tab icon="settings" label="Ajustes" onPress={() => router.push('/settings')} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function OptionCard({
  icon,
  grad,
  title,
  subtitle,
  footer,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  grad: [string, string];
  title: string;
  subtitle: string;
  footer: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <LinearGradient colors={grad} style={styles.cardIcon}>
        <Ionicons name={icon} size={24} color="#fff" />
      </LinearGradient>
      <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{title}</Text>
      <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>{subtitle}</Text>
      <View style={[styles.divider, { backgroundColor: colors.onSurface + '14' }]} />
      <View style={styles.cardFooter}>
        <Text style={[styles.cardFooterText, { color: colors.onSurfaceVariant }]}>{footer}</Text>
        <LinearGradient colors={[Indigo[600], Indigo[400]]} style={styles.cardArrow}>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </LinearGradient>
      </View>
    </Pressable>
  );
}

function Tab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const color = active ? colors.primary : colors.onSurfaceVariant;
  return (
    <Pressable style={styles.tab} onPress={onPress} disabled={active}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingVertical: 16, gap: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  brand: { fontSize: 32, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: 2 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerText: { fontSize: 14, flex: 1 },
  card: { borderRadius: radius.xl, borderWidth: 1, padding: 18, gap: 6 },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardSub: { fontSize: 14 },
  divider: { height: 1, marginVertical: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardFooterText: { fontSize: 13 },
  cardArrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 11 },
});
