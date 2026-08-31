package com.isa.swipeclean.navigation

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.isa.swipeclean.data.MediaType
import com.isa.swipeclean.ui.screens.GalleryScreen
import com.isa.swipeclean.ui.screens.HomeScreen
import com.isa.swipeclean.ui.screens.SettingsScreen
import com.isa.swipeclean.ui.screens.StatsScreen
import com.isa.swipeclean.ui.screens.SwipeScreen
import com.isa.swipeclean.ui.screens.TrashScreen

object Routes {
    const val HOME = "home"
    const val PHOTOS = "photos"
    const val VIDEOS = "videos"
    const val TRASH = "trash"
    const val GALLERY_PHOTOS = "gallery_photos"
    const val GALLERY_VIDEOS = "gallery_videos"
    const val STATS = "stats"
    const val SETTINGS = "settings"
    const val JUMP_ARG = "jumpUri"

    fun photosRoute(jumpUri: String? = null): String =
        if (jumpUri != null) "$PHOTOS?$JUMP_ARG=${Uri.encode(jumpUri)}" else PHOTOS

    fun videosRoute(jumpUri: String? = null): String =
        if (jumpUri != null) "$VIDEOS?$JUMP_ARG=${Uri.encode(jumpUri)}" else VIDEOS
}

@Composable
fun SwipeCleanNavGraph(
    navController: NavHostController = rememberNavController(),
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit
) {
    NavHost(navController = navController, startDestination = Routes.HOME) {
        composable(Routes.HOME) {
            HomeScreen(
                onOpenPhotos = { navController.navigate(Routes.photosRoute()) },
                onOpenVideos = { navController.navigate(Routes.videosRoute()) },
                onOpenTrash = { navController.navigate(Routes.TRASH) },
                onOpenStats = { navController.navigate(Routes.STATS) },
                onOpenSettings = { navController.navigate(Routes.SETTINGS) },
                isDarkTheme = isDarkTheme,
                onToggleTheme = onToggleTheme
            )
        }
        composable(
            route = "${Routes.PHOTOS}?${Routes.JUMP_ARG}={${Routes.JUMP_ARG}}",
            arguments = listOf(navArgument(Routes.JUMP_ARG) {
                type = NavType.StringType
                nullable = true
                defaultValue = null
            })
        ) { backStackEntry ->
            val jumpUri = backStackEntry.arguments?.getString(Routes.JUMP_ARG)
            SwipeScreen(
                mediaType = MediaType.PHOTO,
                onBack = { navController.popBackStack() },
                jumpToUri = jumpUri,
                onOpenGallery = { navController.navigate(Routes.GALLERY_PHOTOS) }
            )
        }
        composable(
            route = "${Routes.VIDEOS}?${Routes.JUMP_ARG}={${Routes.JUMP_ARG}}",
            arguments = listOf(navArgument(Routes.JUMP_ARG) {
                type = NavType.StringType
                nullable = true
                defaultValue = null
            })
        ) { backStackEntry ->
            val jumpUri = backStackEntry.arguments?.getString(Routes.JUMP_ARG)
            SwipeScreen(
                mediaType = MediaType.VIDEO,
                onBack = { navController.popBackStack() },
                jumpToUri = jumpUri,
                onOpenGallery = { navController.navigate(Routes.GALLERY_VIDEOS) }
            )
        }
        composable(Routes.TRASH) {
            TrashScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.GALLERY_PHOTOS) {
            GalleryScreen(
                mediaType = MediaType.PHOTO,
                onBack = { navController.popBackStack() },
                onJumpTo = { uri ->
                    navController.navigate(Routes.photosRoute(uri)) {
                        popUpTo(Routes.HOME)
                        launchSingleTop = true
                    }
                },
                onGoToTrash = {
                    navController.navigate(Routes.TRASH) {
                        popUpTo(Routes.HOME)
                        launchSingleTop = true
                    }
                },
                onResetComplete = {
                    navController.popBackStack(Routes.HOME, false)
                }
            )
        }
        composable(Routes.GALLERY_VIDEOS) {
            GalleryScreen(
                mediaType = MediaType.VIDEO,
                onBack = { navController.popBackStack() },
                onJumpTo = { uri ->
                    navController.navigate(Routes.videosRoute(uri)) {
                        popUpTo(Routes.HOME)
                        launchSingleTop = true
                    }
                },
                onGoToTrash = {
                    navController.navigate(Routes.TRASH) {
                        popUpTo(Routes.HOME)
                        launchSingleTop = true
                    }
                },
                onResetComplete = {
                    navController.popBackStack(Routes.HOME, false)
                }
            )
        }
        composable(Routes.STATS) {
            StatsScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.SETTINGS) {
            SettingsScreen(onBack = { navController.popBackStack() })
        }
    }
}