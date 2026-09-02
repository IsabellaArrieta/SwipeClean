import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '@/components/ui';
import { BeatingHeart } from '@/components/BeatingHeart';
import { useTheme } from '@/theme/ThemeContext';
import { Rose, radius } from '@/theme/tokens';

// TODO Isa: pon aquí tus datos reales.
const GITHUB_USER = 'isabellaarrieta';
const REPO_URL = 'https://github.com/isabellaarrieta/SwipeClean';

export default function Info() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Cristal rosa: fondo translúcido + borde claro + sombra suave.
  const glassBg: [string, string] = isDark
    ? ['rgba(241,136,155,0.22)', 'rgba(229,125,144,0.10)']
    : ['rgba(255,205,212,0.85)', 'rgba(253,180,191,0.55)'];
  const glassBorder = isDark ? 'rgba(255,205,212,0.30)' : 'rgba(255,255,255,0.75)';
  const rose = isDark ? Rose[400] : Rose[800];
  const roseSoft = isDark ? 'rgba(255,205,212,0.75)' : Rose[800];

  return (
    <LinearGradient colors={[colors.background, colors.backgroundEnd]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <Header title="Info" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          <LinearGradient
            colors={glassBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.glass, { borderColor: glassBorder, shadowColor: Rose[800] }]}
          >
            <View style={styles.madeRow}>
              <Text style={[styles.made, { color: rose }]}>Made with</Text>
              <BeatingHeart size={18} color={Rose[700]} />
              <Text style={[styles.made, { color: rose }]}>by Isa</Text>
            </View>

            <Text style={[styles.role, { color: roseSoft }]}>
              Desarrollada de cero con Expo y React Native
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

            <Pressable style={styles.linkRow} onPress={() => Linking.openURL(REPO_URL)}>
              <Ionicons name="code-slash-outline" size={18} color={rose} />
              <Text style={[styles.linkText, { color: rose }]}>Ver el proyecto</Text>
              <Ionicons name="open-outline" size={14} color={roseSoft} />
            </Pressable>
          </LinearGradient>

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
                Dale una estrellita en GitHub, me ayuda un montón ✨
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
          </Pressable>

          <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>SwipeClean 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, gap: 18 },
  glass: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    gap: 10,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  madeRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  made: { fontSize: 20, fontWeight: '800' },
  role: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 6, opacity: 0.6 },
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
