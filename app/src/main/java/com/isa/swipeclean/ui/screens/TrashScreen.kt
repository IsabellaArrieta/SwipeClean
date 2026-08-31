package com.isa.swipeclean.ui.screens

import android.content.IntentSender
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.isa.swipeclean.data.TrashEntity
import com.isa.swipeclean.ui.theme.DangerRose
import com.isa.swipeclean.ui.theme.Indigo400
import com.isa.swipeclean.ui.theme.Indigo600
import com.isa.swipeclean.viewmodel.TrashViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TrashScreen(onBack: () -> Unit) {
    val viewModel: TrashViewModel = viewModel()
    val items by viewModel.trashItems.collectAsState()
    val selected by viewModel.selected.collectAsState()
    val deleteRequest by viewModel.deleteRequest.collectAsState()

    BackHandler { onBack() }

    val deleteLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode == android.app.Activity.RESULT_OK) {
            viewModel.onDeleteConfirmed()
        } else {
            viewModel.onDeleteCancelled()
        }
    }

    LaunchedEffect(deleteRequest) {
        deleteRequest?.let { sender: IntentSender ->
            deleteLauncher.launch(IntentSenderRequest.Builder(sender).build())
        }
    }

    var confirmEmpty by remember { mutableStateOf(false) }

    Scaffold { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().height(56.dp).padding(horizontal = 16.dp)
            ) {
                CircleIconButton(icon = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver", onClick = onBack)
                Spacer(Modifier.width(12.dp))
                Text("Papelera (${items.size})", style = MaterialTheme.typography.titleMedium)
            }

            if (items.isEmpty()) {
                Box(Modifier.weight(1f).fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Tu papelera está vacía")
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    modifier = Modifier.weight(1f).padding(4.dp)
                ) {
                    items(items, key = { it.uriString }) { entity ->
                        TrashThumbnail(
                            entity = entity,
                            isSelected = selected.contains(entity.uriString),
                            onToggle = { viewModel.toggleSelect(entity.uriString) }
                        )
                    }
                }

                Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.06f))

                Column(Modifier.padding(12.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        PillButton(
                            text = "Seleccionar todo",
                            variant = ButtonVariant.Secondary,
                            onClick = { viewModel.selectAll() },
                            modifier = Modifier.weight(1f)
                        )
                        PillButton(
                            text = "Ninguno",
                            variant = ButtonVariant.Secondary,
                            onClick = { viewModel.clearSelection() },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        PillButton(
                            text = "Restaurar",
                            variant = ButtonVariant.Secondary,
                            enabled = selected.isNotEmpty(),
                            onClick = { viewModel.restoreSelected() },
                            modifier = Modifier.weight(1f)
                        )
                        PillButton(
                            text = "Eliminar",
                            icon = Icons.Default.Delete,
                            variant = ButtonVariant.Danger,
                            enabled = selected.isNotEmpty(),
                            onClick = { viewModel.deleteSelected() },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Spacer(Modifier.height(8.dp))
                    PillButton(
                        text = "Restaurar todo",
                        variant = ButtonVariant.Secondary,
                        onClick = { viewModel.restoreAll() },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(8.dp))
                    PillButton(
                        text = "Vaciar papelera",
                        icon = Icons.Default.Delete,
                        variant = ButtonVariant.Danger,
                        onClick = { confirmEmpty = true },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }

    if (confirmEmpty) {
        AlertDialog(
            onDismissRequest = { confirmEmpty = false },
            shape = RoundedCornerShape(24.dp),
            title = { Text("Vaciar papelera") },
            text = { Text("Esto borrará permanentemente los ${items.size} elemento(s) de tu papelera. Esta acción no se puede deshacer.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmEmpty = false
                    viewModel.emptyTrash()
                }) { Text("Borrar todo") }
            },
            dismissButton = {
                TextButton(onClick = { confirmEmpty = false }) { Text("Cancelar") }
            }
        )
    }
}

@Composable
private fun TrashThumbnail(entity: TrashEntity, isSelected: Boolean, onToggle: () -> Unit) {
    Box(
        modifier = Modifier
            .padding(4.dp)
            .aspectRatio(1f)
            .clip(RoundedCornerShape(12.dp))
            .background(Brush.linearGradient(listOf(Indigo600.copy(alpha = 0.08f), Indigo400.copy(alpha = 0.08f))))
            .clickable { onToggle() }
    ) {
        AsyncImage(
            model = android.net.Uri.parse(entity.uriString),
            contentDescription = entity.displayName,
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