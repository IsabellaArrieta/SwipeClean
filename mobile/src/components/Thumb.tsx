import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Semantic, radius } from '@/theme/tokens';

export function Thumb({
  uri,
  selected,
  onPress,
}: {
  uri: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <Image source={{ uri }} style={styles.img} contentFit="cover" transition={120} />
      {selected && (
        <>
          <View style={styles.dim} />
          <View style={styles.check}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  img: { flex: 1 },
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Semantic.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
