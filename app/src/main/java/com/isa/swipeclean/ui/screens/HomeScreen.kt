package com.isa.swipeclean.ui.screens

import com.isa.swipeclean.ui.theme.*
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.LightMode
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.Videocam
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.isa.swipeclean.viewmodel.TrashViewModel
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    onOpenPhotos: () -> Unit,
    onOpenVideos: () -> Unit,
    onOpenTrash: () -> Unit,
    onOpenStats: () -> Unit,
    onOpenSettings: () -> Unit,
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit
) {
    val trashViewModel: TrashViewModel = viewModel()
    val trashItems by trashViewModel.trashItems.collectAsState()

    val bgSpec = tween<Color>(durationMillis = 450)
    val bgStart by animateColorAsState(
        if (isDarkTheme) NeutralBgDark else NeutralBgLight, bgSpec, label = "bgStart"
    )
    val bgEnd by animateColorAsState(
        if (isDarkTheme) NeutralBgDarkEnd else NeutralBgLightEnd, bgSpec, label = "bgEnd"
    )
    val backgroundBrush = Brush.linearGradient(listOf(bgStart, bgEnd))

    Box(modifier = Modifier.fillMaxSize().background(backgroundBrush)) {
        Scaffold(
            containerColor = Color.Transparent,
            bottomBar = {
                NavigationBar {
                    NavigationBarItem(
                        selected = true,
                        onClick = { /* ya estamos en Inicio */ },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Inicio") },
                        label = { Text("Inicio") }
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = onOpenStats,
                        icon = { Icon(Icons.Default.BarChart, contentDescription = "Estadísticas") },
                        label = { Text("Estadísticas") }
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = onOpenSettings,
                        icon = { Icon(Icons.Default.Settings, contentDescription = "Ajustes") },
                        label = { Text("Ajustes") }
                    )
                }
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(padding)
                    .padding(horizontal = 24.dp, vertical = 16.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        Text(
                            text = "SwipeClean",
                            style = TextStyle(
                                brush = Brush.linearGradient(listOf(Indigo600, Indigo400)),
                                fontFamily = OutfitFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 32.sp
                            )
                        )
                        Text(
                            text = "Organiza tu galería con un desliz",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    val rotation = remember { Animatable(0f) }
                    val coroutineScope = rememberCoroutineScope()
                    val iconTint by animateColorAsState(
                        targetValue = if (isDarkTheme) AmberWarning else MaterialTheme.colorScheme.primary,
                        animationSpec = tween(durationMillis = 450),
                        label = "themeIconTint"
                    )
                    IconButton(onClick = {
                        onToggleTheme()
                        coroutineScope.launch {
                            rotation.animateTo(20f, animationSpec = tween(150, easing = FastOutSlowInEasing))
                            rotation.animateTo(0f, animationSpec = tween(250, easing = FastOutSlowInEasing))
                        }
                    }) {
                        Icon(
                            imageVector = Icons.Outlined.LightMode,
                            contentDescription = if (isDarkTheme) "Cambiar a modo claro" else "Cambiar a modo oscuro",
                            tint = iconTint,
                            modifier = Modifier.graphicsLayer { rotationZ = rotation.value }
                        )
                    }
                }

                Spacer(Modifier.height(16.dp))

                // Banner: aún no calculamos espacio real
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                listOf(AmberWarning.copy(alpha = 0.1f), AmberWarning.copy(alpha = 0.05f))
                            ),
                            RoundedCornerShape(16.dp)
                        )
                        .border(1.dp, AmberWarning.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                        .padding(horizontal = 16.dp, vertical = 14.dp)
                ) {
                    Icon(
                        Icons.Outlined.Schedule,
                        contentDescription = null,
                        tint = AmberWarning,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(Modifier.width(10.dp))
                    Text(
                        text = "Cálculo de espacio: función próximamente",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Spacer(Modifier.height(20.dp))

                HomeOptionCard(
                    icon = Icons.Outlined.Image,
                    iconGradient = listOf(Indigo600, Indigo400),
                    title = "Fotos",
                    subtitle = "Desliza para revisar y eliminar las fotos que ya no necesitas",
                    footer = "→ Comenzar",
                    onClick = onOpenPhotos
                )
                Spacer(Modifier.height(14.dp))
                HomeOptionCard(
                    icon = Icons.Outlined.Videocam,
                    iconGradient = listOf(AmberWarning, AmberLight),
                    title = "Videos",
                    subtitle = "Desliza para revisar y eliminar los videos que ya no necesitas",
                    footer = "→ Comenzar",
                    onClick = onOpenVideos
                )
                Spacer(Modifier.height(14.dp))
                HomeOptionCard(
                    icon = Icons.Outlined.Delete,
                    iconGradient = listOf(DangerRose, DangerRoseLight),
                    title = "Papelera",
                    subtitle = "Archivos esperando ser eliminados permanentemente",
                    footer = "${trashItems.size} elementos",
                    onClick = onOpenTrash
                )

                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun HomeOptionCard(
    icon: ImageVector,
    iconGradient: List<Color>,
    title: String,
    subtitle: String,
    footer: String,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.97f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "cardScale"
    )

    Card(
        onClick = onClick,
        interactionSource = interactionSource,
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .shadow(
                elevation = 12.dp,
                shape = RoundedCornerShape(24.dp),
                ambientColor = Indigo600.copy(alpha = 0.15f),
                spotColor = Indigo600.copy(alpha = 0.15f)
            )
            .border(1.dp, Indigo600.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
    ) {
        Column(Modifier.padding(18.dp)) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .shadow(
                        elevation = 8.dp,
                        shape = RoundedCornerShape(18.dp),
                        ambientColor = iconGradient.first().copy(alpha = 0.35f),
                        spotColor = iconGradient.first().copy(alpha = 0.35f)
                    )
                    .background(Brush.linearGradient(iconGradient), RoundedCornerShape(18.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = Color.White)
            }

            Spacer(Modifier.height(14.dp))

            Text(text = title, style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(Modifier.height(12.dp))
            Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))
            Spacer(Modifier.height(12.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = footer,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .shadow(
                            elevation = 6.dp,
                            shape = CircleShape,
                            ambientColor = Indigo600.copy(alpha = 0.4f),
                            spotColor = Indigo600.copy(alpha = 0.4f)
                        )
                        .background(Brush.linearGradient(listOf(Indigo600, Indigo400)), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}