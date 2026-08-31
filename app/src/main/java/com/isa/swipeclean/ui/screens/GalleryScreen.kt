package com.isa.swipeclean.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyGridState
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Popup
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.isa.swipeclean.data.MediaItem
import com.isa.swipeclean.data.MediaType
import com.isa.swipeclean.ui.theme.DangerRose
import com.isa.swipeclean.ui.theme.DangerRoseLight
import com.isa.swipeclean.ui.theme.Indigo400
import com.isa.swipeclean.ui.theme.Indigo600
import com.isa.swipeclean.viewmodel.GalleryViewModel
import kotlinx.coroutines.launch

private const val GRID_COLUMNS = 3

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GalleryScreen(
    mediaType: MediaType,
    onBack: () -> Unit,
    onJumpTo: (String) -> Unit,
    onGoToTrash: () -> Unit,
    onResetComplete: () -> Unit
) {
    val context = LocalContext.current
    val viewModel: GalleryViewModel = viewModel(
        factory = object : androidx.lifecycle.ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                return GalleryViewModel(context.applicationContext as android.app.Application, mediaType) as T
            }
        }
    )
    val state by viewModel.uiState.collectAsState()
    val selected by viewModel.selected.collectAsState()
    val title = if (mediaType == MediaType.PHOTO) "Galería de fotos" else "Galería de videos"

    var confirmReset by remember { mutableStateOf(false) }
    val gridState = rememberLazyGridState()

    var hasAutoScrolled by remember { mutableStateOf(false) }
    LaunchedEffect(state.isLoading, state.items.size) {
        if (!state.isLoading && state.items.isNotEmpty() && !hasAutoScrolled) {
            gridState.scrollToItem(state.initialScrollIndex.coerceIn(0, state.items.lastIndex))
            hasAutoScrolled = true
        }
    }

    BackHandler { onBack() }

    Scaffold { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().height(56.dp).padding(horizontal = 16.dp)
            ) {
                CircleIconButton(icon = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver", onClick = onBack)
                Spacer(Modifier.width(12.dp))
                Text(
                    text = "$title (${state.items.size})",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = "Papelera",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Medium),
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.clickable(onClick = onGoToTrash).padding(4.dp)
                )
            }

            if (state.isLoading) {
                Box(Modifier.weight(1f).fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (state.items.isEmpty()) {
                Box(Modifier.weight(1f).fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No hay elementos pendientes por revisar")
                }
            } else {
                Row(modifier = Modifier.weight(1f).fillMaxWidth()) {
                    LazyVerticalGrid(
                        state = gridState,
                        columns = GridCells.Fixed(GRID_COLUMNS),
                        modifier = Modifier.weight(1f).padding(4.dp)
                    ) {
                        items(state.items, key = { it.uri.toString() }) { item ->
                            GalleryThumbnail(
                                item = item,
                                isSelected = selected.contains(item.uri.toString()),
                                onToggle = { viewModel.toggleSelect(item.uri.toString()) }
                            )
                        }
                    }
                    FastScrollBar(
                        gridState = gridState,
                        totalItems = state.items.size,
                        columns = GRID_COLUMNS,
                        modifier = Modifier.fillMaxHeight()
                    )
                }
            }

            Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.06f))

            Column(Modifier.padding(12.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    PillButton(
                        text = "Saltar aquí",
                        variant = ButtonVariant.Secondary,
                        enabled = selected.size == 1,
                        onClick = { selected.firstOrNull()?.let { onJumpTo(it) } },
                        modifier = Modifier.weight(1f)
                    )
                    PillButton(
                        text = "A papelera",
                        icon = Icons.Default.Delete,
                        variant = ButtonVariant.Danger,
                        enabled = selected.isNotEmpty(),
                        onClick = { viewModel.sendSelectedToTrash() },
                        modifier = Modifier.weight(1f)
                    )
                }
                Spacer(Modifier.height(8.dp))
                PillButton(
                    text = "Empezar de nuevo",
                    icon = Icons.Default.Refresh,
                    variant = ButtonVariant.Secondary,
                    onClick = { confirmReset = true },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }

    if (confirmReset) {
        AlertDialog(
            onDismissRequest = { confirmReset = false },
            shape = RoundedCornerShape(24.dp),
            title = { Text("Empezar de nuevo") },
            text = { Text("Esto reinicia tu punto de partida y te lleva de vuelta al inicio. La próxima vez que entres a revisar, empezarás desde el primer elemento. No borra ni mueve nada.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmReset = false
                    viewModel.resetCheckpoint(onComplete = onResetComplete)
                }) { Text("Reiniciar") }
            },
            dismissButton = {
                TextButton(onClick = { confirmReset = false }) { Text("Cancelar") }
            }
        )
    }
}

enum class ButtonVariant { Primary, Secondary, Danger }

@Composable
fun PillButton(
    text: String,
    variant: ButtonVariant,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector? = null,
    enabled: Boolean = true
) {
    val shape = RoundedCornerShape(12.dp)
    when (variant) {
        ButtonVariant.Primary -> Button(
            onClick = onClick,
            enabled = enabled,
            shape = shape,
            modifier = modifier.height(40.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Indigo600, contentColor = Color.White),
            contentPadding = PaddingValues(horizontal = 12.dp)
        ) { PillButtonContent(text, icon) }

        ButtonVariant.Danger -> Button(
            onClick = onClick,
            enabled = enabled,
            shape = shape,
            modifier = modifier.height(40.dp),
            colors = ButtonDefaults.buttonColors(containerColor = DangerRose, contentColor = Color.White),
            contentPadding = PaddingValues(horizontal = 12.dp)
        ) { PillButtonContent(text, icon) }

        ButtonVariant.Secondary -> OutlinedButton(
            onClick = onClick,
            enabled = enabled,
            shape = shape,
            modifier = modifier.height(40.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Indigo600),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, Indigo600.copy(alpha = if (enabled) 0.3f else 0.15f)),
            contentPadding = PaddingValues(horizontal = 12.dp)
        ) { PillButtonContent(text, icon) }
    }
}

@Composable
private fun PillButtonContent(text: String, icon: androidx.compose.ui.graphics.vector.ImageVector?) {
    if (icon != null) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(14.dp))
        Spacer(Modifier.width(6.dp))
    }
    Text(text, style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
}

@Composable
fun CircleIconButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    contentDescription: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier.size(40.dp).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        IconButton(onClick = onClick) {
            Icon(icon, contentDescription = contentDescription, tint = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
private fun FastScrollBar(
    gridState: LazyGridState,
    totalItems: Int,
    columns: Int,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val density = LocalDensity.current
    var barHeightPx by remember { mutableStateOf(0f) }
    var isDragging by remember { mutableStateOf(false) }
    var dragProgress by remember { mutableStateOf(0f) }

    val totalRows = ((totalItems + columns - 1) / columns).coerceAtLeast(1)

    val currentProgress by remember {
        derivedStateOf {
            if (totalRows <= 1) 0f
            else (gridState.firstVisibleItemIndex / columns).toFloat() / (totalRows - 1).toFloat()
        }
    }

    val progress = (if (isDragging) dragProgress else currentProgress).coerceIn(0f, 1f)
    val thumbHeightDp = 64.dp
    val thumbHeightPx = with(density) { thumbHeightDp.toPx() }
    val maxOffsetPx = (barHeightPx - thumbHeightPx).coerceAtLeast(0f)

    fun jumpTo(y: Float, animate: Boolean) {
        val clampedY = y.coerceIn(0f, barHeightPx)
        val p = if (barHeightPx > 0f) clampedY / barHeightPx else 0f
        dragProgress = p
        val targetRow = (p * (totalRows - 1)).toInt().coerceIn(0, totalRows - 1)
        val targetIndex = (targetRow * columns).coerceIn(0, totalItems - 1)
        coroutineScope.launch {
            if (animate) gridState.animateScrollToItem(targetIndex) else gridState.scrollToItem(targetIndex)
        }
    }

    Box(
        modifier = modifier
            .width(24.dp)
            .onGloballyPositioned { barHeightPx = it.size.height.toFloat() }
            .pointerInput(totalRows) {
                detectTapGestures { offset -> jumpTo(offset.y, animate = true) }
            }
            .pointerInput(totalRows) {
                detectDragGestures(
                    onDragStart = { isDragging = true },
                    onDragEnd = { isDragging = false },
                    onDragCancel = { isDragging = false }
                ) { change, _ ->
                    change.consume()
                    jumpTo(change.position.y, animate = false)
                }
            }
    ) {
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .width(3.dp)
                .fillMaxHeight()
                .background(Indigo600.copy(alpha = 0.08f), RoundedCornerShape(2.dp))
        )
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset { IntOffset(0, (progress * maxOffsetPx).toInt()) }
                .width(if (isDragging) 16.dp else 3.dp)
                .height(thumbHeightDp)
                .background(Indigo600, RoundedCornerShape(10.dp))
        )
        if (isDragging) {
            val targetRow = (progress * (totalRows - 1)).toInt().coerceIn(0, totalRows - 1)
            val approxIndex = (targetRow * columns).coerceIn(0, totalItems - 1) + 1
            Popup(
                alignment = Alignment.TopStart,
                offset = IntOffset(with(density) { (-100).dp.roundToPx() }, (progress * maxOffsetPx).toInt())
            ) {
                Box(
                    modifier = Modifier.background(Color.Black.copy(alpha = 0.8f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text("$approxIndex/$totalItems", color = Color.White, style = MaterialTheme.typography.labelSmall, maxLines = 1)
                }
            }
        }
    }
}

@Composable
private fun GalleryThumbnail(item: MediaItem, isSelected: Boolean, onToggle: () -> Unit) {
    Box(
        modifier = Modifier
            .padding(4.dp)
            .aspectRatio(1f)
            .clip(RoundedCornerShape(12.dp))
            .background(Brush.linearGradient(listOf(Indigo600.copy(alpha = 0.08f), Indigo400.copy(alpha = 0.08f))))
            .clickable { onToggle() }
    ) {
        AsyncImage(
            model = item.uri,
            contentDescription = item.displayName,
            modifier = Modifier.fillMaxSize(),
            contentScale = androidx.compose.ui.layout.ContentScale.Crop
        )
        if (isSelected) {
            Box(modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.3f)))
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .size(24.dp)
                    .background(com.isa.swipeclean.ui.theme.SuccessGreen, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Check, contentDescription = "Seleccionado", tint = Color.White, modifier = Modifier.size(14.dp))
            }
        }
    }
}