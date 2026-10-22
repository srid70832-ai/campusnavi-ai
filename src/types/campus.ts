export type RoomCategory =
  | 'AI_LAB'
  | 'CLASSROOM'
  | 'LIBRARY'
  | 'AUDITORIUM'
  | 'FACULTY'
  | 'ADMIN'
  | 'CAFETERIA'
  | 'RESTROOM'
  | 'ENTRANCE'
  | 'EMERGENCY_EXIT'
  | 'FACILITY'
  | 'SPORTS';

export type NavNodeType =
  | 'NORMAL'
  | 'ROOM_DOOR'
  | 'LIFT'
  | 'STAIRS'
  | 'RAMP'
  | 'ENTRANCE'
  | 'EMERGENCY_EXIT'
  | 'JUNCTION'
  | 'LANDMARK';

export type TurnAction =
  | 'START'
  | 'STRAIGHT'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'TAKE_LIFT_UP'
  | 'TAKE_LIFT_DOWN'
  | 'TAKE_STAIRS_UP'
  | 'TAKE_STAIRS_DOWN'
  | 'TAKE_RAMP'
  | 'ARRIVE';

export type ApprovalStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED';

export type GPSStatus = 'IDLE' | 'LOCATING' | 'LIVE' | 'DENIED' | 'UNAVAILABLE' | 'LOW_ACCURACY';

export interface UserLiveLocation {
  latitude: number;
  longitude: number;
  x: number;
  z: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  isLiveGPS: boolean;
  status: GPSStatus;
  statusMessage?: string;
}

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  description: string;
  numFloors: number;
  defaultFloor: number;
  collegeId: string;
  position: { x: number; y: number; z: number }; // 3D coordinates
  dimensions: { width: number; height: number; depth: number };
  color: string;
  accentColor: string;
  roofColor?: string;
  roofType?: 'PITCHED' | 'FLAT_TERRACE' | 'DOME' | 'HIRED_GABLE' | 'MULTI_TIER';
  architectureStyle?: 'TECH' | 'HERITAGE' | 'MODERN_GLASS' | 'CIRCULAR_DOME' | 'RESIDENTIAL' | 'SPORTS_PAVILION' | 'ADMIN_FORMAL';
  hasEntranceCanopy?: boolean;
  hasPillars?: boolean;
  hasClockTower?: boolean;
  hasTerraceCafe?: boolean;
  imageUrl?: string;
  isCustom?: boolean;
  isWheelchairAccessible?: boolean;
  status: ApprovalStatus;
}

export interface NavNode {
  id: string;
  buildingId: string;
  floorNumber: number;
  x: number;
  y: number;
  z?: number;
  type: NavNodeType;
  label: string;
  description?: string;
  isAccessible?: boolean;
}

export interface NavEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number;
  isAccessible: boolean;
  isBlocked: boolean;
  closureReason?: string;
  status?: ApprovalStatus;
}

export interface CampusRoom {
  id: string;
  buildingId: string;
  floorNumber: number;
  roomNumber: string;
  name: string;
  category: RoomCategory;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isAccessible: boolean;
  description: string;
  facultyOrContact: string;
  openingHours: string;
  associatedNodeId: string;
  isFavorite?: boolean;
  collegeId?: string;
  photoUrl?: string;
  status?: ApprovalStatus;
}

export interface RouteSegment {
  fromNode: NavNode;
  toNode: NavNode;
  distanceMeters: number;
  action: TurnAction;
  instructionEn: string;
  instructionTa: string;
  floorTransition?: boolean;
}

export interface RouteResult {
  success: boolean;
  pathNodes: NavNode[];
  segments: RouteSegment[];
  totalDistanceMeters: number;
  estimatedTimeSeconds: number;
  containsFloorChange: boolean;
  isWheelchairCompliant: boolean;
  errorMessage?: string;
  multiFloorSummary?: string[];
}

export interface TimetableItem {
  id: string;
  subjectName: string;
  courseCode: string;
  instructor: string;
  roomId: string;
  buildingId: string;
  floorNumber: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface EmergencyContact {
  id: string;
  title: string;
  role: string;
  phoneNumber: string;
  location: string;
  priority: number;
}

export interface Facility {
  id: string;
  name: string;
  type: 'RESTROOM' | 'ELEVATOR' | 'RAMP' | 'CAFETERIA' | 'FIRST_AID' | 'PARKING' | 'ATM' | 'WATER';
  buildingId: string;
  floorNumber: number;
  locationDescription: string;
  isAccessible: boolean;
  associatedNodeId: string;
  status: 'OPEN' | 'MAINTENANCE' | 'CLOSED';
}

export interface UserSession {
  id: string;
  name: string;
  role: 'STUDENT' | 'VISITOR' | 'ADMIN';
  email: string;
  department?: string;
  photoUrl?: string;
  isGoogleAuth?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  editor: string;
  targetType: 'LOCATION' | 'EDGE' | 'BUILDING' | 'SETTINGS';
  targetId: string;
  timestamp: number;
  details: string;
}
