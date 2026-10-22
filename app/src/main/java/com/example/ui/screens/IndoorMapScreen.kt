package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.DefaultCampusData
import com.example.data.model.Room
import com.example.data.model.TurnAction
import com.example.ui.MainCampusViewModel
import com.example.ui.components.CampusMapView
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IndoorMapScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val rooms by viewModel.allRooms.collectAsState()
    val edges by viewModel.allEdges.collectAsState()
    val selectedBuilding by viewModel.selectedBuildingId.collectAsState()
    val selectedFloor by viewModel.selectedFloorNumber.collectAsState()
    val startRoom by viewModel.selectedStartRoom.collectAsState()
    val destRoom by viewModel.selectedDestRoom.collectAsState()
    val routeResult by viewModel.routeResult.collectAsState()
    val isWheelchair by viewModel.isWheelchairMode.collectAsState()
    val stepIndex by viewModel.activeStepIndex.collectAsState()
    val preferredLanguage by viewModel.preferredLanguage.collectAsState()
    val isSpeaking by viewModel.voiceManager.isSpeaking.collectAsState()

    var showStartPicker by remember { mutableStateOf(false) }
    var showDestPicker by remember { mutableStateOf(false) }

    val currentBuilding = DefaultCampusData.BUILDINGS.find { it.id == selectedBuilding } ?: DefaultCampusData.BUILDINGS.first()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // 1. Building Selector Row & Floor Selector Chips
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Building Dropdown / Pills
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                DefaultCampusData.BUILDINGS.forEach { bldg ->
                    val isSelected = bldg.id == selectedBuilding
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.setBuildingAndFloor(bldg.id, 1) },
                        label = { Text(bldg.code, fontWeight = FontWeight.Bold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        modifier = Modifier.testTag("building_chip_${bldg.code}")
                    )
                }
            }

            // Floor Pills (1, 2, 3)
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                for (floor in 1..currentBuilding.numFloors) {
                    val isSelected = floor == selectedFloor
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(if (isSelected) PurpleNeon else NavySurface)
                            .clickable { viewModel.setBuildingAndFloor(selectedBuilding, floor) }
                            .testTag("floor_pill_$floor"),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "F$floor",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) Color.White else TextSecondaryDark
                        )
                    }
                }
            }
        }

        // 2. Start & Destination Selection Bar
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = NavySurface),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        // Start point
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(NavyCard)
                                .clickable { showStartPicker = true }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                .testTag("select_start_location_row")
                        ) {
                            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(EmeraldSuccess))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = startRoom?.name ?: "Select Starting Location",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = if (startRoom != null) TextPrimaryDark else TextSecondaryDark,
                                maxLines = 1,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        // Destination point
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(NavyCard)
                                .clickable { showDestPicker = true }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                                .testTag("select_dest_location_row")
                        ) {
                            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(CyanNeon))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = destRoom?.name ?: "Select Destination",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = if (destRoom != null) TextPrimaryDark else TextSecondaryDark,
                                maxLines = 1,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Swap & Accessibility Toggles
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(start = 8.dp)
                    ) {
                        IconButton(
                            onClick = { viewModel.swapStartAndDestination() },
                            modifier = Modifier.size(36.dp).testTag("swap_start_dest_button")
                        ) {
                            Icon(Icons.Default.SwapVert, contentDescription = "Swap Locations", tint = CyanNeon)
                        }
                        IconButton(
                            onClick = { viewModel.toggleWheelchairModeWithVoice(!isWheelchair) },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(if (isWheelchair) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.surfaceVariant)
                                .testTag("wheelchair_toggle_button")
                        ) {
                            Icon(
                                Icons.Default.Accessible,
                                contentDescription = "Wheelchair Accessibility",
                                tint = if (isWheelchair) MaterialTheme.colorScheme.onSecondary else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }

                // Wheelchair active banner
                if (isWheelchair) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.secondaryContainer,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                Icons.Default.Accessible,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.secondary,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = if (preferredLanguage == "Tamil") "சக்கர நாற்காலி வழி: படிக்கட்டுகள் தவிர்க்கப்பட்டுள்ளன (லிஃப்ட் & Ramp)" else "Wheelchair Route: Stairs Avoided (Ramps & Elevators)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSecondaryContainer
                            )
                        }
                    }
                }
            }
        }

        // 3. Interactive Map View Container (Weight 1)
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            CampusMapView(
                buildingId = selectedBuilding,
                floorNumber = selectedFloor,
                rooms = rooms,
                nodes = DefaultCampusData.getInitialNavNodes().associateBy { it.id },
                edges = edges,
                routeResult = routeResult,
                selectedStartRoom = startRoom,
                selectedDestRoom = destRoom,
                onRoomSelected = { clickedRoom ->
                    // Set as destination
                    viewModel.setDestRoom(clickedRoom)
                },
                modifier = Modifier.fillMaxSize()
            )
        }

        // 4. Route Status & Turn-by-Turn Guidance Panel
        if (routeResult != null) {
            val res = routeResult!!
            if (res.success) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = NavySurface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("active_navigation_guidance_card")
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        // Route Metrics Banner
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(CyanNeon.copy(alpha = 0.2f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.DirectionsWalk, contentDescription = null, tint = CyanNeon, modifier = Modifier.size(18.dp))
                                }
                                Column {
                                    Text(
                                        text = "${res.totalDistanceMeters.toInt()} meters • ${((res.estimatedTimeSeconds) / 60).coerceAtLeast(1)} min",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = TextPrimaryDark
                                    )
                                    if (res.containsFloorChange) {
                                        Text(
                                            text = "Multi-Floor Route via ${if (isWheelchair) "Elevator Lift" else "Lifts/Stairs"}",
                                            fontSize = 11.sp,
                                            color = PurpleNeon
                                        )
                                    }
                                }
                            }

                            // Audio Speak Button
                            IconButton(
                                onClick = {
                                    if (isSpeaking) {
                                        viewModel.voiceManager.stop()
                                    } else {
                                        viewModel.speakCurrentStep()
                                    }
                                },
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(if (isSpeaking) EmeraldSuccess else NavyCard)
                                    .testTag("audio_guidance_button")
                            ) {
                                Icon(
                                    imageVector = if (isSpeaking) Icons.Default.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
                                    contentDescription = "Voice Guidance",
                                    tint = if (isSpeaking) Color.White else CyanNeon,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }

                        // Step Instructions
                        if (res.segments.isNotEmpty() && stepIndex in res.segments.indices) {
                            val curStep = res.segments[stepIndex]
                            val actionIcon = when (curStep.action) {
                                TurnAction.TURN_LEFT -> Icons.Default.TurnLeft
                                TurnAction.TURN_RIGHT -> Icons.Default.TurnRight
                                TurnAction.TAKE_LIFT_UP, TurnAction.TAKE_LIFT_DOWN -> Icons.Default.Elevator
                                TurnAction.TAKE_STAIRS_UP, TurnAction.TAKE_STAIRS_DOWN -> Icons.Default.Stairs
                                TurnAction.TAKE_RAMP -> Icons.Default.Accessible
                                TurnAction.ARRIVE -> Icons.Default.Place
                                else -> Icons.Default.Straight
                            }

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(NavyCard)
                                    .padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(CyanNeon),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(actionIcon, contentDescription = null, tint = NavyDeep, modifier = Modifier.size(20.dp))
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Step ${stepIndex + 1} of ${res.segments.size}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = CyanNeon
                                    )
                                    Text(
                                        text = if (preferredLanguage == "Tamil") curStep.instructionTa else curStep.instructionEn,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextPrimaryDark
                                    )
                                }
                            }

                            // Prev / Next Step Controls
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                OutlinedButton(
                                    onClick = { viewModel.previousStep() },
                                    enabled = stepIndex > 0,
                                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Previous", fontSize = 12.sp)
                                }
                                OutlinedButton(
                                    onClick = { viewModel.speakFullRouteSummary() },
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Summary", fontSize = 12.sp)
                                }
                                Button(
                                    onClick = { viewModel.nextStep() },
                                    enabled = stepIndex < res.segments.size - 1,
                                    colors = ButtonDefaults.buttonColors(containerColor = CyanNeon, contentColor = NavyDeep),
                                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Next Step", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            } else {
                // Route failure / blocked corridor alert
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = RoseEmergency.copy(alpha = 0.18f)),
                    modifier = Modifier.fillMaxWidth().testTag("route_blocked_warning_card")
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(Icons.Default.Block, contentDescription = null, tint = RoseEmergency)
                        Column {
                            Text("No Open Route Available", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimaryDark)
                            Text(res.errorMessage, fontSize = 12.sp, color = TextSecondaryDark)
                        }
                    }
                }
            }
        }
    }

    // Modal Room Pickers
    if (showStartPicker) {
        RoomPickerModal(
            title = "Choose Starting Location",
            rooms = rooms,
            onDismiss = { showStartPicker = false },
            onRoomPicked = {
                viewModel.setStartRoom(it)
                showStartPicker = false
            }
        )
    }

    if (showDestPicker) {
        RoomPickerModal(
            title = "Choose Destination",
            rooms = rooms,
            onDismiss = { showDestPicker = false },
            onRoomPicked = {
                viewModel.setDestRoom(it)
                showDestPicker = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RoomPickerModal(
    title: String,
    rooms: List<Room>,
    onDismiss: () -> Unit,
    onRoomPicked: (Room) -> Unit
) {
    var search by remember { mutableStateOf("") }
    val filtered = remember(search, rooms) {
        if (search.isBlank()) rooms else rooms.filter {
            it.name.contains(search, ignoreCase = true) ||
            it.roomNumber.contains(search, ignoreCase = true) ||
            it.category.displayName.contains(search, ignoreCase = true)
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = NavySurface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimaryDark)
            OutlinedTextField(
                value = search,
                onValueChange = { search = it },
                placeholder = { Text("Search room number or name...", color = TextSecondaryDark) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = CyanNeon) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            LazyColumn(
                modifier = Modifier.heightIn(max = 350.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(filtered) { r ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(NavyCard)
                            .clickable { onRoomPicked(r) }
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(r.name, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TextPrimaryDark)
                            Text("Room ${r.roomNumber} • Bldg ${r.buildingId} Floor ${r.floorNumber}", fontSize = 12.sp, color = TextSecondaryDark)
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = CyanNeon)
                    }
                }
            }
        }
    }
}
