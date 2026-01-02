# HVR 6.0 Multi-Agent User Interface for SAP Data Replication

A comprehensive multi-agent architecture with a modern web-based user interface for managing HVR 6.0 SAP data replication operations.

## Overview

This application provides a complete solution for managing critical SAP data replication operations using Fivetran's HVR 6.0 technology. It implements a multi-agent architecture that handles all aspects of data replication from SAP systems to various target platforms.

**✅ HVR 6.0 Integration:** This system can integrate directly with Fivetran's HVR 6.0 product via REST API. It operates in two modes:
- **Standalone Mode** (Default): Demonstrates all features without requiring HVR installation
- **Integrated Mode**: Connects to actual HVR 6.0 for real production data replication

## Quick Links

- 📘 **[SAP Replication Guide](./SAP_REPLICATION_GUIDE.md)** - Step-by-step guide to replicate SAP data
- 🔌 **[HVR Integration Guide](./HVR_INTEGRATION.md)** - Complete HVR 6.0 integration documentation
- 🚀 **[Quick Start](#getting-started)** - Get up and running in minutes

## Features

### 🤖 Multi-Agent Architecture

The system includes six specialized agents, each handling specific replication tasks:

1. **Refresh Agent** - Initial data load operations
   - Bulk data copying from SAP to target
   - Table slicing for parallel processing
   - High-performance initial loads

2. **CDC Agent** - Change Data Capture
   - Real-time transaction log monitoring
   - Log-based CDC for minimal source impact
   - Continuous change tracking

3. **Integration Agent** - Data integration to targets
   - Applies captured changes to target systems
   - Batch processing for efficiency
   - Conflict resolution

4. **Compare Agent** - Data verification
   - Source-to-target comparison
   - Discrepancy detection
   - Data validation and compliance

5. **Monitor Agent** - System health monitoring
   - Performance metrics tracking
   - Health checks and alerting
   - Real-time status monitoring

6. **Schedule Agent** - Workflow automation
   - Task scheduling and orchestration
   - Dependency management
   - Automated workflow execution

### 🎨 Modern Web Interface

- **Dashboard**: Real-time system health and statistics
- **Agent Management**: Monitor all agents and their metrics
- **Job Management**: Track active and historical replication jobs
- **Task Submission**: Create and schedule new replication tasks
- **Real-time Updates**: WebSocket-based live data updates

### 🔧 Technical Stack

**Backend:**
- Node.js with TypeScript
- Express.js REST API
- WebSocket for real-time updates
- Winston for logging

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- React Router for navigation
- Axios for API communication
- Recharts for data visualization
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alvinjchua888/hvr6-client-agents.git
cd hvr6-client-agents
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your HVR 6.0 configuration:
```env
HVR_API_BASE_URL=http://localhost:4340
HVR_API_USERNAME=admin
HVR_API_PASSWORD=changeme
PORT=3000
WS_PORT=3001
LOG_LEVEL=info
```

### Running the Application

#### Development Mode

Run both backend and frontend in development mode:
```bash
npm run dev
```

This starts:
- Backend API server on http://localhost:3000
- WebSocket server on http://localhost:3001
- Frontend development server on http://localhost:5173

Or run them separately:

Backend only:
```bash
npm run dev:server
```

Frontend only:
```bash
npm run dev:client
```

#### Production Mode

Build and run in production:
```bash
npm run build
npm start
```

## HVR 6.0 Integration

### Standalone Mode (Default)

The application runs in standalone mode by default, simulating all HVR operations for demonstration and testing purposes. No HVR 6.0 installation is required.

### Integrated Mode with HVR 6.0

To connect to an actual HVR 6.0 installation:

1. **Install HVR 6.0**: Follow [Fivetran's HVR 6.0 installation guide](https://docs.fivetran.com/hvr6/getting-started)

2. **Configure connection** in `.env`:
```env
HVR_API_BASE_URL=http://your-hvr-server:4340
HVR_API_USERNAME=admin
HVR_API_PASSWORD=your-password
HVR_INTEGRATED_MODE=true  # Enable real HVR integration
```

3. **Restart the application**:
```bash
npm start
```

The system will automatically use the HVR 6.0 REST API for all replication operations:
- **Refresh Agent** → Calls HVR's `POST /api/jobs/refresh`
- **CDC Agent** → Calls HVR's `POST /api/jobs/capture`
- **Integration Agent** → Calls HVR's `POST /api/jobs/integrate`
- **Compare Agent** → Calls HVR's `POST /api/jobs/compare`

### HVR API Client

The included HVR API client (`src/server/hvr/HVRClient.ts`) provides full integration with HVR 6.0:

```typescript
import { getHVRClient } from './hvr/HVRClient';

const hvr = getHVRClient();

// Check HVR connectivity
await hvr.healthCheck();

// Start operations
await hvr.startRefresh('channel-name', ['TABLE1', 'TABLE2']);
await hvr.startCapture('channel-name');
await hvr.startIntegrate('channel-name');

// Monitor jobs
const status = await hvr.getJobStatus(jobId);
```

**📖 Complete Integration Guide:** See [HVR_INTEGRATION.md](./HVR_INTEGRATION.md) for detailed documentation on:
- HVR API endpoints used
- Authentication configuration
- Channel and location management
- Error handling and troubleshooting
- Production deployment examples

## API Documentation

### Agents

- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `GET /api/agents/type/:type` - Get agents by type

### Jobs

- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/:id` - Get job by ID

### Tasks

- `POST /api/tasks` - Submit a new task
- `GET /api/tasks/queue` - Get task queue status

### Health

- `GET /api/health` - Get system health status

### Example: Submit a Refresh Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "REFRESH",
    "action": "refresh",
    "parameters": {
      "channelId": "sap-to-snowflake",
      "tables": [
        {
          "sourceSchema": "SAP",
          "sourceTable": "MARA",
          "targetSchema": "WAREHOUSE",
          "targetTable": "MARA"
        }
      ],
      "estimatedRows": 1000000
    },
    "priority": 5
  }'
```

## Architecture

### Agent Orchestrator

The `AgentOrchestrator` is the central coordinator that:
- Manages agent lifecycle
- Distributes tasks to appropriate agents
- Monitors agent health and performance
- Handles task queuing and prioritization

### Base Agent Class

All specialized agents extend the `BaseAgent` class which provides:
- Task execution framework
- Metrics collection
- Error handling
- Status management

### WebSocket Communication

Real-time updates are pushed to connected clients via WebSocket for:
- Task started/completed/failed events
- Agent status changes
- Job progress updates

## Project Structure

```
hvr6-client-agents/
├── src/
│   ├── server/
│   │   ├── agents/          # Agent implementations
│   │   │   ├── BaseAgent.ts
│   │   │   ├── RefreshAgent.ts
│   │   │   ├── CDCAgent.ts
│   │   │   ├── IntegrationAgent.ts
│   │   │   ├── CompareAgent.ts
│   │   │   ├── MonitorAgent.ts
│   │   │   ├── ScheduleAgent.ts
│   │   │   └── AgentOrchestrator.ts
│   │   ├── api/             # REST API routes
│   │   │   ├── agents.ts
│   │   │   ├── jobs.ts
│   │   │   ├── tasks.ts
│   │   │   └── health.ts
│   │   ├── utils/           # Utilities
│   │   │   └── logger.ts
│   │   └── index.ts         # Server entry point
│   └── shared/
│       └── types.ts         # Shared TypeScript types
├── client/
│   └── src/
│       ├── components/      # React components
│       │   ├── Header.tsx
│       │   └── AgentCard.tsx
│       ├── pages/           # Page components
│       │   ├── Dashboard.tsx
│       │   ├── Agents.tsx
│       │   └── Jobs.tsx
│       ├── services/        # API services
│       │   └── api.ts
│       ├── types/           # TypeScript types
│       │   └── index.ts
│       ├── styles/          # CSS styles
│       │   └── App.css
│       ├── App.tsx
│       └── main.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

### Environment Variables

- `HVR_API_BASE_URL` - HVR 6.0 API endpoint
- `HVR_API_USERNAME` - HVR API username
- `HVR_API_PASSWORD` - HVR API password
- `PORT` - Backend server port (default: 3000)
- `WS_PORT` - WebSocket server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)

## SAP Replication Operations

### Initial Load (Refresh)

Use the Refresh Agent to perform initial bulk data loads from SAP tables:
- Supports parallel table slicing
- Optimized for large volumes
- Progress tracking

### Change Data Capture

The CDC Agent monitors SAP transaction logs for real-time changes:
- Minimal impact on source system
- Captures INSERT, UPDATE, DELETE operations
- Low latency replication

### Data Integration

Integration Agent applies changes to target systems:
- Batch processing for efficiency
- Transaction consistency
- Error handling and retry logic

### Data Validation

Compare Agent ensures data integrity:
- Row-by-row comparison
- Discrepancy reporting
- Compliance verification

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

Built for HVR 6.0 (Fivetran Local Data Processing) to manage SAP data replication operations efficiently and securely.
