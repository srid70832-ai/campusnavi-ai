import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CampusBuilding, NavNode, RouteResult, UserLiveLocation } from '../types/campus';
import {
  Plus,
  Minus,
  Crosshair,
  Compass,
  Navigation as NavIcon,
  MapPin,
  Radio,
  Eye,
  Layers,
} from 'lucide-react';

interface CampusMap3DProps {
  buildings: CampusBuilding[];
  nodes: NavNode[];
  selectedBuilding: CampusBuilding | null;
  onSelectBuilding: (building: CampusBuilding) => void;
  routeResult: RouteResult | null;
  startNodeId: string;
  destinationNodeId: string;
  is3DMode: boolean;
  onToggle3D: (is3D: boolean) => void;
  currentStepIndex?: number;
  userLocation?: UserLiveLocation;
  onEnableGPS?: () => void;
  isFollowUser?: boolean;
  onToggleFollowUser?: () => void;
}

export const CampusMap3D: React.FC<CampusMap3DProps> = ({
  buildings,
  nodes,
  selectedBuilding,
  onSelectBuilding,
  routeResult,
  startNodeId,
  destinationNodeId,
  is3DMode,
  onToggle3D,
  currentStepIndex = 0,
  userLocation = {
    latitude: 13.0108,
    longitude: 80.2354,
    x: -60,
    z: 40,
    accuracy: 5,
    heading: 0,
    speed: 0,
    timestamp: Date.now(),
    isLiveGPS: false,
    status: 'IDLE',
  },
  onEnableGPS,
  isFollowUser = false,
  onToggleFollowUser,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Camera & Interaction
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const desiredTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraSphericalRef = useRef({ radius: 180, theta: 0.85, phi: 0.82 });
  const desiredRadiusRef = useRef(180);
  const [compassHeading, setCompassHeading] = useState(0);

  // 3D Scene Groups
  const buildingsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const routeGroupRef = useRef<THREE.Group>(new THREE.Group());
  const markersGroupRef = useRef<THREE.Group>(new THREE.Group());
  const animatedArrowsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const userMarkerGroupRef = useRef<THREE.Group>(new THREE.Group());
  const environmentPropsGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Route drawing progression
  const routeCurveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const routeDrawProgressRef = useRef(0);

  // Camera tracking when a building is selected or follow mode is active
  useEffect(() => {
    if (isFollowUser && userLocation) {
      desiredTargetRef.current.set(userLocation.x, 0, userLocation.z);
      desiredRadiusRef.current = 105;
    } else if (selectedBuilding) {
      desiredTargetRef.current.set(selectedBuilding.position.x, 0, selectedBuilding.position.z);
      desiredRadiusRef.current = 115;
    } else {
      desiredTargetRef.current.set(0, 0, 0);
      desiredRadiusRef.current = 180;
    }
  }, [selectedBuilding, isFollowUser, userLocation.x, userLocation.z]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    // Realistic architectural atmosphere: subtle off-white daylight with distance mist
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.FogExp2(0xe2e8f0, 0.0018);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1400);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Realistic Sun & Atmospheric Daylight Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(130, 200, 110);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    const d = 160;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Realistic Sky/Ground bounce light
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.45);
    scene.add(hemiLight);

    // Build the Realistic Architectural Campus World: Ground, Pond, Asphalt Roads, Walkways, Trees, Props
    createRealisticCampusWorld(scene);

    scene.add(buildingsGroupRef.current);
    scene.add(routeGroupRef.current);
    scene.add(animatedArrowsGroupRef.current);
    scene.add(markersGroupRef.current);
    scene.add(userMarkerGroupRef.current);
    scene.add(environmentPropsGroupRef.current);

    // Setup initial User Marker
    createUserLocationMarker();

    // Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.02;

      // 1. Smooth Camera LERP (Target and Zoom)
      cameraTargetRef.current.lerp(desiredTargetRef.current, 0.06);
      cameraSphericalRef.current.radius += (desiredRadiusRef.current - cameraSphericalRef.current.radius) * 0.06;
      updateCameraPosition();

      // 2. Animate Progressive Route Drawing
      if (routeDrawProgressRef.current < 1) {
        routeDrawProgressRef.current = Math.min(1, routeDrawProgressRef.current + 0.035);
        updateRouteMeshGeometry(routeDrawProgressRef.current);
      }

      // 3. Animate Marching Chevrons along route
      if (routeCurveRef.current && animatedArrowsGroupRef.current.children.length > 0) {
        const arrows = animatedArrowsGroupRef.current.children;
        const total = arrows.length;
        arrows.forEach((arrow, idx) => {
          const offset = (time * 0.14 + idx / total) % 1;
          if (offset <= routeDrawProgressRef.current) {
            const pt = routeCurveRef.current!.getPoint(offset);
            const tangent = routeCurveRef.current!.getTangent(offset);
            arrow.position.set(pt.x, 2.2, pt.z);
            arrow.lookAt(pt.clone().add(tangent));
            arrow.visible = true;
          } else {
            arrow.visible = false;
          }
        });
      }

      // 4. Pin floating, ripple pulsing
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach((marker) => {
          if (marker.name.includes('PIN')) {
            const body = marker.getObjectByName('PIN_BODY');
            if (body) {
              body.position.y = 3.6 + Math.sin(time * 3) * 0.35;
            }
          }
          if (marker.name.includes('RIPPLE')) {
            const ring = marker as THREE.Mesh;
            const scale = 1 + (Math.sin(time * 3) + 1) * 0.3;
            ring.scale.set(scale, scale, scale);
            if (ring.material && (ring.material as any).opacity) {
              (ring.material as any).opacity = 0.7 - (scale - 1) * 0.55;
            }
          }
        });
      }

      // 5. User Marker Pulse & Heading orientation
      if (userMarkerGroupRef.current) {
        const pulseRing = userMarkerGroupRef.current.getObjectByName('USER_ACCURACY_RING');
        if (pulseRing) {
          const pulse = 1 + Math.sin(time * 4) * 0.1;
          pulseRing.scale.set(pulse, pulse, pulse);
        }
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, []);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const x = cameraTargetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = Math.max(16, cameraTargetRef.current.y + radius * Math.cos(phi));
    const z = cameraTargetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTargetRef.current);

    const headingDeg = (theta * 180) / Math.PI;
    setCompassHeading(headingDeg);
  };

  // Update Real-Time User Position in the 3D Scene
  useEffect(() => {
    if (!userMarkerGroupRef.current) return;
    userMarkerGroupRef.current.position.set(userLocation.x, 1.2, userLocation.z);

    const headingCone = userMarkerGroupRef.current.getObjectByName('USER_HEADING_CONE');
    if (headingCone && userLocation.heading !== null) {
      headingCone.rotation.y = -(userLocation.heading * Math.PI) / 180;
    }

    const accuracyRing = userMarkerGroupRef.current.getObjectByName('USER_ACCURACY_RING');
    if (accuracyRing) {
      const radius = Math.max(3, Math.min(30, (userLocation.accuracy || 5) * 0.4));
      accuracyRing.scale.set(radius, radius, radius);
    }
  }, [userLocation]);

  const createUserLocationMarker = () => {
    const userGroup = userMarkerGroupRef.current;
    while (userGroup.children.length > 0) userGroup.remove(userGroup.children[0]);

    // Center pulsing beacon
    const outerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.4,
      })
    );
    outerSphere.position.y = 2.2;
    outerSphere.castShadow = true;
    userGroup.add(outerSphere);

    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    innerCore.position.y = 2.2;
    userGroup.add(innerCore);

    // Heading Direction Pointer
    const headingCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 3.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 })
    );
    headingCone.name = 'USER_HEADING_CONE';
    headingCone.rotateX(Math.PI / 2);
    headingCone.position.set(0, 2.2, -3.2);
    userGroup.add(headingCone);

    // Accuracy Circle
    const accuracyGeo = new THREE.RingGeometry(0.8, 1.0, 32);
    accuracyGeo.rotateX(-Math.PI / 2);
    const accuracyMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const accuracyRing = new THREE.Mesh(accuracyGeo, accuracyMat);
    accuracyRing.name = 'USER_ACCURACY_RING';
    accuracyRing.position.y = -1.0;
    accuracyRing.scale.set(6, 6, 6);
    userGroup.add(accuracyRing);
  };

  // Re-build Photorealistic Architectural Buildings
  useEffect(() => {
    const group = buildingsGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    buildings.forEach((bld) => {
      const bldObject = createRealisticBuilding(bld, selectedBuilding?.id === bld.id);
      bldObject.userData = { building: bld };
      group.add(bldObject);
    });
  }, [buildings, selectedBuilding, is3DMode]);

  // Re-calculate Route Curve & Marching Chevrons
  useEffect(() => {
    const routeGroup = routeGroupRef.current;
    const markersGroup = markersGroupRef.current;
    const arrowsGroup = animatedArrowsGroupRef.current;

    while (routeGroup.children.length > 0) routeGroup.remove(routeGroup.children[0]);
    while (markersGroup.children.length > 0) markersGroup.remove(markersGroup.children[0]);
    while (arrowsGroup.children.length > 0) arrowsGroup.remove(arrowsGroup.children[0]);
    routeCurveRef.current = null;
    routeDrawProgressRef.current = 0;

    if (!routeResult || !routeResult.success || routeResult.pathNodes.length < 2) return;

    const points: THREE.Vector3[] = [];
    routeResult.pathNodes.forEach((node) => {
      const zPos = node.z !== undefined ? node.z : node.y;
      points.push(new THREE.Vector3(node.x, 0.9, zPos));
    });

    const curve = new THREE.CatmullRomCurve3(points);
    routeCurveRef.current = curve;
    updateRouteMeshGeometry(0.01);

    const numArrows = 8;
    const arrowGeo = new THREE.ConeGeometry(1.5, 3.2, 16);
    arrowGeo.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < numArrows; i++) {
      const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
      arrowMesh.visible = false;
      arrowsGroup.add(arrowMesh);
    }

    // Origin Pin
    const startNode = routeResult.pathNodes[0];
    const startZ = startNode.z !== undefined ? startNode.z : startNode.y;
    const startMarker = createPinMarker(startNode.x, startZ, 0x2563eb, 'START_PIN');
    markersGroup.add(startMarker);

    // Destination Pin
    const destNode = routeResult.pathNodes[routeResult.pathNodes.length - 1];
    const destZ = destNode.z !== undefined ? destNode.z : destNode.y;
    const destMarker = createPinMarker(destNode.x, destZ, 0xef4444, 'DEST_PIN');
    markersGroup.add(destMarker);
  }, [routeResult]);

  const updateRouteMeshGeometry = (progress: number) => {
    if (!routeCurveRef.current) return;
    const routeGroup = routeGroupRef.current;
    while (routeGroup.children.length > 0) routeGroup.remove(routeGroup.children[0]);

    const segmentsCount = Math.max(4, Math.floor(64 * progress));
    const subPoints = routeCurveRef.current.getPoints(segmentsCount);
    if (subPoints.length < 2) return;

    const subCurve = new THREE.CatmullRomCurve3(subPoints);
    const tubularGeometry = new THREE.TubeGeometry(subCurve, segmentsCount, 1.2, 12, false);
    const routeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.4,
    });
    const tubeMesh = new THREE.Mesh(tubularGeometry, routeMaterial);
    tubeMesh.castShadow = true;
    routeGroup.add(tubeMesh);
  };

  const createPinMarker = (x: number, z: number, colorHex: number, name: string) => {
    const pinGroup = new THREE.Group();
    pinGroup.name = name;
    pinGroup.position.set(x, 0, z);

    const bodyGroup = new THREE.Group();
    bodyGroup.name = 'PIN_BODY';

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 24, 24),
      new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.2,
        metalness: 0.3,
        emissive: colorHex,
        emissiveIntensity: 0.2,
      })
    );
    sphere.position.y = 3.6;
    sphere.castShadow = true;
    bodyGroup.add(sphere);

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 4.2, 24),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.2 })
    );
    cone.rotation.x = Math.PI;
    cone.position.y = 1.2;
    cone.castShadow = true;
    bodyGroup.add(cone);

    pinGroup.add(bodyGroup);

    const ringGeo = new THREE.RingGeometry(1.4, 3.8, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.name = 'RIPPLE';
    ring.position.y = 0.15;
    pinGroup.add(ring);

    return pinGroup;
  };

  // PHOTOREALISTIC ARCHITECTURAL BUILDING BUILDER
  const createRealisticBuilding = (bld: CampusBuilding, isSelected: boolean) => {
    const group = new THREE.Group();
    const { width, height: rawH, depth } = bld.dimensions;
    const h = is3DMode ? rawH : 2.0;

    // Architectural Concrete Facade Material
    const facadeColor = isSelected
      ? 0x2563eb
      : new THREE.Color(bld.color || '#f8fafc');

    const concreteMat = new THREE.MeshStandardMaterial({
      color: facadeColor,
      roughness: 0.65,
      metalness: 0.12,
      emissive: isSelected ? 0x1d4ed8 : 0x000000,
      emissiveIntensity: isSelected ? 0.4 : 0,
    });

    // Dark graphite base plinth
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.2,
    });
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1.2, 0.8, depth + 1.2),
      plinthMat
    );
    plinth.position.set(bld.position.x, 0.4, bld.position.z);
    plinth.receiveShadow = true;
    group.add(plinth);

    // Main Architectural Structure
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(width, h, depth), concreteMat);
    bodyMesh.position.set(bld.position.x, h / 2, bld.position.z);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    if (is3DMode) {
      // Architectural Roof Trim & Parapet
      const roofMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(bld.roofColor || '#1e293b'),
        roughness: 0.5,
        metalness: 0.3,
      });

      if (bld.roofType === 'DOME' || bld.architectureStyle === 'CIRCULAR_DOME') {
        // High-end Geodesic / Copper Dome (Auditorium)
        const domeRadius = Math.min(width, depth) * 0.46;
        const domeGeo = new THREE.SphereGeometry(domeRadius, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.25,
          metalness: 0.7,
        });
        const domeMesh = new THREE.Mesh(domeGeo, domeMat);
        domeMesh.position.set(bld.position.x, h, bld.position.z);
        domeMesh.castShadow = true;
        group.add(domeMesh);
      } else if (bld.roofType === 'PITCHED') {
        // Pitched roof (e.g. Heritage Block)
        const roofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.65, 5, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.position.set(bld.position.x, h + 2.5, bld.position.z);
        roofMesh.scale.set(width / Math.max(width, depth), 1, depth / Math.max(width, depth));
        roofMesh.castShadow = true;
        group.add(roofMesh);
      } else {
        // Flat roof with parapet, mechanical penthouses, and solar panels
        const parapet = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.9, depth * 0.98), roofMat);
        parapet.position.set(bld.position.x, h + 0.45, bld.position.z);
        parapet.castShadow = true;
        group.add(parapet);

        // Rooftop HVAC units
        const hvacMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.6 });
        const hvac1 = new THREE.Mesh(new THREE.BoxGeometry(5, 1.8, 3.5), hvacMat);
        hvac1.position.set(bld.position.x - width * 0.25, h + 1.4, bld.position.z - depth * 0.15);
        group.add(hvac1);

        // Rooftop Solar Array
        const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.85 });
        const solar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, 0.4, depth * 0.4), solarMat);
        solar.position.set(bld.position.x + width * 0.2, h + 0.9, bld.position.z + depth * 0.1);
        group.add(solar);
      }

      // Clock Tower for Heritage Block
      if (bld.hasClockTower) {
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 });
        const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 8), towerMat);
        tower.position.set(bld.position.x, h + 6, bld.position.z);
        tower.castShadow = true;
        group.add(tower);

        // Clock Dial
        const clockDial = new THREE.Mesh(
          new THREE.CylinderGeometry(2.2, 2.2, 0.3, 32),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
        );
        clockDial.rotateX(Math.PI / 2);
        clockDial.position.set(bld.position.x, h + 7.5, bld.position.z + 4.1);
        group.add(clockDial);

        // Copper Spire
        const spire = new THREE.Mesh(new THREE.ConeGeometry(4.2, 6.5, 4), roofMat);
        spire.rotateY(Math.PI / 4);
        spire.position.set(bld.position.x, h + 15, bld.position.z);
        group.add(spire);
      }

      // Pillars / Classical Portico
      if (bld.hasPillars) {
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
        const pOffsets = [-width * 0.32, -width * 0.12, width * 0.12, width * 0.32];
        pOffsets.forEach((px) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, h, 16), pillarMat);
          col.position.set(bld.position.x + px, h / 2, bld.position.z + depth / 2 + 1.2);
          col.castShadow = true;
          group.add(col);
        });

        const porticoPediment = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 1.2, 4.5), roofMat);
        porticoPediment.position.set(bld.position.x, h, bld.position.z + depth / 2 + 1.2);
        group.add(porticoPediment);
      }

      // Modern Entrance Glass Canopy
      if (bld.hasEntranceCanopy) {
        const canopyMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.75,
          roughness: 0.1,
          metalness: 0.8,
        });
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 5.5), canopyMat);
        canopy.position.set(bld.position.x, 4.2, bld.position.z + depth / 2 + 2.5);
        canopy.castShadow = true;
        group.add(canopy);
      }

      // PHOTOREALISTIC ARCHITECTURAL GLASS CURTAIN WALL
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.12,
        metalness: 0.85,
        transparent: true,
        opacity: 0.65,
      });

      const mullionMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.4,
        metalness: 0.6,
      });

      const numCols = Math.max(2, Math.floor(width / 6));
      const numRows = Math.max(1, Math.floor(h / 4.5));

      for (let r = 0; r < numRows; r++) {
        const wy = 3.2 + r * 4.4;
        if (wy >= h - 1.2) break;

        for (let c = 0; c < numCols; c++) {
          const wx = bld.position.x - width / 2 + (width / (numCols + 1)) * (c + 1);

          // Front Architectural Window Pane
          const paneFront = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 0.2), glassMat);
          paneFront.position.set(wx, wy, bld.position.z + depth / 2 + 0.12);
          group.add(paneFront);

          // Front Dark Mullion Frame
          const frameFront = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 0.1), mullionMat);
          frameFront.position.set(wx, wy, bld.position.z + depth / 2 + 0.06);
          group.add(frameFront);

          // Back Architectural Window Pane
          const paneBack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 0.2), glassMat);
          paneBack.position.set(wx, wy, bld.position.z - depth / 2 - 0.12);
          group.add(paneBack);
        }
      }
    }

    return group;
  };

  // PHOTOREALISTIC CAMPUS WORLD (Natural turf, asphalt roads with lane stripes, stone quad plazas, reflecting pool, natural trees)
  const createRealisticCampusWorld = (scene: THREE.Scene) => {
    // 1. Natural Manicured Campus Turf (Rich botanical turf green)
    const groundGeo = new THREE.PlaneGeometry(380, 380);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3f6212, // Deep natural grass tone
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    scene.add(ground);

    // 2. Architectural Reflection Pool (Mirror Water)
    const waterGeo = new THREE.CircleGeometry(22, 48);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate blue water
      roughness: 0.05,
      metalness: 0.92,
      transparent: true,
      opacity: 0.9,
    });
    const pond = new THREE.Mesh(waterGeo, waterMat);
    pond.position.set(-20, 0.05, 5);
    pond.receiveShadow = true;
    scene.add(pond);

    // White Granite Coping Rim
    const pondRimGeo = new THREE.RingGeometry(21.5, 23.5, 48);
    pondRimGeo.rotateX(-Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });
    const pondRim = new THREE.Mesh(pondRimGeo, rimMat);
    pondRim.position.set(-20, 0.06, 5);
    scene.add(pondRim);

    // 3. Central Fountain with Tiered Granite Cascades
    const fountainBase = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.8, 1.4, 32),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.4 })
    );
    fountainBase.position.set(16, 0.7, 2);
    fountainBase.castShadow = true;
    scene.add(fountainBase);

    const fountainBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 1.8, 2.0, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 })
    );
    fountainBowl.position.set(16, 1.9, 2);
    fountainBowl.castShadow = true;
    scene.add(fountainBowl);

    // 4. Dark Charcoal Asphalt Roadways & Concrete Walkways
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const walkwayMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });

    // East-West Main Campus Boulevard
    const boulevard = new THREE.Mesh(new THREE.PlaneGeometry(180, 13), asphaltMat);
    boulevard.rotateX(-Math.PI / 2);
    boulevard.position.set(0, 0.05, 52);
    boulevard.receiveShadow = true;
    scene.add(boulevard);

    // Roadway Sidewalk Pavers
    const walkN = new THREE.Mesh(new THREE.PlaneGeometry(180, 3.4), walkwayMat);
    walkN.rotateX(-Math.PI / 2);
    walkN.position.set(0, 0.06, 43.8);
    scene.add(walkN);

    const walkS = new THREE.Mesh(new THREE.PlaneGeometry(180, 3.4), walkwayMat);
    walkS.rotateX(-Math.PI / 2);
    walkS.position.set(0, 0.06, 60.2);
    scene.add(walkS);

    // North-South Campus Quad Avenue
    const nsRoad = new THREE.Mesh(new THREE.PlaneGeometry(13, 170), asphaltMat);
    nsRoad.rotateX(-Math.PI / 2);
    nsRoad.position.set(34, 0.05, 0);
    nsRoad.receiveShadow = true;
    scene.add(nsRoad);

    // Road White Centerline Dashes
    const whiteStripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let x = -80; x <= 80; x += 8) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.4), whiteStripeMat);
      stripe.rotateX(-Math.PI / 2);
      stripe.position.set(x, 0.07, 52);
      scene.add(stripe);
    }

    // Pedestrian Zebra Crossings
    [-4, -2, 0, 2, 4].forEach((offset) => {
      const zebra = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 10.5), whiteStripeMat);
      zebra.rotateX(-Math.PI / 2);
      zebra.position.set(offset * 1.8, 0.07, 52);
      scene.add(zebra);
    });

    // Central Quad Pedestrian Plaza (Geometric Concrete Pavers)
    const quadPlaza = new THREE.Mesh(new THREE.PlaneGeometry(60, 50), walkwayMat);
    quadPlaza.rotateX(-Math.PI / 2);
    quadPlaza.position.set(-10, 0.04, -5);
    quadPlaza.receiveShadow = true;
    scene.add(quadPlaza);

    // 5. Sports Complex Running Track & Football Turf
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 });
    const track = new THREE.Mesh(new THREE.PlaneGeometry(62, 46), trackMat);
    track.rotateX(-Math.PI / 2);
    track.position.set(90, 0.05, -55);
    track.receiveShadow = true;
    scene.add(track);

    const pitchMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(48, 32), pitchMat);
    pitch.rotateX(-Math.PI / 2);
    pitch.position.set(90, 0.06, -55);
    scene.add(pitch);

    // White goal boundaries
    const fieldLine = new THREE.Mesh(new THREE.PlaneGeometry(46, 30), whiteStripeMat);
    fieldLine.rotateX(-Math.PI / 2);
    fieldLine.position.set(90, 0.07, -55);
    scene.add(fieldLine);

    // 6. Realistic Campus Trees (Pine & Broadleaf clusters)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const foliageDarkMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
    const foliageMedMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

    const treeLocations = [
      [-50, -40], [-65, -20], [-45, 10], [-55, 60], [-70, 45],
      [5, -45], [10, -25], [20, -50], [15, 30], [50, 40],
      [65, 10], [55, -25], [60, -75], [120, -40], [115, -70],
    ];

    treeLocations.forEach(([tx, tz], i) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tx, 0, tz);

      // Wood Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 4.5, 10), treeTrunkMat);
      trunk.position.y = 2.25;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Layered Organic Foliage
      const folMat = i % 2 === 0 ? foliageDarkMat : foliageMedMat;
      const b1 = new THREE.Mesh(new THREE.ConeGeometry(3.5, 5, 8), folMat);
      b1.position.y = 5.5;
      b1.castShadow = true;
      treeGroup.add(b1);

      const b2 = new THREE.Mesh(new THREE.ConeGeometry(2.8, 4.2, 8), folMat);
      b2.position.y = 8.2;
      b2.castShadow = true;
      treeGroup.add(b2);

      environmentPropsGroupRef.current.add(treeGroup);
    });

    // 7. Modern Campus Teak & Stainless Steel Benches
    const benchWoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
    const benchMetalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });

    const benchLocations = [
      [-15, 50], [15, 50], [30, 20], [30, -20], [-25, 20],
    ];

    benchLocations.forEach(([bx, bz]) => {
      const bench = new THREE.Group();
      bench.position.set(bx, 0, bz);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 1.4), benchWoodMat);
      seat.position.y = 0.9;
      seat.castShadow = true;
      bench.add(seat);

      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 1.4), benchMetalMat);
      leg1.position.set(-1.8, 0.45, 0);
      bench.add(leg1);

      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 1.4), benchMetalMat);
      leg2.position.set(1.8, 0.45, 0);
      bench.add(leg2);

      environmentPropsGroupRef.current.add(bench);
    });
  };

  // User Orbit & Zoom Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    cameraSphericalRef.current.theta -= deltaX * 0.007;
    cameraSphericalRef.current.phi = Math.max(
      0.15,
      Math.min(Math.PI / 2.05, cameraSphericalRef.current.phi + deltaY * 0.007)
    );
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    desiredRadiusRef.current = Math.max(45, Math.min(320, desiredRadiusRef.current + e.deltaY * 0.12));
  };

  const zoomIn = () => {
    desiredRadiusRef.current = Math.max(45, desiredRadiusRef.current - 35);
  };

  const zoomOut = () => {
    desiredRadiusRef.current = Math.min(320, desiredRadiusRef.current + 35);
  };

  const resetOrientation = () => {
    cameraSphericalRef.current.theta = 0.85;
    cameraSphericalRef.current.phi = 0.82;
    desiredTargetRef.current.set(0, 0, 0);
    desiredRadiusRef.current = 180;
  };

  const centerOnUser = () => {
    desiredTargetRef.current.set(userLocation.x, 0, userLocation.z);
    desiredRadiusRef.current = 110;
  };

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden rounded-2xl bg-slate-100 shadow-inner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 2D / 3D Mode Toggle */}
      <div className="absolute top-4 left-4 z-10 flex bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200">
        <button
          onClick={() => onToggle3D(false)}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            !is3DMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2D Map
        </button>
        <button
          onClick={() => onToggle3D(true)}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            is3DMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3D View
        </button>
      </div>

      {/* Real-Time GPS Status Indicator (Top-Left Pill) */}
      <div className="absolute top-16 left-4 z-10 flex items-center gap-2">
        <button
          onClick={onEnableGPS}
          title={userLocation.statusMessage || 'Toggle Live GPS'}
          className={`px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border text-xs font-semibold flex items-center gap-2 transition ${
            userLocation.isLiveGPS
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Radio size={14} className={userLocation.isLiveGPS ? 'animate-pulse' : ''} />
          <span>{userLocation.isLiveGPS ? 'Live GPS Active' : 'Enable GPS'}</span>
          {userLocation.accuracy && (
            <span className="text-[10px] opacity-80">
              (±{Math.round(userLocation.accuracy)}m)
            </span>
          )}
        </button>

        {/* Compass Widget */}
        <button
          onClick={resetOrientation}
          title="Reset North Orientation"
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition transform active:scale-95"
        >
          <div
            style={{ transform: `rotate(${-compassHeading}deg)` }}
            className="flex flex-col items-center justify-center transition-transform duration-100"
          >
            <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[7px] border-b-red-600" />
            <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[7px] border-t-slate-400" />
          </div>
        </button>
      </div>

      {/* Right Map Action Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition transform active:scale-95"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition transform active:scale-95"
        >
          <Minus size={18} />
        </button>
        <button
          onClick={() => onToggle3D(!is3DMode)}
          title="Perspective Toggle"
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition transform active:scale-95"
        >
          3D
        </button>
        <button
          onClick={centerOnUser}
          title="Locate / Center on Me"
          className={`w-9 h-9 rounded-xl backdrop-blur-md shadow-md border flex items-center justify-center transition transform active:scale-95 ${
            isFollowUser
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <Crosshair size={18} />
        </button>
        {onToggleFollowUser && (
          <button
            onClick={onToggleFollowUser}
            title={isFollowUser ? 'Disable Follow Mode' : 'Follow My Location While Walking'}
            className={`w-9 h-9 rounded-xl backdrop-blur-md shadow-md border flex items-center justify-center transition transform active:scale-95 ${
              isFollowUser
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
          >
            <NavIcon size={16} className={isFollowUser ? 'animate-bounce' : ''} />
          </button>
        )}
      </div>

      {/* Floating 3D Building Badges */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelectBuilding(b)}
            className="pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm border border-slate-200/90 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md hover:bg-blue-600 hover:text-white transition duration-200 cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
            style={{
              left: `${50 + (b.position.x / 140) * 40}%`,
              top: `${50 + (b.position.z / 140) * 40}%`,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.accentColor || b.color }} />
            {b.name}
          </button>
        ))}
      </div>
    </div>
  );
};
