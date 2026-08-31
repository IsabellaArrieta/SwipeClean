package com.isa.swipeclean.ui.components

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem as ExoMediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import kotlinx.coroutines.delay

@Composable
fun VideoPlayerCard(uri: Uri, modifier: Modifier = Modifier) {
    key(uri) {
        val context = LocalContext.current
        var isPlaying by remember { mutableStateOf(true) }
        var isMuted by remember { mutableStateOf(true) }
        var durationMs by remember { mutableStateOf(0L) }
        var positionMs by remember { mutableStateOf(0L) }
        var isDraggingSlider by remember { mutableStateOf(false) }

        val exoPlayer = remember {
            ExoPlayer.Builder(context).build().apply {
                setMediaItem(ExoMediaItem.fromUri(uri))
                prepare()
                playWhenReady = true
                repeatMode = Player.REPEAT_MODE_ONE
                volume = 0f
            }
        }

        DisposableEffect(Unit) {
            onDispose { exoPlayer.release() }
        }

        LaunchedEffect(Unit) {
            while (true) {
                if (!isDraggingSlider) {
                    val dur = exoPlayer.duration
                    if (dur > 0) durationMs = dur
                    positionMs = exoPlayer.currentPosition.coerceIn(0L, if (durationMs > 0) durationMs else Long.MAX_VALUE)
                }
                delay(300)
            }
        }

        Box(modifier = modifier) {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = exoPlayer
                        useController = false
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // Botón de play/pausa "biselado": fondo semitransparente + borde, como en el prototipo
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .size(64.dp)
                    .background(Color.White.copy(alpha = 0.2f), CircleShape)
                    .border(2.dp, Color.White.copy(alpha = 0.4f), CircleShape)
                    .clickable {
                        isPlaying = !isPlaying
                        exoPlayer.playWhenReady = isPlaying
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = if (isPlaying) "Pausar" else "Reproducir",
                    tint = Color.White,
                    modifier = Modifier.size(28.dp)
                )
            }

            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.6f))
                        )
                    )
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Slider(
                    value = if (durationMs > 0) (positionMs.toFloat() / durationMs.toFloat()).coerceIn(0f, 1f) else 0f,
                    onValueChange = { fraction ->
                        isDraggingSlider = true
                        positionMs = (fraction * durationMs).toLong()
                    },
                    onValueChangeFinished = {
                        exoPlayer.seekTo(positionMs)
                        isDraggingSlider = false
                    },
                    colors = SliderDefaults.colors(
                        thumbColor = Color.White,
                        activeTrackColor = Color.White,
                        inactiveTrackColor = Color.White.copy(alpha = 0.3f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = formatTime(positionMs),
                        color = Color.White,
                        style = MaterialTheme.typography.labelSmall
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "/ ${formatTime(durationMs)}",
                        color = Color.White.copy(alpha = 0.7f),
                        style = MaterialTheme.typography.labelSmall
                    )
                    Spacer(Modifier.weight(1f))
                    IconButton(
                        onClick = {
                            isMuted = !isMuted
                            exoPlayer.volume = if (isMuted) 0f else 1f
                        }
                    ) {
                        Icon(
                            imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                            contentDescription = if (isMuted) "Activar sonido" else "Silenciar",
                            tint = Color.White
                        )
                    }
                }
            }
        }
    }
}

private fun formatTime(ms: Long): String {
    val totalSeconds = (ms / 1000).coerceAtLeast(0)
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%d:%02d".format(minutes, seconds)
}