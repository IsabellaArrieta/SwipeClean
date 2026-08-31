package com.isa.swipeclean.viewmodel

import android.app.Application
import android.content.IntentSender
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.isa.swipeclean.data.AppDatabase
import com.isa.swipeclean.data.TrashEntity
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class TrashViewModel(application: Application) : AndroidViewModel(application) {

    private val trashDao = AppDatabase.getInstance(application).trashDao()

    val trashItems: StateFlow<List<TrashEntity>> = trashDao.observeAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selected = kotlinx.coroutines.flow.MutableStateFlow<Set<String>>(emptySet())
    val selected: StateFlow<Set<String>> = _selected

    /** Cuando el sistema pide confirmación de borrado (Android 11+), se emite aquí. */
    private val _deleteRequest = kotlinx.coroutines.flow.MutableStateFlow<IntentSender?>(null)
    val deleteRequest: StateFlow<IntentSender?> = _deleteRequest

    // Guarda temporalmente qué uris se están intentando borrar mientras se espera confirmación
    private var pendingDeleteUris: List<String> = emptyList()

    fun toggleSelect(uriString: String) {
        val current = _selected.value
        _selected.value = if (current.contains(uriString)) current - uriString else current + uriString
    }

    fun selectAll() {
        _selected.value = trashItems.value.map { it.uriString }.toSet()
    }

    fun clearSelection() {
        _selected.value = emptySet()
    }

    fun restoreSelected() {
        val uris = _selected.value.toList()
        viewModelScope.launch {
            trashDao.removeByUris(uris)
            _selected.value = emptySet()
        }
    }

    fun restoreAll() {
        viewModelScope.launch {
            trashDao.clearAll()
            _selected.value = emptySet()
        }
    }

    fun deleteSelected() {
        requestPermanentDelete(_selected.value.toList())
    }

    fun emptyTrash() {
        requestPermanentDelete(trashItems.value.map { it.uriString })
    }

    private fun requestPermanentDelete(uriStrings: List<String>) {
        if (uriStrings.isEmpty()) return
        pendingDeleteUris = uriStrings
        val context = getApplication<android.app.Application>()
        val uris = uriStrings.map { Uri.parse(it) }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val pendingIntent = MediaStore.createDeleteRequest(context.contentResolver, uris)
            _deleteRequest.value = pendingIntent.intentSender
        } else {
            // API 29: borrado directo; si el sistema exige confirmación se captura
            // la RecoverableSecurityException y se relanza como IntentSender.
            viewModelScope.launch {
                try {
                    uris.forEach { context.contentResolver.delete(it, null, null) }
                    onDeleteConfirmed()
                } catch (e: android.app.RecoverableSecurityException) {
                    _deleteRequest.value = e.userAction.actionIntent.intentSender
                }
            }
        }
    }

    /** Llamar cuando el usuario confirma el diálogo de borrado del sistema. */
    fun onDeleteConfirmed() {
        viewModelScope.launch {
            trashDao.removeByUris(pendingDeleteUris)
            pendingDeleteUris = emptyList()
            _selected.value = emptySet()
            _deleteRequest.value = null
        }
    }

    fun onDeleteCancelled() {
        pendingDeleteUris = emptyList()
        _deleteRequest.value = null
    }
}
