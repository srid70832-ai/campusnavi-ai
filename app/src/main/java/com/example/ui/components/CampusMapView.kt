package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.gestures.transformable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.EdgeEntity
import com.example.data.model.*
import com.example.ui.theme.*

@Composable
fun CampusMapView(
    buildingId: String,
    floorNumber: Int,
    rooms: List<Room>,
    nodes: Map<String, NavNode>,
    edges: List<EdgeEntity>,
    routeResult: RouteResult?,
    selectedStartRoom: Room?,
    selectedDestRoom: Room?,
    onRoomSelected: (Room) -> Unit,
    modifier: Modifier = Modifier
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    val textMeasurer = rememberTextMeasurer()

    val transformState = rememberTransformableState { zoomChange, offsetChange, _ ->
        scale = (scale * zoomChange).coerceIn(0.6f, 3.5f)
        offset += offsetChange
    }

    // Filter rooms on this floor & building
    val floorRooms = remember(rooms, buildingId, floorNumber) {
        rooms.filter { it.buildingId == buildingId && it.floorNumber == floorNumber }
    }

    // Filter nodes on this floor & building
    val floorNodes = remember(nodes, buildingId, floorNumber) {
        nodes.values.filter { it.buildingId == buildingId && it.floorNumber == floorNumber }
    }

    // Filter route nodes on this floor
    val floorRouteNodes = remember(routeResult, buildingId, floorNumber) {
        routeResult?.pathNodes?.filter { it.buildingId == buildingId && it.floorNumber == floorNumber } ?: emptyList()
    }

    val canvasBg = MaterialTheme.colorScheme.surface
    val boundaryColor = MaterialTheme.colorScheme.surfaceVariant
    val gridColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
    val corridorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
    val roomCardColor = MaterialTheme.colorScheme.surfaceVariant
    val roomOutlineColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.6f)
    val textPrimaryColor = MaterialTheme.colorScheme.onSurface

    Box(
        modifier = modifier
            .fillMaxSize()
            .clip(RoundedCornerShape(16.dp))
            .background(canvasBg)
            .testTag("interactive_campus_map_canvas")
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .transformable(state = transformState)
                .pointerInput(floorRooms, scale, offset) {
                    detectTapGestures { tapOffset ->
                        // Reverse transform to canvas coordinate space
                        val canvasX = (tapOffset.x - offset.x) / scale
                        val canvasY = (tapOffset.y - offset.y) / scale

                        val tapped = floorRooms.find { r ->
                            canvasX >= r.x && canvasX <= (r.x + r.width) &&
                            canvasY >= r.y && canvasY <= (r.y + r.height)
                        }
                        if (tapped != null) {
                            onRoomSelected(tapped)
                        }
                    }
                }
        ) {
            val canvasWidth = size.width
            val canvasHeight = size.height

            // Coordinate normalization based on virtual 1000x750 canvas
            val baseScaleX = canvasWidth / 1000f
            val baseScaleY = canvasHeight / 750f
            val fitScale = minOf(baseScaleX, baseScaleY) * scale

            val originX = offset.x + (canvasWidth - 1000f * fitScale) / 2f
            val originY = offset.y + (canvasHeight - 750f * fitScale) / 2f

            // 1. Draw Architectural Floor Boundaries & Background Grid
            drawRect(
                color = boundaryColor,
                topLeft = Offset(originX + 40f * fitScale, originY + 120f * fitScale),
                size = Size(920f * fitScale, 520f * fitScale),
                style = Stroke(width = 3.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f)))
            )

            // Subtle floor grid
            for (gx in 100..900 step 100) {
                drawLine(
                    color = gridColor,
                    start = Offset(originX + gx * fitScale, originY + 120f * fitScale),
                    end = Offset(originX + gx * fitScale, originY + 640f * fitScale),
                    strokeWidth = 1f
                )
            }
            for (gy in 150..600 step 75) {
                drawLine(
                    color = gridColor,
                    start = Offset(originX + 40f * fitScale, originY + gy * fitScale),
                    end = Offset(originX + 960f * fitScale, originY + gy * fitScale),
                    strokeWidth = 1f
                )
            }

            // 2. Draw Corridors
            val corridorPath = Path()
            // Main horizontal corridor spine
            corridorPath.moveTo(originX + 80f * fitScale, originY + 340f * fitScale)
            corridorPath.lineTo(originX + 920f * fitScale, originY + 340f * fitScale)
            drawPath(
                path = corridorPath,
                color = corridorColor,
                style = Stroke(width = 32f * fitScale, cap = StrokeCap.Round)
            )
            // Center atrium vertical corridor
            drawLine(
                color = corridorColor,
                start = Offset(originX + 500f * fitScale, originY + 280f * fitScale),
                end = Offset(originX + 500f * fitScale, originY + 440f * fitScale),
                strokeWidth = 32f * fitScale,
                cap = StrokeCap.Round
            )

            // 3. Draw Room Blocks
            for (room in floorRooms) {
                val rx = originX + room.x * fitScale
                val ry = originY + room.y * fitScale
                val rw = room.width * fitScale
                val rh = room.height * fitScale

                val isStart = selectedStartRoom?.id == room.id
                val isDest = selectedDestRoom?.id == room.id

                val (fillColor, strokeColor) = when {
                    isStart -> Pair(EmeraldSuccess.copy(alpha = 0.4f), EmeraldSuccess)
                    isDest -> Pair(CyanNeon.copy(alpha = 0.45f), CyanNeon)
                    room.category == RoomCategory.AI_LAB -> Pair(roomCardColor, CyanGlow.copy(alpha = 0.8f))
                    room.category == RoomCategory.AUDITORIUM -> Pair(roomCardColor, PurpleNeon.copy(alpha = 0.8f))
                    room.category == RoomCategory.LIBRARY -> Pair(roomCardColor, Color(0xFF38BDF8))
                    room.category == RoomCategory.RESTROOM -> Pair(roomCardColor, Color(0xFFF472B6))
                    room.category == RoomCategory.ENTRANCE -> Pair(roomCardColor, EmeraldSuccess)
                    room.category == RoomCategory.CAFETERIA -> Pair(roomCardColor, AmberWarning)
                    else -> Pair(roomCardColor, roomOutlineColor)
                }

                // Room block
                drawRoundRect(
                    color = fillColor,
                    topLeft = Offset(rx, ry),
                    size = Size(rw, rh),
                    cornerRadius = CornerRadius(8f * fitScale, 8f * fitScale)
                )
                drawRoundRect(
                    color = strokeColor,
                    topLeft = Offset(rx, ry),
                    size = Size(rw, rh),
                    cornerRadius = CornerRadius(8f * fitScale, 8f * fitScale),
                    style = Stroke(width = if (isStart || isDest) 3.dp.toPx() else 1.5.dp.toPx())
                )

                // Room Number & Name Label
                val labelText = "${room.roomNumber}\n${room.name.take(16)}"
                val measured = textMeasurer.measure(
                    text = labelText,
                    style = TextStyle(
                        color = if (isStart || isDest) Color.White else textPrimaryColor,
                        fontSize = (10 * fitScale).coerceIn(8f, 13f).sp,
                        fontWeight = if (isStart || isDest) FontWeight.Bold else FontWeight.Medium
                    )
                )
                drawText(
                    textMeasurer = textMeasurer,
                    text = labelText,
                    topLeft = Offset(rx + 6f * fitScale, ry + 6f * fitScale),
                    style = TextStyle(
                        color = if (isStart || isDest) Color.White else textPrimaryColor,
                        fontSize = (10 * fitScale).coerceIn(8f, 13f).sp,
                        fontWeight = if (isStart || isDest) FontWeight.Bold else FontWeight.Medium
                    )
                )
            }

            // 4. Draw Special Facility Markers (Lifts, Stairs, Ramps, Exits)
            for (node in floorNodes) {
                val nx = originX + node.x * fitScale
                val ny = originY + node.y * fitScale

                when (node.type) {
                    NavNodeType.LIFT -> {
                        drawCircle(
                            color = CyanNeon,
                            radius = 12f * fitScale,
                            center = Offset(nx, ny)
                        )
                        drawCircle(
                            color = canvasBg,
                            radius = 6f * fitScale,
                            center = Offset(nx, ny)
                        )
                    }
                    NavNodeType.STAIRS -> {
                        drawCircle(
                            color = AmberWarning,
                            radius = 11f * fitScale,
                            center = Offset(nx, ny)
                        )
                        drawCircle(
                            color = canvasBg,
                            radius = 5f * fitScale,
                            center = Offset(nx, ny)
                        )
                    }
                    NavNodeType.RAMP -> {
                        drawCircle(
                            color = PurpleNeon,
                            radius = 11f * fitScale,
                            center = Offset(nx, ny)
                        )
                    }
                    NavNodeType.EMERGENCY_EXIT -> {
                        drawRoundRect(
                            color = EmeraldSuccess,
                            topLeft = Offset(nx - 14f * fitScale, ny - 10f * fitScale),
                            size = Size(28f * fitScale, 20f * fitScale),
                            cornerRadius = CornerRadius(4f * fitScale, 4f * fitScale)
                        )
                    }
                    else -> {}
                }
            }

            // 5. Draw Active Route Path (Glowing Neon Line)
            if (floorRouteNodes.size >= 2) {
                val path = Path()
                path.moveTo(
                    originX + floorRouteNodes.first().x * fitScale,
                    originY + floorRouteNodes.first().y * fitScale
                )
                for (i in 1 until floorRouteNodes.size) {
                    val n = floorRouteNodes[i]
                    path.lineTo(originX + n.x * fitScale, originY + n.y * fitScale)
                }

                // Outer glow line
                drawPath(
                    path = path,
                    color = CyanNeon.copy(alpha = 0.35f),
                    style = Stroke(width = 16f * fitScale, cap = StrokeCap.Round, join = StrokeJoin.Round)
                )
                // Core sharp route line
                drawPath(
                    path = path,
                    color = CyanNeon,
                    style = Stroke(
                        width = 6f * fitScale,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(18f * fitScale, 8f * fitScale))
                    )
                )
            }

            // 6. Draw Start & Destination Markers on Map
            if (selectedStartRoom != null && selectedStartRoom.buildingId == buildingId && selectedStartRoom.floorNumber == floorNumber) {
                val sx = originX + (selectedStartRoom.x + selectedStartRoom.width / 2f) * fitScale
                val sy = originY + (selectedStartRoom.y + selectedStartRoom.height / 2f) * fitScale
                // Pulsing ring
                drawCircle(color = EmeraldSuccess.copy(alpha = 0.3f), radius = 22f * fitScale, center = Offset(sx, sy))
                drawCircle(color = EmeraldSuccess, radius = 10f * fitScale, center = Offset(sx, sy))
                drawCircle(color = Color.White, radius = 4f * fitScale, center = Offset(sx, sy))
            }

            if (selectedDestRoom != null && selectedDestRoom.buildingId == buildingId && selectedDestRoom.floorNumber == floorNumber) {
                val dx = originX + (selectedDestRoom.x + selectedDestRoom.width / 2f) * fitScale
                val dy = originY + (selectedDestRoom.y + selectedDestRoom.height / 2f) * fitScale
                // Outer ring
                drawCircle(color = CyanNeon.copy(alpha = 0.35f), radius = 24f * fitScale, center = Offset(dx, dy))
                drawCircle(color = CyanNeon, radius = 11f * fitScale, center = Offset(dx, dy))
                drawCircle(color = canvasBg, radius = 5f * fitScale, center = Offset(dx, dy))
            }
        }

        // Map Overlay Controls: Zoom In / Zoom Out / Reset View
        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            IconButton(
                onClick = { scale = (scale * 1.25f).coerceAtMost(3.5f) },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(NavySurface)
                    .testTag("map_zoom_in_button")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Zoom In", tint = CyanNeon)
            }
            IconButton(
                onClick = { scale = (scale / 1.25f).coerceAtLeast(0.6f) },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(NavySurface)
                    .testTag("map_zoom_out_button")
            ) {
                Icon(Icons.Default.Remove, contentDescription = "Zoom Out", tint = CyanNeon)
            }
            IconButton(
                onClick = {
                    scale = 1f
                    offset = Offset.Zero
                },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(NavySurface)
                    .testTag("map_reset_view_button")
            ) {
                Icon(Icons.Default.CenterFocusStrong, contentDescription = "Reset View", tint = Color.White)
            }
        }

        // Map Legend Chip Overlay at Top Left
        Row(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(10.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(NavySurface.copy(alpha = 0.88f))
                .padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(CyanNeon))
            Text("AI Lab", fontSize = 10.sp, color = TextPrimaryDark)

            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(PurpleNeon))
            Text("Hall", fontSize = 10.sp, color = TextPrimaryDark)

            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(EmeraldSuccess))
            Text("Exit/Entry", fontSize = 10.sp, color = TextPrimaryDark)

            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(AmberWarning))
            Text("Stairs", fontSize = 10.sp, color = TextPrimaryDark)
        }
    }
}
