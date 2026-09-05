import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '@/components/ui';
import { Glass } from '@/components/Glass';
import { BeatingHeart } from '@/components/BeatingHeart';
import { useTheme } from '@/theme/ThemeContext';
import { getCheckpoint } from '@/lib/storage';
import { Rose, Semantic, radius } from '@/theme/tokens';

const GITHUB_USER = 'IsabellaArrieta';
const REPO_URL = 'https://github.com/IsabellaArrieta/SwipeClean';
const REPORT_EMAIL = 'isabellaarrietag@gmail.com';

// Abre el correo con los datos del equipo ya escritos, para no tener que
// pedírselos después a quien reporta.
function reportarBug() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const cuerpo = [
    'Contame qué pasó:',
    '',
    '',
    '¿Qué esperabas que pasara?',
    '',
    '',
    '---',
    `SwipeClean ${version}`,
    `${Platform.OS} ${Platform.Version}`,
  ].join('\n');
  const url = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(
    `SwipeClean ${version} — reporte`,
  )}&body=${encodeURIComponent(cuerpo)}`;
  Linking.openURL(url).catch(() => {});
}

export default function Info() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState({ photos: 0, videos: 0 });

  useEffect(() => {
    Promise.all([getCheckpoint('photo'), getCheckpoint('video')]).then(([p, v]) =>
      setStats({ photos: p?.count ?? 0, videos: v?.count ?? 0 }),
    );
  }, []);

  // Velo rosa sobre el desenfoque real del fondo.
  const veil = isDark ? 'rgba(241,136,155,0.09)' : 'rgba(253,180,191,0.22)';
  const glassBorder = isDark ? 'rgba(255,205,212,0.22)' : 'rgba(255,255,255,0.7)';
  const rose = isDark ? Rose[400] : Rose[800];
  const roseSoft = isDark ? 'rgba(255,205,212,0.72)' : 'rgba(229,125,144,0.85)';

  const total = stats.photos + stats.videos;

  return (
    <View style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <Header title="Info" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.glassWrap}>
            {/* Halo difuso detrás del cristal */}
            <View style={[styles.halo, { backgroundColor: Rose[600], opacity: isDark ? 0.22 : 0.3 }]} />

            <Glass style={styles.glass} tintColor={veil} borderColor={glassBorder} intensity={40}>
              <View style={styles.madeRow}>
                <Text style={[styles.made, { color: rose }]}>Made with</Text>
                <BeatingHeart size={18} color={Rose[700]} />
                <Text style={[styles.made, { color: rose }]}>by Isa</Text>
              </View>

              <Text style={[styles.role, { color: roseSoft }]}>
                Desarrollada con Expo y React Native
              </Text>

              <View style={[styles.divider, { backgroundColor: glassBorder }]} />

              <Pressable
                style={styles.linkRow}
                onPress={() => Linking.openURL(`https://github.com/${GITHUB_USER}`)}
              >
                <Ionicons name="logo-github" size={18} color={rose} />
                <Text style={[styles.linkText, { color: rose }]}>@{GITHUB_USER}</Text>
                <Ionicons name="open-outline" size={14} color={roseSoft} />
              </Pressable>

              <View style={styles.linkRow}>
                <Ionicons name="sparkles-outline" size={18} color={rose} />
                <Text style={[styles.linkText, { color: rose }]}>
                  {total === 0
                    ? 'Aún no has revisado nada… ¡a limpiar!'
                    : `Llevas ${stats.photos} fotos y ${stats.videos} videos revisados`}
                </Text>
              </View>
            </Glass>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.starCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            onPress={() => Linking.openURL(REPO_URL)}
          >
            <Ionicons name="star" size={22} color={Rose[700]} />
            <View style={styles.starTextWrap}>
              <Text style={[styles.starTitle, { color: colors.onSurface }]}>
                ¿Te sirvió SwipeClean?
              </Text>
              <Text style={[styles.starSub, { color: colors.onSurfaceVariant }]}>
                Dale una estrellita en GitHub ✨
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.starCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            onPress={reportarBug}
          >
            <Ionicons name="bug" size={22} color={Semantic.amber} />
            <View style={styles.starTextWrap}>
              <Text style={[styles.starTitle, { color: colors.onSurface }]}>
                ¿Algo no funciona?
              </Text>
              <Text style={[styles.starSub, { color: colors.onSurfaceVariant }]}>
                Escríbeme un email y lo reviso
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
          </Pressable>

          <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>SwipeClean 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, gap: 18 },
  glassWrap: { position: 'relative' },
  halo: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 22,
    bottom: 2,
    borderRadius: 40,
  },
  glass: { padding: 22, gap: 10 },
  madeRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  made: { fontSize: 20, fontWeight: '800' },
  role: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 6, opacity: 0.55 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  linkText: { flex: 1, fontSize: 14, fontWeight: '700' },
  starCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 16,
  },
  starTextWrap: { flex: 1, gap: 2 },
  starTitle: { fontSize: 15, fontWeight: '700' },
  starSub: { fontSize: 12, lineHeight: 16 },
  version: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
