package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "colleges")
data class CollegeEntity(
    @PrimaryKey val id: String,
    val name: String,
    val location: String,
    val description: String,
    val isCustom: Boolean = false
)

@Entity(tableName = "rooms")
data class RoomEntity(
    @PrimaryKey val id: String,
    val buildingId: String,
    val floorNumber: Int,
    val roomNumber: String,
    val name: String,
    val category: String,
    val x: Float,
    val y: Float,
    val width: Float,
    val height: Float,
    val isAccessible: Boolean,
    val description: String,
    val facultyOrContact: String,
    val openingHours: String,
    val associatedNodeId: String,
    val isFavorite: Boolean = false,
    val collegeId: String = "TECH_UNIVERSITY"
)

@Entity(tableName = "nav_edges")
data class EdgeEntity(
    @PrimaryKey val id: String,
    val fromNodeId: String,
    val toNodeId: String,
    val distanceMeters: Float,
    val isAccessible: Boolean,
    val isBlocked: Boolean,
    val closureReason: String
)

@Entity(tableName = "timetable")
data class TimetableEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val subjectName: String,
    val courseCode: String,
    val instructor: String,
    val roomId: String,
    val buildingId: String,
    val floorNumber: Int,
    val dayOfWeek: String,
    val startTime: String,
    val endTime: String
)

@Entity(tableName = "announcements")
data class AnnouncementEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val content: String,
    val type: String,
    val timestamp: Long,
    val isCritical: Boolean
)

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val roomId: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "emergency_contacts")
data class EmergencyContactEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val role: String,
    val phoneNumber: String,
    val location: String,
    val priority: Int,
    val collegeId: String = "TECH_UNIVERSITY"
)

@Entity(tableName = "analytics")
data class AnalyticsEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val startRoom: String,
    val destinationRoom: String,
    val distanceMeters: Float,
    val isAccessibleMode: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "campus_photos")
data class CampusPhotoEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val collegeId: String,
    val title: String,
    val description: String,
    val category: String,
    val photoUrl: String,
    val uploadedBy: String = "College Admin",
    val timestamp: Long = System.currentTimeMillis(),
    val buildingName: String = "",
    val roomOrArea: String = ""
)
