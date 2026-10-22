package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.example.data.model.Room
import com.example.data.model.TimetableItem
import com.example.ui.MainCampusViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimetableScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val timetable by viewModel.timetable.collectAsState()
    val rooms by viewModel.allRooms.collectAsState()

    val daysOfWeek = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")
    var selectedDay by remember { mutableStateOf("Monday") }
    var showAddDialog by remember { mutableStateOf(false) }

    val dayClasses = remember(timetable, selectedDay) {
        timetable.filter { it.dayOfWeek.equals(selectedDay, ignoreCase = true) }
            .sortedBy { it.startTime }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.testTag("add_class_fab")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Class")
            }
        },
        containerColor = MaterialTheme.colorScheme.background,
        modifier = modifier.fillMaxSize()
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Days of the week row
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(daysOfWeek) { day ->
                    val isSelected = day == selectedDay
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedDay = day },
                        label = { Text(day, fontWeight = FontWeight.Bold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        modifier = Modifier.testTag("day_filter_chip_$day")
                    )
                }
            }

            // Day schedule summary
            Text(
                text = "${dayClasses.size} classes scheduled for $selectedDay",
                fontSize = 12.sp,
                color = TextSecondaryDark
            )

            // Classes list
            if (dayClasses.isEmpty()) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.CalendarToday,
                            contentDescription = null,
                            tint = TextMutedDark,
                            modifier = Modifier.size(48.dp)
                        )
                        Text("No classes scheduled for $selectedDay", fontSize = 14.sp, color = TextSecondaryDark)
                        Text("Tap + below to add a class to your timetable", fontSize = 12.sp, color = TextMutedDark)
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("timetable_class_list")
                ) {
                    items(dayClasses, key = { it.id }) { item ->
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = NavySurface),
                            modifier = Modifier.fillMaxWidth().testTag("timetable_item_${item.id}")
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = CyanNeon.copy(alpha = 0.2f)
                                    ) {
                                        Text(
                                            text = item.courseCode,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = CyanNeon,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = "${item.startTime} - ${item.endTime}",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimaryDark
                                        )
                                        IconButton(
                                            onClick = { viewModel.deleteTimetableEntry(item.id) },
                                            modifier = Modifier.size(32.dp)
                                        ) {
                                            Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = TextMutedDark, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                }

                                Text(item.subjectName, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextPrimaryDark)

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Room ${item.roomId} • ${item.buildingId} Floor ${item.floorNumber}",
                                            fontSize = 12.sp,
                                            color = CyanNeon
                                        )
                                        Text(item.instructor, fontSize = 11.sp, color = TextSecondaryDark)
                                    }

                                    Button(
                                        onClick = { viewModel.navigateToClass(item) },
                                        colors = ButtonDefaults.buttonColors(containerColor = CyanNeon, contentColor = NavyDeep),
                                        shape = RoundedCornerShape(10.dp),
                                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                    ) {
                                        Icon(Icons.Default.Navigation, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Go to Class", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddClassDialog(
            rooms = rooms,
            selectedDay = selectedDay,
            onDismiss = { showAddDialog = false },
            onAdd = { newItem ->
                viewModel.addTimetableEntry(newItem)
                showAddDialog = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddClassDialog(
    rooms: List<Room>,
    selectedDay: String,
    onDismiss: () -> Unit,
    onAdd: (TimetableItem) -> Unit
) {
    var subject by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var instructor by remember { mutableStateOf("") }
    var startTime by remember { mutableStateOf("09:00") }
    var endTime by remember { mutableStateOf("10:30") }
    var selectedRoom by remember { mutableStateOf(rooms.firstOrNull()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Timetable Class", color = TextPrimaryDark, fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = subject,
                    onValueChange = { subject = it },
                    label = { Text("Subject Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = code,
                    onValueChange = { code = it },
                    label = { Text("Course Code (e.g. AI-401)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = instructor,
                    onValueChange = { instructor = it },
                    label = { Text("Instructor / Professor") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = startTime,
                        onValueChange = { startTime = it },
                        label = { Text("Start (09:00)") },
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = endTime,
                        onValueChange = { endTime = it },
                        label = { Text("End (10:30)") },
                        modifier = Modifier.weight(1f)
                    )
                }

                Text("Assigned Classroom:", fontSize = 12.sp, color = TextSecondaryDark)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(rooms.take(8)) { r ->
                        FilterChip(
                            selected = selectedRoom?.id == r.id,
                            onClick = { selectedRoom = r },
                            label = { Text("${r.roomNumber} (${r.name.take(10)})", fontSize = 11.sp) }
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val r = selectedRoom ?: return@Button
                    if (subject.isNotBlank()) {
                        onAdd(
                            TimetableItem(
                                subjectName = subject,
                                courseCode = code.ifBlank { "CS-101" },
                                instructor = instructor.ifBlank { "Faculty" },
                                roomId = r.id,
                                buildingId = r.buildingId,
                                floorNumber = r.floorNumber,
                                dayOfWeek = selectedDay,
                                startTime = startTime,
                                endTime = endTime
                            )
                        )
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = CyanNeon, contentColor = NavyDeep)
            ) {
                Text("Add Class", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondaryDark)
            }
        },
        containerColor = NavySurface
    )
}
