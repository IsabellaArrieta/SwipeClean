package com.isa.swipeclean.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

private val Context.checkpointDataStore: DataStore<Preferences> by preferencesDataStore(name = "swipe_checkpoint")

class CheckpointManager(private val context: Context) {

    private fun keyFor(mediaType: MediaType) = stringPreferencesKey("last_uri_${mediaType.name}")

    suspend fun saveCheckpoint(mediaType: MediaType, uri: String) {
        context.checkpointDataStore.edit { prefs ->
            prefs[keyFor(mediaType)] = uri
        }
    }

    suspend fun getCheckpoint(mediaType: MediaType): String? {
        return context.checkpointDataStore.data.first()[keyFor(mediaType)]
    }

    suspend fun clearCheckpoint(mediaType: MediaType) {
        context.checkpointDataStore.edit { prefs ->
            prefs.remove(keyFor(mediaType))
        }
    }
}