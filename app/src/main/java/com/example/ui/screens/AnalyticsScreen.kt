package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MainCampusViewModel
import com.example.ui.theme.*

@Composable
fun AnalyticsScreen(
    viewModel: MainCampusViewModel,
    modifier: Modifier = Modifier
) {
    val analytics by viewModel.analyticsRecords.collectAsState()
    val edges by viewModel.allEdges.collectAsState()

    val totalRoutes = analytics.size
    val accessibleRoutes = analytics.count { it.isAccessibleMode }
    val blockedCount = edges.count { it.isBlocked && !it.id.endsWith("_rev") }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Campus Navigation Analytics", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
            Text("Real navigation requests, accessible routing trends, and path usage", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        // Metrics Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard(
                    title = "Total Routes",
                    value = totalRoutes.toString(),
                    icon = Icons.Default.Route,
                    color = CyanNeon,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Wheelchair",
                    value = "$accessibleRoutes",
                    icon = Icons.Default.Accessible,
                    color = PurpleNeon,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Blocked",
                    value = "$blockedCount",
                    icon = Icons.Default.Block,
                    color = if (blockedCount > 0) AmberWarning else EmeraldSuccess,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Recent Routes History
        item {
            Text("Recent Computed Routes", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextPrimaryDark)
        }

        if (analytics.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = NavySurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(modifier = Modifier.padding(24.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text("No route calculations recorded yet. Calculate a route on the map!", color = TextSecondaryDark, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(analytics) { record ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = NavySurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "${record.startRoom} ➔ ${record.destinationRoom}",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp,
                                color = TextPrimaryDark
                            )
                            Text(
                                text = "Distance: ${record.distanceMeters.toInt()}m • ${if (record.isAccessibleMode) "Wheelchair Mode" else "Standard Walk"}",
                                fontSize = 11.sp,
                                color = TextSecondaryDark
                            )
                        }
                        if (record.isAccessibleMode) {
                            Icon(Icons.Default.Accessible, contentDescription = null, tint = PurpleAccent, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = NavySurface),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextPrimaryDark)
            Text(title, fontSize = 11.sp, color = TextSecondaryDark)
        }
    }
}
