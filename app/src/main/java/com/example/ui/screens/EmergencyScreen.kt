package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.DirectionsRun
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.EmergencyContact
import com.example.ui.MainCampusViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmergencyScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val contacts by viewModel.emergencyContacts.collectAsState()
    val selectedCollegeId by viewModel.selectedCollegeId.collectAsState()
    val colleges by viewModel.allColleges.collectAsState()
    val currentCollege = colleges.find { it.id == selectedCollegeId }

    val collegeContacts = remember(contacts, selectedCollegeId) {
        val filtered = contacts.filter { it.collegeId == selectedCollegeId }
        if (filtered.isNotEmpty()) filtered else contacts
    }

    var showAddContactDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Evacuate to Emergency Exit Hero Banner
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = RoseEmergency.copy(alpha = 0.15f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("emergency_evacuate_card")
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(RoseEmergency),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Emergency, contentDescription = null, tint = Color.White, modifier = Modifier.size(32.dp))
                    }

                    Text("EMERGENCY EVACUATION", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                    Text(
                        text = "Instantly calculates the safest turn-by-turn route to the nearest emergency fire exit on your floor.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )

                    Button(
                        onClick = { viewModel.navigateToNearestEmergencyExit() },
                        colors = ButtonDefaults.buttonColors(containerColor = RoseEmergency, contentColor = Color.White),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("navigate_nearest_exit_button")
                    ) {
                        Icon(Icons.AutoMirrored.Filled.DirectionsRun, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Route to Nearest Exit Now", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }
        }

        // 2. Emergency Contacts Header with "+ Add Contact" button
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Campus Emergency Dispatch", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                    Text(
                        text = "For ${currentCollege?.name ?: "Current College"}",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Button(
                    onClick = { showAddContactDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("add_emergency_contact_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Number", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // 3. Contacts List
        items(collegeContacts, key = { it.id }) { contact ->
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier.fillMaxWidth().testTag("emergency_contact_${contact.id}")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                if (contact.priority == 1) RoseEmergency.copy(alpha = 0.2f) else MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (contact.priority == 1) Icons.Default.LocalHospital else Icons.Default.Shield,
                            contentDescription = null,
                            tint = if (contact.priority == 1) RoseEmergency else MaterialTheme.colorScheme.primary
                        )
                    }

                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text(contact.title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                        Text(contact.role, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(contact.location, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                    }

                    // SMS SOS Button
                    IconButton(
                        onClick = {
                            val smsIntent = Intent(Intent.ACTION_SENDTO).apply {
                                data = Uri.parse("smsto:${contact.phoneNumber}")
                                putExtra("sms_body", "EMERGENCY SOS: Need assistance on campus at ${currentCollege?.name ?: "Campus"}.")
                            }
                            try { context.startActivity(smsIntent) } catch (e: Exception) {}
                        },
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer)
                    ) {
                        Icon(Icons.Default.Sms, contentDescription = "SMS SOS", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                    }

                    // Call Button
                    IconButton(
                        onClick = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${contact.phoneNumber}"))
                            context.startActivity(intent)
                        },
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(EmeraldSuccess)
                            .testTag("call_contact_${contact.id}")
                    ) {
                        Icon(Icons.Default.Call, contentDescription = "Call", tint = Color.White)
                    }
                }
            }
        }

        // 4. Safety Information Card
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Campus Safety & Assembly Points", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
                    Text("• In case of fire or hazard, use only stairways and designated exits. Never use elevators during an active fire alarm.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("• Automated External Defibrillator (AED) & First Aid Stations are marked at Central Entrances and Clinics.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("• Primary Campus Assembly Ground: Front Academic Quadrangle.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }

    // Add Emergency Contact Dialog
    if (showAddContactDialog) {
        var name by remember { mutableStateOf("") }
        var role by remember { mutableStateOf("") }
        var phone by remember { mutableStateOf("") }
        var location by remember { mutableStateOf("") }
        var isUrgent by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { showAddContactDialog = false },
            title = { Text("Add College Emergency Number", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Contact / Office Name (e.g. Campus Security)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = role,
                        onValueChange = { role = it },
                        label = { Text("Role / Department (e.g. 24/7 Dispatch)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone Number (e.g. +91 94440 00000)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = location,
                        onValueChange = { location = it },
                        label = { Text("Location on Campus") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = isUrgent, onCheckedChange = { isUrgent = it })
                        Text("High Priority 24/7 SOS Number")
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (name.isNotBlank() && phone.isNotBlank()) {
                            viewModel.addCustomEmergencyContact(
                                title = name,
                                role = role.ifBlank { "Campus Contact" },
                                phoneNumber = phone,
                                location = location.ifBlank { "Campus Ground Floor" },
                                priority = if (isUrgent) 1 else 2
                            )
                            showAddContactDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text("Save Contact", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddContactDialog = false }) {
                    Text("Cancel")
                }
            },
            containerColor = MaterialTheme.colorScheme.surface
        )
    }
}
