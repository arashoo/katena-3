# Katena Backend API

## Overview
This is the backend API server for the Katena Glass Inventory Management System. It provides RESTful endpoints for managing glass inventory and backlog reservations with JSON file storage.

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
```bash
cd backend
npm install
```

### Running the Server
```bash
# Production mode
npm start

# Development mode with auto-restart
npm run dev
```

The server will start on port 3001 by default.

## API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Glass Inventory
- `GET /api/glasses` - Get all glasses
- `POST /api/glasses` - Add new glass
- `PUT /api/glasses/:id` - Update glass by ID
- `DELETE /api/glasses/:id` - Delete glass by ID
- `POST /api/glasses/bulk` - Bulk add glasses

### Backlog Management
- `GET /api/backlog` - Get all backlog items
- `POST /api/backlog` - Add item to backlog
- `PUT /api/backlog/:id` - Update backlog item by ID
- `DELETE /api/backlog/:id` - Delete backlog item by ID

## Data Storage
- Data is stored in JSON files in the `data/` directory
- `glasses.json` - Glass inventory data
- `backlog.json` - Backlog reservations data

## Features
- CORS enabled for frontend communication
- Automatic data file initialization
- UUID generation for unique IDs
- Error handling and validation
- Backup localStorage fallback in frontend

## Development Notes
- Server runs on port 3001
- Data files are automatically created if they don't exist
- All endpoints return JSON responses
- Comprehensive error handling with meaningful error messages