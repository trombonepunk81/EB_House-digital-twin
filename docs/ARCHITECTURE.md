# Architecture Notes

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (React + Vite)                    │
│                                                             │
│  ┌────────────┐   ┌──────────────────┐   ┌──────────────┐  │
│  │ Dashboard  │   │   3D IFC Viewer  │   │ Asset Manager│  │
│  │            │   │  (web-ifc-three) │   │              │  │
│  └────────────┘   └────────┬─────────┘   └──────┬───────┘  │
│                            │                    │           │
│                    ┌───────▼────────────────────▼───────┐   │
│                    │         Zustand State Store         │   │
│                    └───────────────────┬────────────────┘   │
└───────────────────────────────────────┼─────────────────────┘
                                        │ REST API
                                        │
┌───────────────────────────────────────▼─────────────────────┐
│                   FastAPI Backend (Python)                   │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐ │
│  │ /api/assets │   │ /api/models  │   │  IfcOpenShell    │ │
│  │  CRUD ops   │   │ IFC upload   │   │  Parser utils    │ │
│  └──────┬──────┘   └──────┬───────┘   └──────────────────┘ │
│         │                 │                                  │
│  ┌──────▼─────────────────▼──────────────────────────────┐  │
│  │                  SQLite / PostgreSQL                   │  │
│  │            (assets, ifc_models tables)                 │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## IFC Loading Strategy

**Client-side (primary):** The frontend uses `web-ifc-three` to load IFC files
directly in the browser via WebAssembly. This allows:
- Real-time 3D rendering with Three.js
- Element picking/raycasting
- Property inspection without server roundtrips

**Server-side (secondary):** When a model is uploaded via the API, IfcOpenShell
parses it server-side to:
- Extract structured asset data for the database
- Build room/floor navigation metadata
- Support future search/filter over model elements

## Data Model

```
Asset
├── id (PK)
├── name
├── category        (Appliance | HVAC | Plumbing | Electrical | ...)
├── status          (Good | Monitor | Maintenance | Repair)
├── location        (room name / description)
├── brand, model, serial_number
├── install_date, warranty_expiry
├── notes
├── ifc_id          (expressID from client-side viewer)
├── ifc_global_id   (GlobalId GUID from IFC file)
└── created_at, updated_at

IFCModel
├── id (PK)
├── filename
├── file_path
├── element_count
├── schema_version
└── uploaded_at
```

## Development Phases

### Phase 1 (Current)
- [x] Project scaffold
- [x] 3D IFC viewer (client-side web-ifc-three)
- [x] Element inspector panel
- [x] Asset registry (client-side Zustand, pending API integration)
- [x] FastAPI backend with CRUD endpoints
- [x] IfcOpenShell server-side parsing

### Phase 2
- [ ] Persist assets to backend database
- [ ] IFC model upload + server-side parse
- [ ] Auto-suggest assets from IFC element types
- [ ] Floor plan 2D view

### Phase 3
- [ ] Maintenance schedule & reminders
- [ ] Photo attachments per asset
- [ ] Warranty expiry notifications
- [ ] Cost/contractor tracking

### Phase 4
- [ ] PostgreSQL migration
- [ ] Auth (single-user password or SSO)
- [ ] Mobile-responsive layout
- [ ] Export to CSV / report
