import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

import { cachedPoster, getPoster } from '@/lib/videoThumb';

// Player de video con slider y toggle de sonido. Portado de ui/components/VideoPlayerCard.kt.
export function VideoCard({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.bufferOptions = { minBufferForPlayback: 0.5, preferredForwardBufferDuration: 5 };
    p.play();
  });

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [started, setStarted] = useState(false);
  const [poster, setPoster] = useState<string | null>(() => cachedPoster(uri) ?? null);
  const scrubbing = useRef(false);

  useEffect(() => {
    if (cachedPoster(uri) === undefined) getPoster(uri).then(setPoster);
  }, [uri]);

  useEffect(() => {
    const id = setInterval(() => {
      try {
        setBuffering(player.status === 'loading');
        if (player.status === 'readyToPlay' && (player.currentTime || 0) > 0.05) setStarted(true);
        if (scrubbing.current) return;
        setDur(player.duration || 0);
        setPos(player.currentTime || 0);
      } catch {
        // el player ya se liberó (cambio de video / salida de pantalla)
      }
    }, 250);
    return () => clearInterval(id);
  }, [player]);

  const togglePlay = () => {
    playing ? player.pause() : player.play();
    setPlaying(!playing);
  };
  const toggleMute = () => {
    player.muted = !muted;
    setMuted(!muted);
  };

  return (
    <View style={styles.fill}>
      <VideoView player={player} style={styles.fill} contentFit="contain" nativeControls={false} />

      {!started && poster && (
        <Image source={{ uri: poster }} style={styles.poster} contentFit="contain" transition={0} />
      )}

      {buffering && !started ? (
        <View style={styles.playBtn}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <Pressable style={styles.playBtn} onPress={togglePlay}>
          <Ionicons name={playing ? 'pause' : 'play'} size={28} color="#fff" />
        </Pressable>
      )}

      <View style={styles.bottom}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={dur > 0 ? pos / dur : 0}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor="#fff"
          onSlidingStart={() => (scrubbing.current = true)}
          onValueChange={(v) => setPos(v * dur)}
          onSlidingComplete={(v) => {
            player.currentTime = v * dur;
            scrubbing.current = false;
          }}
        />
        <View style={styles.row}>
          <Text style={styles.time}>
            {fmt(pos)} <Text style={styles.timeDim}>/ {fmt(dur)}</Text>
          </Text>
          <Pressable onPress={toggleMute} hitSlop={10}>
            <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function fmt(s: number) {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%' },
  poster: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  playBtn: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12 },
  slider: { width: '100%', height: 32 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { color: '#fff', fontSize: 12 },
  timeDim: { color: 'rgba(255,255,255,0.7)' },
});
