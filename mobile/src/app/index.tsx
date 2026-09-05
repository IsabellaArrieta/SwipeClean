import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeContext';
import { Indigo, Semantic, radius } from '@/theme/tokens';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Glass } from '@/components/Glass';
import { getCheckpoint } from '@/lib/storage';
import { getTotalCount } from '@/lib/media';
import { useTrashStore } from '@/store/useTrashStore';

// Sin Intl: en Hermes no siempre está disponible el formato por locale.
const miles = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function Home() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const items = useTrashStore((s) => s.items);
  const refresh = useTrashStore((s) => s.refresh);
  const [pending, setPending] = useState<{ photo: number; video: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
      Promise.all([
        getTotalCount('photo'),
        getTotalCount('video'),
        getCheckpoint('photo'),
        getCheckpoint('video'),
      ]).then(([tp, tv, cp, cv]) =>
        setPending({
          photo: Math.max(0, tp - (cp?.count ?? 0)),
          video: Math.max(0, tv - (cv?.count ?? 0)),
        }),
      );
    }, [refresh]),
  );

  return (
    <View style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topRow}>
            <View>
              <Text style={[styles.brand, { color: colors.primary }]}>SwipeClean</Text>
              <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>
                Organiza tu galería con un desliz
              </Text>
            </View>
            <ThemeToggle />
          </View>

          <Glass
            style={styles.banner}
            radius={radius.lg}
            intensity={10}
            tintColor={Semantic.amber + '1A'}
            borderColor={Semantic.amber + '59'}
          >
            <Ionicons name="hourglass-outline" size={18} color={Semantic.amber} />
            <Text style={[styles.bannerText, { color: colors.onSurface }]}>
              {!pending
                ? 'Contando lo que falta por revisar…'
                : pending.photo + pending.video === 0
                  ? '¡Galería al día! No te queda nada por revisar'
                  : `Te faltan ${miles(pending.photo)} fotos y ${miles(pending.video)} videos por revisar`}
            </Text>
          </Glass>

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

        <Glass
          style={styles.tabBar}
          radius={30}
          intensity={16}
          tintColor={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)'}
        >
          <Tab icon="home" label="Inicio" active />
          <Tab icon="bar-chart" label="Estadísticas" onPress={() => router.push('/stats')} />
          <Tab icon="heart" label="Info" onPress={() => router.push('/info')} />
        </Glass>
      </SafeAreaView>
    </View>
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
  const { colors, isDark } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <Glass
        style={styles.card}
        radius={radius.xl}
        intensity={0}
        blur={false}
        tintColor={isDark ? 'rgba(30,41,59,0.34)' : 'rgba(255,255,255,0.34)'}
        borderColor={isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.9)'}
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
      </Glass>
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
  content: { paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 108, gap: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  brand: { fontSize: 32, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: 2 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerText: { fontSize: 14, flex: 1 },
  card: { padding: 18, gap: 6 },
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
  // Burbuja flotante en vez de barra pegada al borde.
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
    flexDirection: 'row',
    paddingVertical: 12,
    shadowColor: Indigo[600],
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 11 },
});
