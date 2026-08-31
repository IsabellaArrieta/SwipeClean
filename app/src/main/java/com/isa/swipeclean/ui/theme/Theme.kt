package com.isa.swipeclean.ui.theme

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = Indigo600,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = Indigo100,
    onPrimaryContainer = Indigo900,
    secondaryContainer = Indigo50,
    onSecondaryContainer = Indigo800,
    background = NeutralBgLight,
    surface = androidx.compose.ui.graphics.Color.White,
    onSurface = androidx.compose.ui.graphics.Color(0xFF0F172A),
    onSurfaceVariant = androidx.compose.ui.graphics.Color(0xFF475569)
)

private val DarkColors = darkColorScheme(
    primary = Indigo400,
    onPrimary = Indigo900,
    primaryContainer = Indigo800,
    onPrimaryContainer = Indigo100,
    secondaryContainer = androidx.compose.ui.graphics.Color(0xFF1E293B),
    onSecondaryContainer = Indigo200,
    background = NeutralBgDark,
    surface = androidx.compose.ui.graphics.Color(0xFF1E293B),
    onSurface = androidx.compose.ui.graphics.Color(0xFFF1F5F9),
    onSurfaceVariant = androidx.compose.ui.graphics.Color(0xFF94A3B8)
)

@Composable
fun SwipeCleanTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val target = if (darkTheme) DarkColors else LightColors
    val spec = tween<androidx.compose.ui.graphics.Color>(durationMillis = 450)

    // Cada color del esquema se anima por separado, así toda la app hace
    // una transición suave en vez de saltar de golpe al cambiar de modo.
    val animatedScheme = target.copy(
        primary = animateColorAsState(target.primary, spec, label = "primary").value,
        onPrimary = animateColorAsState(target.onPrimary, spec, label = "onPrimary").value,
        primaryContainer = animateColorAsState(target.primaryContainer, spec, label = "primaryContainer").value,
        onPrimaryContainer = animateColorAsState(target.onPrimaryContainer, spec, label = "onPrimaryContainer").value,
        secondaryContainer = animateColorAsState(target.secondaryContainer, spec, label = "secondaryContainer").value,
        onSecondaryContainer = animateColorAsState(target.onSecondaryContainer, spec, label = "onSecondaryContainer").value,
        background = animateColorAsState(target.background, spec, label = "background").value,
        surface = animateColorAsState(target.surface, spec, label = "surface").value,
        onSurface = animateColorAsState(target.onSurface, spec, label = "onSurface").value,
        onSurfaceVariant = animateColorAsState(target.onSurfaceVariant, spec, label = "onSurfaceVariant").value
    )

    MaterialTheme(
        colorScheme = animatedScheme,
        typography = SwipeCleanTypography,
        content = content
    )
}