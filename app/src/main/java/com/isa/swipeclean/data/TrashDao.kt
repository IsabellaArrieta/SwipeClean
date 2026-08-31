package com.isa.swipeclean.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TrashDao {
    @Query("SELECT * FROM trash_items ORDER BY trashedAt DESC")
    fun observeAll(): Flow<List<TrashEntity>>

    @Query("SELECT uriString FROM trash_items")
    suspend fun allUris(): List<String>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: TrashEntity)

    @Query("DELETE FROM trash_items WHERE uriString = :uriString")
    suspend fun removeByUri(uriString: String)

    @Query("DELETE FROM trash_items WHERE uriString IN (:uris)")
    suspend fun removeByUris(uris: List<String>)

    @Query("DELETE FROM trash_items")
    suspend fun clearAll()
}
