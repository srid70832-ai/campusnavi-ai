package com.example.domain.routing

import com.example.data.local.EdgeEntity
import com.example.data.model.*
import java.util.PriorityQueue
import kotlin.math.atan2
import kotlin.math.roundToInt

object DijkstraRouter {

    private data class NodeDistance(val nodeId: String, val distance: Float) : Comparable<NodeDistance> {
        override fun compareTo(other: NodeDistance): Int = this.distance.compareTo(other.distance)
    }

    fun findRoute(
        startNodeId: String,
        destinationNodeId: String,
        nodesMap: Map<String, NavNode>,
        edgesList: List<EdgeEntity>,
        wheelchairAccessibleOnly: Boolean = false,
        walkingSpeedMps: Float = 1.2f
    ): RouteResult {
        if (!nodesMap.containsKey(startNodeId)) {
            return RouteResult(success = false, errorMessage = "Starting location not found in campus database.")
        }
        if (!nodesMap.containsKey(destinationNodeId)) {
            return RouteResult(success = false, errorMessage = "Destination location not found in campus database.")
        }
        if (startNodeId == destinationNodeId) {
            val node = nodesMap[startNodeId]!!
            return RouteResult(
                success = true,
                pathNodes = listOf(node),
                segments = emptyList(),
                totalDistanceMeters = 0f,
                estimatedTimeSeconds = 0,
                errorMessage = "You are already at your destination."
            )
        }

        // Build adjacency list
        val adj = mutableMapOf<String, MutableList<EdgeEntity>>()
        for (edge in edgesList) {
            // Check corridor blockages
            if (edge.isBlocked) continue

            // Check wheelchair accessibility
            if (wheelchairAccessibleOnly && !edge.isAccessible) continue

            adj.getOrPut(edge.fromNodeId) { mutableListOf() }.add(edge)
        }

        val distances = mutableMapOf<String, Float>()
        val previousNode = mutableMapOf<String, String>()
        val previousEdge = mutableMapOf<String, EdgeEntity>()
        val pq = PriorityQueue<NodeDistance>()

        for (nodeId in nodesMap.keys) {
            distances[nodeId] = Float.MAX_VALUE
        }

        distances[startNodeId] = 0f
        pq.add(NodeDistance(startNodeId, 0f))

        var reached = false

        while (pq.isNotEmpty()) {
            val nodeDist = pq.poll() ?: break
            val currentId = nodeDist.nodeId
            val currentDist = nodeDist.distance

            if (currentId == destinationNodeId) {
                reached = true
                break
            }

            if (currentDist > (distances[currentId] ?: Float.MAX_VALUE)) continue

            val neighbors = adj[currentId] ?: emptyList()
            for (edge in neighbors) {
                val nextId = edge.toNodeId
                val newDist = currentDist + edge.distanceMeters

                if (newDist < (distances[nextId] ?: Float.MAX_VALUE)) {
                    distances[nextId] = newDist
                    previousNode[nextId] = currentId
                    previousEdge[nextId] = edge
                    pq.add(NodeDistance(nextId, newDist))
                }
            }
        }

        if (!reached || (distances[destinationNodeId] ?: Float.MAX_VALUE) >= Float.MAX_VALUE / 2) {
            val reason = if (wheelchairAccessibleOnly) {
                "No wheelchair-accessible route found. Some passages, stairs, or elevators may be blocked or restricted."
            } else {
                "No open route found between these locations. A corridor on this route may be currently closed for maintenance."
            }
            return RouteResult(success = false, errorMessage = reason)
        }

        // Reconstruct path
        val pathNodes = mutableListOf<NavNode>()
        var curr: String? = destinationNodeId
        while (curr != null) {
            val node = nodesMap[curr]
            if (node != null) {
                pathNodes.add(0, node)
            }
            curr = previousNode[curr]
        }

        // Generate segments & turn instructions
        val segments = mutableListOf<RouteSegment>()
        var containsFloorChange = false
        val multiFloorSummary = mutableListOf<String>()

        for (i in 0 until pathNodes.size - 1) {
            val from = pathNodes[i]
            val to = pathNodes[i + 1]
            val edge = edgesList.find { it.fromNodeId == from.id && it.toNodeId == to.id }
            val dist = edge?.distanceMeters ?: 10f

            val (action, enText, taText, isFloorChange) = determineActionAndInstruction(
                prevNode = if (i > 0) pathNodes[i - 1] else null,
                fromNode = from,
                toNode = to,
                distance = dist
            )

            if (isFloorChange) {
                containsFloorChange = true
                multiFloorSummary.add("Floor ${from.floorNumber} ➔ Floor ${to.floorNumber} via ${to.type.name}")
            }

            segments.add(
                RouteSegment(
                    fromNode = from,
                    toNode = to,
                    distanceMeters = dist,
                    action = action,
                    instructionEn = enText,
                    instructionTa = taText,
                    floorTransition = isFloorChange
                )
            )
        }

        val totalDist = distances[destinationNodeId] ?: 0f
        val effectiveSpeed = if (wheelchairAccessibleOnly) (walkingSpeedMps * 0.75f).coerceAtLeast(0.7f) else walkingSpeedMps
        val estimatedTime = (totalDist / effectiveSpeed).roundToInt()

        return RouteResult(
            success = true,
            pathNodes = pathNodes,
            segments = segments,
            totalDistanceMeters = totalDist,
            estimatedTimeSeconds = estimatedTime,
            containsFloorChange = containsFloorChange,
            isWheelchairCompliant = wheelchairAccessibleOnly,
            multiFloorSummary = multiFloorSummary
        )
    }

    private fun determineActionAndInstruction(
        prevNode: NavNode?,
        fromNode: NavNode,
        toNode: NavNode,
        distance: Float
    ): Quadruple<TurnAction, String, String, Boolean> {
        val distRound = distance.roundToInt()

        // Floor transition checks
        if (fromNode.floorNumber != toNode.floorNumber) {
            val isUp = toNode.floorNumber > fromNode.floorNumber
            return if (toNode.type == NavNodeType.LIFT || fromNode.type == NavNodeType.LIFT) {
                if (isUp) {
                    Quadruple(
                        TurnAction.TAKE_LIFT_UP,
                        "Take Elevator Lift up to Floor ${toNode.floorNumber}",
                        "லிஃப்ட் மூலம் தளம் ${toNode.floorNumber}-க்கு மேலே செல்லுங்கள்",
                        true
                    )
                } else {
                    Quadruple(
                        TurnAction.TAKE_LIFT_DOWN,
                        "Take Elevator Lift down to Floor ${toNode.floorNumber}",
                        "லிஃப்ட் மூலம் தளம் ${toNode.floorNumber}-க்கு கீழே செல்லுங்கள்",
                        true
                    )
                }
            } else {
                if (isUp) {
                    Quadruple(
                        TurnAction.TAKE_STAIRS_UP,
                        "Take Stairs up to Floor ${toNode.floorNumber}",
                        "படிக்கட்டுகள் வழியாக தளம் ${toNode.floorNumber}-க்கு மேலே செல்லுங்கள்",
                        true
                    )
                } else {
                    Quadruple(
                        TurnAction.TAKE_STAIRS_DOWN,
                        "Take Stairs down to Floor ${toNode.floorNumber}",
                        "படிக்கட்டுகள் வழியாக தளம் ${toNode.floorNumber}-க்கு கீழே செல்லுங்கள்",
                        true
                    )
                }
            }
        }

        // Ramp check
        if (toNode.type == NavNodeType.RAMP || fromNode.type == NavNodeType.RAMP) {
            return Quadruple(
                TurnAction.TAKE_RAMP,
                "Follow the accessible wheelchair ramp for ${distRound}m",
                "சக்கர நாற்காலி சாய்வுதளம் (Ramp) வழியாக ${distRound} மீ செல்லுங்கள்",
                false
            )
        }

        // Door arrival check
        if (toNode.type == NavNodeType.ROOM_DOOR || toNode.type == NavNodeType.EMERGENCY_EXIT) {
            return Quadruple(
                TurnAction.ARRIVE,
                "Proceed ${distRound}m to ${toNode.label}",
                "${distRound} மீ தூரம் சென்று ${toNode.label} சென்றடையுங்கள்",
                false
            )
        }

        // Turns based on geometry
        if (prevNode != null) {
            val angle1 = atan2((fromNode.y - prevNode.y).toDouble(), (fromNode.x - prevNode.x).toDouble())
            val angle2 = atan2((toNode.y - fromNode.y).toDouble(), (toNode.x - fromNode.x).toDouble())
            var diff = Math.toDegrees(angle2 - angle1)
            while (diff < -180) diff += 360
            while (diff > 180) diff -= 360

            if (diff < -30) {
                return Quadruple(
                    TurnAction.TURN_LEFT,
                    "Turn left and proceed straight for ${distRound}m",
                    "இடது பக்கம் திரும்பி நேராக ${distRound} மீ செல்லுங்கள்",
                    false
                )
            } else if (diff > 30) {
                return Quadruple(
                    TurnAction.TURN_RIGHT,
                    "Turn right and proceed straight for ${distRound}m",
                    "வலது பக்கம் திரும்பி நேராக ${distRound} மீ செல்லுங்கள்",
                    false
                )
            }
        }

        return Quadruple(
            TurnAction.STRAIGHT,
            "Continue straight along the corridor for ${distRound}m",
            "நடைபாதையில் நேராக ${distRound} மீ செல்லுங்கள்",
            false
        )
    }

    private data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
}
