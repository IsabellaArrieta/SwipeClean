package com.isa.swipeclean.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.isa.swipeclean.ui.theme.DangerRose
import com.isa.swipeclean.ui.theme.Indigo600
import com.isa.swipeclean.ui.theme.SuccessGreen
import kotlin.math.roundToInt

private val NeutralStart = Color(0xFFE0E7FF)
private val NeutralEnd = Color(0xFFF0F4FF)
private val RedStart = Color(0xFFFEE2E2)
private val RedEnd = Color(0xFFFECACA)
private val GreenStart = Color(0xFFDCFCE7)
private val GreenEnd = Color(0xFFBBF7D0)

/**
 * Card arrastrable estilo Tinder. Swipe derecha = se queda, izquierda = a papelera.
 * El fondo cambia de color gradualmente mientras arrastras.
 */
@Composable
fun SwipeCard(
    onSwipeRight: () -> Unit,
    onSwipeLeft: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    var offsetX by remember { mutableStateOf(0f) }
    var offsetY by remember { mutableStateOf(0f) }
    val swipeThreshold = 300f

    val animatedOffsetX by animateFloatAsState(
        targetValue = offsetX,
        animationSpec = spring(stiffness = Spring.StiffnessMedium),
        label = "offsetX"
    )

    // t va de -1 (izquierda, papelera) a 1 (derecha, se queda), 0 = neutral
    val t = (animatedOffsetX / swipeThreshold).coerceIn(-1f, 1f)

    val bgStart = when {
        t > 0 -> lerp(NeutralStart, GreenStart, t)
        t < 0 -> lerp(NeutralStart, RedStart, -t)
        else -> NeutralStart
    }
    val bgEnd = when {
        t > 0 -> lerp(NeutralEnd, GreenEnd, t)
        t < 0 -> lerp(NeutralEnd, RedEnd, -t)
        else -> NeutralEnd
    }
    val borderColor = when {
        t > 0 -> lerp(Indigo600.copy(alpha = 0.15f), SuccessGreen.copy(alpha = 0.3f), t)
        t < 0 -> lerp(Indigo600.copy(alpha = 0.15f), DangerRose.copy(alpha = 0.3f), -t)
        else -> Indigo600.copy(alpha = 0.15f)
    }

    Box(
        modifier = modifier
            .offset {
                androidx.compose.ui.unit.IntOffset(animatedOffsetX.roundToInt(), offsetY.roundToInt())
            }
            .rotate((animatedOffsetX / 40).coerceIn(-15f, 15f))
            .shadow(
                elevation = 16.dp,
                shape = RoundedCornerShape(28.dp),
                ambientColor = Indigo600.copy(alpha = 0.2f),
                spotColor = Indigo600.copy(alpha = 0.2f)
            )
            .clip(RoundedCornerShape(28.dp))
            .background(Brush.linearGradient(listOf(bgStart, bgEnd)))
            .border(1.dp, borderColor, RoundedCornerShape(28.dp))
            .pointerInput(Unit) {
                detectDragGestures(
                    onDrag = { change, dragAmount ->
                        change.consume()
                        offsetX += dragAmount.x
                        offsetY += dragAmount.y * 0.2f
                    },
                    onDragEnd = {
                        when {
                            offsetX > swipeThreshold -> onSwipeRight()
                            offsetX < -swipeThreshold -> onSwipeLeft()
                        }
                        offsetX = 0f
                        offsetY = 0f
                    }
                )
            }
    ) {
        content()

        if (offsetX > 40) {
            SwipeLabel(text = "SE QUEDA", color = SuccessGreen, alignment = Alignment.TopStart)
        } else if (offsetX < -40) {
            SwipeLabel(text = "SE VA", color = DangerRose, alignment = Alignment.TopEnd)
        }
    }
}

@Composable
private fun BoxScope.SwipeLabel(text: String, color: Color, alignment: Alignment) {
    Box(
        modifier = Modifier
            .align(alignment)
            .padding(16.dp)
            .background(color, RoundedCornerShape(8.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(text = text, color = Color.White, style = MaterialTheme.typography.titleMedium)
    }
}