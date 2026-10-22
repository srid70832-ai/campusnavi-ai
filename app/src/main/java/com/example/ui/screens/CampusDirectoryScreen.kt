package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import com.example.data.model.CampusPhoto
import com.example.data.model.Room
import com.example.data.model.RoomCategory
import com.example.data.model.UserRole
import com.example.ui.CampusScreen
import com.example.ui.MainCampusViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CampusDirectoryScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val rooms by viewModel.allRooms.collectAsState()
    val favorites by viewModel.favoriteRoomIds.collectAsState()
    val allPhotos by viewModel.allCampusPhotos.collectAsState()
    val selectedCollegeId by viewModel.selectedCollegeId.collectAsState()
    val userSession by viewModel.userSession.collectAsState()
    val preferredLanguage by viewModel.preferredLanguage.collectAsState()

    var activeTab by remember { mutableIntStateOf(0) } // 0 = Rooms & Labs, 1 = College Photos & Tour
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<RoomCategory?>(null) }
    var selectedPhotoCategory by remember { mutableStateOf<String?>(null) }
    var detailRoom by remember { mutableStateOf<Room?>(null) }
    var selectedPhotoPreview by remember { mutableStateOf<CampusPhoto?>(null) }

    // Filtered rooms
    val filteredRooms = remember(rooms, searchQuery, selectedCategory) {
        rooms.filter { r ->
            val matchQuery = searchQuery.isBlank() ||
                    r.name.contains(searchQuery, ignoreCase = true) ||
                    r.roomNumber.contains(searchQuery, ignoreCase = true) ||
                    r.category.displayName.contains(searchQuery, ignoreCase = true) ||
                    r.facultyOrContact.contains(searchQuery, ignoreCase = true)

            val matchCategory = selectedCategory == null || r.category == selectedCategory
            matchQuery && matchCategory
        }
    }

    // Filtered photos for active college
    val collegePhotos = remember(allPhotos, selectedCollegeId, searchQuery, selectedPhotoCategory) {
        allPhotos.filter { photo ->
            val matchCollege = photo.collegeId == selectedCollegeId || photo.collegeId == "TECH_UNIVERSITY" || selectedCollegeId.isBlank()
            val matchCategory = selectedPhotoCategory == null || photo.category.equals(selectedPhotoCategory, ignoreCase = true)
            val matchSearch = searchQuery.isBlank() ||
                    photo.title.contains(searchQuery, ignoreCase = true) ||
                    photo.description.contains(searchQuery, ignoreCase = true) ||
                    photo.buildingName.contains(searchQuery, ignoreCase = true) ||
                    photo.roomOrArea.contains(searchQuery, ignoreCase = true)
            matchCollege && matchCategory && matchSearch
        }
    }

    // Helper to route to room/photo
    fun routeToLocation(photo: CampusPhoto) {
        val dest = rooms.find { r ->
            r.name.equals(photo.roomOrArea, ignoreCase = true) ||
            r.roomNumber.equals(photo.roomOrArea, ignoreCase = true) ||
            r.name.contains(photo.title, ignoreCase = true) ||
            photo.title.contains(r.name, ignoreCase = true)
        } ?: rooms.find { it.category == RoomCategory.ENTRANCE } ?: rooms.firstOrNull()

        if (dest != null) {
            if (viewModel.selectedStartRoom.value == null) {
                val start = rooms.find { it.category == RoomCategory.ENTRANCE } ?: rooms.firstOrNull()
                if (start != null && start.id != dest.id) {
                    viewModel.setStartRoom(start)
                }
            }
            viewModel.setDestRoom(dest)
            viewModel.navigateTo(CampusScreen.INDOOR_MAP)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Tab Selector: Rooms vs College Photos
        PrimaryTabRow(
            selectedTabIndex = activeTab,
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            contentColor = MaterialTheme.colorScheme.primary,
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
        ) {
            Tab(
                selected = activeTab == 0,
                onClick = { activeTab = 0 },
                text = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.Apartment, contentDescription = null, modifier = Modifier.size(16.dp))
                        Text(
                            if (preferredLanguage == "Tamil") "வகுப்பறைகள் (${filteredRooms.size})" else "Rooms & Labs (${filteredRooms.size})",
                            fontSize = 12.sp,
                            fontWeight = if (activeTab == 0) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                },
                modifier = Modifier.testTag("tab_rooms_directory")
            )
            Tab(
                selected = activeTab == 1,
                onClick = { activeTab = 1 },
                text = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.PhotoCamera, contentDescription = null, modifier = Modifier.size(16.dp))
                        Text(
                            if (preferredLanguage == "Tamil") "புகைப்படங்கள் (${collegePhotos.size})" else "College Photos (${collegePhotos.size})",
                            fontSize = 12.sp,
                            fontWeight = if (activeTab == 1) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                },
                modifier = Modifier.testTag("tab_college_photos")
            )
        }

        // Universal Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = {
                Text(
                    if (activeTab == 0) {
                        if (preferredLanguage == "Tamil") "வகுப்பறை, ஆய்வகம் அல்லது தொடர்பு தேடுக..." else "Search by room, lab, department, or faculty..."
                    } else {
                        if (preferredLanguage == "Tamil") "கல்லூரி புகைப்படங்கள், ஆய்வகங்கள், கட்டிடங்கள்..." else "Search college photos, labs, buildings, gates..."
                    },
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )
            },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = CyanNeon) },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            },
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                focusedBorderColor = CyanNeon,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                unfocusedTextColor = MaterialTheme.colorScheme.onSurface
            ),
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .testTag("directory_search_textfield")
        )

        // Tab Content
        if (activeTab == 0) {
            // Category Filter Chips for Rooms
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(
                        selected = selectedCategory == null,
                        onClick = { selectedCategory = null },
                        label = { Text(if (preferredLanguage == "Tamil") "அனைத்தும்" else "All Categories") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CyanNeon,
                            selectedLabelColor = NavyDeep,
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        modifier = Modifier.testTag("filter_category_all")
                    )
                }
                items(RoomCategory.values()) { cat ->
                    FilterChip(
                        selected = selectedCategory == cat,
                        onClick = { selectedCategory = if (selectedCategory == cat) null else cat },
                        label = { Text(cat.displayName) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CyanNeon,
                            selectedLabelColor = NavyDeep,
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        modifier = Modifier.testTag("filter_category_${cat.name.lowercase()}")
                    )
                }
            }

            Text(
                text = "${filteredRooms.size} " + if (preferredLanguage == "Tamil") "இடங்கள் கண்டறியப்பட்டன (வழியை தொடவும்)" else "campus destinations found (tap to view & route)",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Room Cards List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier
                    .weight(1f)
                    .testTag("directory_room_list")
            ) {
                items(filteredRooms, key = { it.id }) { room ->
                    val isFav = favorites.contains(room.id)
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .clickable { detailRoom = room }
                            .testTag("room_item_${room.id}")
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Category Icon Badge
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        when (room.category) {
                                            RoomCategory.AI_LAB -> CyanNeon.copy(alpha = 0.2f)
                                            RoomCategory.AUDITORIUM -> PurpleNeon.copy(alpha = 0.2f)
                                            RoomCategory.LIBRARY -> Color(0xFF38BDF8).copy(alpha = 0.2f)
                                            RoomCategory.RESTROOM -> Color(0xFFF472B6).copy(alpha = 0.2f)
                                            RoomCategory.CAFETERIA -> AmberWarning.copy(alpha = 0.2f)
                                            RoomCategory.ENTRANCE -> EmeraldSuccess.copy(alpha = 0.2f)
                                            else -> MaterialTheme.colorScheme.surface
                                        }
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    when (room.category) {
                                        RoomCategory.AI_LAB -> Icons.Default.SmartToy
                                        RoomCategory.AUDITORIUM -> Icons.Default.TheaterComedy
                                        RoomCategory.LIBRARY -> Icons.Default.LocalLibrary
                                        RoomCategory.RESTROOM -> Icons.Default.Wc
                                        RoomCategory.CAFETERIA -> Icons.Default.Restaurant
                                        RoomCategory.ENTRANCE -> Icons.Default.MeetingRoom
                                        else -> Icons.Default.Class
                                    },
                                    contentDescription = null,
                                    tint = when (room.category) {
                                        RoomCategory.AI_LAB -> CyanNeon
                                        RoomCategory.AUDITORIUM -> PurpleNeon
                                        RoomCategory.LIBRARY -> Color(0xFF38BDF8)
                                        RoomCategory.RESTROOM -> Color(0xFFF472B6)
                                        RoomCategory.CAFETERIA -> AmberWarning
                                        RoomCategory.ENTRANCE -> EmeraldSuccess
                                        else -> MaterialTheme.colorScheme.onSurface
                                    }
                                )
                            }

                            // Room Info
                            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = "Room ${room.roomNumber}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = CyanNeon
                                    )
                                    Text(
                                        text = "• ${room.buildingId} Floor ${room.floorNumber}",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    if (room.isAccessible) {
                                        Icon(
                                            Icons.Default.Accessible,
                                            contentDescription = "Wheelchair Accessible",
                                            tint = PurpleAccent,
                                            modifier = Modifier.size(13.dp)
                                        )
                                    }
                                }
                                Text(
                                    text = room.name,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                if (room.facultyOrContact.isNotBlank()) {
                                    Text(
                                        text = room.facultyOrContact,
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        maxLines = 1
                                    )
                                }
                            }

                            // Quick Route Button
                            IconButton(
                                onClick = {
                                    if (viewModel.selectedStartRoom.value == null) {
                                        val start = rooms.find { it.category == RoomCategory.ENTRANCE } ?: rooms.firstOrNull()
                                        if (start != null && start.id != room.id) {
                                            viewModel.setStartRoom(start)
                                        }
                                    }
                                    viewModel.setDestRoom(room)
                                    viewModel.navigateTo(CampusScreen.INDOOR_MAP)
                                },
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(CyanNeon.copy(alpha = 0.15f))
                            ) {
                                Icon(
                                    Icons.Default.Directions,
                                    contentDescription = "Route to Room",
                                    tint = CyanNeon,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            // Favorite button
                            IconButton(
                                onClick = { viewModel.toggleFavorite(room.id) },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                    contentDescription = "Favorite",
                                    tint = if (isFav) RoseEmergency else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }
            }
        } else {
            // TAB 1: College Photos & Tour
            // Photo Category Filter Chips
            val photoCategories = listOf(
                null to (if (preferredLanguage == "Tamil") "அனைத்தும்" else "All"),
                "CAMPUS_VIEW" to (if (preferredLanguage == "Tamil") "வளாகம்" else "Campus"),
                "LAB" to (if (preferredLanguage == "Tamil") "ஆய்வகம்" else "AI & Labs"),
                "LIBRARY" to (if (preferredLanguage == "Tamil") "நூலகம்" else "Library"),
                "AUDITORIUM" to (if (preferredLanguage == "Tamil") "அரங்கம்" else "Auditorium"),
                "CLASSROOM" to (if (preferredLanguage == "Tamil") "வகுப்பறை" else "Classroom"),
                "CAFETERIA" to (if (preferredLanguage == "Tamil") "உணவகம்" else "Cafeteria"),
                "MAP_BLUEPRINT" to (if (preferredLanguage == "Tamil") "வரைபடம்" else "Map & Blueprints")
            )

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(photoCategories) { (catKey, catLabel) ->
                    FilterChip(
                        selected = selectedPhotoCategory == catKey,
                        onClick = { selectedPhotoCategory = catKey },
                        label = { Text(catLabel) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PurpleAccent,
                            selectedLabelColor = Color.White,
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        modifier = Modifier.testTag("filter_photo_${catKey ?: "all"}")
                    )
                }
            }

            // Info banner explaining the photos & routes feature
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = CyanNeon.copy(alpha = 0.1f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(Icons.Default.Info, contentDescription = null, tint = CyanNeon, modifier = Modifier.size(20.dp))
                    Text(
                        if (preferredLanguage == "Tamil")
                            "நிர்வாகிகள் பதிவேற்றிய புகைப்படங்களை பார்வையாளர்கள் மற்றும் மாணவர்கள் கண்டு 'வழி காட்டு' பொத்தானை தொட்டு நேராக வழியைக் காணலாம்."
                        else
                            "College members & Admins upload campus photos and blueprints. Students and visitors can view them and tap 'Route Here' for indoor directions.",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface,
                        lineHeight = 15.sp
                    )
                }
            }

            // Photos List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier
                    .weight(1f)
                    .testTag("directory_photos_list")
            ) {
                if (collegePhotos.isEmpty()) {
                    item {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 24.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.PhotoLibrary, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(48.dp))
                                Text(
                                    if (preferredLanguage == "Tamil") "புகைப்படங்கள் எதுவும் கிடைக்கவில்லை" else "No college photos found",
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    if (preferredLanguage == "Tamil") "நிர்வாகி உள்நுழைவு மூலம் கல்லூரி புகைப்படங்களை சேர்க்கலாம்." else "College admins can add photos and floor blueprints in Admin Login.",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                if (userSession.role == UserRole.ADMIN) {
                                    Button(
                                        onClick = { viewModel.navigateTo(CampusScreen.ADMIN) },
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Open Admin Photo Studio")
                                    }
                                }
                            }
                        }
                    }
                } else {
                    items(collegePhotos, key = { it.id }) { photo ->
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .clickable { selectedPhotoPreview = photo }
                                .testTag("photo_card_${photo.id}")
                        ) {
                            Column {
                                // Image with badges overlay
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(170.dp)
                                        .background(MaterialTheme.colorScheme.surface)
                                ) {
                                    AsyncImage(
                                        model = photo.photoUrl,
                                        contentDescription = photo.title,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )

                                    // Category Pill Tag
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = NavyDeep.copy(alpha = 0.85f),
                                        modifier = Modifier
                                            .align(Alignment.TopStart)
                                            .padding(10.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            Icon(
                                                when (photo.category) {
                                                    "LAB" -> Icons.Default.SmartToy
                                                    "AUDITORIUM" -> Icons.Default.TheaterComedy
                                                    "LIBRARY" -> Icons.Default.LocalLibrary
                                                    "CAFETERIA" -> Icons.Default.Restaurant
                                                    "MAP_BLUEPRINT" -> Icons.Default.Map
                                                    else -> Icons.Default.Apartment
                                                },
                                                contentDescription = null,
                                                tint = CyanNeon,
                                                modifier = Modifier.size(12.dp)
                                            )
                                            Text(
                                                text = photo.category.replace("_", " "),
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = CyanNeon
                                            )
                                        }
                                    }

                                    // Tap to Zoom Tag
                                    Surface(
                                        shape = CircleShape,
                                        color = NavyDeep.copy(alpha = 0.7f),
                                        modifier = Modifier
                                            .align(Alignment.TopEnd)
                                            .padding(10.dp)
                                    ) {
                                        IconButton(
                                            onClick = { selectedPhotoPreview = photo },
                                            modifier = Modifier.size(32.dp)
                                        ) {
                                            Icon(Icons.Default.ZoomIn, contentDescription = "View Photo", tint = Color.White, modifier = Modifier.size(18.dp))
                                        }
                                    }

                                    // Building & Room badge
                                    if (photo.buildingName.isNotBlank() || photo.roomOrArea.isNotBlank()) {
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = PurpleAccent.copy(alpha = 0.9f),
                                            modifier = Modifier
                                                .align(Alignment.BottomStart)
                                                .padding(10.dp)
                                        ) {
                                            Text(
                                                text = "${photo.buildingName} ${if (photo.roomOrArea.isNotBlank()) "• ${photo.roomOrArea}" else ""}",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = Color.White,
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                            )
                                        }
                                    }
                                }

                                // Photo details & Route action
                                Column(
                                    modifier = Modifier.padding(14.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = photo.title,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = photo.description,
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        lineHeight = 16.sp
                                    )

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "By ${photo.uploadedBy}",
                                            fontSize = 10.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                                        )

                                        // ROUTE BUTTON (User request: student or visitor tapping shows route)
                                        Button(
                                            onClick = { routeToLocation(photo) },
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = CyanNeon,
                                                contentColor = NavyDeep
                                            ),
                                            shape = RoundedCornerShape(10.dp),
                                            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp),
                                            modifier = Modifier.testTag("route_to_photo_${photo.id}")
                                        ) {
                                            Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(15.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(
                                                if (preferredLanguage == "Tamil") "வழி காட்டு" else "Route to this Place",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Full Photo Preview Dialog
    selectedPhotoPreview?.let { photo ->
        Dialog(onDismissRequest = { selectedPhotoPreview = null }) {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = photo.title,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (photo.roomOrArea.isNotBlank()) {
                                Text(
                                    text = "${photo.buildingName} • ${photo.roomOrArea}",
                                    fontSize = 11.sp,
                                    color = CyanNeon
                                )
                            }
                        }
                        IconButton(onClick = { selectedPhotoPreview = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(240.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(NavyDeep)
                    ) {
                        AsyncImage(
                            model = photo.photoUrl,
                            contentDescription = photo.title,
                            contentScale = ContentScale.Fit,
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    Text(
                        text = photo.description,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 18.sp
                    )

                    Button(
                        onClick = {
                            selectedPhotoPreview = null
                            routeToLocation(photo)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = CyanNeon, contentColor = NavyDeep),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            if (preferredLanguage == "Tamil") "நேரடி வழி காட்டு (Indoor Route)" else "Start Live Turn-by-Turn Route",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }

    // Room Detail Modal Bottom Sheet
    detailRoom?.let { room ->
        ModalBottomSheet(
            onDismissRequest = { detailRoom = null },
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Room ${room.roomNumber}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = CyanNeon)
                        Text(room.name, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                    }
                    IconButton(onClick = { viewModel.toggleFavorite(room.id) }) {
                        Icon(
                            imageVector = if (favorites.contains(room.id)) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = if (favorites.contains(room.id)) RoseEmergency else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                    }
                }

                Text(room.description, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text(if (preferredLanguage == "Tamil") "இடம்" else "Location", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("${room.buildingId} Complex, Floor ${room.floorNumber}", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.onSurface)
                    }
                    Column {
                        Text(if (preferredLanguage == "Tamil") "நேரம்" else "Hours", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(room.openingHours, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.onSurface)
                    }
                }

                if (room.facultyOrContact.isNotBlank()) {
                    Column {
                        Text(if (preferredLanguage == "Tamil") "பொறுப்பாளர் / தொடர்பு" else "Faculty / In-Charge", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(room.facultyOrContact, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.onSurface)
                    }
                }

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            viewModel.setStartRoom(room)
                            detailRoom = null
                            viewModel.navigateTo(CampusScreen.INDOOR_MAP)
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(if (preferredLanguage == "Tamil") "தொடக்க புள்ளி" else "Set as Start", fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            viewModel.setDestRoom(room)
                            detailRoom = null
                            viewModel.navigateTo(CampusScreen.INDOOR_MAP)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = CyanNeon, contentColor = NavyDeep),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (preferredLanguage == "Tamil") "வழி காட்டு" else "Navigate Here", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
