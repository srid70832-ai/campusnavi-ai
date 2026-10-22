package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.ui.CampusScreen
import com.example.ui.MainCampusViewModel
import com.example.ui.theme.*

@Composable
fun AccessibilitySettingsScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val isWheelchair by viewModel.isWheelchairMode.collectAsState()
    val isHighContrast by viewModel.isHighContrast.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val language by viewModel.preferredLanguage.collectAsState()
    val voiceSpeed by viewModel.voiceSpeedRate.collectAsState()
    val walkingSpeed by viewModel.walkingSpeedMps.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Accessibility & Preferences", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
            Text("Tailor campus navigation to your mobility and visual needs", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        // Mobility Section
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Mobility & Path Preferences", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = CyanNeon)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Wheelchair Mode (Avoid Stairs)", fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TextPrimaryDark)
                            Text("Exclusively uses elevators, lifts, and ramps. Never routes through stairs.", fontSize = 11.sp, color = TextSecondaryDark)
                        }
                        Switch(
                            checked = isWheelchair,
                            onCheckedChange = { viewModel.toggleWheelchairMode(it) },
                            modifier = Modifier.testTag("switch_wheelchair_mode")
                        )
                    }

                    Divider(color = NavyBorder)

                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Walking Speed", fontSize = 13.sp, color = TextPrimaryDark)
                            Text(String.format("%.1f m/s", walkingSpeed), fontSize = 13.sp, color = CyanNeon, fontWeight = FontWeight.Bold)
                        }
                        Slider(
                            value = walkingSpeed,
                            onValueChange = { viewModel.walkingSpeedMps.value = it },
                            valueRange = 0.6f..1.8f,
                            steps = 5,
                            modifier = Modifier.testTag("walking_speed_slider")
                        )
                    }
                }
            }
        }

        // Voice Navigation Section
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Voice Guidance & Language", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = CyanNeon)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Navigation Language", fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TextPrimaryDark)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FilterChip(
                                selected = language == "English",
                                onClick = { viewModel.preferredLanguage.value = "English" },
                                label = { Text("English") },
                                modifier = Modifier.testTag("lang_chip_english")
                            )
                            FilterChip(
                                selected = language == "Tamil",
                                onClick = { viewModel.preferredLanguage.value = "Tamil" },
                                label = { Text("தமிழ்") },
                                modifier = Modifier.testTag("lang_chip_tamil")
                            )
                        }
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Speech Narration Speed", fontSize = 13.sp, color = TextPrimaryDark)
                            Text(String.format("%.2fx", voiceSpeed), fontSize = 13.sp, color = CyanNeon, fontWeight = FontWeight.Bold)
                        }
                        Slider(
                            value = voiceSpeed,
                            onValueChange = { viewModel.voiceSpeedRate.value = it },
                            valueRange = 0.7f..1.5f,
                            steps = 4
                        )
                    }

                    Button(
                        onClick = {
                            val testText = if (language == "Tamil") {
                                "வணக்கம். கேம்பஸ் நேவிகேட்டர் ஏ.ஐ. நேரலை வழிகாட்டுதல் இயக்கத்தில் உள்ளது."
                            } else {
                                "Hello! Campus Navigator AI voice guidance is ready to assist your journey."
                            }
                            viewModel.voiceManager.speak(testText, language, voiceSpeed)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = NavyCard, contentColor = CyanNeon),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().testTag("test_voice_button")
                    ) {
                        Icon(Icons.Default.VolumeUp, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Test Voice Narration Audio")
                    }
                }
            }
        }

        // Display & Theme Section
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Display & Contrast", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = CyanNeon)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("High Contrast Mode", fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TextPrimaryDark)
                            Text("Maximum contrast color scheme for low-vision accessibility", fontSize = 11.sp, color = TextSecondaryDark)
                        }
                        Switch(
                            checked = isHighContrast,
                            onCheckedChange = { viewModel.isHighContrast.value = it },
                            modifier = Modifier.testTag("switch_high_contrast")
                        )
                    }

                    Divider(color = NavyBorder)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Dark Theme", fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = TextPrimaryDark)
                            Text("Cyber navy dark background palette", fontSize = 11.sp, color = TextSecondaryDark)
                        }
                        Switch(
                            checked = isDarkTheme,
                            onCheckedChange = { viewModel.isDarkTheme.value = it }
                        )
                    }
                }
            }
        }

        // Analytics Link
        item {
            Button(
                onClick = { viewModel.navigateTo(CampusScreen.ANALYTICS) },
                colors = ButtonDefaults.buttonColors(containerColor = NavyCard, contentColor = TextPrimaryDark),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth().testTag("view_analytics_button")
            ) {
                Icon(Icons.Default.Analytics, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("View Campus Navigation Analytics")
            }
        }
    }
}
