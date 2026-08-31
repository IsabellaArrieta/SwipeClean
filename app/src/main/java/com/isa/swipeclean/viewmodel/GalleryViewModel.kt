package com.isa.swipeclean.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.isa.swipeclean.data.AppDatabase
import com.isa.swipeclean.data.CheckpointManager
import com.isa.swipeclean.data.MediaItem
import com.isa.swipeclean.data.MediaRepository
import com.isa.swipeclean.data.MediaType
import com.isa.swipeclean.data.TrashEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class GalleryUiState(
    val items: List<MediaItem> = emptyList(),
    val isLoading: Boolean = true,
    val initialScrollIndex: Int = 0
)

class GalleryViewModel(application: Application, private val mediaType: MediaType) :
    AndroidViewModel(application) {

    private val repository = MediaRepository(application)
    private val trashDao = AppDatabase.getInstance(application).trashDao()
    private val checkpointManager = CheckpointManager(application)

    private val _uiState = MutableStateFlow(GalleryUiState())
    val uiState: StateFlow<GalleryUiState> = _uiState.asStateFlow()

    private val _selected = MutableStateFlow<Set<String>>(emptySet())
    val selected: StateFlow<Set<String>> = _selected.asStateFlow()

    init {
        load()
    }

    private fun load() {
        viewModelScope.launch {
            val allItems = repository.queryMedia(mediaType)
            val trashedUris = trashDao.allUris().toSet()
            val pending = allItems.filterNot { trashedUris.contains(it.uri.toString()) }

            // Buscamos el checkpoint para abrir la galería cerca de donde vas, no desde el inicio
            val lastUri = checkpointManager.getCheckpoint(mediaType)
            val nearIndex = if (lastUri != null) {
                val idx = pending.indexOfFirst { it.uri.toString() == lastUri }
                if (idx >= 0) idx else 0
            } else 0

            _uiState.value = GalleryUiState(items = pending, isLoading = false, initialScrollIndex = nearIndex)
        }
    }

    fun toggleSelect(uriString: String) {
        _selected.value = if (_selected.value.contains(uriString)) {
            _selected.value - uriString
        } else {
            _selected.value + uriString
        }
    }

    fun sendSelectedToTrash() {
        val toTrash = _uiState.value.items.filter { _selected.value.contains(it.uri.toString()) }
        viewModelScope.launch {
            toTrash.forEach { item ->
                trashDao.insert(
                    TrashEntity(
                        uriString = item.uri.toString(),
                        mediaType = item.type.name,
                        displayName = item.displayName,
                        dateAdded = item.dateAdded,
                        trashedAt = System.currentTimeMillis()
                    )
                )
            }
            _selected.value = emptySet()
            load()
        }
    }

    fun resetCheckpoint(onComplete: () -> Unit) {
        viewModelScope.launch {
            checkpointManager.clearCheckpoint(mediaType)
            onComplete()
        }
    }
}