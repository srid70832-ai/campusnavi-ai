package com.example.data.repository

import android.content.Context
import com.example.data.local.*
import com.example.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class CampusRepository(private val campusDao: CampusDao) {

    private val navNodesMap = DefaultCampusData.getInitialNavNodes().associateBy { it.id }.toMutableMap()

    fun getNodesMap(): Map<String, NavNode> = navNodesMap

    val allColleges: Flow<List<CollegeCampus>> = campusDao.getAllColleges().map { entities ->
        entities.map { it.toModel() }
    }

    val allRooms: Flow<List<Room>> = campusDao.getAllRooms().map { entities ->
        entities.map { it.toModel() }
    }

    val allEdges: Flow<List<EdgeEntity>> = campusDao.getAllEdges()

    val timetable: Flow<List<TimetableItem>> = campusDao.getTimetable().map { entities ->
        entities.map { it.toModel() }
    }

    val announcements: Flow<List<AnnouncementItem>> = campusDao.getAnnouncements().map { entities ->
        entities.map { it.toModel() }
    }

    val emergencyContacts: Flow<List<EmergencyContact>> = campusDao.getEmergencyContacts().map { entities ->
        entities.map { it.toModel() }
    }

    val favoriteRoomIds: Flow<Set<String>> = campusDao.getFavorites().map { list ->
        list.map { it.roomId }.toSet()
    }

    val analyticsRecords: Flow<List<NavigationAnalytics>> = campusDao.getAnalytics().map { entities ->
        entities.map { it.toModel() }
    }

    val allCampusPhotos: Flow<List<CampusPhoto>> = campusDao.getAllCampusPhotos().map { entities ->
        entities.map { it.toModel() }
    }

    suspend fun initializeDefaultDataIfEmpty() {
        val currentColleges = campusDao.getAllColleges().first()
        if (currentColleges.isEmpty()) {
            resetToDefaultCampusData()
        }
    }

    suspend fun resetToDefaultCampusData() {
        campusDao.clearColleges()
        campusDao.clearRooms()
        campusDao.clearEdges()
        campusDao.clearTimetable()
        campusDao.clearAnnouncements()
        campusDao.clearEmergencyContacts()
        campusDao.clearCampusPhotos()

        campusDao.insertColleges(DefaultCampusData.getInitialColleges())
        campusDao.insertRooms(DefaultCampusData.getInitialRooms())
        campusDao.insertEdges(DefaultCampusData.getInitialNavEdges())
        campusDao.insertTimetableList(DefaultCampusData.getInitialTimetable())
        campusDao.insertAnnouncements(DefaultCampusData.getInitialAnnouncements())
        campusDao.insertEmergencyContacts(DefaultCampusData.getInitialEmergencyContacts())
        campusDao.insertCampusPhotos(DefaultCampusData.getInitialCampusPhotos())
    }

    suspend fun addCampusPhoto(photo: CampusPhoto) {
        campusDao.insertCampusPhoto(photo.toEntity())
    }

    suspend fun deleteCampusPhoto(id: Long) {
        campusDao.deleteCampusPhoto(id)
    }

    suspend fun addCollege(college: CollegeCampus) {
        campusDao.insertCollege(
            CollegeEntity(
                id = college.id,
                name = college.name,
                location = college.location,
                description = college.description,
                isCustom = college.isCustom
            )
        )
    }

    suspend fun addDynamicRoomAndRoute(
        room: Room,
        connectToNodeId: String,
        distanceMeters: Float,
        isAccessible: Boolean
    ) {
        // 1. Create door node
        val doorNodeId = room.associatedNodeId.ifBlank { "N_${room.id}" }
        val updatedRoom = room.copy(associatedNodeId = doorNodeId)
        val navNode = NavNode(
            id = doorNodeId,
            buildingId = room.buildingId,
            floorNumber = room.floorNumber,
            x = room.x + room.width / 2f,
            y = room.y + room.height,
            type = NavNodeType.ROOM_DOOR,
            label = "Door ${room.name}"
        )
        navNodesMap[doorNodeId] = navNode

        // 2. Persist room
        campusDao.insertRoom(updatedRoom.toEntity())

        // 3. Persist bidirectional edges if target connect node exists
        if (connectToNodeId.isNotBlank()) {
            val edgeId = "E_DYN_${doorNodeId}_${connectToNodeId}"
            val edge1 = EdgeEntity(
                id = edgeId,
                fromNodeId = doorNodeId,
                toNodeId = connectToNodeId,
                distanceMeters = distanceMeters,
                isAccessible = isAccessible,
                isBlocked = false,
                closureReason = ""
            )
            val edge2 = EdgeEntity(
                id = "${edgeId}_rev",
                fromNodeId = connectToNodeId,
                toNodeId = doorNodeId,
                distanceMeters = distanceMeters,
                isAccessible = isAccessible,
                isBlocked = false,
                closureReason = ""
            )
            campusDao.insertEdge(edge1)
            campusDao.insertEdge(edge2)
        }
    }

    suspend fun addEmergencyContact(contact: EmergencyContact) {
        campusDao.insertEmergencyContact(contact.toEntity())
    }

    suspend fun deleteEmergencyContact(id: Long) {
        campusDao.deleteEmergencyContact(id)
    }

    suspend fun toggleEdgeBlocked(edgeId: String, isBlocked: Boolean, reason: String = "") {
        campusDao.setEdgeBlocked(edgeId, isBlocked, reason)
        // Also update reverse edge if exists
        val revId = if (edgeId.endsWith("_rev")) edgeId.removeSuffix("_rev") else "${edgeId}_rev"
        campusDao.setEdgeBlocked(revId, isBlocked, reason)
    }

    suspend fun toggleFavorite(roomId: String, isCurrentlyFavorite: Boolean) {
        if (isCurrentlyFavorite) {
            campusDao.removeFavorite(roomId)
        } else {
            campusDao.addFavorite(FavoriteEntity(roomId = roomId))
        }
    }

    suspend fun addRoom(room: Room) {
        campusDao.insertRoom(room.toEntity())
    }

    suspend fun deleteRoom(room: Room) {
        campusDao.deleteRoom(room.toEntity())
    }

    suspend fun addTimetableItem(item: TimetableItem) {
        campusDao.insertTimetable(item.toEntity())
    }

    suspend fun deleteTimetableItem(id: Long) {
        campusDao.deleteTimetable(id)
    }

    suspend fun addAnnouncement(announcement: AnnouncementItem) {
        campusDao.insertAnnouncement(announcement.toEntity())
    }

    suspend fun deleteAnnouncement(id: Long) {
        campusDao.deleteAnnouncement(id)
    }

    suspend fun recordAnalytics(startRoom: String, destRoom: String, distance: Float, accessible: Boolean) {
        campusDao.insertAnalytics(
            AnalyticsEntity(
                startRoom = startRoom,
                destinationRoom = destRoom,
                distanceMeters = distance,
                isAccessibleMode = accessible
            )
        )
    }

    companion object {
        @Volatile
        private var INSTANCE: CampusRepository? = null

        fun getInstance(context: Context): CampusRepository {
            return INSTANCE ?: synchronized(this) {
                val db = CampusDatabase.getDatabase(context)
                val repo = CampusRepository(db.campusDao())
                INSTANCE = repo
                CoroutineScope(Dispatchers.IO).launch {
                    repo.initializeDefaultDataIfEmpty()
                }
                repo
            }
        }
    }
}

// Converters
private fun CollegeEntity.toModel(): CollegeCampus = CollegeCampus(
    id = id,
    name = name,
    location = location,
    description = description,
    isCustom = isCustom
)

private fun RoomEntity.toModel(): Room = Room(
    id = id,
    buildingId = buildingId,
    floorNumber = floorNumber,
    roomNumber = roomNumber,
    name = name,
    category = try { RoomCategory.valueOf(category) } catch (e: Exception) { RoomCategory.CLASSROOM },
    x = x, y = y, width = width, height = height,
    isAccessible = isAccessible,
    description = description,
    facultyOrContact = facultyOrContact,
    openingHours = openingHours,
    associatedNodeId = associatedNodeId,
    isFavorite = isFavorite,
    collegeId = collegeId
)

private fun Room.toEntity(): RoomEntity = RoomEntity(
    id = id,
    buildingId = buildingId,
    floorNumber = floorNumber,
    roomNumber = roomNumber,
    name = name,
    category = category.name,
    x = x, y = y, width = width, height = height,
    isAccessible = isAccessible,
    description = description,
    facultyOrContact = facultyOrContact,
    openingHours = openingHours,
    associatedNodeId = associatedNodeId,
    isFavorite = isFavorite,
    collegeId = collegeId
)

private fun TimetableEntity.toModel(): TimetableItem = TimetableItem(
    id = id,
    subjectName = subjectName,
    courseCode = courseCode,
    instructor = instructor,
    roomId = roomId,
    buildingId = buildingId,
    floorNumber = floorNumber,
    dayOfWeek = dayOfWeek,
    startTime = startTime,
    endTime = endTime
)

private fun TimetableItem.toEntity(): TimetableEntity = TimetableEntity(
    id = id,
    subjectName = subjectName,
    courseCode = courseCode,
    instructor = instructor,
    roomId = roomId,
    buildingId = buildingId,
    floorNumber = floorNumber,
    dayOfWeek = dayOfWeek,
    startTime = startTime,
    endTime = endTime
)

private fun AnnouncementEntity.toModel(): AnnouncementItem = AnnouncementItem(
    id = id,
    title = title,
    content = content,
    type = type,
    timestamp = timestamp,
    isCritical = isCritical
)

private fun AnnouncementItem.toEntity(): AnnouncementEntity = AnnouncementEntity(
    id = id,
    title = title,
    content = content,
    type = type,
    timestamp = timestamp,
    isCritical = isCritical
)

private fun EmergencyContactEntity.toModel(): EmergencyContact = EmergencyContact(
    id = id,
    title = title,
    role = role,
    phoneNumber = phoneNumber,
    location = location,
    priority = priority,
    collegeId = collegeId
)

private fun EmergencyContact.toEntity(): EmergencyContactEntity = EmergencyContactEntity(
    id = id,
    title = title,
    role = role,
    phoneNumber = phoneNumber,
    location = location,
    priority = priority,
    collegeId = collegeId
)

private fun AnalyticsEntity.toModel(): NavigationAnalytics = NavigationAnalytics(
    id = id,
    startRoom = startRoom,
    destinationRoom = destinationRoom,
    distanceMeters = distanceMeters,
    isAccessibleMode = isAccessibleMode,
    timestamp = timestamp
)

private fun CampusPhotoEntity.toModel(): CampusPhoto = CampusPhoto(
    id = id,
    collegeId = collegeId,
    title = title,
    description = description,
    category = category,
    photoUrl = photoUrl,
    uploadedBy = uploadedBy,
    timestamp = timestamp,
    buildingName = buildingName,
    roomOrArea = roomOrArea
)

private fun CampusPhoto.toEntity(): CampusPhotoEntity = CampusPhotoEntity(
    id = id,
    collegeId = collegeId,
    title = title,
    description = description,
    category = category,
    photoUrl = photoUrl,
    uploadedBy = uploadedBy,
    timestamp = timestamp,
    buildingName = buildingName,
    roomOrArea = roomOrArea
)
