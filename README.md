# EB House Digital Twin

A personal digital twin platform for home asset management, featuring a browser-based 3D IFC/BIM viewer built on Three.js and a FastAPI backend.

## Features

- 🏠 **3D BIM Viewer** — Load IFC models exported from Revit directly in the browser
- 🔍 **Element Inspector** — Click any element in the 3D model to view its properties
- 📋 **Asset Registry** — Track appliances, systems, and components linked to model elements
- 🗓️ **Maintenance Tracker** — Warranty dates, service history, upcoming maintenance
- 🏷️ **Metadata Extraction** — Automatically parse IFC properties into your asset database

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Three.js + web-ifc-viewer |
| State | Zustand |
| Styling | Tailwind CSS |
| Backend | FastAPI (Python 3.11+) |
| IFC Parsing | IfcOpenShell |
| Database | SQLite (dev) → PostgreSQL (prod) |
| Containerization | Docker + Docker Compose |

## Project Structure

```
EB_House-digital-twin/
├── frontend/          # React + Three.js IFC viewer
│   └── src/
│       ├── viewer/    # 3D scene, IFC loader, camera controls
│       ├── assets/    # Asset management UI
│       ├── components/# Shared UI components
│       ├── hooks/     # Custom React hooks
│       └── store/     # Zustand state management
├── backend/           # FastAPI + IfcOpenShell
│   ├── api/           # REST endpoints
│   ├── ifc/           # IFC parsing utilities
│   └── db/            # Database models & migrations
├── models/            # IFC / glTF model files (gitignored if large)
└── docs/              # Architecture diagrams, notes
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional but recommended)

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

Frontend: http://localhost:5173  
Backend API: http://localhost:8000  
API Docs: http://localhost:8000/docs

### Option B — Manual

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Loading Your Revit Model

1. In Revit, export your model: **File → Export → IFC**
2. Choose **IFC 2x3** or **IFC 4** format
3. Place the `.ifc` file in the `models/` directory
4. In the app, click **Load Model** and select your file

## Roadmap

- [ ] Phase 1: IFC viewer + element inspector + asset registry
- [ ] Phase 2: Floor plan 2D view + room-based navigation
- [ ] Phase 3: Maintenance scheduling + notifications
- [ ] Phase 4: Photo attachments per asset
- [ ] Phase 5: Cost tracking + contractor management

## License

MIT
