import { NavNode, NavEdge, RouteResult, RouteSegment, TurnAction } from '../types/campus';

interface NodeDistance {
  nodeId: string;
  distance: number;
}

class PriorityQueue<T> {
  private items: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  push(item: T): void {
    this.items.push(item);
    this.items.sort(this.comparator);
  }

  pop(): T | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export class DijkstraRouter {
  public static findRoute(
    startNodeId: string,
    destinationNodeId: string,
    nodesMap: Map<string, NavNode>,
    edgesList: NavEdge[],
    wheelchairAccessibleOnly: boolean = false,
    walkingSpeedMps: number = 1.2
  ): RouteResult {
    if (!nodesMap.has(startNodeId)) {
      return {
        success: false,
        pathNodes: [],
        segments: [],
        totalDistanceMeters: 0,
        estimatedTimeSeconds: 0,
        containsFloorChange: false,
        isWheelchairCompliant: wheelchairAccessibleOnly,
        errorMessage: `Starting location "${startNodeId}" was not found in verified campus records.`,
      };
    }

    if (!nodesMap.has(destinationNodeId)) {
      return {
        success: false,
        pathNodes: [],
        segments: [],
        totalDistanceMeters: 0,
        estimatedTimeSeconds: 0,
        containsFloorChange: false,
        isWheelchairCompliant: wheelchairAccessibleOnly,
        errorMessage: `Destination "${destinationNodeId}" was not found in verified campus records.`,
      };
    }

    if (startNodeId === destinationNodeId) {
      const node = nodesMap.get(startNodeId)!;
      return {
        success: true,
        pathNodes: [node],
        segments: [],
        totalDistanceMeters: 0,
        estimatedTimeSeconds: 0,
        containsFloorChange: false,
        isWheelchairCompliant: wheelchairAccessibleOnly,
        errorMessage: 'You are already at your destination.',
      };
    }

    // Build Adjacency List
    const adj = new Map<string, NavEdge[]>();
    for (const edge of edgesList) {
      if (edge.isBlocked) continue;
      if (wheelchairAccessibleOnly && !edge.isAccessible) continue;
      if (edge.distanceMeters < 0) {
        throw new Error(`Invalid negative edge weight detected on edge ${edge.id}`);
      }

      const list = adj.get(edge.fromNodeId) || [];
      list.push(edge);
      adj.set(edge.fromNodeId, list);
    }

    const distances = new Map<string, number>();
    const previousNode = new Map<string, string>();
    const pq = new PriorityQueue<NodeDistance>((a, b) => a.distance - b.distance);

    for (const nodeId of nodesMap.keys()) {
      distances.set(nodeId, Infinity);
    }

    distances.set(startNodeId, 0);
    pq.push({ nodeId: startNodeId, distance: 0 });

    let reached = false;

    while (!pq.isEmpty()) {
      const current = pq.pop();
      if (!current) break;

      const currentId = current.nodeId;
      const currentDist = current.distance;

      if (currentId === destinationNodeId) {
        reached = true;
        break;
      }

      if (currentDist > (distances.get(currentId) ?? Infinity)) continue;

      const neighbors = adj.get(currentId) || [];
      for (const edge of neighbors) {
        const nextId = edge.toNodeId;
        const newDist = currentDist + edge.distanceMeters;

        if (newDist < (distances.get(nextId) ?? Infinity)) {
          distances.set(nextId, newDist);
          previousNode.set(nextId, currentId);
          pq.push({ nodeId: nextId, distance: newDist });
        }
      }
    }

    if (!reached || (distances.get(destinationNodeId) ?? Infinity) === Infinity) {
      const reason = wheelchairAccessibleOnly
        ? 'No wheelchair-accessible path found. Stairs or unpaved sections exist on alternative paths.'
        : 'No verified walkable path connects these two campus locations.';
      return {
        success: false,
        pathNodes: [],
        segments: [],
        totalDistanceMeters: 0,
        estimatedTimeSeconds: 0,
        containsFloorChange: false,
        isWheelchairCompliant: wheelchairAccessibleOnly,
        errorMessage: reason,
      };
    }

    // Reconstruct path
    const pathNodes: NavNode[] = [];
    let curr: string | undefined = destinationNodeId;
    while (curr) {
      const node = nodesMap.get(curr);
      if (node) {
        pathNodes.unshift(node);
      }
      curr = previousNode.get(curr);
    }

    // Generate segments and instructions
    const segments: RouteSegment[] = [];
    let containsFloorChange = false;
    const multiFloorSummary: string[] = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const from = pathNodes[i];
      const to = pathNodes[i + 1];
      const edge = edgesList.find((e) => e.fromNodeId === from.id && e.toNodeId === to.id);
      const dist = edge?.distanceMeters ?? 10;

      const { action, enText, taText, isFloorChange } = this.determineActionAndInstruction(
        i > 0 ? pathNodes[i - 1] : null,
        from,
        to,
        dist
      );

      if (isFloorChange) {
        containsFloorChange = true;
        multiFloorSummary.push(`Floor ${from.floorNumber} ➔ Floor ${to.floorNumber} via ${to.type}`);
      }

      segments.push({
        fromNode: from,
        toNode: to,
        distanceMeters: dist,
        action,
        instructionEn: enText,
        instructionTa: taText,
        floorTransition: isFloorChange,
      });
    }

    const totalDistanceMeters = distances.get(destinationNodeId) ?? 0;
    const effectiveSpeed = wheelchairAccessibleOnly ? Math.max(0.7, walkingSpeedMps * 0.75) : walkingSpeedMps;
    const estimatedTimeSeconds = Math.round(totalDistanceMeters / effectiveSpeed);

    return {
      success: true,
      pathNodes,
      segments,
      totalDistanceMeters,
      estimatedTimeSeconds,
      containsFloorChange,
      isWheelchairCompliant: wheelchairAccessibleOnly,
      multiFloorSummary,
    };
  }

  private static determineActionAndInstruction(
    prevNode: NavNode | null,
    fromNode: NavNode,
    toNode: NavNode,
    distance: number
  ): { action: TurnAction; enText: string; taText: string; isFloorChange: boolean } {
    const distRound = Math.round(distance);

    // Floor transition
    if (fromNode.floorNumber !== toNode.floorNumber) {
      const isUp = toNode.floorNumber > fromNode.floorNumber;
      if (toNode.type === 'LIFT' || fromNode.type === 'LIFT') {
        return {
          action: isUp ? 'TAKE_LIFT_UP' : 'TAKE_LIFT_DOWN',
          enText: isUp
            ? `Take Elevator Lift up to Floor ${toNode.floorNumber}`
            : `Take Elevator Lift down to Floor ${toNode.floorNumber}`,
          taText: isUp
            ? `லிஃப்ட் மூலம் தளம் ${toNode.floorNumber}-க்கு மேலே செல்லுங்கள்`
            : `லிஃப்ட் மூலம் தளம் ${toNode.floorNumber}-க்கு கீழே செல்லுங்கள்`,
          isFloorChange: true,
        };
      } else {
        return {
          action: isUp ? 'TAKE_STAIRS_UP' : 'TAKE_STAIRS_DOWN',
          enText: isUp
            ? `Take Stairs up to Floor ${toNode.floorNumber}`
            : `Take Stairs down to Floor ${toNode.floorNumber}`,
          taText: isUp
            ? `படிக்கட்டுகள் வழியாக தளம் ${toNode.floorNumber}-க்கு மேலே செல்லுங்கள்`
            : `படிக்கட்டுகள் வழியாக தளம் ${toNode.floorNumber}-க்கு கீழே செல்லுங்கள்`,
          isFloorChange: true,
        };
      }
    }

    // Ramp check
    if (toNode.type === 'RAMP' || fromNode.type === 'RAMP') {
      return {
        action: 'TAKE_RAMP',
        enText: `Follow the accessible ramp for ${distRound}m`,
        taText: `சக்கர நாற்காலி சாய்வுதளம் வழியாக ${distRound} மீ செல்லுங்கள்`,
        isFloorChange: false,
      };
    }

    // Arrival check
    if (toNode.type === 'ROOM_DOOR' || toNode.type === 'ENTRANCE') {
      return {
        action: 'ARRIVE',
        enText: `Proceed ${distRound}m to ${toNode.label}`,
        taText: `${distRound} மீ தூரம் சென்று ${toNode.label} சென்றடையுங்கள்`,
        isFloorChange: false,
      };
    }

    // Geometry angle calculation
    if (prevNode) {
      const pX = prevNode.x;
      const pZ = prevNode.z !== undefined ? prevNode.z : prevNode.y;
      const fX = fromNode.x;
      const fZ = fromNode.z !== undefined ? fromNode.z : fromNode.y;
      const tX = toNode.x;
      const tZ = toNode.z !== undefined ? toNode.z : toNode.y;

      const angle1 = Math.atan2(fZ - pZ, fX - pX);
      const angle2 = Math.atan2(tZ - fZ, tX - fX);
      let diff = ((angle2 - angle1) * 180) / Math.PI;

      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;

      if (diff < -30) {
        return {
          action: 'TURN_LEFT',
          enText: `Turn left at ${fromNode.label} and proceed ${distRound}m`,
          taText: `இடது பக்கம் திரும்பி ${distRound} மீ நேராக செல்லுங்கள்`,
          isFloorChange: false,
        };
      } else if (diff > 30) {
        return {
          action: 'TURN_RIGHT',
          enText: `Turn right at ${fromNode.label} and proceed ${distRound}m`,
          taText: `வலது பக்கம் திரும்பி ${distRound} மீ நேராக செல்லுங்கள்`,
          isFloorChange: false,
        };
      }
    }

    return {
      action: 'STRAIGHT',
      enText: `Continue straight for ${distRound}m toward ${toNode.label}`,
      taText: `நேராக ${distRound} மீ நடைபாதையில் செல்லுங்கள்`,
      isFloorChange: false,
    };
  }
}
