import { describe, it, expect } from 'vitest';
import { DijkstraRouter } from './dijkstraRouter';
import { NavNode, NavEdge } from '../types/campus';

describe('DijkstraRouter Campus Navigation Tests', () => {
  const sampleNodes: NavNode[] = [
    { id: 'N1', buildingId: 'B1', floorNumber: 1, x: 0, y: 0, z: 0, type: 'ENTRANCE', label: 'Entrance 1' },
    { id: 'N2', buildingId: 'B1', floorNumber: 1, x: 50, y: 0, z: 0, type: 'JUNCTION', label: 'Junction A' },
    { id: 'N3', buildingId: 'B1', floorNumber: 1, x: 100, y: 0, z: 0, type: 'ROOM_DOOR', label: 'Classroom 101' },
    { id: 'N_STAIRS_1', buildingId: 'B1', floorNumber: 1, x: 50, y: 0, z: 20, type: 'STAIRS', label: 'Stairs L1' },
    { id: 'N_STAIRS_2', buildingId: 'B1', floorNumber: 2, x: 50, y: 0, z: 20, type: 'STAIRS', label: 'Stairs L2' },
    { id: 'N_LIFT_1', buildingId: 'B1', floorNumber: 1, x: 50, y: 0, z: -20, type: 'LIFT', label: 'Lift L1' },
    { id: 'N_LIFT_2', buildingId: 'B1', floorNumber: 2, x: 50, y: 0, z: -20, type: 'LIFT', label: 'Lift L2' },
    { id: 'N_ISOLATED', buildingId: 'B2', floorNumber: 1, x: 999, y: 0, z: 999, type: 'ROOM_DOOR', label: 'Isolated Shed' },
  ];

  const sampleNodesMap = new Map<string, NavNode>(sampleNodes.map((n) => [n.id, n]));

  const sampleEdges: NavEdge[] = [
    { id: 'E1', fromNodeId: 'N1', toNodeId: 'N2', distanceMeters: 50, isAccessible: true, isBlocked: false },
    { id: 'E2', fromNodeId: 'N2', toNodeId: 'N3', distanceMeters: 50, isAccessible: true, isBlocked: false },
    { id: 'E_STAIRS', fromNodeId: 'N2', toNodeId: 'N_STAIRS_1', distanceMeters: 10, isAccessible: false, isBlocked: false },
    { id: 'E_STAIRS_VERT', fromNodeId: 'N_STAIRS_1', toNodeId: 'N_STAIRS_2', distanceMeters: 12, isAccessible: false, isBlocked: false },
    { id: 'E_LIFT', fromNodeId: 'N2', toNodeId: 'N_LIFT_1', distanceMeters: 15, isAccessible: true, isBlocked: false },
    { id: 'E_LIFT_VERT', fromNodeId: 'N_LIFT_1', toNodeId: 'N_LIFT_2', distanceMeters: 8, isAccessible: true, isBlocked: false },
  ];

  it('calculates the direct shortest route correctly', () => {
    const result = DijkstraRouter.findRoute('N1', 'N3', sampleNodesMap, sampleEdges);
    expect(result.success).toBe(true);
    expect(result.totalDistanceMeters).toBe(100);
    expect(result.pathNodes.map((n) => n.id)).toEqual(['N1', 'N2', 'N3']);
    expect(result.segments.length).toBe(2);
  });

  it('handles origin equals destination', () => {
    const result = DijkstraRouter.findRoute('N1', 'N1', sampleNodesMap, sampleEdges);
    expect(result.success).toBe(true);
    expect(result.totalDistanceMeters).toBe(0);
    expect(result.estimatedTimeSeconds).toBe(0);
    expect(result.pathNodes.length).toBe(1);
  });

  it('detects disconnected locations gracefully', () => {
    const result = DijkstraRouter.findRoute('N1', 'N_ISOLATED', sampleNodesMap, sampleEdges);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toMatch(/No verified walkable path/i);
  });

  it('handles missing origin or destination nodes', () => {
    const result = DijkstraRouter.findRoute('NON_EXISTENT', 'N1', sampleNodesMap, sampleEdges);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toMatch(/Starting location.*not found/i);
  });

  it('respects wheelchair accessibility constraints by avoiding inaccessible stairs', () => {
    // Both stairs and lift lead to floor 2.
    // In wheelchair mode, it should not use stairs.
    const resultNormal = DijkstraRouter.findRoute('N2', 'N_STAIRS_2', sampleNodesMap, sampleEdges, false);
    expect(resultNormal.success).toBe(true);
    expect(resultNormal.pathNodes.map((n) => n.id)).toEqual(['N2', 'N_STAIRS_1', 'N_STAIRS_2']);

    const resultWheelchair = DijkstraRouter.findRoute('N2', 'N_STAIRS_2', sampleNodesMap, sampleEdges, true);
    expect(resultWheelchair.success).toBe(false);
    expect(resultWheelchair.errorMessage).toMatch(/wheelchair-accessible path/i);
  });

  it('respects blocked corridors and construction closures', () => {
    const edgesWithBlock: NavEdge[] = [
      { id: 'E1', fromNodeId: 'N1', toNodeId: 'N2', distanceMeters: 50, isAccessible: true, isBlocked: true, closureReason: 'Maintenance' },
      { id: 'E2', fromNodeId: 'N2', toNodeId: 'N3', distanceMeters: 50, isAccessible: true, isBlocked: false },
    ];
    const result = DijkstraRouter.findRoute('N1', 'N3', sampleNodesMap, edgesWithBlock);
    expect(result.success).toBe(false);
  });

  it('rejects invalid negative edge weights', () => {
    const invalidEdges: NavEdge[] = [
      { id: 'E_NEG', fromNodeId: 'N1', toNodeId: 'N2', distanceMeters: -10, isAccessible: true, isBlocked: false },
    ];
    expect(() => {
      DijkstraRouter.findRoute('N1', 'N2', sampleNodesMap, invalidEdges);
    }).toThrow(/negative edge weight/i);
  });
});
