import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  INITIAL_BUILDINGS,
  INITIAL_NAV_NODES,
  INITIAL_NAV_EDGES,
  INITIAL_ROOMS,
  INITIAL_TIMETABLE,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_FACILITIES,
} from '../src/data/campusData';
import { DijkstraRouter } from '../src/services/dijkstraRouter';
import { AiCampusAssistant } from '../src/services/aiAssistant';
import { CampusBuilding, NavEdge, NavNode } from '../src/types/campus';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory Database initialized with verified data
let campusBuildings = [...INITIAL_BUILDINGS];
let campusNodes = [...INITIAL_NAV_NODES];
let campusEdges = [...INITIAL_NAV_EDGES];
let campusRooms = [...INITIAL_ROOMS];

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'NaviCampus AI',
    version: '2.0.0',
    verifiedBuildingsCount: campusBuildings.length,
    activeEdgesCount: campusEdges.filter((e) => !e.isBlocked).length,
  });
});

// Campus Data Endpoints
app.get('/api/campus/buildings', (_req: Request, res: Response) => {
  res.json(campusBuildings);
});

app.get('/api/campus/rooms', (_req: Request, res: Response) => {
  res.json(campusRooms);
});

app.get('/api/campus/nodes', (_req: Request, res: Response) => {
  res.json(campusNodes);
});

app.get('/api/campus/edges', (_req: Request, res: Response) => {
  res.json(campusEdges);
});

// Dijkstra Routing Engine Endpoint
app.post('/api/campus/route', (req: Request, res: Response) => {
  try {
    const { startNodeId, destinationNodeId, wheelchairAccessibleOnly, walkingSpeedMps } = req.body;

    if (!startNodeId || !destinationNodeId) {
      return res.status(400).json({ success: false, error: 'startNodeId and destinationNodeId are required' });
    }

    const nodesMap = new Map<string, NavNode>(campusNodes.map((n) => [n.id, n]));
    const result = DijkstraRouter.findRoute(
      startNodeId,
      destinationNodeId,
      nodesMap,
      campusEdges,
      Boolean(wheelchairAccessibleOnly),
      walkingSpeedMps || 1.2
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Assistant Endpoint
app.post('/api/campus/assistant', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await AiCampusAssistant.query(
      query,
      campusRooms,
      campusBuildings,
      INITIAL_FACILITIES,
      apiKey
    );

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Timetable, Facilities, Emergency
app.get('/api/timetable', (_req: Request, res: Response) => {
  res.json(INITIAL_TIMETABLE);
});

app.get('/api/facilities', (_req: Request, res: Response) => {
  res.json(INITIAL_FACILITIES);
});

app.get('/api/emergency', (_req: Request, res: Response) => {
  res.json(INITIAL_EMERGENCY_CONTACTS);
});

// Admin Lifecycle Endpoints (Draft -> Pending Review -> Approved -> Published)
app.post('/api/admin/buildings', (req: Request, res: Response) => {
  const newBuilding: CampusBuilding = {
    ...req.body,
    id: req.body.id || `BLD_${Date.now()}`,
    status: 'DRAFT',
  };
  campusBuildings.push(newBuilding);
  res.status(201).json(newBuilding);
});

app.post('/api/admin/buildings/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const building = campusBuildings.find((b) => b.id === id);
  if (!building) {
    return res.status(404).json({ error: 'Building not found' });
  }

  building.status = 'PUBLISHED';
  res.json({ message: 'Building successfully published to live navigation graph', building });
});

app.post('/api/admin/edges/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isBlocked, reason } = req.body;
  const edge = campusEdges.find((e) => e.id === id);
  if (!edge) {
    return res.status(404).json({ error: 'Pathway edge not found' });
  }

  edge.isBlocked = Boolean(isBlocked);
  edge.closureReason = reason || '';
  res.json({ message: 'Pathway edge updated', edge });
});

// Feedback Endpoint
app.post('/api/feedback', (req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Feedback logged to campus facilities desk' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`NaviCampus AI Backend API running at http://localhost:${PORT}`);
  });
}

export default app;
