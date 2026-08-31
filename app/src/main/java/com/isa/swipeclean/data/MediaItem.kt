package com.isa.swipeclean.data

import android.net.Uri

enum class MediaType { PHOTO, VIDEO }

data class MediaItem(
    val id: Long,
    val uri: Uri,
    val type: MediaType,
    val displayName: String,
    val dateAdded: Long
)
