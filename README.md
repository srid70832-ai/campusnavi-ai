# NaviCampus AI

**Production Smart Campus Navigation Web Application**  
*Product Name: NaviCampus AI &copy; 2026*

---

## 1. Executive Summary & Objective

**NaviCampus AI** is a production-quality, responsive web application engineered for college and university campuses. It transforms campus navigation by combining:
- **Interactive 3D Campus Visualization** with accurate 3D building geometry, architectural details, green lawns, sports tracks, and animated navigational paths.
- **Dijkstra Shortest-Path Routing Engine** with verified edge weights, accessibility constraints (wheelchair ramps vs stairs), obstacle avoidance, and geometry-derived step-by-step turn directions.
- **Turn-by-Turn Voice Navigation** using browser SpeechSynthesis with dual-language support in English and Tamil (தமிழ்).
- **Google Authentication** integrated with Firebase and Supabase client support.
- **AI Campus Assistant** with Gemini API integration and an automated zero-hallucination verified rule engine fallback.
- **Role-Based Access Control (RBAC)** providing distinct experiences for Students, Visitors, and Administrators.
- **Administrator Governance & Map Editor** with a strict change approval lifecycle (`Draft` &rarr; `Pending Review` &rarr; `Approved` &rarr; `Published`) and full audit logging.

---

## 2. Design System & User Interface

The interface follows a **premium white theme with blue accents**:
- **Backgrounds**: Soft crisp surfaces (`#F4F7FB`, `#FFFFFF`).
- **Brand Accent**: Modern corporate electric blue (`#1D68F2`, `#2563EB`).
- **Typography**: Clean, geometric *Plus Jakarta Sans*.
- **Cards**: Glass-like rounded cards (`border-radius: 16px`), subtle borders (`#E2E8F0`), and soft elevation shadows.
- **Responsive Layout**:
  - **Left Sidebar**: Home, Campus Map, Find Location, Navigation, AI Assistant, Schedule & Events, Facilities, Feedback, and Admin Panel.
  - **Top Bar**: Search bar with verified building/room autocomplete, day/night theme toggle, announcements bell, and Google Auth student profile pill.
  - **Main Hero Banner**: *"Explore Your Campus Easily"* with instant origin & destination selectors and swap controls.
  - **3D Interactive Map**: Full pan, orbit, zoom, compass north-reset, 2D/3D toggle, and building pin badges.
  - **Right Navigation Panel**: Destination preview with building photo, estimated distance & walking duration, Start/Stop navigation controls, and step-by-step directions.
  - **Bottom Feature Cards**: 5 quick-access cards (*Find Any Location*, *Shortest Path*, *3D Campus Map*, *Voice Navigation*, *Admin Controlled*).

---

## 3. Dijkstra Routing Engine & Graph Architecture

The routing engine operates strictly on verified graph data without fabricating paths or coordinates:
- **Nodes ($V$)**: Represent verified campus entrances, road junctions, corridor waypoints, elevator landings, and doors.
- **Edges ($E$)**: Represent physical walkable connections with non-negative measured distances ($w_e \ge 0$).
- **Wheelchair Accessibility Mode**: Automatically filters out edges marked with `isAccessible: false` (e.g. stairs) and routes exclusively through verified ramps, lifts, and level corridors.
- **Maintenance / Obstacle Avoidance**: Dynamic recalculation when edges are marked `isBlocked: true` (e.g., corridor waxing or construction).
- **Turn Direction Synthesis**: Derives real turn angles (`TURN_LEFT`, `TURN_RIGHT`, `STRAIGHT`, `ARRIVE`) from vector math ($\operatorname{atan2}(\Delta z, \Delta x)$) and handles vertical floor transitions (`TAKE_LIFT_UP`, `TAKE_STAIRS_DOWN`, `TAKE_RAMP`).

---

## 4. Technical Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons |
| **Authentication** | Google Auth via Firebase SDK (`getAuth`, `signInWithPopup`) & Supabase client |
| **3D Rendering** | Three.js (WebGL with shadow mapping, animated marching chevrons, smooth camera lerp) |
| **Routing** | Dedicated TypeScript Dijkstra Router with Priority Queue |
| **Voice Guidance** | Web Speech API (`SpeechSynthesisUtterance`) with EN-US and TA-IN voices |
| **AI Assistant** | Google Gemini 2.0 Flash API + Verified Campus Rule Engine |
| **Backend API** | Node.js, Express 5, CORS, Dotenv, TypeScript (`tsx`) |
| **Testing** | Vitest unit test suite |

---

## 5. Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x recommended)
- **npm**: v9.0.0 or higher

### Installation
```bash
# Navigate to the project directory
cd campus-navigator-ai

# Install dependencies
npm install
```

### Running in Development Mode
```bash
# Run the Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running the Backend API Server (Optional)
```bash
# Start Express backend on port 3001
npm run server
```

---

## 6. Testing & Quality Assurance

Run the automated test suite:
```bash
npm test
```

### Building for Production
```bash
npm run build
```

---

## 7. License & Attribution

**NaviCampus AI** &copy; 2026. All rights reserved.
