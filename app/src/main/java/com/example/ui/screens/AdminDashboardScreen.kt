package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import com.example.data.local.EdgeEntity
import com.example.data.model.AnnouncementItem
import com.example.data.model.CampusPhoto
import com.example.data.model.CollegeCampus
import com.example.data.model.RoomCategory
import com.example.data.model.UserRole
import com.example.ui.CampusScreen
import com.example.ui.MainCampusViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val userSession by viewModel.userSession.collectAsState()
    val edges by viewModel.allEdges.collectAsState()
    val blockedEdges = remember(edges) { edges.filter { !it.id.endsWith("_rev") } }
    val colleges by viewModel.allColleges.collectAsState()
    val selectedCollegeId by viewModel.selectedCollegeId.collectAsState()
    val currentCollege = colleges.find { it.id == selectedCollegeId }

    val allPhotos by viewModel.allCampusPhotos.collectAsState()
    val collegePhotos = remember(allPhotos, selectedCollegeId) {
        allPhotos.filter { it.collegeId == selectedCollegeId }
    }
    val rooms by viewModel.allRooms.collectAsState()
    val collegeRooms = remember(rooms, selectedCollegeId) {
        rooms.filter { it.collegeId == selectedCollegeId }
    }

    var showResetDialog by remember { mutableStateOf(false) }
    var showAddAnnouncementDialog by remember { mutableStateOf(false) }
    var showAddCollegeDialog by remember { mutableStateOf(false) }
    var showAddPhotoDialog by remember { mutableStateOf(false) }
    var showCreateMapDialog by remember { mutableStateOf(false) }

    // If NOT logged in as Admin, show the College Admin Login Portal
    if (userSession.role != UserRole.ADMIN) {
        var adminName by remember { mutableStateOf("Prof. K. Ramanathan") }
        var staffId by remember { mutableStateOf("AU-FAC-4092") }
        var adminPin by remember { mutableStateOf("admin2026") }
        var department by remember { mutableStateOf("Campus Planning & Infrastructure") }
        var loginError by remember { mutableStateOf<String?>(null) }

        Column(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth().testTag("admin_login_card")
            ) {
                Column(
                    modifier = Modifier.padding(22.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(PurpleAccent.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.AdminPanelSettings,
                            contentDescription = null,
                            tint = PurpleNeon,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Text(
                        text = "College Admin & Faculty Portal",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Text(
                        text = "Only authorized college members can upload floor maps, add classroom photos, map camera routes, and publish emergency contacts for students & visitors.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.School, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                            Text(
                                text = "Active College: ${currentCollege?.name?.take(28) ?: "Campus"}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }

                    OutlinedTextField(
                        value = adminName,
                        onValueChange = { adminName = it },
                        label = { Text("College Member / Faculty Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = staffId,
                        onValueChange = { staffId = it },
                        label = { Text("Staff ID / Faculty Code") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = adminPin,
                        onValueChange = { adminPin = it },
                        label = { Text("Admin Passcode / PIN (Demo: admin2026)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (loginError != null) {
                        Text(loginError!!, color = RoseEmergency, fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            if (adminPin.trim() == "admin2026" || adminPin.trim().length >= 4) {
                                viewModel.login(
                                    role = UserRole.ADMIN,
                                    name = adminName,
                                    emailOrId = staffId,
                                    department = department,
                                    collegeId = selectedCollegeId
                                )
                            } else {
                                loginError = "Please enter valid passcode (Demo: admin2026)"
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().height(48.dp).testTag("admin_login_submit_button")
                    ) {
                        Icon(Icons.Default.LockOpen, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Log In as College Admin", fontWeight = FontWeight.Bold)
                    }

                    // 1-Tap Quick Demo Admin Login
                    OutlinedButton(
                        onClick = {
                            viewModel.login(
                                role = UserRole.ADMIN,
                                name = "Prof. K. Ramanathan (CEG Admin)",
                                emailOrId = "admin@campus.edu",
                                department = "Campus Planning & Infrastructure",
                                collegeId = selectedCollegeId
                            )
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = AmberWarning)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("⚡ 1-Tap Quick Demo Admin Login", fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                    }

                    TextButton(
                        onClick = {
                            viewModel.login(
                                role = UserRole.VISITOR,
                                name = "Campus Visitor",
                                emailOrId = "visitor@gmail.com",
                                department = "Visitor",
                                collegeId = selectedCollegeId
                            )
                            viewModel.navigateTo(CampusScreen.DASHBOARD)
                        }
                    ) {
                        Text("Continue as Visitor / Student (View Mode Only)", fontSize = 12.sp)
                    }
                }
            }
        }
        return
    }

    // IF LOGGED IN AS ADMIN: Show Complete Admin Route Studio
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Admin Header & Status
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PurpleAccent.copy(alpha = 0.12f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier.fillMaxWidth().testTag("admin_status_banner")
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(PurpleNeon),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White)
                        }
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(userSession.name, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = PurpleNeon
                                ) {
                                    Text("COLLEGE ADMIN", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = androidx.compose.ui.graphics.Color.White, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                }
                            }
                            Text(userSession.department, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("Managing: ${currentCollege?.name ?: "Campus"}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.primary)
                        }
                    }

                    OutlinedButton(
                        onClick = { viewModel.logout() },
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("Log Out", fontSize = 11.sp)
                    }
                }
            }
        }

        // 2. CAMPUS MAP & BLUEPRINT STUDIO
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier.fillMaxWidth().testTag("admin_map_studio_card")
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primaryContainer),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Map, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                            }
                            Column {
                                Text("MAP & BLUEPRINT STUDIO", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                Text("Add College Maps & Classrooms", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                        ) {
                            Text(
                                text = "${collegeRooms.size} Rooms Mapped",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                            )
                        }
                    }

                    Text(
                        text = "College Admin can generate new building floor plans, map classrooms, and define walkable paths so students and visitors can navigate seamlessly.",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { showCreateMapDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1.2f).testTag("admin_create_map_button")
                        ) {
                            Icon(Icons.Default.AddLocationAlt, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Create Floor Map", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = { viewModel.navigateTo(CampusScreen.CAMERA_NAV) },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f).testTag("admin_cam_map_button")
                        ) {
                            Icon(Icons.Default.CameraAlt, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Cam Mapper", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // 3. COLLEGE PHOTOS STUDIO (Photos of the College for Visitors & Students)
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier.fillMaxWidth().testTag("admin_photo_studio_card")
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(PurpleAccent.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.AddPhotoAlternate, contentDescription = null, tint = PurpleNeon, modifier = Modifier.size(20.dp))
                            }
                            Column {
                                Text("COLLEGE PHOTOS & CAMPUS TOUR", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PurpleNeon)
                                Text("${collegePhotos.size} Photos Published for Visitors", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                            }
                        }

                        Button(
                            onClick = { showAddPhotoDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = PurpleNeon),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                            modifier = Modifier.testTag("admin_add_photo_button")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Add Photo", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Text(
                        text = "College Admin can add photos of campus gates, academic blocks, labs, library, and auditoriums. Students and visitors can view them in the Campus Directory tour!",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    if (collegePhotos.isEmpty()) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "No photos added yet. Tap '+ Add Photo' to publish your college's buildings, laboratories, and lecture hall images!",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    } else {
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            items(collegePhotos, key = { it.id }) { photo ->
                                Card(
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                                    modifier = Modifier.width(220.dp)
                                ) {
                                    Column {
                                        Box(modifier = Modifier.fillMaxWidth().height(115.dp)) {
                                            AsyncImage(
                                                model = photo.photoUrl,
                                                contentDescription = photo.title,
                                                contentScale = ContentScale.Crop,
                                                modifier = Modifier.fillMaxSize()
                                            )
                                            Surface(
                                                shape = RoundedCornerShape(6.dp),
                                                color = Color.Black.copy(alpha = 0.65f),
                                                modifier = Modifier.align(Alignment.TopStart).padding(6.dp)
                                            ) {
                                                Text(
                                                    text = photo.category.replace("_", " "),
                                                    fontSize = 8.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color.White,
                                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                                )
                                            }
                                        }
                                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Text(photo.title, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, color = MaterialTheme.colorScheme.onSurface)
                                            Text(photo.roomOrArea.ifBlank { photo.buildingName }, fontSize = 10.sp, color = MaterialTheme.colorScheme.primary, maxLines = 1)
                                            Text(photo.description, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2)
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text("By Admin", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                                IconButton(
                                                    onClick = { viewModel.deleteCampusPhoto(photo.id) },
                                                    modifier = Modifier.size(24.dp)
                                                ) {
                                                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = RoseEmergency, modifier = Modifier.size(16.dp))
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
        }

        // 3. Quick Action: Emergency Contact & Announcements
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = { viewModel.navigateTo(CampusScreen.EMERGENCY) },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.onSurface),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.ContactPhone, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Emergency Numbers", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }

                Button(
                    onClick = { showAddAnnouncementDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.onSurface),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).testTag("admin_post_announcement_button")
                ) {
                    Icon(Icons.Default.Campaign, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Post Notice", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // 4. Corridor Maintenance & Closures Section
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Corridor Closures & Path Maintenance", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                Text(
                    "Toggling a corridor to Blocked forces Dijkstra pathfinding to immediately avoid it for students & visitors.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        items(blockedEdges.take(12), key = { it.id }) { edge ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (edge.isBlocked) RoseEmergency.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant
                ),
                modifier = Modifier.fillMaxWidth().testTag("admin_edge_${edge.id}")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = "${edge.fromNodeId} ➔ ${edge.toNodeId}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Distance: ${edge.distanceMeters.toInt()}m • ${if (edge.isAccessible) "♿ Wheelchair Ramp/Lift OK" else "Stairs Only"}",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        if (edge.isBlocked) {
                            Text(
                                text = "BLOCKED: ${edge.closureReason.ifBlank { "Corridor Maintenance" }}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = RoseEmergency
                            )
                        }
                    }

                    Switch(
                        checked = edge.isBlocked,
                        onCheckedChange = { isChecked ->
                            viewModel.toggleCorridorClosure(
                                edgeId = edge.id,
                                isBlocked = isChecked,
                                reason = if (isChecked) "Renovation & Maintenance" else ""
                            )
                        }
                    )
                }
            }
        }

        // Reset Demo Action
        item {
            OutlinedButton(
                onClick = { showResetDialog = true },
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth().testTag("admin_reset_data_button")
            ) {
                Icon(Icons.Default.RestartAlt, contentDescription = null, tint = RoseEmergency)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Reset All Campus Demonstration Data", color = RoseEmergency, fontWeight = FontWeight.SemiBold)
            }
        }
    }

    // Dialog: Reset Data
    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("Reset Campus Data?") },
            text = { Text("This will restore default demonstration rooms, navigation edges, and clear custom corridor blocks.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.resetCampusData()
                        showResetDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RoseEmergency)
                ) {
                    Text("Reset Data", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetDialog = false }) { Text("Cancel") }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }

    // Dialog: Add Announcement
    if (showAddAnnouncementDialog) {
        var title by remember { mutableStateOf("") }
        var content by remember { mutableStateOf("") }
        var isCritical by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { showAddAnnouncementDialog = false },
            title = { Text("Publish Campus Notice / Route Alert", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Notice Title (e.g. Lift Under Maintenance)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = content,
                        onValueChange = { content = it },
                        label = { Text("Message Content") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = isCritical, onCheckedChange = { isCritical = it })
                        Text("Mark as High Priority Alert")
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (title.isNotBlank()) {
                            viewModel.addAnnouncement(
                                AnnouncementItem(
                                    title = title,
                                    content = content,
                                    type = if (isCritical) "ALERT" else "EVENT",
                                    isCritical = isCritical
                                )
                            )
                            showAddAnnouncementDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("Publish", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddAnnouncementDialog = false }) { Text("Cancel") }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }

    // Dialog: Add New College
    if (showAddCollegeDialog) {
        var cName by remember { mutableStateOf("") }
        var cLoc by remember { mutableStateOf("") }
        var cDesc by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddCollegeDialog = false },
            title = { Text("Add New College Campus", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = cName,
                        onValueChange = { cName = it },
                        label = { Text("College Name (e.g. PSG Tech)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = cLoc,
                        onValueChange = { cLoc = it },
                        label = { Text("Location (e.g. Coimbatore)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = cDesc,
                        onValueChange = { cDesc = it },
                        label = { Text("Description & Blocks") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (cName.isNotBlank()) {
                            viewModel.addNewCollege(cName, cLoc.ifBlank { "Campus City" }, cDesc.ifBlank { "Custom college campus" })
                            showAddCollegeDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("Create Campus", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddCollegeDialog = false }) { Text("Cancel") }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }

    // Dialog: Add College Photo (Admin Power as Requested)
    if (showAddPhotoDialog) {
        var photoTitle by remember { mutableStateOf("New Campus Research Lab") }
        var photoCategory by remember { mutableStateOf("LAB") }
        var photoUrl by remember { mutableStateOf("https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80") }
        var bldgName by remember { mutableStateOf(currentCollege?.name ?: "Main Campus") }
        var roomArea by remember { mutableStateOf("Room 201 - Advanced AI Lab") }
        var photoDesc by remember { mutableStateOf("Equipped with high-performance GPU nodes, computer vision testbeds, and research workspaces.") }

        AlertDialog(
            onDismissRequest = { showAddPhotoDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.AddPhotoAlternate, contentDescription = null, tint = PurpleNeon)
                    Text("Publish College Photo", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                }
            },
            text = {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth().heightIn(max = 420.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text(
                            text = "Add photos of classrooms, buildings, and facilities for students & visitors of ${currentCollege?.name ?: "this college"}.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = photoTitle,
                            onValueChange = { photoTitle = it },
                            label = { Text("Photo Title (e.g. Central Library Floor 2)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        Text("Category:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            val categories = listOf("CAMPUS_VIEW", "BUILDING", "CLASSROOM", "LAB", "LIBRARY", "AUDITORIUM", "CAFETERIA", "MAP_BLUEPRINT")
                            items(categories) { cat ->
                                FilterChip(
                                    selected = photoCategory == cat,
                                    onClick = { photoCategory = cat },
                                    label = { Text(cat.replace("_", " "), fontSize = 10.sp) }
                                )
                            }
                        }
                    }

                    item {
                        Text("1-Tap Architectural Preset Image:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            item {
                                OutlinedButton(
                                    onClick = {
                                        photoTitle = "Main Heritage Clock Tower Gate"
                                        photoCategory = "CAMPUS_VIEW"
                                        photoUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80"
                                        photoDesc = "Campus entrance with security check-in and accessible pathways."
                                    },
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("🏛️ Main Gate", fontSize = 10.sp)
                                }
                            }
                            item {
                                OutlinedButton(
                                    onClick = {
                                        photoTitle = "Turing AI & Robotics Lab"
                                        photoCategory = "LAB"
                                        photoUrl = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
                                        photoDesc = "GPU compute workstations and robotics testing platforms."
                                    },
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("🤖 AI Lab", fontSize = 10.sp)
                                }
                            }
                            item {
                                OutlinedButton(
                                    onClick = {
                                        photoTitle = "Central Digital Library & Study Pods"
                                        photoCategory = "LIBRARY"
                                        photoUrl = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80"
                                        photoDesc = "Quiet reading carrels, book stacks, and high-speed research Wi-Fi."
                                    },
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("📚 Library", fontSize = 10.sp)
                                }
                            }
                            item {
                                OutlinedButton(
                                    onClick = {
                                        photoTitle = "Dr. Kalam Tiered Auditorium"
                                        photoCategory = "AUDITORIUM"
                                        photoUrl = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80"
                                        photoDesc = "Acoustic auditorium for symposiums and conferences with ramp access."
                                    },
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("🎭 Auditorium", fontSize = 10.sp)
                                }
                            }
                            item {
                                OutlinedButton(
                                    onClick = {
                                        photoTitle = "Indoor Floorplan Map Blueprint"
                                        photoCategory = "MAP_BLUEPRINT"
                                        photoUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                                        photoDesc = "Architectural floorplan blueprint showing corridor transitions and rooms."
                                    },
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("🗺️ Floorplan Blueprint", fontSize = 10.sp)
                                }
                            }
                        }
                    }

                    item {
                        OutlinedTextField(
                            value = photoUrl,
                            onValueChange = { photoUrl = it },
                            label = { Text("Photo Image URL") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = bldgName,
                                onValueChange = { bldgName = it },
                                label = { Text("Building") },
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = roomArea,
                                onValueChange = { roomArea = it },
                                label = { Text("Room / Area") },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    item {
                        OutlinedTextField(
                            value = photoDesc,
                            onValueChange = { photoDesc = it },
                            label = { Text("Description & Visitor Guidance") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (photoTitle.isNotBlank() && photoUrl.isNotBlank()) {
                            viewModel.addCampusPhoto(
                                title = photoTitle,
                                description = photoDesc,
                                category = photoCategory,
                                photoUrl = photoUrl,
                                buildingName = bldgName,
                                roomOrArea = roomArea
                            )
                            showAddPhotoDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PurpleNeon)
                ) {
                    Text("Publish to College Gallery", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddPhotoDialog = false }) { Text("Cancel") }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }

    // Dialog: Create & Add Campus Map (Admin Power as Requested)
    if (showCreateMapDialog) {
        var mapBldgName by remember { mutableStateOf("Innovation & Computing Block") }
        var mapBldgCode by remember { mutableStateOf("ICB") }
        var mapLocation by remember { mutableStateOf(currentCollege?.location ?: "Chennai") }
        var mapFloors by remember { mutableStateOf("2") }
        var mapRooms by remember {
            mutableStateOf("Robotics Lab 101, Computer Center 102, AI Seminar Hall 103, Central Restrooms 104, Smart Classroom 201, Faculty Lounge 202")
        }
        var mapHasElevator by remember { mutableStateOf(true) }
        var mapHasRamp by remember { mutableStateOf(true) }

        AlertDialog(
            onDismissRequest = { showCreateMapDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.AddLocationAlt, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Text("Create & Deploy Floor Map", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                }
            },
            text = {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth().heightIn(max = 420.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text(
                            text = "Admin can add a new building layout with classrooms and corridors. It will immediately generate Dijkstra navigation paths for students and visitors!",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    item {
                        OutlinedTextField(
                            value = mapBldgName,
                            onValueChange = { mapBldgName = it },
                            label = { Text("Building / Department Name") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = mapBldgCode,
                                onValueChange = { mapBldgCode = it },
                                label = { Text("Code (e.g. ICB)") },
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = mapFloors,
                                onValueChange = { mapFloors = it },
                                label = { Text("Floors Count") },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    item {
                        OutlinedTextField(
                            value = mapRooms,
                            onValueChange = { mapRooms = it },
                            label = { Text("Classrooms, Labs & Facilities (Comma-separated)") },
                            minLines = 3,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Accessible Wheelchair Ramp at Entrance", fontSize = 12.sp)
                            Switch(checked = mapHasRamp, onCheckedChange = { mapHasRamp = it })
                        }
                    }

                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Elevator / Lift Connects All Floors", fontSize = 12.sp)
                            Switch(checked = mapHasElevator, onCheckedChange = { mapHasElevator = it })
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val roomsList = mapRooms.split(",").map { it.trim() }.filter { it.isNotBlank() }
                        viewModel.uploadAndAnalyzeCollegeMap(
                            collegeName = currentCollege?.name ?: "College Campus",
                            location = mapLocation,
                            blockName = mapBldgName,
                            floorsCount = mapFloors.toIntOrNull() ?: 2,
                            roomsList = roomsList,
                            hasElevator = mapHasElevator,
                            hasRamp = mapHasRamp
                        )
                        showCreateMapDialog = false
                        viewModel.navigateTo(CampusScreen.INDOOR_MAP)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("Generate & Deploy Map", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showCreateMapDialog = false }) { Text("Cancel") }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }
}
