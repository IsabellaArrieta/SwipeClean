import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Header } from '@/components/ui';
import { useTheme } from '@/theme/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { colors, isDark, toggle } = useTheme();
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Ajustes" onBack={() => router.back()} />
      <View style={styles.body}>
        <View style={[styles.rowItem, { borderColor: colors.border }]}>
          <Text style={{ color: colors.onSurface, fontSize: 15 }}>Modo oscuro</Text>
          <Switch value={isDark} onValueChange={toggle} />
        </View>
        <Text style={[styles.soon, { color: colors.onSurfaceVariant }]}>Más opciones próximamente</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 16, gap: 16 },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  soon: { fontSize: 13, textAlign: 'center' },
});
