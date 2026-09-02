import { useCallback } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { CircleIconButton, PillButton } from '@/components/ui';
import { Thumb } from '@/components/Thumb';
import { useTheme } from '@/theme/ThemeContext';
import { useTrashStore } from '@/store/useTrashStore';

const COLS = 3;

export default function Trash() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    items,
    selected,
    refresh,
    toggle,
    selectAll,
    clearSelection,
    restoreSelected,
    restoreAll,
    deleteSelected,
    emptyTrash,
  } = useTrashStore();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const confirmEmpty = () =>
    Alert.alert(
      'Vaciar papelera',
      `Esto borrará permanentemente los ${items.length} elemento(s) de tu papelera. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar todo', style: 'destructive', onPress: emptyTrash },
      ],
    );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <CircleIconButton name="arrow-back" onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.onSurface }]}>Papelera ({items.length})</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.onSurfaceVariant }}>Tu papelera está vacía</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            numColumns={COLS}
            contentContainerStyle={{ padding: 4 }}
            renderItem={({ item }) => (
              <Thumb
                uri={item.uri}
                selected={selected.has(item.id)}
                onPress={() => toggle(item.id)}
              />
            )}
          />

          <View style={[styles.footer, { borderColor: colors.border }]}>
            <View style={styles.row}>
              <PillButton label="Seleccionar todo" onPress={selectAll} style={styles.grow} />
              <PillButton label="Ninguno" onPress={clearSelection} style={styles.grow} />
            </View>
            <View style={styles.row}>
              <PillButton
                label="Restaurar"
                onPress={restoreSelected}
                disabled={selected.size === 0}
                style={styles.grow}
              />
              <PillButton
                label="Eliminar"
                icon="trash-outline"
                variant="danger"
                onPress={deleteSelected}
                disabled={selected.size === 0}
                style={styles.grow}
              />
            </View>
            <PillButton label="Restaurar todo" onPress={restoreAll} />
            <PillButton label="Vaciar papelera" icon="trash-outline" variant="danger" onPress={confirmEmpty} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  footer: { borderTopWidth: 1, padding: 12, gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
});
