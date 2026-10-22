package com.example.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface CampusDao {

    // Colleges
    @Query("SELECT * FROM colleges")
    fun getAllColleges(): Flow<List<CollegeEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertColleges(colleges: List<CollegeEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCollege(college: CollegeEntity)

    @Query("DELETE FROM colleges WHERE id = :id")
    suspend fun deleteCollege(id: String)

    @Query("DELETE FROM colleges")
    suspend fun clearColleges()

    // Rooms
    @Query("SELECT * FROM rooms")
    fun getAllRooms(): Flow<List<RoomEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRooms(rooms: List<RoomEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoom(room: RoomEntity)

    @Delete
    suspend fun deleteRoom(room: RoomEntity)

    @Query("DELETE FROM rooms")
    suspend fun clearRooms()

    // Edges & Closures
    @Query("SELECT * FROM nav_edges")
    fun getAllEdges(): Flow<List<EdgeEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEdges(edges: List<EdgeEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEdge(edge: EdgeEntity)

    @Update
    suspend fun updateEdge(edge: EdgeEntity)

    @Query("UPDATE nav_edges SET isBlocked = :isBlocked, closureReason = :reason WHERE id = :edgeId")
    suspend fun setEdgeBlocked(edgeId: String, isBlocked: Boolean, reason: String)

    @Query("DELETE FROM nav_edges")
    suspend fun clearEdges()

    // Timetable
    @Query("SELECT * FROM timetable ORDER BY startTime ASC")
    fun getTimetable(): Flow<List<TimetableEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTimetable(item: TimetableEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTimetableList(items: List<TimetableEntity>)

    @Query("DELETE FROM timetable WHERE id = :id")
    suspend fun deleteTimetable(id: Long)

    @Query("DELETE FROM timetable")
    suspend fun clearTimetable()

    // Announcements
    @Query("SELECT * FROM announcements ORDER BY timestamp DESC")
    fun getAnnouncements(): Flow<List<AnnouncementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnnouncement(item: AnnouncementEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnnouncements(items: List<AnnouncementEntity>)

    @Query("DELETE FROM announcements WHERE id = :id")
    suspend fun deleteAnnouncement(id: Long)

    @Query("DELETE FROM announcements")
    suspend fun clearAnnouncements()

    // Favorites
    @Query("SELECT * FROM favorites ORDER BY timestamp DESC")
    fun getFavorites(): Flow<List<FavoriteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addFavorite(fav: FavoriteEntity)

    @Query("DELETE FROM favorites WHERE roomId = :roomId")
    suspend fun removeFavorite(roomId: String)

    // Emergency Contacts
    @Query("SELECT * FROM emergency_contacts ORDER BY priority ASC")
    fun getEmergencyContacts(): Flow<List<EmergencyContactEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEmergencyContacts(contacts: List<EmergencyContactEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEmergencyContact(contact: EmergencyContactEntity)

    @Query("DELETE FROM emergency_contacts WHERE id = :id")
    suspend fun deleteEmergencyContact(id: Long)

    @Query("DELETE FROM emergency_contacts")
    suspend fun clearEmergencyContacts()

    // Analytics
    @Query("SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 50")
    fun getAnalytics(): Flow<List<AnalyticsEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnalytics(item: AnalyticsEntity)

    // Campus Photos (Added by College Admin)
    @Query("SELECT * FROM campus_photos ORDER BY timestamp DESC")
    fun getAllCampusPhotos(): Flow<List<CampusPhotoEntity>>

    @Query("SELECT * FROM campus_photos WHERE collegeId = :collegeId ORDER BY timestamp DESC")
    fun getCampusPhotosForCollege(collegeId: String): Flow<List<CampusPhotoEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCampusPhoto(photo: CampusPhotoEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCampusPhotos(photos: List<CampusPhotoEntity>)

    @Query("DELETE FROM campus_photos WHERE id = :id")
    suspend fun deleteCampusPhoto(id: Long)

    @Query("DELETE FROM campus_photos")
    suspend fun clearCampusPhotos()
}
