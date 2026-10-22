package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CampusTopBar(
    currentScreen: CampusScreen,
    preferredLanguage: String,
    isDarkTheme: Boolean,
    activeCollegeName: String,
    userRole: UserRole,
    userName: String,
    onLanguageToggle: () -> Unit,
    onThemeToggle: () -> Unit,
    onCollegeClick: () -> Unit,
    onRoleProfileClick: () -> Unit,
    onEmergencyClick: () -> Unit,
    onAdminClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onBackClick: () -> Unit,
    canGoBack: Boolean,
    modifier: Modifier = Modifier
) {
    TopAppBar(
        title = {
            Column(
                modifier = Modifier.clickable { onCollegeClick() }
            ) {
                Text(
                    text = currentScreen.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = activeCollegeName.take(22),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.primary,
                        maxLines = 1
                    )
                    Icon(
                        Icons.Default.ArrowDropDown,
                        contentDescription = "Switch College",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        },
        navigationIcon = {
            if (canGoBack) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier.testTag("top_bar_back_button")
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .padding(start = 12.dp, end = 6.dp)
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Explore,
                        contentDescription = "CampusNav",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        },
        actions = {
            // Role & Login Profile Pill (Admin, Student, Visitor)
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = when (userRole) {
                    UserRole.ADMIN -> PurpleAccent.copy(alpha = 0.2f)
                    UserRole.STUDENT -> MaterialTheme.colorScheme.primaryContainer
                    UserRole.VISITOR -> MaterialTheme.colorScheme.surfaceVariant
                },
                modifier = Modifier
                    .clickable { onRoleProfileClick() }
                    .testTag("top_bar_role_badge")
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = when (userRole) {
                            UserRole.ADMIN -> Icons.Default.AdminPanelSettings
                            UserRole.STUDENT -> Icons.Default.School
                            UserRole.VISITOR -> Icons.Default.Person
                        },
                        contentDescription = "Role Login",
                        tint = when (userRole) {
                            UserRole.ADMIN -> PurpleNeon
                            UserRole.STUDENT -> MaterialTheme.colorScheme.primary
                            UserRole.VISITOR -> MaterialTheme.colorScheme.onSurfaceVariant
                        },
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = userRole.badge,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = when (userRole) {
                            UserRole.ADMIN -> PurpleNeon
                            UserRole.STUDENT -> MaterialTheme.colorScheme.primary
                            UserRole.VISITOR -> MaterialTheme.colorScheme.onSurface
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.width(4.dp))

            // Theme Toggle Button (Dark Mode / White Mode)
            IconButton(
                onClick = onThemeToggle,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .testTag("theme_toggle_button")
            ) {
                Icon(
                    imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                    contentDescription = if (isDarkTheme) "Switch to Light Mode" else "Switch to Dark Mode",
                    tint = if (isDarkTheme) AmberWarning else MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(3.dp))

            // Language Switcher Badge (EN / தமிழ்)
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .clickable { onLanguageToggle() }
                    .padding(horizontal = 7.dp, vertical = 5.dp)
                    .testTag("language_toggle_button"),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (preferredLanguage == "Tamil") "தமிழ்" else "EN",
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.width(3.dp))

            // Emergency SOS Quick Button
            IconButton(
                onClick = onEmergencyClick,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(RoseEmergency.copy(alpha = 0.2f))
                    .testTag("quick_sos_button")
            ) {
                Icon(
                    Icons.Default.Warning,
                    contentDescription = "Emergency SOS",
                    tint = RoseEmergency,
                    modifier = Modifier.size(18.dp)
                )
            }

            // Settings
            IconButton(
                onClick = onSettingsClick,
                modifier = Modifier.size(36.dp).testTag("settings_button")
            ) {
                Icon(
                    Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(20.dp)
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface,
            titleContentColor = MaterialTheme.colorScheme.onSurface
        ),
        modifier = modifier
    )
}
