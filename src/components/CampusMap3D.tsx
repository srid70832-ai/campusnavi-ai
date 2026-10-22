import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CampusBuilding, NavNode, RouteResult } from '../types/campus';
import { Plus, Minus, Crosshair } from 'lucide-react';

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
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Interaction tracking & Smooth Camera Target
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const desiredTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraSphericalRef = useRef({ radius: 170, theta: 0.85, phi: 0.8 });
  const desiredRadiusRef = useRef(170);
  const [compassHeading, setCompassHeading] = useState(0);

  // 3D Objects references
  const buildingsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const routeGroupRef = useRef<THREE.Group>(new THREE.Group());
  const markersGroupRef = useRef<THREE.Group>(new THREE.Group());
  const animatedArrowsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const routeCurveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const routeDrawProgressRef = useRef(0);

  // Smooth camera tracking when selected building changes
  useEffect(() => {
    if (selectedBuilding) {
      desiredTargetRef.current.set(selectedBuilding.position.x, 0, selectedBuilding.position.z);
      desiredRadiusRef.current = 115;
    } else {
      desiredTargetRef.current.set(0, 0, 0);
      desiredRadiusRef.current = 170;
    }
  }, [selectedBuilding]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.FogExp2(0xf1f5f9, 0.0022);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbf0, 1.45);
    sunLight.position.set(110, 160, 90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 400;
    const d = 130;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xbbf7d0, 0.45);
    scene.add(hemiLight);

    // Campus Grounds and Road Network
    createCampusEnvironment(scene);

    scene.add(buildingsGroupRef.current);
    scene.add(routeGroupRef.current);
    scene.add(animatedArrowsGroupRef.current);
    scene.add(markersGroupRef.current);

    // Animation Loop with Smooth Camera Damping & Animated Marching Chevrons
    let time = 0;
    const animate = () => {
      time += 0.025;

      // 1. Smooth Camera Target LERP
      cameraTargetRef.current.lerp(desiredTargetRef.current, 0.06);
      cameraSphericalRef.current.radius += (desiredRadiusRef.current - cameraSphericalRef.current.radius) * 0.06;
      updateCameraPosition();

      // 2. Animate Progressive Route Drawing
      if (routeDrawProgressRef.current < 1) {
        routeDrawProgressRef.current = Math.min(1, routeDrawProgressRef.current + 0.04);
        updateRouteMeshGeometry(routeDrawProgressRef.current);
      }

      // 3. Animate Marching Chevrons along curve
      if (routeCurveRef.current && animatedArrowsGroupRef.current.children.length > 0) {
        const arrows = animatedArrowsGroupRef.current.children;
        const total = arrows.length;
        arrows.forEach((arrow, idx) => {
          const offset = ((time * 0.18 + idx / total) % 1);
          if (offset <= routeDrawProgressRef.current) {
            const pt = routeCurveRef.current!.getPoint(offset);
            const tangent = routeCurveRef.current!.getTangent(offset);
            arrow.position.set(pt.x, 2.3, pt.z);
            arrow.lookAt(pt.clone().add(tangent));
            arrow.visible = true;
          } else {
            arrow.visible = false;
          }
        });
      }

      // 4. Pin floating & pulsing rings animation
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach((marker) => {
          if (marker.name.includes('PIN')) {
            const body = marker.getObjectByName('PIN_BODY');
            if (body) {
              body.position.y = 3.5 + Math.sin(time * 3.5) * 0.4;
            }
          }
          if (marker.name.includes('RIPPLE')) {
            const ring = marker as THREE.Mesh;
            const scale = 1 + (Math.sin(time * 3) + 1) * 0.35;
            ring.scale.set(scale, scale, scale);
            if (ring.material && (ring.material as any).opacity) {
              (ring.material as any).opacity = 0.7 - (scale - 1) * 0.6;
            }
          }
        });
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
    const y = cameraTargetRef.current.y + radius * Math.cos(phi);
    const z = cameraTargetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTargetRef.current);

    const headingDeg = (theta * 180) / Math.PI;
    setCompassHeading(headingDeg);
  };

  // Re-build campus buildings with smooth selection glow
  useEffect(() => {
    const group = buildingsGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    buildings.forEach((bld) => {
      const bldMesh = createDetailedBuilding(bld, selectedBuilding?.id === bld.id);
      bldMesh.userData = { building: bld };
      group.add(bldMesh);
    });
  }, [buildings, selectedBuilding, is3DMode]);

  // Re-calculate Route Curve & Setup Animated Marching Chevrons
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

    // Start with empty geometry that animates forward
    updateRouteMeshGeometry(0.01);

    // Create 7 Marching Chevron Cones
    const numArrows = 7;
    const arrowGeo = new THREE.ConeGeometry(1.6, 3.4, 16);
    arrowGeo.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < numArrows; i++) {
      const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
      arrowMesh.visible = false;
      arrowsGroup.add(arrowMesh);
    }

    // Start Pin (Blue Sphere with pulsing ground ring)
    const startNode = routeResult.pathNodes[0];
    const startZ = startNode.z !== undefined ? startNode.z : startNode.y;
    const startMarker = createPinMarker(startNode.x, startZ, 0x1d68f2, 'START_PIN');
    markersGroup.add(startMarker);

    // Destination Pin (Red Location Pin with Animated Ripple)
    const destNode = routeResult.pathNodes[routeResult.pathNodes.length - 1];
    const destZ = destNode.z !== undefined ? destNode.z : destNode.y;
    const destMarker = createPinMarker(destNode.x, destZ, 0xef4444, 'DEST_PIN');
    markersGroup.add(destMarker);
  }, [routeResult]);

  // Progressive Route Mesh Geometry Update
  const updateRouteMeshGeometry = (progress: number) => {
    if (!routeCurveRef.current) return;
    const routeGroup = routeGroupRef.current;
    while (routeGroup.children.length > 0) routeGroup.remove(routeGroup.children[0]);

    const segmentsCount = Math.max(4, Math.floor(64 * progress));
    const subPoints = routeCurveRef.current.getPoints(segmentsCount);
    if (subPoints.length < 2) return;

    const subCurve = new THREE.CatmullRomCurve3(subPoints);
    const tubularGeometry = new THREE.TubeGeometry(subCurve, segmentsCount, 1.25, 12, false);
    const routeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d68f2,
      emissive: 0x0047cc,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.35,
    });
    const tubeMesh = new THREE.Mesh(tubularGeometry, routeMaterial);
    tubeMesh.castShadow = true;
    routeGroup.add(tubeMesh);
  };

  const createPinMarker = (x: number, z: number, colorHex: number, name: string) => {
    const pinGroup = new THREE.Group();
    pinGroup.name = name;
    pinGroup.position.set(x, 1, z);

    const bodyGroup = new THREE.Group();
    bodyGroup.name = 'PIN_BODY';

    // Sphere head
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 24, 24),
      new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.5,
        roughness: 0.1,
      })
    );
    sphere.position.y = 3.5;
    sphere.castShadow = true;
    bodyGroup.add(sphere);

    // Pointy cone
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 4.5, 24),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.2 })
    );
    cone.rotation.x = Math.PI;
    cone.position.y = 1.2;
    cone.castShadow = true;
    bodyGroup.add(cone);

    pinGroup.add(bodyGroup);

    // Translucent ripple ring
    const ringGeo = new THREE.RingGeometry(1.5, 3.8, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.name = 'RIPPLE';
    ring.position.y = 0.1;
    pinGroup.add(ring);

    return pinGroup;
  };

  const createDetailedBuilding = (bld: CampusBuilding, isSelected: boolean) => {
    const group = new THREE.Group();
    const { width, height: h, depth } = bld.dimensions;
    const actualHeight = is3DMode ? h : 1.5;

    const bodyGeo = new THREE.BoxGeometry(width, actualHeight, depth);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isSelected ? 0x2563eb : new THREE.Color(bld.color),
      emissive: isSelected ? 0x1d4ed8 : 0x000000,
      emissiveIntensity: isSelected ? 0.35 : 0,
      roughness: 0.35,
      metalness: 0.12,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(bld.position.x, actualHeight / 2, bld.position.z);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    if (is3DMode) {
      const roofGeo = new THREE.BoxGeometry(width * 0.95, 0.8, depth * 0.95);
      const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(bld.accentColor), roughness: 0.5 });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(bld.position.x, actualHeight + 0.4, bld.position.z);
      group.add(roofMesh);

      const windowGeo = new THREE.BoxGeometry(width * 1.01, actualHeight * 0.4, depth * 1.01);
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.6,
      });
      const windowBand = new THREE.Mesh(windowGeo, windowMat);
      windowBand.position.set(bld.position.x, actualHeight * 0.5, bld.position.z);
      group.add(windowBand);
    }

    return group;
  };

  const createCampusEnvironment = (scene: THREE.Scene) => {
    const groundGeo = new THREE.PlaneGeometry(350, 350);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    scene.add(ground);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });

    const mainAvenue = new THREE.Mesh(new THREE.PlaneGeometry(160, 14), roadMat);
    mainAvenue.rotateX(-Math.PI / 2);
    mainAvenue.position.set(0, 0.05, 52);
    mainAvenue.receiveShadow = true;
    scene.add(mainAvenue);

    const nsRoad = new THREE.Mesh(new THREE.PlaneGeometry(14, 150), roadMat);
    nsRoad.rotateX(-Math.PI / 2);
    nsRoad.position.set(34, 0.06, 0);
    nsRoad.receiveShadow = true;
    scene.add(nsRoad);

    const trackGeo = new THREE.RingGeometry(18, 26, 32);
    trackGeo.rotateX(-Math.PI / 2);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xe05638, roughness: 0.7 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(25, 0.08, -65);
    track.scale.set(1.4, 1, 0.9);
    scene.add(track);

    const pitchGeo = new THREE.PlaneGeometry(36, 24);
    pitchGeo.rotateX(-Math.PI / 2);
    const pitchMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.position.set(25, 0.1, -65);
    scene.add(pitch);

    const treeTrunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 8);
    const treeLeavesGeo = new THREE.SphereGeometry(2.5, 12, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

    const treePositions = [
      [-15, 30], [-10, 40], [-25, 45], [-35, 30],
      [15, 10], [18, -5], [20, -20], [-10, -5],
      [-40, -25], [-35, -15], [50, 45], [45, -45],
      [10, 70], [-20, 70], [-55, 75],
    ];

    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const leaves = new THREE.Mesh(treeLeavesGeo, leavesMat);
      leaves.position.y = 4.2;
      leaves.castShadow = true;
      tree.add(leaves);

      tree.position.set(tx, 0, tz);
      scene.add(tree);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    if (e.buttons === 1) {
      cameraSphericalRef.current.theta -= deltaX * 0.006;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi + deltaY * 0.006)
      );
    } else if (e.buttons === 2) {
      const panSpeed = 0.2;
      cameraTargetRef.current.x -= deltaX * panSpeed;
      cameraTargetRef.current.z -= deltaY * panSpeed;
      desiredTargetRef.current.copy(cameraTargetRef.current);
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    desiredRadiusRef.current = Math.max(
      60,
      Math.min(300, desiredRadiusRef.current + e.deltaY * 0.12)
    );
  };

  const zoomIn = () => {
    desiredRadiusRef.current = Math.max(60, desiredRadiusRef.current - 25);
  };

  const zoomOut = () => {
    desiredRadiusRef.current = Math.min(300, desiredRadiusRef.current + 25);
  };

  const resetOrientation = () => {
    cameraSphericalRef.current.theta = 0.85;
    cameraSphericalRef.current.phi = 0.8;
    desiredTargetRef.current.set(0, 0, 0);
    desiredRadiusRef.current = 170;
  };

  const centerOnUser = () => {
    desiredTargetRef.current.set(-60, 0, 40); // CSE Block position
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
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 2D / 3D Mode Toggle */}
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

      {/* Compass Widget */}
      <div className="absolute top-16 left-4 z-10">
        <button
          onClick={resetOrientation}
          title="Reset North Orientation"
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition transform active:scale-95"
        >
          <div
            style={{ transform: `rotate(${-compassHeading}deg)` }}
            className="flex flex-col items-center justify-center transition-transform duration-100"
          >
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-red-600" />
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-slate-400" />
          </div>
        </button>
      </div>

      {/* Floating Map Action Controls */}
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
          title="Locate Me / CSE Block"
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition transform active:scale-95"
        >
          <Crosshair size={18} />
        </button>
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
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
            {b.name}
          </button>
        ))}
      </div>
    </div>
  );
};
