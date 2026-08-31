package com.isa.swipeclean.ui.screens

import android.Manifest
import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.isa.swipeclean.data.MediaType
import com.isa.swipeclean.ui.components.SwipeCard
import com.isa.swipeclean.ui.components.VideoPlayerCard
import com.isa.swipeclean.ui.theme.*
import com.isa.swipeclean.viewmodel.SwipeViewModel

private val PillShape = RoundedCornerShape(50)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SwipeScreen(
    mediaType: MediaType,
    onBack: () -> Unit,
    onOpenGallery: () -> Unit,
    jumpToUri: String? = null
) {
    val context = LocalContext.current
    val permission = remember {
        when {
            Build.VERSION.SDK_INT >= 33 && mediaType == MediaType.PHOTO -> Manifest.permission.READ_MEDIA_IMAGES
            Build.VERSION.SDK_INT >= 33 && mediaType == MediaType.VIDEO -> Manifest.permission.READ_MEDIA_VIDEO
            else -> Manifest.permission.READ_EXTERNAL_STORAGE
        }
    }

    var hasPermission by remember {
        mutableStateOf(
            androidx.core.content.ContextCompat.checkSelfPermission(context, permission) ==
                    android.content.pm.PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.RequestPermission()
    ) { granted -> hasPermission = granted }

    if (!hasPermission) {
        PermissionRequestBody(mediaType) { launcher.launch(permission) }
        return
    }

    val viewModel: SwipeViewModel = viewModel(
        factory = object : androidx.lifecycle.ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                return SwipeViewModel(context.applicationContext as android.app.Application, mediaType, jumpToUri) as T
            }
        }
    )
    val state by viewModel.uiState.collectAsState()
    val title = if (mediaType == MediaType.PHOTO) "Fotos" else "Videos"

    BackHandler { onBack() }

    val backgroundBrush = Brush.linearGradient(
        listOf(MaterialTheme.colorScheme.background, MaterialTheme.colorScheme.surface)
    )

    Box(modifier = Modifier.fillMaxSize().background(backgroundBrush)) {
        Scaffold(containerColor = Color.Transparent) { padding ->
            Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                // Header
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .padding(horizontal = 16.dp)
                ) {
                    CircleIconButton(
                        icon = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Volver al menú",
                        onClick = onBack
                    )
                    Spacer(Modifier.width(12.dp))
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.weight(1f)
                    )
                    CircleIconButton(
                        icon = Icons.Default.PhotoLibrary,
                        contentDescription = "Ver galería",
                        onClick = onOpenGallery
                    )
                    Spacer(Modifier.width(8.dp))
                    CircleIconButton(
                        icon = Icons.Default.Undo,
                        contentDescription = "Deshacer",
                        onClick = { viewModel.undo() },
                        enabled = state.canUndo
                    )
                }

                // Progreso
                Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) {
                    Text(
                        text = "Revisaste ${state.reviewed} de ${state.total}",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(Modifier.height(10.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f), PillShape)
                    ) {
                        val progress = if (state.total == 0) 0f else state.reviewed / state.total.toFloat()
                        Box(
                            modifier = Modifier
                                .fillMaxHeight()
                                .fillMaxWidth(progress)
                                .background(Brush.horizontalGradient(listOf(Indigo600, Indigo400)), PillShape)
                        )
                    }
                }

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                        when {
                            state.isLoading -> CircularProgressIndicator()
                            state.currentIndex >= state.queue.size -> {
                                Text(
                                    text = if (state.total == 0) "No hay ${title.lowercase()} para revisar" else "¡Terminaste! No quedan ${title.lowercase()} por revisar",
                                    style = MaterialTheme.typography.titleMedium
                                )
                            }
                            else -> {
                                val item = state.queue[state.currentIndex]
                                SwipeCard(
                                    onSwipeRight = { viewModel.swipeRight() },
                                    onSwipeLeft = { viewModel.swipeLeft() },
                                    modifier = Modifier.fillMaxWidth(0.9f).fillMaxHeight(0.85f)
                                ) {
                                    if (mediaType == MediaType.VIDEO) {
                                        VideoPlayerCard(uri = item.uri, modifier = Modifier.fillMaxSize())
                                    } else {
                                        AsyncImage(
                                            model = item.uri,
                                            contentDescription = item.displayName,
                                            modifier = Modifier.fillMaxSize(),
                                            contentScale = androidx.compose.ui.layout.ContentScale.Fit
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(Modifier.height(16.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        PastelActionButton(
                            text = "✕ A papelera",
                            containerColor = DangerRose.copy(alpha = 0.15f),
                            contentColor = DangerRose,
                            onClick = { viewModel.swipeLeft() },
                            modifier = Modifier.weight(1f)
                        )
                        PastelActionButton(
                            text = "✓ Se queda",
                            containerColor = SuccessGreen.copy(alpha = 0.15f),
                            contentColor = SuccessGreen,
                            onClick = { viewModel.swipeRight() },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CircleIconButton(
    icon: ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
    enabled: Boolean = true
) {
    Box(
        modifier = Modifier
            .size(40.dp)
            .background(
                MaterialTheme.colorScheme.primary.copy(alpha = if (enabled) 0.1f else 0.05f),
                CircleShape
            ),
        contentAlignment = Alignment.Center
    ) {
        IconButton(onClick = onClick, enabled = enabled) {
            Icon(
                icon,
                contentDescription = contentDescription,
                tint = if (enabled) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)
            )
        }
    }
}

@Composable
private fun PastelActionButton(
    text: String,
    containerColor: Color,
    contentColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier.height(52.dp),
        shape = RoundedCornerShape(24.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = contentColor
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
    ) {
        Text(text, style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
    }
}

@Composable
private fun PermissionRequestBody(mediaType: MediaType, onRequest: () -> Unit) {
    val label = if (mediaType == MediaType.PHOTO) "fotos" else "videos"
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("SwipeClean necesita acceso a tus $label para poder mostrártelos.")
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRequest) { Text("Dar acceso") }
    }
}