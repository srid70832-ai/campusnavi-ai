package com.example.data.model

enum class RoomCategory(val displayName: String, val iconName: String) {
    AI_LAB("AI & Tech Lab", "Computer"),
    CLASSROOM("Classroom", "School"),
    LIBRARY("Library & Study", "LocalLibrary"),
    AUDITORIUM("Auditorium", "TheaterComedy"),
    FACULTY("Faculty & Research", "Person"),
    ADMIN("Administration", "Apartment"),
    CAFETERIA("Cafeteria & Dining", "Restaurant"),
    RESTROOM("Restroom", "Wc"),
    ENTRANCE("Campus Entrance", "MeetingRoom"),
    EMERGENCY_EXIT("Emergency Exit", "Emergency")
}

data class CollegeCampus(
    val id: String,
    val name: String,
    val location: String,
    val description: String,
    val isCustom: Boolean = false
)

data class Building(
    val id: String,
    val name: String,
    val code: String,
    val description: String,
    val numFloors: Int,
    val defaultFloor: Int = 1,
    val collegeId: String = "TECH_UNIVERSITY"
)

data class Floor(
    val id: String,
    val buildingId: String,
    val floorNumber: Int,
    val floorName: String,
    val mapWidth: Float = 1000f,
    val mapHeight: Float = 750f
)

data class Room(
    val id: String,
    val buildingId: String,
    val floorNumber: Int,
    val roomNumber: String,
    val name: String,
    val category: RoomCategory,
    val x: Float,
    val y: Float,
    val width: Float = 70f,
    val height: Float = 55f,
    val isAccessible: Boolean = true,
    val description: String = "",
    val facultyOrContact: String = "",
    val openingHours: String = "08:00 - 18:00",
    val associatedNodeId: String = "",
    val isFavorite: Boolean = false,
    val collegeId: String = "TECH_UNIVERSITY"
)

enum class NavNodeType {
    NORMAL,
    ROOM_DOOR,
    LIFT,
    STAIRS,
    RAMP,
    ENTRANCE,
    EMERGENCY_EXIT
}

data class NavNode(
    val id: String,
    val buildingId: String,
    val floorNumber: Int,
    val x: Float,
    val y: Float,
    val type: NavNodeType,
    val label: String
)

data class NavEdge(
    val id: String,
    val fromNodeId: String,
    val toNodeId: String,
    val distanceMeters: Float,
    val isAccessible: Boolean = true, // false for stairs, true for ramps, lifts, corridors
    val isBlocked: Boolean = false,
    val closureReason: String = ""
)

enum class TurnAction {
    START,
    STRAIGHT,
    TURN_LEFT,
    TURN_RIGHT,
    TAKE_LIFT_UP,
    TAKE_LIFT_DOWN,
    TAKE_STAIRS_UP,
    TAKE_STAIRS_DOWN,
    TAKE_RAMP,
    ARRIVE
}

data class RouteSegment(
    val fromNode: NavNode,
    val toNode: NavNode,
    val distanceMeters: Float,
    val action: TurnAction,
    val instructionEn: String,
    val instructionTa: String,
    val floorTransition: Boolean = false
)

data class RouteResult(
    val success: Boolean,
    val pathNodes: List<NavNode> = emptyList(),
    val segments: List<RouteSegment> = emptyList(),
    val totalDistanceMeters: Float = 0f,
    val estimatedTimeSeconds: Int = 0,
    val containsFloorChange: Boolean = false,
    val isWheelchairCompliant: Boolean = true,
    val errorMessage: String = "",
    val multiFloorSummary: List<String> = emptyList()
)

data class TimetableItem(
    val id: Long = 0,
    val subjectName: String,
    val courseCode: String,
    val instructor: String,
    val roomId: String,
    val buildingId: String,
    val floorNumber: Int,
    val dayOfWeek: String, // "Monday", "Tuesday", etc.
    val startTime: String, // "09:00"
    val endTime: String   // "10:30"
)

data class AnnouncementItem(
    val id: Long = 0,
    val title: String,
    val content: String,
    val type: String, // "CLOSURE", "EVENT", "ALERT"
    val timestamp: Long = System.currentTimeMillis(),
    val isCritical: Boolean = false
)

data class EmergencyContact(
    val id: Long = 0,
    val title: String,
    val role: String,
    val phoneNumber: String,
    val location: String,
    val priority: Int = 1,
    val collegeId: String = "TECH_UNIVERSITY"
)

data class NavigationAnalytics(
    val id: Long = 0,
    val startRoom: String,
    val destinationRoom: String,
    val distanceMeters: Float,
    val isAccessibleMode: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

data class CampusPhoto(
    val id: Long = 0,
    val collegeId: String = "TECH_UNIVERSITY",
    val title: String,
    val description: String,
    val category: String = "BUILDING", // "CAMPUS_VIEW", "BUILDING", "CLASSROOM", "LAB", "LIBRARY", "AUDITORIUM", "CAFETERIA", "MAP_BLUEPRINT"
    val photoUrl: String,
    val uploadedBy: String = "College Admin",
    val timestamp: Long = System.currentTimeMillis(),
    val buildingName: String = "",
    val roomOrArea: String = ""
)

data class CampusSettings(
    val isDarkTheme: Boolean = true,
    val isHighContrast: Boolean = false,
    val isWheelchairMode: Boolean = false,
    val voiceLanguage: String = "English", // "English" or "Tamil"
    val voiceSpeed: Float = 1.0f,
    val isVoiceEnabled: Boolean = true,
    val walkingSpeedMps: Float = 1.2f, // 1.2 m/s standard, 0.8 for wheelchair
    val currentBuildingId: String = "TP",
    val currentFloorNumber: Int = 1
)

enum class UserRole(val displayName: String, val badge: String, val description: String) {
    VISITOR("Visitor / Guest", "Visitor", "Browse campus, search classrooms, interactive 2D map, and turn-by-turn voice routes"),
    STUDENT("Student", "Student", "Access course schedule, next-class routes, timetable, facilities, and accessible routing"),
    ADMIN("College Admin / Faculty", "Admin", "Upload campus floor plans & photos, map camera landmark routes, manage closures & publish emergency dispatch")
}

data class UserSession(
    val role: UserRole = UserRole.VISITOR,
    val name: String = "Campus Guest",
    val emailOrId: String = "guest@campus.edu",
    val department: String = "Campus Visitor",
    val collegeId: String = "TECH_UNIVERSITY",
    val collegeName: String = "Apex Institute of Technology & AI",
    val isAuthenticated: Boolean = true
)
