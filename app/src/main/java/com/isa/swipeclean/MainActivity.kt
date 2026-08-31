package com.isa.swipeclean

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.isa.swipeclean.navigation.SwipeCleanNavGraph
import com.isa.swipeclean.ui.theme.SwipeCleanTheme
import com.isa.swipeclean.viewmodel.ThemeViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val themeViewModel: ThemeViewModel = viewModel()
            val isDarkTheme by themeViewModel.isDarkTheme.collectAsState()

            SwipeCleanTheme(darkTheme = isDarkTheme) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    SwipeCleanNavGraph(
                        isDarkTheme = isDarkTheme,
                        onToggleTheme = { themeViewModel.toggleTheme() }
                    )
                }
            }
        }
    }
}