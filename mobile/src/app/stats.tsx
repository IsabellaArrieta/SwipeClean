import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Header } from '@/components/ui';
import { useTheme } from '@/theme/ThemeContext';

export default function Stats() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header title="Estadísticas" onBack={() => router.back()} />
      <View style={styles.center}>
        <Text style={{ color: colors.onSurfaceVariant }}>Próximamente</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
