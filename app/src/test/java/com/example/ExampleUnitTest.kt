package com.example

import com.example.data.local.DefaultCampusData
import com.example.domain.routing.DijkstraRouter
import org.junit.Assert.*
import org.junit.Test

class ExampleUnitTest {

    private val nodes = DefaultCampusData.getInitialNavNodes().associateBy { it.id }
    private val edges = DefaultCampusData.getInitialNavEdges()

    @Test
    fun testShortestPathFindsValidRoute() {
        // Entrance to AI Lab
        val route = DijkstraRouter.findRoute(
            startNodeId = "N_TP_107",
            destinationNodeId = "N_TP_103",
            nodesMap = nodes,
            edgesList = edges,
            wheelchairAccessibleOnly = false
        )

        assertTrue("Route should be successful", route.success)
        assertTrue("Route should have nodes", route.pathNodes.isNotEmpty())
        assertEquals("First node should be start", "N_TP_107", route.pathNodes.first().id)
        assertEquals("Last node should be destination", "N_TP_103", route.pathNodes.last().id)
        assertTrue("Distance should be greater than zero", route.totalDistanceMeters > 0f)
        assertTrue("Estimated time should be greater than zero", route.estimatedTimeSeconds > 0)
    }

    @Test
    fun testWheelchairModeUsesLiftNotStairs() {
        // Route from Floor 1 to Floor 2 in Tech Park
        val route = DijkstraRouter.findRoute(
            startNodeId = "N_TP_101",
            destinationNodeId = "N_TP_201",
            nodesMap = nodes,
            edgesList = edges,
            wheelchairAccessibleOnly = true
        )

        assertTrue("Wheelchair route should be successful", route.success)
        assertTrue("Route should contain floor change", route.containsFloorChange)

        val nodeIds = route.pathNodes.map { it.id }
        assertTrue("Should contain Elevator Lift L1", nodeIds.contains("N_TP_LIFT_1"))
        assertTrue("Should contain Elevator Lift L2", nodeIds.contains("N_TP_LIFT_2"))
        assertFalse("Should NOT use stairs in wheelchair mode", nodeIds.contains("N_TP_STAIRS_1"))
        assertFalse("Should NOT use stairs in wheelchair mode", nodeIds.contains("N_TP_STAIRS_2"))
    }

    @Test
    fun testBlockedCorridorIsAvoided() {
        // Mark edge between C4 and C5 as blocked
        val modifiedEdges = edges.map { edge ->
            if (edge.id == "E_TP1_C4_C5" || edge.id == "E_TP1_C4_C5_rev") {
                edge.copy(isBlocked = true, closureReason = "Wet Floor Maintenance")
            } else {
                edge
            }
        }

        val route = DijkstraRouter.findRoute(
            startNodeId = "N_TP_101",
            destinationNodeId = "N_TP_103",
            nodesMap = nodes,
            edgesList = modifiedEdges,
            wheelchairAccessibleOnly = false
        )

        // Verify that the blocked edge was not traversed
        for (i in 0 until route.pathNodes.size - 1) {
            val from = route.pathNodes[i].id
            val to = route.pathNodes[i + 1].id
            assertFalse(
                "Blocked edge from C4 to C5 must not be used",
                from == "N_TP_CORR_4" && to == "N_TP_CORR_5"
            )
        }
    }

    @Test
    fun testBilingualTurnInstructions() {
        val route = DijkstraRouter.findRoute(
            startNodeId = "N_TP_107",
            destinationNodeId = "N_TP_103",
            nodesMap = nodes,
            edgesList = edges
        )

        assertTrue(route.success)
        assertTrue(route.segments.isNotEmpty())

        val firstSegment = route.segments.first()
        assertNotNull(firstSegment.instructionEn)
        assertNotNull(firstSegment.instructionTa)
        assertTrue("English instruction should not be blank", firstSegment.instructionEn.isNotBlank())
        assertTrue("Tamil instruction should not be blank", firstSegment.instructionTa.isNotBlank())
    }

    @Test
    fun testUnreachableDestinationReportsError() {
        val route = DijkstraRouter.findRoute(
            startNodeId = "N_TP_107",
            destinationNodeId = "NON_EXISTENT_NODE",
            nodesMap = nodes,
            edgesList = edges
        )

        assertFalse("Route to non-existent node should fail", route.success)
        assertTrue("Error message should be descriptive", route.errorMessage.isNotBlank())
    }
}
