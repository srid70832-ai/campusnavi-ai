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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Room
import com.example.data.model.TimetableItem
import com.example.data.model.UserRole
import com.example.ui.CampusScreen
import com.example.ui.MainCampusViewModel
import com.example.ui.theme.*

@Composable
fun DashboardScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val rooms by viewModel.allRooms.collectAsState()
    val timetable by viewModel.timetable.collectAsState()
    val announcements by viewModel.announcements.collectAsState()
    val edges by viewModel.allEdges.collectAsState()
    val isWheelchair by viewModel.isWheelchairMode.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val colleges by viewModel.allColleges.collectAsState()
    val selectedCollegeId by viewModel.selectedCollegeId.collectAsState()
    val currentCollege = colleges.find { it.id == selectedCollegeId }
    val userSession by viewModel.userSession.collectAsState()

    val blockedCount = edges.count { it.isBlocked }
    val nextClass = timetable.firstOrNull()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Futuristic Hero Card with Theme & College Info
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("dashboard_hero_card")
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                if (isDarkTheme) {
                                    listOf(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.surface)
                                } else {
                                    listOf(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f), MaterialTheme.colorScheme.surface)
                                }
                            )
                        )
                        .padding(18.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Campus Navigator AI",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Indoor Wayfinding & Real-Time Campus Map",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }

                            // Theme Toggle Pill (Dark / White Mode)
                            FilledTonalButton(
                                onClick = { viewModel.toggleTheme() },
                                shape = RoundedCornerShape(12.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Icon(
                                    imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                                    contentDescription = "Toggle Theme",
                                    modifier = Modifier.size(16.dp),
                                    tint = if (isDarkTheme) AmberWarning else MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (isDarkTheme) "White Mode" else "Dark Mode",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // Active College Chip & Corridor Status
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { viewModel.navigateTo(CampusScreen.ADMIN) }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        Icons.Default.School,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = currentCollege?.name?.take(28) ?: "Campus Hub",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary,
                                        maxLines = 1
                                    )
                                    Icon(
                                        Icons.Default.Edit,
                                        contentDescription = "Change",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(12.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            Box(
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(if (blockedCount > 0) AmberWarning.copy(alpha = 0.2f) else EmeraldSuccess.copy(alpha = 0.2f))
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(if (blockedCount > 0) AmberWarning else EmeraldSuccess)
                                    )
                                    Text(
                                        text = if (blockedCount > 0) "$blockedCount Blocked" else "Routes Clear",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (blockedCount > 0) AmberWarning else EmeraldSuccess
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // User Role & Account Status Strip
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(
                    containerColor = when (userSession.role) {
                        UserRole.ADMIN -> PurpleAccent.copy(alpha = 0.12f)
                        UserRole.STUDENT -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                        UserRole.VISITOR -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ),
                modifier = Modifier.fillMaxWidth().testTag("dashboard_user_role_card")
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(
                                    when (userSession.role) {
                                        UserRole.ADMIN -> PurpleNeon
                                        UserRole.STUDENT -> MaterialTheme.colorScheme.primary
                                        UserRole.VISITOR -> MaterialTheme.colorScheme.outline
                                    }
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = when (userSession.role) {
                                    UserRole.ADMIN -> Icons.Default.AdminPanelSettings
                                    UserRole.STUDENT -> Icons.Default.School
                                    UserRole.VISITOR -> Icons.Default.Person
                                },
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = userSession.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = when (userSession.role) {
                                        UserRole.ADMIN -> PurpleNeon
                                        UserRole.STUDENT -> MaterialTheme.colorScheme.primary
                                        UserRole.VISITOR -> MaterialTheme.colorScheme.outline
                                    }
                                ) {
                                    Text(
                                        text = userSession.role.badge.uppercase(),
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = when (userSession.role) {
                                    UserRole.ADMIN -> "College Admin Mode: Map creation & route editing active"
                                    UserRole.STUDENT -> "Student Mode: Timetable & classroom wayfinding active"
                                    UserRole.VISITOR -> "Visitor Mode: Exploring college facilities & routes"
                                },
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    FilledTonalButton(
                        onClick = {
                            if (userSession.role == UserRole.ADMIN) {
                                viewModel.navigateTo(CampusScreen.ADMIN)
                            } else {
                                viewModel.navigateTo(CampusScreen.LOGIN)
                            }
                        },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (userSession.role == UserRole.ADMIN) "Admin Studio" else "Switch / Login",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // 2. Wheelchair Accessibility Mode Card with Quick Switch
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isWheelchair) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("wheelchair_quick_card")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                if (isWheelchair) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.surfaceVariant
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Accessible,
                            contentDescription = "Wheelchair",
                            tint = if (isWheelchair) MaterialTheme.colorScheme.onSecondary else MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "Wheelchair Route Mode",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (isWheelchair) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = EmeraldSuccess.copy(alpha = 0.2f)
                                ) {
                                    Text(
                                        "100% Barrier-Free",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EmeraldSuccess,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                        Text(
                            text = if (isWheelchair)
                                "Stairs strictly avoided • Elevators & Ramps only • Tamil & English voice announcements"
                            else
                                "Tap toggle to enforce step-free paths, ramps, and elevator priority",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Switch(
                        checked = isWheelchair,
                        onCheckedChange = { viewModel.toggleWheelchairModeWithVoice(it) }
                    )
                }
            }
        }

        // 3. Visiting Another College? Camera Route & Classroom Map Scanner Banner
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.navigateTo(CampusScreen.CAMERA_NAV) }
                    .testTag("visiting_college_scanner_card")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.AddLocationAlt, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                "Visiting Another College?",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    "Real-Time",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.secondary,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            "Walk with camera to add routes or upload classroom map blueprint to auto-generate indoor routes",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                }
            }
        }

        // 4. Next Class Live Banner
        if (nextClass != null) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("next_class_banner")
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.Schedule, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                                Text("NEXT UPCOMING CLASS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                            }
                            Text("${nextClass.startTime} - ${nextClass.endTime}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }

                        Text(nextClass.subjectName, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                        Text(
                            text = "Room ${nextClass.roomId} • ${nextClass.buildingId} Floor ${nextClass.floorNumber} • ${nextClass.instructor}",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Button(
                            onClick = { viewModel.navigateToClass(nextClass) },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp)
                                .testTag("navigate_to_next_class_button")
                        ) {
                            Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Navigate to Classroom Now", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // 5. Quick Navigation Destinations
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Quick Campus Navigation",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    QuickNavCard(
                        title = "AI & Robotics",
                        sub = "Room TP-103",
                        icon = Icons.Default.SmartToy,
                        color = CyanNeon,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            rooms.find { it.id == "TP-103" }?.let {
                                viewModel.setDestRoom(it)
                                viewModel.navigateTo(CampusScreen.INDOOR_MAP)
                            }
                        }
                    )
                    QuickNavCard(
                        title = "Central Library",
                        sub = "Room TP-205",
                        icon = Icons.Default.LocalLibrary,
                        color = Color(0xFF38BDF8),
                        modifier = Modifier.weight(1f),
                        onClick = {
                            rooms.find { it.id == "TP-205" }?.let {
                                viewModel.setDestRoom(it)
                                viewModel.navigateTo(CampusScreen.INDOOR_MAP)
                            }
                        }
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    QuickNavCard(
                        title = "Auditorium",
                        sub = "Room TP-105",
                        icon = Icons.Default.TheaterComedy,
                        color = PurpleNeon,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            rooms.find { it.id == "TP-105" }?.let {
                                viewModel.setDestRoom(it)
                                viewModel.navigateTo(CampusScreen.INDOOR_MAP)
                            }
                        }
                    )
                    QuickNavCard(
                        title = "Cafeteria",
                        sub = "Room SH-101",
                        icon = Icons.Default.Restaurant,
                        color = AmberWarning,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            rooms.find { it.id == "SH-101" }?.let {
                                viewModel.setDestRoom(it)
                                viewModel.navigateTo(CampusScreen.INDOOR_MAP)
                            }
                        }
                    )
                }
            }
        }

        // 6. Campus Announcements
        if (announcements.isNotEmpty()) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Campus Alerts & Notices",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    announcements.take(2).forEach { alert ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (alert.isCritical) RoseEmergency.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface
                            ),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Icon(
                                    if (alert.isCritical) Icons.Default.Warning else Icons.Default.Campaign,
                                    contentDescription = null,
                                    tint = if (alert.isCritical) RoseEmergency else MaterialTheme.colorScheme.primary
                                )
                                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text(alert.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)
                                    Text(alert.content, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                }
            }
        }

        // 7. Emergency Evacuation Quick Action
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = RoseEmergency.copy(alpha = 0.12f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.navigateTo(CampusScreen.EMERGENCY) }
                    .testTag("dashboard_emergency_card")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(RoseEmergency.copy(alpha = 0.25f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Emergency, contentDescription = null, tint = RoseEmergency)
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Emergency Assistance & Evacuation", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                        Text("Turn-by-turn route to nearest exit or call campus security", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Button(
                        onClick = { viewModel.navigateToNearestEmergencyExit() },
                        colors = ButtonDefaults.buttonColors(containerColor = RoseEmergency, contentColor = Color.White),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text("Exit SOS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickNavCard(
    title: String,
    sub: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(color.copy(alpha = 0.18f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            }
            Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface, maxLines = 1)
            Text(sub, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
        }
    }
}
