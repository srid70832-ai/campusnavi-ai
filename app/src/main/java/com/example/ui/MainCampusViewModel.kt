package com.example.ui

import android.app.Application
import android.graphics.Bitmap
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.DefaultCampusData
import com.example.data.local.EdgeEntity
import com.example.data.model.*
import com.example.data.repository.CampusRepository
import com.example.domain.ai.GeminiCampusAssistant
import com.example.domain.routing.DijkstraRouter
import com.example.domain.voice.VoiceNavigationManager
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

enum class CampusScreen(val title: String) {
    DASHBOARD("Campus Home"),
    INDOOR_MAP("Indoor Navigation"),
    DIRECTORY("Campus Directory & Photos"),
    AI_ASSISTANT("AI Campus Guide"),
    TIMETABLE("My Class Schedule"),
    CAMERA_NAV("Visual Sign Scanner"),
    EMERGENCY("Emergency SOS"),
    ADMIN("Admin Management"),
    SETTINGS("Accessibility & Settings"),
    ANALYTICS("Campus Analytics"),
    LOGIN("Campus Portal & Role Login")
}

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

class MainCampusViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = CampusRepository.getInstance(application)
    val voiceManager = VoiceNavigationManager(application)
    val geminiAssistant = GeminiCampusAssistant()

    // Navigation backstack
    private val _screenStack = MutableStateFlow(listOf(CampusScreen.DASHBOARD))
    val currentScreen: StateFlow<CampusScreen> = _screenStack.map { it.lastOrNull() ?: CampusScreen.DASHBOARD }
        .stateIn(viewModelScope, SharingStarted.Eagerly, CampusScreen.DASHBOARD)

    fun navigateTo(screen: CampusScreen) {
        if (_screenStack.value.lastOrNull() != screen) {
            _screenStack.value = _screenStack.value + screen
        }
    }

    fun navigateBack(): Boolean {
        if (_screenStack.value.size > 1) {
            _screenStack.value = _screenStack.value.dropLast(1)
            return true
        }
        return false
    }

    // Campus Data Flows
    val allColleges = repository.allColleges.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val selectedCollegeId = MutableStateFlow("TECH_UNIVERSITY")

    val allRooms = repository.allRooms.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val allEdges = repository.allEdges.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val timetable = repository.timetable.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val announcements = repository.announcements.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val emergencyContacts = repository.emergencyContacts.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val favoriteRoomIds = repository.favoriteRoomIds.stateIn(viewModelScope, SharingStarted.Lazily, emptySet())
    val analyticsRecords = repository.analyticsRecords.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
    val allCampusPhotos = repository.allCampusPhotos.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    // Selected Map Context
    val selectedBuildingId = MutableStateFlow("TP")
    val selectedFloorNumber = MutableStateFlow(1)

    // Routing Selection
    val selectedStartRoom = MutableStateFlow<Room?>(null)
    val selectedDestRoom = MutableStateFlow<Room?>(null)
    val isWheelchairMode = MutableStateFlow(false)
    val walkingSpeedMps = MutableStateFlow(1.2f)

    // Computed Route
    private val _routeResult = MutableStateFlow<RouteResult?>(null)
    val routeResult: StateFlow<RouteResult?> = _routeResult.asStateFlow()

    // Current Step in Step-by-Step Navigation
    val activeStepIndex = MutableStateFlow(0)

    // Directory Search & Filters
    val searchQuery = MutableStateFlow("")
    val selectedCategoryFilter = MutableStateFlow<RoomCategory?>(null)

    // Settings
    val isHighContrast = MutableStateFlow(false)
    val isDarkTheme = MutableStateFlow(true)
    val preferredLanguage = MutableStateFlow("English") // "English" or "Tamil"
    val voiceSpeedRate = MutableStateFlow(1.0f)

    // User Authentication & Role Session (Admin, Student, Visitor)
    val userSession = MutableStateFlow(
        UserSession(
            role = UserRole.VISITOR,
            name = "Campus Visitor",
            emailOrId = "visitor@college.edu",
            department = "General Campus Guest",
            collegeId = "TECH_UNIVERSITY",
            collegeName = "Apex Institute of Technology & AI",
            isAuthenticated = true
        )
    )

    fun login(
        role: UserRole,
        name: String,
        emailOrId: String,
        department: String = "",
        collegeId: String = ""
    ) {
        val targetCollId = collegeId.ifBlank { selectedCollegeId.value }
        val activeColl = allColleges.value.find { it.id == targetCollId }
        val cId = activeColl?.id ?: targetCollId
        val cName = activeColl?.name ?: "Selected College"

        userSession.value = UserSession(
            role = role,
            name = name.ifBlank {
                when (role) {
                    UserRole.ADMIN -> "College Admin / Map Coordinator"
                    UserRole.STUDENT -> "Student Member"
                    UserRole.VISITOR -> "Campus Visitor"
                }
            },
            emailOrId = emailOrId.ifBlank {
                when (role) {
                    UserRole.ADMIN -> "admin@$cId.edu"
                    UserRole.STUDENT -> "student@$cId.edu"
                    UserRole.VISITOR -> "visitor@gmail.com"
                }
            },
            department = department.ifBlank {
                when (role) {
                    UserRole.ADMIN -> "Campus Planning & Infrastructure"
                    UserRole.STUDENT -> "Computer Science & Engineering"
                    UserRole.VISITOR -> "Campus Guest"
                }
            },
            collegeId = cId,
            collegeName = cName,
            isAuthenticated = true
        )

        selectCollege(cId)

        val greeting = if (preferredLanguage.value == "Tamil") {
            when (role) {
                UserRole.ADMIN -> "$cName நிர்வாகியாக உள்நுழைந்துள்ளீர்கள். புதிய வரைபடங்கள் மற்றும் வழிகளை பதிவேற்றலாம்."
                UserRole.STUDENT -> "மாணவராக உள்நுழைந்துள்ளீர்கள். வகுப்பறைகள் மற்றும் கால அட்டவணை வழிகளை காணலாம்."
                UserRole.VISITOR -> "பார்வையாளராக உள்நுழைந்துள்ளீர்கள். வளாக வழிகளை கண்டறியலாம்."
            }
        } else {
            when (role) {
                UserRole.ADMIN -> "Logged in as $cName Admin. Route and floorplan mapping unlocked."
                UserRole.STUDENT -> "Logged in as Student. Class schedules and indoor routes available."
                UserRole.VISITOR -> "Logged in as Visitor. Campus wayfinding and voice guidance ready."
            }
        }
        voiceManager.speak(greeting, preferredLanguage.value, voiceSpeedRate.value)
    }

    fun logout() {
        userSession.value = UserSession(
            role = UserRole.VISITOR,
            name = "Campus Visitor",
            emailOrId = "guest@campus.edu",
            department = "Visitor",
            collegeId = selectedCollegeId.value,
            collegeName = allColleges.value.find { it.id == selectedCollegeId.value }?.name ?: "Selected Campus",
            isAuthenticated = false
        )
    }

    // AI Chat
    private val _chatMessages = MutableStateFlow(
        listOf(
            ChatMessage(
                text = "Hello! I am your AI Campus Guide. Ask me about laboratories, classrooms, library locations, or accessible routes.",
                isUser = false
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()
    val isAiThinking = MutableStateFlow(false)

    // Visual Sign Scanner
    val visualDetectedRoom = MutableStateFlow<Room?>(null)
    val visualStatusMessage = MutableStateFlow("Align camera with room number plaque or landmark sign")
    val isAnalyzingVisual = MutableStateFlow(false)

    init {
        // Auto-initialize start room to Entrance TP-107 and destination to AI Lab TP-103
        viewModelScope.launch {
            allRooms.collect { rooms ->
                if (rooms.isNotEmpty() && selectedStartRoom.value == null) {
                    selectedStartRoom.value = rooms.find { it.id == "TP-107" } ?: rooms.firstOrNull()
                    selectedDestRoom.value = rooms.find { it.id == "TP-103" } ?: rooms.getOrNull(2)
                    calculateRoute()
                }
            }
        }
    }

    fun setBuildingAndFloor(buildingId: String, floorNumber: Int) {
        selectedBuildingId.value = buildingId
        selectedFloorNumber.value = floorNumber
    }

    fun setStartRoom(room: Room) {
        selectedStartRoom.value = room
        calculateRoute()
    }

    fun setDestRoom(room: Room) {
        selectedDestRoom.value = room
        // Auto-switch map to destination's building and floor
        selectedBuildingId.value = room.buildingId
        selectedFloorNumber.value = room.floorNumber
        calculateRoute()
    }

    fun swapStartAndDestination() {
        val temp = selectedStartRoom.value
        selectedStartRoom.value = selectedDestRoom.value
        selectedDestRoom.value = temp
        calculateRoute()
    }

    fun toggleWheelchairMode(enabled: Boolean) {
        isWheelchairMode.value = enabled
        calculateRoute()
    }

    fun calculateRoute() {
        val start = selectedStartRoom.value ?: return
        val dest = selectedDestRoom.value ?: return

        val nodesMap = repository.getNodesMap()
        val edges = allEdges.value

        val startNodeId = start.associatedNodeId
        val destNodeId = dest.associatedNodeId

        if (startNodeId.isBlank() || destNodeId.isBlank()) {
            _routeResult.value = RouteResult(success = false, errorMessage = "Selected room does not have a mapped navigation door node.")
            return
        }

        val result = DijkstraRouter.findRoute(
            startNodeId = startNodeId,
            destinationNodeId = destNodeId,
            nodesMap = nodesMap,
            edgesList = edges,
            wheelchairAccessibleOnly = isWheelchairMode.value,
            walkingSpeedMps = walkingSpeedMps.value
        )
        _routeResult.value = result
        activeStepIndex.value = 0

        // Save analytics
        if (result.success) {
            viewModelScope.launch {
                repository.recordAnalytics(
                    startRoom = start.name,
                    destRoom = dest.name,
                    distance = result.totalDistanceMeters,
                    accessible = isWheelchairMode.value
                )
            }
        }
    }

    fun speakCurrentStep() {
        val result = _routeResult.value ?: return
        val steps = result.segments
        val idx = activeStepIndex.value
        if (idx in steps.indices) {
            val step = steps[idx]
            val text = if (preferredLanguage.value == "Tamil") step.instructionTa else step.instructionEn
            voiceManager.speak(text, preferredLanguage.value, voiceSpeedRate.value)
        }
    }

    fun speakFullRouteSummary() {
        val result = _routeResult.value ?: return
        val dest = selectedDestRoom.value?.name ?: "Destination"
        val dist = result.totalDistanceMeters.toInt()
        val mins = (result.estimatedTimeSeconds / 60).coerceAtLeast(1)

        val summary = if (preferredLanguage.value == "Tamil") {
            "$dest-க்கான வழி கணக்கிடப்பட்டது. மொத்த தூரம் $dist மீட்டர்கள். சுமார் $mins நிமிடங்கள் ஆகும்."
        } else {
            "Route to $dest calculated. Total distance is $dist meters, approximately $mins minutes walk."
        }
        voiceManager.speak(summary, preferredLanguage.value, voiceSpeedRate.value)
    }

    fun nextStep() {
        val max = (_routeResult.value?.segments?.size ?: 1) - 1
        if (activeStepIndex.value < max) {
            activeStepIndex.value += 1
            speakCurrentStep()
        }
    }

    fun previousStep() {
        if (activeStepIndex.value > 0) {
            activeStepIndex.value -= 1
            speakCurrentStep()
        }
    }

    fun toggleFavorite(roomId: String) {
        val isFav = favoriteRoomIds.value.contains(roomId)
        viewModelScope.launch {
            repository.toggleFavorite(roomId, isFav)
        }
    }

    fun sendAiMessage(message: String) {
        if (message.isBlank()) return
        val userMsg = ChatMessage(text = message, isUser = true)
        _chatMessages.value = _chatMessages.value + userMsg

        isAiThinking.value = true
        viewModelScope.launch {
            val blocked = allEdges.value.filter { it.isBlocked }.map { it.closureReason.ifBlank { "Corridor ${it.fromNodeId}" } }
            val reply = geminiAssistant.queryCampusAssistant(
                userMessage = message,
                allRooms = allRooms.value,
                blockedCorridors = blocked,
                preferredLanguage = preferredLanguage.value
            )
            _chatMessages.value = _chatMessages.value + ChatMessage(text = reply, isUser = false)
            isAiThinking.value = false
        }
    }

    fun analyzeVisualSign(bitmap: Bitmap) {
        isAnalyzingVisual.value = true
        visualStatusMessage.value = "Analyzing campus signboard with vision AI..."
        viewModelScope.launch {
            val (room, explanation) = geminiAssistant.analyzeCameraSign(bitmap, allRooms.value)
            visualDetectedRoom.value = room
            visualStatusMessage.value = explanation
            isAnalyzingVisual.value = false
        }
    }

    fun navigateToClass(timetableItem: TimetableItem) {
        val targetRoom = allRooms.value.find { it.id == timetableItem.roomId }
        if (targetRoom != null) {
            setDestRoom(targetRoom)
            navigateTo(CampusScreen.INDOOR_MAP)
        }
    }

    fun navigateToNearestEmergencyExit() {
        val currentFloor = selectedFloorNumber.value
        val currentBldg = selectedBuildingId.value

        // Find nearest exit node on current building & floor
        val exitNode = repository.getNodesMap().values.find {
            it.buildingId == currentBldg && it.floorNumber == currentFloor && it.type == NavNodeType.EMERGENCY_EXIT
        }

        if (exitNode != null) {
            // Find a room near this exit or create temporary destination
            val exitRoom = Room(
                id = exitNode.id,
                buildingId = currentBldg,
                floorNumber = currentFloor,
                roomNumber = "EXIT",
                name = exitNode.label,
                category = RoomCategory.EMERGENCY_EXIT,
                x = exitNode.x, y = exitNode.y,
                associatedNodeId = exitNode.id
            )
            selectedDestRoom.value = exitRoom
            calculateRoute()
            navigateTo(CampusScreen.INDOOR_MAP)
            speakCurrentStep()
        }
    }

    fun toggleCorridorClosure(edgeId: String, isBlocked: Boolean, reason: String) {
        viewModelScope.launch {
            repository.toggleEdgeBlocked(edgeId, isBlocked, reason)
            calculateRoute()
        }
    }

    fun resetCampusData() {
        viewModelScope.launch {
            repository.resetToDefaultCampusData()
            calculateRoute()
        }
    }

    fun addTimetableEntry(item: TimetableItem) {
        viewModelScope.launch {
            repository.addTimetableItem(item)
        }
    }

    fun deleteTimetableEntry(id: Long) {
        viewModelScope.launch {
            repository.deleteTimetableItem(id)
        }
    }

    fun addAnnouncement(item: AnnouncementItem) {
        viewModelScope.launch {
            repository.addAnnouncement(item)
        }
    }

    fun addCampusPhoto(
        title: String,
        description: String,
        category: String,
        photoUrl: String,
        buildingName: String = "",
        roomOrArea: String = ""
    ) {
        viewModelScope.launch {
            val photo = CampusPhoto(
                collegeId = selectedCollegeId.value,
                title = title,
                description = description,
                category = category,
                photoUrl = photoUrl,
                uploadedBy = userSession.value.name,
                timestamp = System.currentTimeMillis(),
                buildingName = buildingName,
                roomOrArea = roomOrArea
            )
            repository.addCampusPhoto(photo)
            val msg = if (preferredLanguage.value == "Tamil") {
                "வளாக புகைப்படம் வெற்றிகரமாக பதிவேற்றப்பட்டது"
            } else {
                "Campus photo published successfully for students and visitors"
            }
            voiceManager.speak(msg, preferredLanguage.value, voiceSpeedRate.value)
        }
    }

    fun deleteCampusPhoto(id: Long) {
        viewModelScope.launch {
            repository.deleteCampusPhoto(id)
        }
    }

    fun deleteAnnouncement(id: Long) {
        viewModelScope.launch {
            repository.deleteAnnouncement(id)
        }
    }

    fun toggleTheme() {
        isDarkTheme.value = !isDarkTheme.value
    }

    fun selectCollege(collegeId: String) {
        selectedCollegeId.value = collegeId
        val collegeRooms = allRooms.value.filter { it.collegeId == collegeId }
        if (collegeRooms.isEmpty() && (collegeId == "ANNA_UNIV" || collegeId == "IIT_MADRAS")) {
            seedPresetCollegeData(collegeId)
        } else if (collegeRooms.isNotEmpty()) {
            val firstRoom = collegeRooms.first()
            selectedBuildingId.value = firstRoom.buildingId
            selectedFloorNumber.value = firstRoom.floorNumber
            selectedStartRoom.value = collegeRooms.find { it.category == RoomCategory.ENTRANCE } ?: collegeRooms.firstOrNull()
            selectedDestRoom.value = collegeRooms.find { it.category != RoomCategory.ENTRANCE } ?: collegeRooms.getOrNull(1)
            calculateRoute()
        }
    }

    private fun seedPresetCollegeData(collegeId: String) {
        viewModelScope.launch {
            if (collegeId == "ANNA_UNIV") {
                val rooms = listOf(
                    Room(
                        id = "AU_ENTRANCE",
                        buildingId = "CEG_MAIN",
                        floorNumber = 1,
                        roomNumber = "ENTRANCE",
                        name = "Red Building Main Entrance & Ramp",
                        category = RoomCategory.ENTRANCE,
                        x = 500f, y = 500f, width = 160f, height = 80f,
                        isAccessible = true,
                        description = "Heritage Red Building main entrance with wide tactile ramp",
                        associatedNodeId = "N_AU_ENTRANCE",
                        collegeId = "ANNA_UNIV"
                    ),
                    Room(
                        id = "AU_CSE_LAB",
                        buildingId = "CEG_MAIN",
                        floorNumber = 1,
                        roomNumber = "CS-101",
                        name = "Ramanujan Computing & AI Lab",
                        category = RoomCategory.AI_LAB,
                        x = 220f, y = 240f, width = 150f, height = 90f,
                        isAccessible = true,
                        description = "High-performance computing lab with GPU cluster and wheelchair access",
                        associatedNodeId = "N_AU_CSE_LAB",
                        collegeId = "ANNA_UNIV"
                    ),
                    Room(
                        id = "AU_LIBRARY",
                        buildingId = "CEG_MAIN",
                        floorNumber = 1,
                        roomNumber = "LIB-01",
                        name = "University Central Library",
                        category = RoomCategory.LIBRARY,
                        x = 760f, y = 240f, width = 150f, height = 90f,
                        isAccessible = true,
                        description = "Digital resource center, quiet study zones, Braille books corner",
                        associatedNodeId = "N_AU_LIBRARY",
                        collegeId = "ANNA_UNIV"
                    ),
                    Room(
                        id = "AU_DEAN",
                        buildingId = "CEG_MAIN",
                        floorNumber = 2,
                        roomNumber = "ADMIN-201",
                        name = "Dean & Administrative Office",
                        category = RoomCategory.ADMIN,
                        x = 500f, y = 220f, width = 150f, height = 90f,
                        isAccessible = true,
                        description = "Dean of CEG office and academic affairs, accessible via Central Elevator",
                        associatedNodeId = "N_AU_DEAN",
                        collegeId = "ANNA_UNIV"
                    ),
                    Room(
                        id = "AU_AUDITORIUM",
                        buildingId = "CEG_MAIN",
                        floorNumber = 1,
                        roomNumber = "AUD-1",
                        name = "Vivekananda Central Auditorium",
                        category = RoomCategory.AUDITORIUM,
                        x = 500f, y = 350f, width = 180f, height = 100f,
                        isAccessible = true,
                        description = "1000-seat university auditorium with step-free entrance and reserved wheelchair bays",
                        associatedNodeId = "N_AU_AUDITORIUM",
                        collegeId = "ANNA_UNIV"
                    )
                )
                rooms.forEach { room ->
                    repository.addDynamicRoomAndRoute(
                        room = room,
                        connectToNodeId = "N_TP_CORR_4",
                        distanceMeters = 18f,
                        isAccessible = room.isAccessible
                    )
                }

                repository.addEmergencyContact(EmergencyContact(
                    title = "Anna University Security Control",
                    role = "24/7 Campus Security & Vigilance",
                    phoneNumber = "04422357000",
                    location = "Main Gate Security Cabin",
                    priority = 1,
                    collegeId = "ANNA_UNIV"
                ))
                repository.addEmergencyContact(EmergencyContact(
                    title = "CEG Health Centre & Ambulance",
                    role = "Campus Medical Emergency Dispatch",
                    phoneNumber = "04422358000",
                    location = "Opposite Sports Hostel",
                    priority = 1,
                    collegeId = "ANNA_UNIV"
                ))
                repository.addEmergencyContact(EmergencyContact(
                    title = "Women Safety & Student Grievance Helpline",
                    role = "Student Welfare & Counseling",
                    phoneNumber = "04422357222",
                    location = "Dean Office Block",
                    priority = 2,
                    collegeId = "ANNA_UNIV"
                ))
            } else if (collegeId == "IIT_MADRAS") {
                val rooms = listOf(
                    Room(
                        id = "IITM_ENTRANCE",
                        buildingId = "RESEARCH_PARK",
                        floorNumber = 1,
                        roomNumber = "ENTRANCE",
                        name = "Main Quadrangle & Ramp Entrance",
                        category = RoomCategory.ENTRANCE,
                        x = 500f, y = 500f, width = 160f, height = 80f,
                        isAccessible = true,
                        description = "Step-free ramp entry to IIT Madras Research Park",
                        associatedNodeId = "N_IITM_ENTRANCE",
                        collegeId = "IIT_MADRAS"
                    ),
                    Room(
                        id = "IITM_AI_LAB",
                        buildingId = "RESEARCH_PARK",
                        floorNumber = 1,
                        roomNumber = "RBCDSAI",
                        name = "Robert Bosch Data Science & AI Center",
                        category = RoomCategory.AI_LAB,
                        x = 240f, y = 250f, width = 160f, height = 90f,
                        isAccessible = true,
                        description = "Advanced AI & autonomous robotics research facility",
                        associatedNodeId = "N_IITM_AI_LAB",
                        collegeId = "IIT_MADRAS"
                    ),
                    Room(
                        id = "IITM_CLT",
                        buildingId = "RESEARCH_PARK",
                        floorNumber = 1,
                        roomNumber = "CLT-01",
                        name = "Central Lecture Theatre (CLT)",
                        category = RoomCategory.AUDITORIUM,
                        x = 760f, y = 250f, width = 160f, height = 90f,
                        isAccessible = true,
                        description = "Acoustically treated mega lecture theater with wheelchair front row access",
                        associatedNodeId = "N_IITM_CLT",
                        collegeId = "IIT_MADRAS"
                    ),
                    Room(
                        id = "IITM_LIBRARY",
                        buildingId = "RESEARCH_PARK",
                        floorNumber = 2,
                        roomNumber = "LIB-201",
                        name = "Central Digital Science Library",
                        category = RoomCategory.LIBRARY,
                        x = 500f, y = 240f, width = 160f, height = 90f,
                        isAccessible = true,
                        description = "State-of-the-art knowledge repository with quiet study and braille terminals",
                        associatedNodeId = "N_IITM_LIBRARY",
                        collegeId = "IIT_MADRAS"
                    )
                )
                rooms.forEach { room ->
                    repository.addDynamicRoomAndRoute(
                        room = room,
                        connectToNodeId = "N_TP_CORR_4",
                        distanceMeters = 20f,
                        isAccessible = room.isAccessible
                    )
                }

                repository.addEmergencyContact(EmergencyContact(
                    title = "IITM Security Main Control Room",
                    role = "24/7 Institute Security & Response",
                    phoneNumber = "04422578888",
                    location = "Main Gate, Sardar Patel Road",
                    priority = 1,
                    collegeId = "IIT_MADRAS"
                ))
                repository.addEmergencyContact(EmergencyContact(
                    title = "IITM Institute Hospital & ICU",
                    role = "Campus Ambulance & Emergency Ward",
                    phoneNumber = "04422578333",
                    location = "Campus Hospital Avenue",
                    priority = 1,
                    collegeId = "IIT_MADRAS"
                ))
                repository.addEmergencyContact(EmergencyContact(
                    title = "Dean of Students & Counselling Helpline",
                    role = "Mitra Student Support Service",
                    phoneNumber = "04422578050",
                    location = "DOST Office",
                    priority = 2,
                    collegeId = "IIT_MADRAS"
                ))
            }
        }
    }

    fun uploadAndAnalyzeCollegeMap(
        collegeName: String,
        location: String,
        blockName: String,
        floorsCount: Int,
        roomsList: List<String>,
        hasElevator: Boolean,
        hasRamp: Boolean
    ) {
        val newId = "COLLEGE_${System.currentTimeMillis()}"
        val newCollege = CollegeCampus(
            id = newId,
            name = collegeName,
            location = location,
            description = "Custom college campus mapped with $blockName ($floorsCount Floors)",
            isCustom = true
        )
        viewModelScope.launch {
            repository.addCollege(newCollege)

            val entrance = Room(
                id = "${newId}_ENTRANCE",
                buildingId = blockName.ifBlank { "MAIN" },
                floorNumber = 1,
                roomNumber = "ENTRANCE",
                name = "$collegeName Main Gate & Accessible Ramp",
                category = RoomCategory.ENTRANCE,
                x = 500f, y = 520f, width = 160f, height = 80f,
                isAccessible = true,
                description = "Primary entrance with wheelchair ramp and tactile path",
                associatedNodeId = "N_${newId}_ENTRANCE",
                collegeId = newId
            )
            repository.addDynamicRoomAndRoute(
                room = entrance,
                connectToNodeId = "N_TP_CORR_4",
                distanceMeters = 15f,
                isAccessible = true
            )

            val defaultRooms = if (roomsList.isNotEmpty()) roomsList else listOf(
                "Smart Classroom 101",
                "Computer Science & AI Lab",
                "Central Digital Library",
                "Dean & HOD Office",
                "Seminar Hall & Auditorium"
            )

            val xCoords = listOf(200f, 400f, 600f, 800f, 300f, 700f)
            val yCoords = listOf(220f, 220f, 220f, 220f, 360f, 360f)

            defaultRooms.forEachIndexed { idx, rName ->
                val rId = "${newId}_ROOM_${idx + 1}"
                val floorNum = if (idx >= 3 && floorsCount > 1) 2 else 1
                val isAccessible = hasElevator || floorNum == 1
                val cat = when {
                    rName.contains("Lab", ignoreCase = true) -> RoomCategory.AI_LAB
                    rName.contains("Library", ignoreCase = true) -> RoomCategory.LIBRARY
                    rName.contains("Office", ignoreCase = true) || rName.contains("Dean", ignoreCase = true) -> RoomCategory.ADMIN
                    rName.contains("Auditorium", ignoreCase = true) || rName.contains("Hall", ignoreCase = true) -> RoomCategory.AUDITORIUM
                    else -> RoomCategory.CLASSROOM
                }
                val r = Room(
                    id = rId,
                    buildingId = blockName.ifBlank { "MAIN" },
                    floorNumber = floorNum,
                    roomNumber = "${floorNum}0${idx + 1}",
                    name = rName,
                    category = cat,
                    x = xCoords.getOrElse(idx) { 250f + (idx * 90f) % 600f },
                    y = yCoords.getOrElse(idx) { 260f },
                    width = 140f, height = 90f,
                    isAccessible = isAccessible,
                    description = "$rName at $collegeName ($blockName - Floor $floorNum)",
                    associatedNodeId = "N_$rId",
                    collegeId = newId
                )
                repository.addDynamicRoomAndRoute(
                    room = r,
                    connectToNodeId = "N_${newId}_ENTRANCE",
                    distanceMeters = (15f + idx * 8f),
                    isAccessible = isAccessible
                )
            }

            repository.addEmergencyContact(EmergencyContact(
                title = "$collegeName Security Office",
                role = "24/7 Campus Security & Control",
                phoneNumber = "9444000001",
                location = "Campus Entrance Booth",
                priority = 1,
                collegeId = newId
            ))
            repository.addEmergencyContact(EmergencyContact(
                title = "$collegeName Health Centre",
                role = "First Aid & Medical Emergency",
                phoneNumber = "9444000002",
                location = "Ground Floor Medical Room",
                priority = 1,
                collegeId = newId
            ))

            selectCollege(newId)

            val voiceMsg = if (preferredLanguage.value == "Tamil") {
                "$collegeName கல்லூரி வரைபடம் வெற்றிகரமாக சேர்க்கப்பட்டது. வகுப்பறைகள் மற்றும் வழிகள் கணக்கிடப்பட்டுவிட்டன."
            } else {
                "$collegeName campus map & classroom routes successfully parsed and generated."
            }
            voiceManager.speak(voiceMsg, preferredLanguage.value, voiceSpeedRate.value)
        }
    }

    fun addNewCollege(name: String, location: String, description: String) {
        val newId = "COLLEGE_${System.currentTimeMillis()}"
        val newCollege = CollegeCampus(
            id = newId,
            name = name,
            location = location,
            description = description,
            isCustom = true
        )
        viewModelScope.launch {
            repository.addCollege(newCollege)
            // Add a starter entrance for this new college
            val entranceRoom = Room(
                id = "${newId}_ENTRANCE",
                buildingId = "MAIN",
                floorNumber = 1,
                roomNumber = "ENTRANCE",
                name = "$name Main Entrance",
                category = RoomCategory.ENTRANCE,
                x = 500f, y = 480f,
                width = 160f, height = 90f,
                isAccessible = true,
                description = "Campus entrance with accessible ramp and reception",
                associatedNodeId = "N_${newId}_ENTRANCE",
                collegeId = newId
            )
            repository.addDynamicRoomAndRoute(
                room = entranceRoom,
                connectToNodeId = "N_TP_CORR_4", // Link to atrium hub
                distanceMeters = 20f,
                isAccessible = true
            )
            selectCollege(newId)
        }
    }

    fun addCameraMappedWaypoint(
        roomName: String,
        roomNumber: String,
        buildingId: String,
        floorNumber: Int,
        category: RoomCategory,
        isAccessible: Boolean,
        connectToNodeId: String = "N_TP_CORR_4",
        distanceMeters: Float = 15f
    ) {
        val roomId = "ROOM_CAM_${System.currentTimeMillis()}"
        val doorNodeId = "N_$roomId"
        val newRoom = Room(
            id = roomId,
            buildingId = buildingId.ifBlank { selectedBuildingId.value },
            floorNumber = floorNumber,
            roomNumber = roomNumber.ifBlank { "CAM-1" },
            name = roomName,
            category = category,
            x = (200f + (System.currentTimeMillis() % 400)).toFloat(),
            y = 200f,
            width = 140f, height = 90f,
            isAccessible = isAccessible,
            description = "Camera-mapped campus location added by faculty/student",
            associatedNodeId = doorNodeId,
            collegeId = selectedCollegeId.value
        )

        viewModelScope.launch {
            val linkNode = if (connectToNodeId.isNotBlank()) connectToNodeId else "N_TP_CORR_4"
            repository.addDynamicRoomAndRoute(
                room = newRoom,
                connectToNodeId = linkNode,
                distanceMeters = distanceMeters,
                isAccessible = isAccessible
            )
            setDestRoom(newRoom)
            navigateTo(CampusScreen.INDOOR_MAP)

            val voiceMsg = if (preferredLanguage.value == "Tamil") {
                "புதிய இடம் $roomName வெற்றிகரமாக வரைபடத்தில் சேர்க்கப்பட்டது. பாதை கணக்கிடப்படுகிறது."
            } else {
                "New location $roomName mapped successfully. Calculating route."
            }
            voiceManager.speak(voiceMsg, preferredLanguage.value, voiceSpeedRate.value)
        }
    }

    fun addCustomEmergencyContact(
        title: String,
        role: String,
        phoneNumber: String,
        location: String,
        priority: Int = 1
    ) {
        viewModelScope.launch {
            repository.addEmergencyContact(
                EmergencyContact(
                    title = title,
                    role = role,
                    phoneNumber = phoneNumber,
                    location = location,
                    priority = priority,
                    collegeId = selectedCollegeId.value
                )
            )
        }
    }

    fun removeEmergencyContact(id: Long) {
        viewModelScope.launch {
            repository.deleteEmergencyContact(id)
        }
    }

    fun importCollegeJsonMap(jsonString: String): Boolean {
        return try {
            val json = org.json.JSONObject(jsonString)
            val collegeName = json.optString("collegeName", "Custom College Campus")
            val location = json.optString("location", "Campus Location")
            val collegeId = "COLLEGE_${System.currentTimeMillis()}"

            viewModelScope.launch {
                repository.addCollege(
                    CollegeCampus(
                        id = collegeId,
                        name = collegeName,
                        location = location,
                        description = "Imported college floorplan and routing graph",
                        isCustom = true
                    )
                )

                val roomsArray = json.optJSONArray("rooms")
                if (roomsArray != null) {
                    for (i in 0 until roomsArray.length()) {
                        val obj = roomsArray.getJSONObject(i)
                        val rId = obj.optString("id", "R_${System.currentTimeMillis()}_$i")
                        val catStr = obj.optString("category", "CLASSROOM")
                        val category = try { RoomCategory.valueOf(catStr) } catch (e: Exception) { RoomCategory.CLASSROOM }
                        val isAcc = obj.optBoolean("isAccessible", true)
                        val r = Room(
                            id = rId,
                            buildingId = obj.optString("buildingId", "MAIN"),
                            floorNumber = obj.optInt("floorNumber", 1),
                            roomNumber = obj.optString("roomNumber", "101"),
                            name = obj.optString("name", "Room"),
                            category = category,
                            x = obj.optDouble("x", 200.0).toFloat(),
                            y = obj.optDouble("y", 200.0).toFloat(),
                            width = 130f, height = 90f,
                            isAccessible = isAcc,
                            description = obj.optString("description", "Imported room"),
                            associatedNodeId = "N_$rId",
                            collegeId = collegeId
                        )
                        repository.addDynamicRoomAndRoute(
                            room = r,
                            connectToNodeId = "N_TP_CORR_4",
                            distanceMeters = 15f,
                            isAccessible = isAcc
                        )
                    }
                }
                selectCollege(collegeId)
            }
            true
        } catch (e: Exception) {
            false
        }
    }

    fun toggleWheelchairModeWithVoice(enabled: Boolean) {
        isWheelchairMode.value = enabled
        calculateRoute()
        val speech = if (enabled) {
            if (preferredLanguage.value == "Tamil") {
                "சக்கர நாற்காலி சாய்வுதளம் மற்றும் லிஃப்ட் வழியே வழி கணக்கிடப்பட்டுள்ளது - படிக்கட்டுகள் முற்றிலும் தவிர்க்கப்பட்டுள்ளன."
            } else {
                "Wheelchair accessible route active. Stairs avoided; using ramps and elevators exclusively."
            }
        } else {
            if (preferredLanguage.value == "Tamil") {
                "வழக்கமான நடைபாதை பயன்முறை இயக்கப்பட்டது."
            } else {
                "Standard walking mode active."
            }
        }
        voiceManager.speak(speech, preferredLanguage.value, voiceSpeedRate.value)
    }

    override fun onCleared() {
        super.onCleared()
        voiceManager.shutdown()
    }
}
