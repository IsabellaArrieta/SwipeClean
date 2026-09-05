import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '@/components/ui';
import { Glass } from '@/components/Glass';
import { useTheme } from '@/theme/ThemeContext';
import { getTotalCount } from '@/lib/media';
import { dayKey, getActivity, getCheckpoint, type Activity } from '@/lib/storage';
import { useTrashStore } from '@/store/useTrashStore';
import { Indigo, Semantic, radius } from '@/theme/tokens';

const DIAS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

type Data = {
  photo: { total: number; reviewed: number };
  video: { total: number; reviewed: number };
  activity: Activity;
};

export default function Stats() {
  const router = useRouter();
  const { colors } = useTheme();
  const trash = useTrashStore((s) => s.items);
  const refresh = useTrashStore((s) => s.refresh);
  const [data, setData] = useState<Data | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
      Promise.all([
        getTotalCount('photo'),
        getTotalCount('video'),
        getCheckpoint('photo'),
        getCheckpoint('video'),
        getActivity(),
      ]).then(([tp, tv, cp, cv, activity]) =>
        setData({
          photo: { total: tp, reviewed: cp?.count ?? 0 },
          video: { total: tv, reviewed: cv?.count ?? 0 },
          activity,
        }),
      );
    }, [refresh]),
  );

  // Últimos 7 días, del más viejo al de hoy.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const a = data?.activity[dayKey(d)];
    return { label: DIAS[d.getDay()], kept: a?.kept ?? 0, trashed: a?.trashed ?? 0 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.kept + d.trashed));
  const semana = days.reduce((n, d) => n + d.kept + d.trashed, 0);
  const revisados = (data?.photo.reviewed ?? 0) + (data?.video.reviewed ?? 0);

  return (
    <SafeAreaView style={styles.flex}>
      <Header title="Estadísticas" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tiles}>
          <Tile icon="checkmark-done" label="Revisados" value={revisados} color={colors.primary} />
          <Tile icon="calendar" label="Esta semana" value={semana} color={Semantic.success} />
          <Tile icon="trash" label="En papelera" value={trash.length} color={Semantic.danger} />
        </View>

        <Card title="Actividad de los últimos 7 días">
          {semana === 0 ? (
            <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>
              Todavía no hay actividad esta semana. ¡Desliza algunas fotos!
            </Text>
          ) : (
            <>
              <View style={styles.chart}>
                {days.map((d, i) => (
                  <View key={i} style={styles.col}>
                    <View style={styles.barWrap}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${((d.kept + d.trashed) / maxDay) * 100}%`,
                            backgroundColor: colors.primary + '33',
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.barFill,
                            {
                              flex: d.trashed,
                              backgroundColor: Semantic.danger,
                            },
                          ]}
                        />
                        <View style={[styles.barFill, { flex: d.kept, backgroundColor: colors.primary }]} />
                      </View>
                    </View>
                    <Text style={[styles.dayLabel, { color: colors.onSurfaceVariant }]}>{d.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.legend}>
                <Dot color={colors.primary} label="Conservados" />
                <Dot color={Semantic.danger} label="A papelera" />
              </View>
            </>
          )}
        </Card>

        <Card title="Progreso de revisión">
          <Progress
            label="Fotos"
            reviewed={data?.photo.reviewed ?? 0}
            total={data?.photo.total ?? 0}
            color={Indigo[600]}
          />
          <Progress
            label="Videos"
            reviewed={data?.video.reviewed ?? 0}
            total={data?.video.total ?? 0}
            color={Semantic.amber}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  const { colors, isDark } = useTheme();
  return (
    <Glass
      style={styles.tile}
      radius={radius.lg}
      intensity={12}
      tintColor={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'}
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.tileValue, { color: colors.onSurface }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
    </Glass>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  return (
    <Glass
      style={styles.card}
      radius={radius.xl}
      intensity={12}
      tintColor={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'}
    >
      <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{title}</Text>
      {children}
    </Glass>
  );
}

function Progress({
  label,
  reviewed,
  total,
  color,
}: {
  label: string;
  reviewed: number;
  total: number;
  color: string;
}) {
  const { colors } = useTheme();
  const pct = total > 0 ? Math.min(1, reviewed / total) : 0;
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHead}>
        <Text style={[styles.progressLabel, { color: colors.onSurface }]}>{label}</Text>
        <Text style={[styles.progressValue, { color: colors.onSurfaceVariant }]}>
          {reviewed} / {total} · {Math.round(pct * 100)}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.onSurface + '14' }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.dotRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.dotLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 3 },
  tileValue: { fontSize: 22, fontWeight: '800' },
  tileLabel: { fontSize: 11 },
  card: { padding: 18, gap: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  empty: { fontSize: 13, lineHeight: 18 },
  chart: { flexDirection: 'row', height: 130, gap: 8 },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  barWrap: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6, overflow: 'hidden', minHeight: 4 },
  barFill: { width: '100%' },
  dayLabel: { fontSize: 11 },
  legend: { flexDirection: 'row', gap: 16 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLabel: { fontSize: 12 },
  progressRow: { gap: 6 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 14, fontWeight: '600' },
  progressValue: { fontSize: 12 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});
