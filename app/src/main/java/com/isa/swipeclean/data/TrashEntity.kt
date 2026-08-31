package com.isa.swipeclean.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Representa un elemento marcado para borrar. Guardar aquí NO borra el
 * archivo real: solo lo "esconde" de la revisión y lo lista en Papelera,
 * hasta que el usuario confirme el borrado definitivo.
 */
@Entity(tableName = "trash_items")
data class TrashEntity(
    @PrimaryKey val uriString: String,
    val mediaType: String,
    val displayName: String,
    val dateAdded: Long,
    val trashedAt: Long
)
