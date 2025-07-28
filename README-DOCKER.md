# Docker Setup for Nonprofit Calculator

## Quick Start

### Production Build
```bash
# Build and run both services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Development Mode (with hot reload)
```bash
# Run development version with volume mounting
docker-compose -f docker-compose.dev.yml up --build

# Frontend: http://localhost:3000 (with hot reload)
# Backend: http://localhost:5000 (with auto-restart)
```

## Services

### Backend (Flask)
- **Port**: 5000
- **Endpoints**: `/api/portfolios`, `/api/calculate`, `/api/generate-pdf`
- **Volume**: `./data` mounted for persistent storage

### Frontend (React + Nginx)
- **Port**: 3000 (production) / 3000 (development)
- **Proxy**: API calls automatically routed to backend
- **Build**: Production uses multi-stage build with Nginx

## Commands

```bash
# Stop all services
docker-compose down

# Rebuild without cache
docker-compose build --no-cache

# View logs
docker-compose logs -f

# Run specific service
docker-compose up backend
docker-compose up frontend

# Development with file watching
docker-compose -f docker-compose.dev.yml up

# Clean up containers and images
docker-compose down --rmi all --volumes
```

## Environment Variables

### Backend
- `DEBUG`: Enable Flask debug mode (default: True)
- `PORT`: Flask port (default: 5000)

### Frontend
- `VITE_API_URL`: Backend API URL
  - Development: `http://localhost:5000`
  - Production: `/api` (proxied by Nginx)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React/Nginx) │────│    (Flask)      │
│   Port: 3000    │    │    Port: 5000   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Docker Network
```

## Troubleshooting

### Port Conflicts
If ports 3000 or 5000 are in use:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5000

# Modify docker-compose.yml ports section
ports:
  - "8080:80"  # Frontend
  - "8000:5000"  # Backend
```

### CORS Issues
The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://frontend:80` (Docker network)

### Volume Issues
```bash
# Reset volumes
docker-compose down --volumes
docker-compose up --build
```