package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.UserRole
import com.example.ui.CampusScreen
import com.example.ui.MainCampusViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val userSession by viewModel.userSession.collectAsState()
    val colleges by viewModel.allColleges.collectAsState()
    val selectedCollegeId by viewModel.selectedCollegeId.collectAsState()
    val currentCollege = colleges.find { it.id == selectedCollegeId }
    val preferredLanguage by viewModel.preferredLanguage.collectAsState()

    var selectedTab by remember { mutableStateOf(userSession.role) }

    // Student fields
    var studentName by remember { mutableStateOf("Priya Sharma") }
    var studentId by remember { mutableStateOf("2024CS1092") }
    var studentDept by remember { mutableStateOf("Computer Science & AI") }
    var studentYear by remember { mutableStateOf("3rd Year") }

    // Visitor fields
    var visitorName by remember { mutableStateOf("Dr. David Miller") }
    var visitorPurpose by remember { mutableStateOf("Guest Speaker & Campus Tour") }
    var visitorPhone by remember { mutableStateOf("+91 98765 43210") }
    var visitorGate by remember { mutableStateOf("Main Gate 1 (North)") }

    // Admin fields
    var adminName by remember { mutableStateOf("Prof. K. Ramanathan") }
    var adminStaffId by remember { mutableStateOf("AU-FAC-4092") }
    var adminPin by remember { mutableStateOf("admin2026") }
    var adminDept by remember { mutableStateOf("Campus Infrastructure & Planning") }
    var adminError by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Header
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth().testTag("login_hero_card")
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = if (preferredLanguage == "Tamil") "வளாக உள்நுழைவு போர்டல்" else "Campus Access Portal",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = if (preferredLanguage == "Tamil") "மாணவர், பார்வையாளர் மற்றும் நிர்வாகி உள்நுழைவு" else "Student, Visitor & College Admin Authentication",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                        ) {
                            Text(
                                text = userSession.role.badge.uppercase(),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.School, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Active College: ${currentCollege?.name ?: "Campus"}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = currentCollege?.location ?: "Chennai, Tamil Nadu",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }

        // 3-Way Role Selector Tabs
        item {
            TabRow(
                selectedTabIndex = when (selectedTab) {
                    UserRole.STUDENT -> 0
                    UserRole.VISITOR -> 1
                    UserRole.ADMIN -> 2
                },
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary,
                modifier = Modifier.clip(RoundedCornerShape(14.dp))
            ) {
                Tab(
                    selected = selectedTab == UserRole.STUDENT,
                    onClick = { selectedTab = UserRole.STUDENT },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(Icons.Default.School, contentDescription = null, modifier = Modifier.size(16.dp))
                            Text("Student", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    },
                    modifier = Modifier.testTag("tab_login_student")
                )
                Tab(
                    selected = selectedTab == UserRole.VISITOR,
                    onClick = { selectedTab = UserRole.VISITOR },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp))
                            Text("Visitor", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    },
                    modifier = Modifier.testTag("tab_login_visitor")
                )
                Tab(
                    selected = selectedTab == UserRole.ADMIN,
                    onClick = { selectedTab = UserRole.ADMIN },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(Icons.Default.AdminPanelSettings, contentDescription = null, modifier = Modifier.size(16.dp))
                            Text("Admin", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    },
                    modifier = Modifier.testTag("tab_login_admin")
                )
            }
        }

        // TAB 1: STUDENT LOGIN
        if (selectedTab == UserRole.STUDENT) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth().testTag("student_login_card")
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primaryContainer),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.School, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            }
                            Column {
                                Text(
                                    text = if (preferredLanguage == "Tamil") "மாணவர் உள்நுழைவு" else "Student Portal Login",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Access class timetable, labs, study pods, and lecture wayfinding",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        OutlinedTextField(
                            value = studentName,
                            onValueChange = { studentName = it },
                            label = { Text("Student Name") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = studentId,
                            onValueChange = { studentId = it },
                            label = { Text("Roll Number / Registration ID") },
                            leadingIcon = { Icon(Icons.Default.Badge, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = studentDept,
                                onValueChange = { studentDept = it },
                                label = { Text("Department") },
                                modifier = Modifier.weight(1.3f)
                            )
                            OutlinedTextField(
                                value = studentYear,
                                onValueChange = { studentYear = it },
                                label = { Text("Year") },
                                modifier = Modifier.weight(0.7f)
                            )
                        }

                        // Feature Highlights
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.25f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("Student Features Unlocked:", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                                Text("✓ Live class timetable & next lecture route shortcut", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text("✓ AI & Computing lab directions & workstation finder", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text("✓ Digital library quiet carrel and book search", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                            }
                        }

                        Button(
                            onClick = {
                                viewModel.login(
                                    role = UserRole.STUDENT,
                                    name = studentName.ifBlank { "Student Member" },
                                    emailOrId = studentId.ifBlank { "student@college.edu" },
                                    department = studentDept.ifBlank { "Computer Science" },
                                    collegeId = selectedCollegeId
                                )
                                viewModel.navigateTo(CampusScreen.DASHBOARD)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth().height(48.dp).testTag("student_login_button")
                        ) {
                            Icon(Icons.Default.Login, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(if (preferredLanguage == "Tamil") "மாணவராக உள்நுழைக" else "Enter Student Portal", fontWeight = FontWeight.Bold)
                        }

                        // 1-Tap Quick Demo Logins
                        Text("Quick Demo Profiles:", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = {
                                    studentName = "Priya Sharma"
                                    studentId = "2024CS1092"
                                    studentDept = "Computer Science & AI"
                                    studentYear = "3rd Year"
                                    viewModel.login(UserRole.STUDENT, studentName, studentId, studentDept, selectedCollegeId)
                                    viewModel.navigateTo(CampusScreen.DASHBOARD)
                                },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("⚡ Priya (CSE)", fontSize = 11.sp)
                            }
                            OutlinedButton(
                                onClick = {
                                    studentName = "Rahul Verma"
                                    studentId = "2023EC4012"
                                    studentDept = "Electronics & Comm"
                                    studentYear = "2nd Year"
                                    viewModel.login(UserRole.STUDENT, studentName, studentId, studentDept, selectedCollegeId)
                                    viewModel.navigateTo(CampusScreen.DASHBOARD)
                                },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("⚡ Rahul (ECE)", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // TAB 2: VISITORS LOGIN
        if (selectedTab == UserRole.VISITOR) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth().testTag("visitor_login_card")
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.secondary)
                            }
                            Column {
                                Text(
                                    text = if (preferredLanguage == "Tamil") "பார்வையாளர் போர்டல்" else "Visitor / Guest Portal Login",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Guided campus tour, public auditoriums, and visitor navigation",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        OutlinedTextField(
                            value = visitorName,
                            onValueChange = { visitorName = it },
                            label = { Text("Visitor / Guest Name") },
                            leadingIcon = { Icon(Icons.Default.PersonOutline, contentDescription = null, tint = MaterialTheme.colorScheme.secondary) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = visitorPurpose,
                            onValueChange = { visitorPurpose = it },
                            label = { Text("Purpose of Visit") },
                            leadingIcon = { Icon(Icons.Default.Assignment, contentDescription = null, tint = MaterialTheme.colorScheme.secondary) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = visitorPhone,
                                onValueChange = { visitorPhone = it },
                                label = { Text("Mobile Contact") },
                                modifier = Modifier.weight(1.1f)
                            )
                            OutlinedTextField(
                                value = visitorGate,
                                onValueChange = { visitorGate = it },
                                label = { Text("Entry Gate") },
                                modifier = Modifier.weight(0.9f)
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.12f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("Visitor Features Unlocked:", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = MaterialTheme.colorScheme.secondary)
                                Text("✓ Dean & Administrative Office wayfinding", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text("✓ Kalam Auditorium & Seminar Hall directions", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text("✓ Campus Cafeteria, Restrooms & Visitor Parking guide", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text("✓ View College Photos & Campus Architectural Tour", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                            }
                        }

                        Button(
                            onClick = {
                                viewModel.login(
                                    role = UserRole.VISITOR,
                                    name = visitorName.ifBlank { "Campus Guest" },
                                    emailOrId = visitorPhone.ifBlank { "guest@visitor.com" },
                                    department = visitorPurpose.ifBlank { "Campus Visit" },
                                    collegeId = selectedCollegeId
                                )
                                viewModel.navigateTo(CampusScreen.DASHBOARD)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth().height(48.dp).testTag("visitor_login_button")
                        ) {
                            Icon(Icons.Default.Explore, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(if (preferredLanguage == "Tamil") "பார்வையாளராக தொடரவும்" else "Enter Visitor Guide", fontWeight = FontWeight.Bold)
                        }

                        Text("Quick Demo Profiles:", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = {
                                    visitorName = "Dr. David Miller"
                                    visitorPurpose = "Guest Lecture & Seminar"
                                    viewModel.login(UserRole.VISITOR, visitorName, "david@visitor.com", visitorPurpose, selectedCollegeId)
                                    viewModel.navigateTo(CampusScreen.DASHBOARD)
                                },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("⚡ Guest Speaker", fontSize = 11.sp)
                            }
                            OutlinedButton(
                                onClick = {
                                    visitorName = "Mrs. Lakshmi Narayanan"
                                    visitorPurpose = "Parent - Admissions Enquiry"
                                    viewModel.login(UserRole.VISITOR, visitorName, "lakshmi@parent.com", visitorPurpose, selectedCollegeId)
                                    viewModel.navigateTo(CampusScreen.DASHBOARD)
                                },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("⚡ Parent / Guardian", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // TAB 3: ADMIN LOGIN (CAN ADD MAP AND PHOTOS OF COLLEGE)
        if (selectedTab == UserRole.ADMIN) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth().testTag("admin_login_card")
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(PurpleAccent.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = PurpleNeon)
                            }
                            Column {
                                Text(
                                    text = if (preferredLanguage == "Tamil") "கல்லூரி நிர்வாகி உள்நுழைவு" else "College Admin & Faculty Login",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Manage maps, upload photos, corridor closures & emergency dispatch",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        OutlinedTextField(
                            value = adminName,
                            onValueChange = { adminName = it },
                            label = { Text("College Member / Faculty Name") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = PurpleNeon) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = adminStaffId,
                            onValueChange = { adminStaffId = it },
                            label = { Text("Faculty / Staff ID") },
                            leadingIcon = { Icon(Icons.Default.Badge, contentDescription = null, tint = PurpleNeon) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = adminPin,
                            onValueChange = { adminPin = it },
                            label = { Text("Security Passcode (Demo: admin2026)") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = PurpleNeon) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        if (adminError != null) {
                            Text(adminError!!, color = RoseEmergency, fontSize = 12.sp)
                        }

                        // Admin Powers Highlight (Specifically maps and photos as requested by user)
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = PurpleAccent.copy(alpha = 0.12f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("Admin Privileges Unlocked:", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = PurpleNeon)
                                Text("🗺️ Add & upload college floor maps, blueprints, and classroom nodes", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text("📷 Add and publish photos of the college for students & visitors", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text("🚧 Block/Unblock corridors for maintenance & construction", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                Text("📞 Add official campus emergency helpline phone numbers", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                            }
                        }

                        Button(
                            onClick = {
                                if (adminPin.trim() == "admin2026" || adminPin.trim().length >= 4) {
                                    viewModel.login(
                                        role = UserRole.ADMIN,
                                        name = adminName.ifBlank { "College Admin" },
                                        emailOrId = adminStaffId.ifBlank { "admin@college.edu" },
                                        department = adminDept.ifBlank { "Campus Administration" },
                                        collegeId = selectedCollegeId
                                    )
                                    viewModel.navigateTo(CampusScreen.ADMIN)
                                } else {
                                    adminError = "Please enter valid passcode (Demo: admin2026)"
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PurpleNeon),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth().height(48.dp).testTag("admin_login_submit_button")
                        ) {
                            Icon(Icons.Default.LockOpen, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(if (preferredLanguage == "Tamil") "நிர்வாகியாக உள்நுழைக" else "Log In to Admin Studio", fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = {
                                adminName = "Prof. K. Ramanathan (CEG Admin)"
                                adminStaffId = "AU-FAC-4092"
                                adminPin = "admin2026"
                                viewModel.login(UserRole.ADMIN, adminName, adminStaffId, adminDept, selectedCollegeId)
                                viewModel.navigateTo(CampusScreen.ADMIN)
                            },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Bolt, contentDescription = null, tint = AmberWarning)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("⚡ 1-Tap Quick Demo Admin Login", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
