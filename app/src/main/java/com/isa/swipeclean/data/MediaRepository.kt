package com.isa.swipeclean.data

import android.content.Context
import android.net.Uri
import android.provider.MediaStore

/**
 * Lee fotos o videos directamente del MediaStore del sistema.
 * No copia ni mueve archivos: solo obtiene las referencias (URIs).
 */
class MediaRepository(private val context: Context) {

    fun queryMedia(type: MediaType): List<MediaItem> {
        val collection = if (type == MediaType.PHOTO) {
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        } else {
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI
        }

        val projection = arrayOf(
            MediaStore.MediaColumns._ID,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.DATE_ADDED
        )

        val sortOrder = "${MediaStore.MediaColumns.DATE_ADDED} DESC"

        val items = mutableListOf<MediaItem>()

        context.contentResolver.query(
            collection, projection, null, null, sortOrder
        )?.use { cursor ->
            val idCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
            val nameCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
            val dateCol = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_ADDED)

            while (cursor.moveToNext()) {
                val id = cursor.getLong(idCol)
                val uri = Uri.withAppendedPath(collection, id.toString())
                items.add(
                    MediaItem(
                        id = id,
                        uri = uri,
                        type = type,
                        displayName = cursor.getString(nameCol) ?: "",
                        dateAdded = cursor.getLong(dateCol)
                    )
                )
            }
        }
        return items
    }
}
