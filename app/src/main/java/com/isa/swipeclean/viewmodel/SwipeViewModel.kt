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

private enum class ActionType { KEPT, TRASHED }
private data class SwipeAction(val item: MediaItem, val action: ActionType)

data class SwipeUiState(
    val queue: List<MediaItem> = emptyList(),
    val currentIndex: Int = 0,
    val total: Int = 0,
    val reviewed: Int = 0,
    val canUndo: Boolean = false,
    val isLoading: Boolean = true
)

class SwipeViewModel(
    application: Application,
    private val mediaType: MediaType,
    private val jumpToUri: String? = null
) : AndroidViewModel(application) {

    private val repository = MediaRepository(application)
    private val trashDao = AppDatabase.getInstance(application).trashDao()
    private val checkpointManager = CheckpointManager(application)

    private val _uiState = MutableStateFlow(SwipeUiState())
    val uiState: StateFlow<SwipeUiState> = _uiState.asStateFlow()

    private val history = ArrayDeque<SwipeAction>()

    init {
        load()
    }

    private fun load() {
        viewModelScope.launch {
            val allItems = repository.queryMedia(mediaType)
            val trashedUris = trashDao.allUris().toSet()
            val pending = allItems.filterNot { trashedUris.contains(it.uri.toString()) }

            // Si venimos de la Galería con un URI específico, arrancamos justo ahí.
            // Si no, usamos el checkpoint normal (arranca después del último revisado).
            val startIndex = if (jumpToUri != null) {
                val idx = pending.indexOfFirst { it.uri.toString() == jumpToUri }
                if (idx >= 0) idx else 0
            } else {
                val lastUri = checkpointManager.getCheckpoint(mediaType)
                if (lastUri != null) {
                    val idx = pending.indexOfFirst { it.uri.toString() == lastUri }
                    if (idx >= 0) idx + 1 else 0
                } else 0
            }

            _uiState.value = SwipeUiState(
                queue = pending,
                currentIndex = startIndex,
                total = pending.size,
                reviewed = startIndex,
                canUndo = false,
                isLoading = false
            )
        }
    }

    fun currentItem(): MediaItem? {
        val state = _uiState.value
        return state.queue.getOrNull(state.currentIndex)
    }

    fun swipeRight() {
        val item = currentItem() ?: return
        history.addLast(SwipeAction(item, ActionType.KEPT))
        saveCheckpoint(item)
        advance()
    }

    fun swipeLeft() {
        val item = currentItem() ?: return
        viewModelScope.launch {
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
        history.addLast(SwipeAction(item, ActionType.TRASHED))
        saveCheckpoint(item)
        advance()
    }

    private fun saveCheckpoint(item: MediaItem) {
        viewModelScope.launch {
            checkpointManager.saveCheckpoint(mediaType, item.uri.toString())
        }
    }

    private fun advance() {
        val state = _uiState.value
        _uiState.value = state.copy(
            currentIndex = state.currentIndex + 1,
            reviewed = state.reviewed + 1,
            canUndo = true
        )
    }

    fun undo() {
        if (history.isEmpty()) return
        val last = history.removeLast()
        if (last.action == ActionType.TRASHED) {
            viewModelScope.launch {
                trashDao.removeByUri(last.item.uri.toString())
            }
        }
        val state = _uiState.value
        _uiState.value = state.copy(
            currentIndex = (state.currentIndex - 1).coerceAtLeast(0),
            reviewed = (state.reviewed - 1).coerceAtLeast(0),
            canUndo = history.isNotEmpty()
        )
    }
}