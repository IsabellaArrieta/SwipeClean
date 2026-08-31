package com.isa.swipeclean.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.isa.swipeclean.data.ThemePreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ThemeViewModel(application: Application) : AndroidViewModel(application) {
    private val prefs = ThemePreferences(application)

    private val _isDarkTheme = MutableStateFlow(false)
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

    init {
        viewModelScope.launch {
            _isDarkTheme.value = prefs.getDarkTheme() ?: false
        }
    }

    fun toggleTheme() {
        val newValue = !_isDarkTheme.value
        _isDarkTheme.value = newValue
        viewModelScope.launch { prefs.saveDarkTheme(newValue) }
    }
}