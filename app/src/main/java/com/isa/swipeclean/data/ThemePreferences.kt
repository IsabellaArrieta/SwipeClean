package com.isa.swipeclean.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

private val Context.themeDataStore: DataStore<Preferences> by preferencesDataStore(name = "swipe_theme")

class ThemePreferences(private val context: Context) {
    private val darkModeKey = booleanPreferencesKey("dark_mode_enabled")

    suspend fun getDarkTheme(): Boolean? {
        return context.themeDataStore.data.first()[darkModeKey]
    }

    suspend fun saveDarkTheme(enabled: Boolean) {
        context.themeDataStore.edit { it[darkModeKey] = enabled }
    }
}