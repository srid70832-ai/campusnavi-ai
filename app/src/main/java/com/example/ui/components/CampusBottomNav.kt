package com.example.ui.components

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.example.ui.CampusScreen

private data class NavItem(
    val screen: CampusScreen,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

@Composable
fun CampusBottomNav(
    currentScreen: CampusScreen,
    onNavigate: (CampusScreen) -> Unit,
    modifier: Modifier = Modifier
) {
    val items = listOf(
        NavItem(CampusScreen.DASHBOARD, "Home", Icons.Filled.Home, Icons.Outlined.Home),
        NavItem(CampusScreen.INDOOR_MAP, "Map", Icons.Filled.Map, Icons.Outlined.Map),
        NavItem(CampusScreen.DIRECTORY, "Directory", Icons.Filled.Search, Icons.Outlined.Search),
        NavItem(CampusScreen.AI_ASSISTANT, "AI Guide", Icons.Filled.SmartToy, Icons.Outlined.SmartToy),
        NavItem(CampusScreen.TIMETABLE, "Schedule", Icons.Filled.CalendarMonth, Icons.Outlined.CalendarMonth)
    )

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface,
        modifier = modifier
            .windowInsetsPadding(WindowInsets.navigationBars)
            .testTag("campus_bottom_navigation_bar")
    ) {
        items.forEach { item ->
            val isSelected = currentScreen == item.screen
            NavigationBarItem(
                selected = isSelected,
                onClick = { onNavigate(item.screen) },
                icon = {
                    Icon(
                        imageVector = if (isSelected) item.selectedIcon else item.unselectedIcon,
                        contentDescription = item.label
                    )
                },
                label = {
                    Text(
                        text = item.label,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.onPrimary,
                    indicatorColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant
                ),
                modifier = Modifier.testTag("bottom_nav_${item.label.lowercase()}")
            )
        }
    }
}
