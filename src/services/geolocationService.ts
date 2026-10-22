import { UserLiveLocation, GPSStatus, NavNode } from '../types/campus';

export interface GeolocationConfig {
  centerLat: number;
  centerLon: number;
  scaleFactor: number; // 1 unit in 3D = 1 meter
}

// Campus center anchor (corresponds to scene coordinate x=0, z=0)
export const CAMPUS_GPS_ANCHOR: GeolocationConfig = {
  centerLat: 13.0108,
  centerLon: 80.2354,
  scaleFactor: 1.0,
};

export class GeolocationService {
  private static instance: GeolocationService;
  private watchId: number | null = null;
  private listeners: ((loc: UserLiveLocation) => void)[] = [];
  private deviationListeners: ((currentLoc: UserLiveLocation) => void)[] = [];
  private arrivalListeners: (() => void)[] = [];

  private currentLocation: UserLiveLocation = {
    latitude: CAMPUS_GPS_ANCHOR.centerLat,
    longitude: CAMPUS_GPS_ANCHOR.centerLon,
    x: -60, // Default to CSE Block
    z: 40,
    accuracy: 5,
    heading: 0,
    speed: 0,
    timestamp: Date.now(),
    isLiveGPS: false,
    status: 'IDLE',
    statusMessage: 'GPS not started. Tap "Enable GPS" or pick a campus origin.',
  };

  private constructor() {
    // Listen to device compass orientation if supported
    if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', (event) => {
        if (event.alpha !== null) {
          const heading = Math.round(event.alpha);
          this.currentLocation.heading = heading;
          this.notifyListeners();
        }
      });
    }
  }

  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  public getLocation(): UserLiveLocation {
    return this.currentLocation;
  }

  public subscribe(callback: (loc: UserLiveLocation) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentLocation);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public onDeviation(callback: (loc: UserLiveLocation) => void): () => void {
    this.deviationListeners.push(callback);
    return () => {
      this.deviationListeners = this.deviationListeners.filter((cb) => cb !== callback);
    };
  }

  public onArrival(callback: () => void): () => void {
    this.arrivalListeners.push(callback);
    return () => {
      this.arrivalListeners = this.arrivalListeners.filter((cb) => cb !== callback);
    };
  }

  public startLiveTracking(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.updateStatus('UNAVAILABLE', 'Geolocation is not supported by your browser.');
      return;
    }

    this.updateStatus('LOCATING', 'Acquiring satellite GPS lock...');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } = position.coords;
        const { x, z } = this.projectGPSCoordsToScene(latitude, longitude);

        const status: GPSStatus = accuracy > 40 ? 'LOW_ACCURACY' : 'LIVE';
        const statusMessage =
          accuracy > 40
            ? `Low GPS accuracy (±${Math.round(accuracy)}m). Indoor multipath may occur.`
            : `Live GPS active (±${Math.round(accuracy)}m)`;

        this.currentLocation = {
          latitude,
          longitude,
          x,
          z,
          accuracy,
          heading: heading ?? this.currentLocation.heading,
          speed,
          timestamp: position.timestamp,
          isLiveGPS: true,
          status,
          statusMessage,
        };

        this.notifyListeners();
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        let status: GPSStatus = 'UNAVAILABLE';
        if (error.code === error.PERMISSION_DENIED) {
          status = 'DENIED';
          msg = 'Location permission denied. Please allow location access or choose a campus entrance.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          status = 'UNAVAILABLE';
          msg = 'GPS signal unavailable. Please ensure location services are enabled.';
        } else if (error.code === error.TIMEOUT) {
          status = 'LOW_ACCURACY';
          msg = 'Location acquisition timed out. Re-trying...';
        }
        this.updateStatus(status, msg);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );
  }

  public stopLiveTracking(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.updateStatus('IDLE', 'GPS tracking stopped.');
  }

  public setManualPosition(x: number, z: number, label?: string): void {
    this.currentLocation = {
      ...this.currentLocation,
      x,
      z,
      isLiveGPS: false,
      accuracy: 2,
      status: 'LIVE',
      statusMessage: label ? `Position set to: ${label}` : 'Manual starting location selected',
      timestamp: Date.now(),
    };
    this.notifyListeners();
  }

  // Convert real Lat/Lon to 3D Cartesian coordinates
  public projectGPSCoordsToScene(lat: number, lon: number): { x: number; z: number } {
    const latRad = (CAMPUS_GPS_ANCHOR.centerLat * Math.PI) / 180;
    const deltaLon = lon - CAMPUS_GPS_ANCHOR.centerLon;
    const deltaLat = lat - CAMPUS_GPS_ANCHOR.centerLat;

    // 1 deg latitude ≈ 110,540 meters, 1 deg longitude ≈ 111,320 * cos(lat) meters
    const metersX = deltaLon * 111320 * Math.cos(latRad);
    const metersZ = -deltaLat * 110540;

    return {
      x: metersX * CAMPUS_GPS_ANCHOR.scaleFactor,
      z: metersZ * CAMPUS_GPS_ANCHOR.scaleFactor,
    };
  }

  // Check if user has deviated from current computed route polyline
  public checkRouteDeviation(pathNodes: NavNode[], maxDeviationMeters: number = 25): boolean {
    if (pathNodes.length < 2) return false;
    const uX = this.currentLocation.x;
    const uZ = this.currentLocation.z;

    let minDistance = Infinity;
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const a = pathNodes[i];
      const b = pathNodes[i + 1];
      const aZ = a.z !== undefined ? a.z : a.y;
      const bZ = b.z !== undefined ? b.z : b.y;

      const dist = this.distanceToSegment(uX, uZ, a.x, aZ, b.x, bZ);
      if (dist < minDistance) minDistance = dist;
    }

    if (minDistance > maxDeviationMeters) {
      this.deviationListeners.forEach((listener) => listener(this.currentLocation));
      return true;
    }
    return false;
  }

  // Check arrival at destination
  public checkArrival(destinationNode: NavNode, arrivalThresholdMeters: number = 10): boolean {
    const destZ = destinationNode.z !== undefined ? destinationNode.z : destinationNode.y;
    const dx = this.currentLocation.x - destinationNode.x;
    const dz = this.currentLocation.z - destZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist <= arrivalThresholdMeters) {
      this.arrivalListeners.forEach((listener) => listener());
      return true;
    }
    return false;
  }

  private distanceToSegment(px: number, pz: number, x1: number, z1: number, x2: number, z2: number): number {
    const l2 = (x2 - x1) * (x2 - x1) + (z2 - z1) * (z2 - z1);
    if (l2 === 0) return Math.hypot(px - x1, pz - z1);
    let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), pz - (z1 + t * (z2 - z1)));
  }

  private updateStatus(status: GPSStatus, message: string): void {
    this.currentLocation = {
      ...this.currentLocation,
      status,
      statusMessage: message,
    };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentLocation));
  }
}
