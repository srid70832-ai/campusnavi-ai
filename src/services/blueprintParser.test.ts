import { describe, it, expect } from 'vitest';
import {
  BlueprintParserService,
  REFERENCE_BLUEPRINT_DETECTIONS,
} from './blueprintParserService';
import { DijkstraRouter } from './dijkstraRouter';
import { NavNode } from '../types/campus';

describe('Blueprint-to-Realistic-3D-Map Pipeline', () => {
  it('should contain all 24 verified reference blueprint detections with legend mappings', () => {
    expect(REFERENCE_BLUEPRINT_DETECTIONS.length).toBe(24);

    const mainGate = REFERENCE_BLUEPRINT_DETECTIONS.find((d) => d.legendIndex === 1);
    expect(mainGate).toBeDefined();
    expect(mainGate?.label).toContain('Main Gate');

    const adminBlock = REFERENCE_BLUEPRINT_DETECTIONS.find((d) => d.legendIndex === 3);
    expect(adminBlock).toBeDefined();
    expect(adminBlock?.label).toContain('Administration Block');
    expect(adminBlock?.confidence).toBeGreaterThan(0.9);

    const library = REFERENCE_BLUEPRINT_DETECTIONS.find((d) => d.legendIndex === 4);
    expect(library).toBeDefined();
    expect(library?.label).toContain('Central Library');

    const cse = REFERENCE_BLUEPRINT_DETECTIONS.find((d) => d.legendIndex === 5);
    expect(cse).toBeDefined();
    expect(cse?.code).toBe('CSE');

    const sportsGround = REFERENCE_BLUEPRINT_DETECTIONS.find((d) => d.legendIndex === 15);
    expect(sportsGround).toBeDefined();
    expect(sportsGround?.type).toBe('SPORTS');
  });

  it('should generate a connected Dijkstra routing graph from blueprint detections', () => {
    const { nodes, edges } = BlueprintParserService.buildRoutingGraphFromDetections(
      REFERENCE_BLUEPRINT_DETECTIONS
    );

    expect(nodes.length).toBeGreaterThan(15);
    expect(edges.length).toBeGreaterThan(20);

    // Verify all edges have strictly positive distance meters
    edges.forEach((edge) => {
      expect(edge.distanceMeters).toBeGreaterThan(0);
      expect(edge.fromNodeId).toBeDefined();
      expect(edge.toNodeId).toBeDefined();
    });
  });

  it('should validate routing graph and report 0 unreachable critical buildings', () => {
    const { nodes, edges } = BlueprintParserService.buildRoutingGraphFromDetections(
      REFERENCE_BLUEPRINT_DETECTIONS
    );
    const validation = BlueprintParserService.validateRoutingGraph(
      nodes,
      edges,
      REFERENCE_BLUEPRINT_DETECTIONS
    );

    expect(validation.isValid).toBe(true);
    expect(validation.unreachableBuildings.length).toBe(0);
    expect(validation.zeroLengthEdges.length).toBe(0);
  });

  it('should calculate genuine Dijkstra shortest paths across verified blueprint waypoints', () => {
    const { nodes, edges } = BlueprintParserService.buildRoutingGraphFromDetections(
      REFERENCE_BLUEPRINT_DETECTIONS
    );
    const nodesMap = new Map<string, NavNode>(nodes.map((n) => [n.id, n]));

    // Route 1: Main Gate -> Central Library
    const routeToLibrary = DijkstraRouter.findRoute(
      'N_MAIN_GATE',
      'N_LIBRARY_CONCOURSE',
      nodesMap,
      edges,
      false
    );

    expect(routeToLibrary.success).toBe(true);
    expect(routeToLibrary.totalDistanceMeters).toBeGreaterThan(100);
    expect(routeToLibrary.pathNodes.length).toBeGreaterThanOrEqual(4);
    expect(routeToLibrary.pathNodes[0].id).toBe('N_MAIN_GATE');
    expect(routeToLibrary.pathNodes[routeToLibrary.pathNodes.length - 1].id).toBe('N_LIBRARY_CONCOURSE');

    // Route 2: CSE Block -> Cafeteria & Dining
    const routeCseToCafe = DijkstraRouter.findRoute(
      'N_WEST_JCT_NORTH',
      'N_WEST_JCT_CAFE',
      nodesMap,
      edges,
      false
    );
    expect(routeCseToCafe.success).toBe(true);
    expect(routeCseToCafe.totalDistanceMeters).toBeGreaterThan(20);

    // Route 3: Boys Hostel -> Sports Ground
    const routeHostelToSports = DijkstraRouter.findRoute(
      'N_WEST_JCT_HB',
      'N_SPORTS_ENTRANCE',
      nodesMap,
      edges,
      false
    );
    expect(routeHostelToSports.success).toBe(true);
  });

  it('should convert blueprint detections to 3D campus buildings with verified coordinates', () => {
    const buildings = BlueprintParserService.detectionsToCampusBuildings(
      REFERENCE_BLUEPRINT_DETECTIONS
    );

    expect(buildings.length).toBeGreaterThan(10);
    buildings.forEach((bld) => {
      expect(bld.id).toBeDefined();
      expect(bld.name).toBeDefined();
      expect(bld.dimensions.width).toBeGreaterThan(0);
      expect(bld.dimensions.height).toBeGreaterThan(0);
      expect(bld.dimensions.depth).toBeGreaterThan(0);
      expect(bld.position).toBeDefined();
    });
  });

  it('should detect when a route is disconnected or impossible', () => {
    const { nodes } = BlueprintParserService.buildRoutingGraphFromDetections(
      REFERENCE_BLUEPRINT_DETECTIONS
    );
    const nodesMap = new Map<string, NavNode>(nodes.map((n) => [n.id, n]));

    // Empty edges array: route must fail safely without inventing data
    const impossibleRoute = DijkstraRouter.findRoute(
      'N_MAIN_GATE',
      'N_LIBRARY_CONCOURSE',
      nodesMap,
      [],
      false
    );

    expect(impossibleRoute.success).toBe(false);
    expect(impossibleRoute.pathNodes.length).toBe(0);
    expect(impossibleRoute.totalDistanceMeters).toBe(0);
  });
});
