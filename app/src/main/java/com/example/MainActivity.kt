package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.UserRole
import com.example.ui.CampusScreen
import com.example.ui.MainCampusViewModel
import com.example.ui.components.CampusBottomNav
import com.example.ui.components.CampusTopBar
import com.example.ui.screens.*
import com.example.ui.theme.CampusNavigatorTheme

class MainActivity : ComponentActivity() {

    private val viewModel: MainCampusViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val isDarkTheme by viewModel.isDarkTheme.collectAsState()
            val isHighContrast by viewModel.isHighContrast.collectAsState()
            val currentScreen by viewModel.currentScreen.collectAsState()
            val preferredLanguage by viewModel.preferredLanguage.collectAsState()

            val colleges by viewModel.allColleges.collectAsState()
            val selectedCollegeId by viewModel.selectedCollegeId.collectAsState()
            val currentCollege = colleges.find { it.id == selectedCollegeId }
            val userSession by viewModel.userSession.collectAsState()
            var showCollegeDialog by remember { mutableStateOf(false) }
            var showRoleLoginDialog by remember { mutableStateOf(false) }

            CampusNavigatorTheme(
                darkTheme = isDarkTheme,
                highContrast = isHighContrast
            ) {
                // Handle system back button for all sub-screens
                BackHandler(enabled = currentScreen != CampusScreen.DASHBOARD) {
                    viewModel.navigateBack()
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = {
                        CampusTopBar(
                            currentScreen = currentScreen,
                            preferredLanguage = preferredLanguage,
                            isDarkTheme = isDarkTheme,
                            activeCollegeName = currentCollege?.name ?: "Campus Navigator",
                            userRole = userSession.role,
                            userName = userSession.name,
                            onLanguageToggle = {
                                viewModel.preferredLanguage.value =
                                    if (preferredLanguage == "Tamil") "English" else "Tamil"
                            },
                            onThemeToggle = {
                                viewModel.toggleTheme()
                            },
                            onCollegeClick = {
                                showCollegeDialog = true
                            },
                            onRoleProfileClick = {
                                viewModel.navigateTo(CampusScreen.LOGIN)
                            },
                            onEmergencyClick = {
                                viewModel.navigateTo(CampusScreen.EMERGENCY)
                            },
                            onAdminClick = {
                                viewModel.navigateTo(CampusScreen.ADMIN)
                            },
                            onSettingsClick = {
                                viewModel.navigateTo(CampusScreen.SETTINGS)
                            },
                            onBackClick = {
                                viewModel.navigateBack()
                            },
                            canGoBack = currentScreen != CampusScreen.DASHBOARD
                        )
                    },
                    bottomBar = {
                        CampusBottomNav(
                            currentScreen = currentScreen,
                            onNavigate = { screen ->
                                viewModel.navigateTo(screen)
                            }
                        )
                    }
                ) { innerPadding ->
                    val screenModifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)

                    when (currentScreen) {
                        CampusScreen.DASHBOARD -> DashboardScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.INDOOR_MAP -> IndoorMapScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.DIRECTORY -> CampusDirectoryScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.AI_ASSISTANT -> AiAssistantScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.TIMETABLE -> TimetableScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.CAMERA_NAV -> VisualNavigationScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.EMERGENCY -> EmergencyScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.ADMIN -> AdminDashboardScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.SETTINGS -> AccessibilitySettingsScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.ANALYTICS -> AnalyticsScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                        CampusScreen.LOGIN -> LoginScreen(
                            viewModel = viewModel,
                            modifier = screenModifier
                        )
                    }
                }

                if (showCollegeDialog) {
                    var showAddCollegeForm by remember { mutableStateOf(false) }
                    var newCollegeName by remember { mutableStateOf("") }
                    var newCollegeLocation by remember { mutableStateOf("") }
                    var newCollegeDesc by remember { mutableStateOf("") }

                    AlertDialog(
                        onDismissRequest = { showCollegeDialog = false },
                        title = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    Icons.Default.School,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    text = if (showAddCollegeForm) "Visit / Add Other College" else "Select Campus / College",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 17.sp
                                )
                            }
                        },
                        text = {
                            if (!showAddCollegeForm) {
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = "Choose a campus or add a new college with camera routes & classroom floorplans:",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )

                                    LazyColumn(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .heightIn(max = 240.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        items(colleges, key = { it.id }) { college ->
                                            val isSelected = college.id == selectedCollegeId
                                            Surface(
                                                shape = RoundedCornerShape(10.dp),
                                                color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clickable {
                                                        viewModel.selectCollege(college.id)
                                                        showCollegeDialog = false
                                                    }
                                            ) {
                                                Row(
                                                    modifier = Modifier.padding(10.dp),
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                                ) {
                                                    RadioButton(
                                                        selected = isSelected,
                                                        onClick = {
                                                            viewModel.selectCollege(college.id)
                                                            showCollegeDialog = false
                                                        }
                                                    )
                                                    Column(modifier = Modifier.weight(1f)) {
                                                        Text(
                                                            text = college.name,
                                                            fontWeight = FontWeight.Bold,
                                                            fontSize = 13.sp,
                                                            color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
                                                        )
                                                        Text(
                                                            text = college.location,
                                                            fontSize = 11.sp,
                                                            color = MaterialTheme.colorScheme.primary
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    Divider(modifier = Modifier.padding(vertical = 4.dp))

                                    Button(
                                        onClick = { showAddCollegeForm = true },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Icon(Icons.Default.AddBusiness, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Add Other College Campus", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }

                                    OutlinedButton(
                                        onClick = {
                                            showCollegeDialog = false
                                            viewModel.navigateTo(CampusScreen.CAMERA_NAV)
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Icon(Icons.Default.CameraAlt, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Camera Route & Map Scanner", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            } else {
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = "Going to another college? Add the college name and map its routes via camera or upload its classroom map!",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )

                                    OutlinedTextField(
                                        value = newCollegeName,
                                        onValueChange = { newCollegeName = it },
                                        label = { Text("College Name (e.g. Loyola College)") },
                                        singleLine = true,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                    OutlinedTextField(
                                        value = newCollegeLocation,
                                        onValueChange = { newCollegeLocation = it },
                                        label = { Text("Location / Campus City") },
                                        singleLine = true,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                    OutlinedTextField(
                                        value = newCollegeDesc,
                                        onValueChange = { newCollegeDesc = it },
                                        label = { Text("Description / Block Names") },
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }
                            }
                        },
                        confirmButton = {
                            if (showAddCollegeForm) {
                                Button(
                                    onClick = {
                                        if (newCollegeName.isNotBlank()) {
                                            viewModel.addNewCollege(
                                                name = newCollegeName,
                                                location = newCollegeLocation.ifBlank { "Campus City" },
                                                description = newCollegeDesc.ifBlank { "Custom college campus routes" }
                                            )
                                            showCollegeDialog = false
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                                ) {
                                    Text("Create & Map", fontWeight = FontWeight.Bold)
                                }
                            }
                        },
                        dismissButton = {
                            TextButton(
                                onClick = {
                                    if (showAddCollegeForm) {
                                        showAddCollegeForm = false
                                    } else {
                                        showCollegeDialog = false
                                    }
                                }
                            ) {
                                Text(if (showAddCollegeForm) "Back" else "Close")
                            }
                        },
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                }

                // Role Login & Switcher Dialog (Student, Visitor, Admin)
                if (showRoleLoginDialog) {
                    var selectedRoleTab by remember { mutableStateOf(userSession.role) }
                    var nameInput by remember { mutableStateOf("") }
                    var idInput by remember { mutableStateOf("") }
                    var extraInput by remember { mutableStateOf("") }
                    var adminPinInput by remember { mutableStateOf("") }

                    AlertDialog(
                        onDismissRequest = { showRoleLoginDialog = false },
                        title = {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Default.AccountCircle, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                Text("Campus Account & Role Login", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                            }
                        },
                        text = {
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // Role Selector Tabs
                                TabRow(
                                    selectedTabIndex = when (selectedRoleTab) {
                                        UserRole.VISITOR -> 0
                                        UserRole.STUDENT -> 1
                                        UserRole.ADMIN -> 2
                                    },
                                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier.clip(RoundedCornerShape(10.dp))
                                ) {
                                    Tab(
                                        selected = selectedRoleTab == UserRole.VISITOR,
                                        onClick = { selectedRoleTab = UserRole.VISITOR },
                                        text = { Text("Visitor", fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                                    )
                                    Tab(
                                        selected = selectedRoleTab == UserRole.STUDENT,
                                        onClick = { selectedRoleTab = UserRole.STUDENT },
                                        text = { Text("Student", fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                                    )
                                    Tab(
                                        selected = selectedRoleTab == UserRole.ADMIN,
                                        onClick = { selectedRoleTab = UserRole.ADMIN },
                                        text = { Text("Admin", fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                                    )
                                }

                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(8.dp)) {
                                        Text(
                                            text = selectedRoleTab.displayName,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                        Text(
                                            text = selectedRoleTab.description,
                                            fontSize = 11.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }

                                when (selectedRoleTab) {
                                    UserRole.VISITOR -> {
                                        OutlinedTextField(
                                            value = nameInput,
                                            onValueChange = { nameInput = it },
                                            label = { Text("Visitor Name (e.g. David Miller)") },
                                            singleLine = true,
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                        OutlinedTextField(
                                            value = extraInput,
                                            onValueChange = { extraInput = it },
                                            label = { Text("Purpose (e.g. Campus Visit, Guest, Parent)") },
                                            singleLine = true,
                                            modifier = Modifier.fillMaxWidth()
                                        )

                                        OutlinedButton(
                                            onClick = {
                                                viewModel.login(
                                                    role = UserRole.VISITOR,
                                                    name = "David Miller (Guest)",
                                                    emailOrId = "david.guest@gmail.com",
                                                    department = "Campus Visitor",
                                                    collegeId = selectedCollegeId
                                                )
                                                showRoleLoginDialog = false
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text("⚡ Quick Demo Visitor Login", fontSize = 11.sp)
                                        }
                                    }
                                    UserRole.STUDENT -> {
                                        OutlinedTextField(
                                            value = nameInput,
                                            onValueChange = { nameInput = it },
                                            label = { Text("Student Name (e.g. Priya Sharma)") },
                                            singleLine = true,
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                        OutlinedTextField(
                                            value = idInput,
                                            onValueChange = { idInput = it },
                                            label = { Text("Student Roll / ID (e.g. 2024CS1092)") },
                                            singleLine = true,
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                        OutlinedTextField(
                                            value = extraInput,
                                            onValueChange = { extraInput = it },
                                            label = { Text("Department (e.g. Computer Science)") },
                                            singleLine = true,
                                            modifier = Modifier.fillMaxWidth()
                                        )

                                        OutlinedButton(
                                            onClick = {
                                                viewModel.login(
                                                    role = UserRole.STUDENT,
                                                    name = "Priya Sharma (Student)",
                                                    emailOrId = "2024CS1092",
                                                    department = "Computer Science & AI",
                                                    collegeId = selectedCollegeId
                                                )
                                                showRoleLoginDialog = false
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text("⚡ Quick Demo Student Login", fontSize = 11.sp)
                                        }
                                    }
                                    UserRole.ADMIN -> {
                                        OutlinedTextField(
                                            value = nameInput,
                                            onValueChange = { nameInput = it },
                                            label = { Text("Faculty / Staff Name (e.g. Prof. Ramanathan)") },
                                            singleLine = true,
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                        OutlinedTextField(
                                            value = idInput,
                                            onValueChange = { idInput = it },
                                            label = { Text("Staff ID / Employee Code") },
                                            singleLine = true,
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                        OutlinedTextField(
                                            value = adminPinInput,
                                            onValueChange = { adminPinInput = it },
                                            label = { Text("Admin Passcode / PIN (Demo: admin2026)") },
                                            singleLine = true,
                                            modifier = Modifier.fillMaxWidth()
                                        )

                                        OutlinedButton(
                                            onClick = {
                                                viewModel.login(
                                                    role = UserRole.ADMIN,
                                                    name = "Prof. K. Ramanathan (CEG Admin)",
                                                    emailOrId = "FAC-4092",
                                                    department = "Campus Planning & Infrastructure",
                                                    collegeId = selectedCollegeId
                                                )
                                                showRoleLoginDialog = false
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text("⚡ Quick Demo Admin Login", fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        },
                        confirmButton = {
                            Button(
                                onClick = {
                                    val rName = nameInput.ifBlank {
                                        when (selectedRoleTab) {
                                            UserRole.ADMIN -> "College Admin"
                                            UserRole.STUDENT -> "Student Member"
                                            UserRole.VISITOR -> "Campus Visitor"
                                        }
                                    }
                                    viewModel.login(
                                        role = selectedRoleTab,
                                        name = rName,
                                        emailOrId = idInput.ifBlank { "user@college.edu" },
                                        department = extraInput.ifBlank { "Campus Member" },
                                        collegeId = selectedCollegeId
                                    )
                                    showRoleLoginDialog = false
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                            ) {
                                Text("Log In as ${selectedRoleTab.badge}", fontWeight = FontWeight.Bold)
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { showRoleLoginDialog = false }) {
                                Text("Cancel")
                            }
                        },
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                }
            }
        }
    }
}
