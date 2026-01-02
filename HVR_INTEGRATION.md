# HVR 6.0 Integration Guide

This document explains how the HVR 6.0 Client Agents system integrates with Fivetran's HVR 6.0 product.

## Overview

The system provides two modes of operation:

1. **Standalone Mode** (Default): Simulates HVR operations for demonstration and testing
2. **Integrated Mode**: Connects to actual HVR 6.0 API for real data replication operations

## Architecture

### HVR 6.0 API Client

The `HVRClient` class (`src/server/hvr/HVRClient.ts`) provides a complete interface to HVR 6.0's REST API:

```typescript
import { getHVRClient } from './hvr/HVRClient';

const hvrClient = getHVRClient();

// Check if HVR is accessible
const isAvailable = await hvrClient.healthCheck();

// Start a refresh operation
await hvrClient.startRefresh('sap-to-snowflake', ['MARA', 'MAKT']);

// Start CDC
await hvrClient.startCapture('sap-to-snowflake');

// Get job status
const status = await hvrClient.getJobStatus(jobId);
```

### Multi-Agent Integration

Each agent can operate in two modes:

#### Standalone Mode (Current Default)
- Simulates HVR operations for demonstration
- No HVR 6.0 installation required
- Useful for development, testing, and demos

#### Integrated Mode
- Connects to actual HVR 6.0 API
- Delegates operations to HVR 6.0
- Monitors HVR job status in real-time
- Retrieves actual logs and metrics

## Configuration

### Environment Variables

Configure HVR 6.0 connection in `.env`:

```bash
# HVR 6.0 API Configuration
HVR_API_BASE_URL=http://your-hvr-server:4340
HVR_API_USERNAME=admin
HVR_API_PASSWORD=your-password

# Enable integrated mode (set to 'true' to use real HVR)
HVR_INTEGRATED_MODE=false

# Server Configuration
PORT=3000
WS_PORT=3001
LOG_LEVEL=info
```

### Enabling Integrated Mode

To enable real HVR 6.0 integration:

1. Install and configure HVR 6.0 (see HVR 6.0 documentation)
2. Update `.env` with your HVR server details
3. Set `HVR_INTEGRATED_MODE=true`
4. Restart the application

```bash
npm start
```

## HVR 6.0 API Endpoints Used

The system integrates with the following HVR 6.0 API endpoints:

### Channel Management
- `GET /api/channels` - List all replication channels
- `GET /api/channels/{name}` - Get channel details
- `GET /api/channels/{name}/stats` - Get channel statistics

### Job Operations
- `POST /api/jobs/refresh` - Start initial data load (Refresh)
- `POST /api/jobs/capture` - Start change data capture (CDC)
- `POST /api/jobs/integrate` - Start data integration
- `POST /api/jobs/compare` - Start data comparison
- `GET /api/jobs/{id}` - Get job status
- `GET /api/jobs/{id}/logs` - Get job logs
- `POST /api/jobs/{id}/stop` - Stop a running job

### Location Management
- `GET /api/locations` - List connection definitions
- `POST /api/locations/{name}/test` - Test connection

## Agent Operations

### Refresh Agent
**Simulated Mode:**
- Simulates parallel table slicing
- Mock data processing with progress updates

**Integrated Mode:**
```typescript
// Calls HVR API: POST /api/jobs/refresh
await hvrClient.startRefresh(channelId, tables);
```

### CDC Agent
**Simulated Mode:**
- Simulates continuous change capture
- Generates random change events

**Integrated Mode:**
```typescript
// Calls HVR API: POST /api/jobs/capture
await hvrClient.startCapture(channelId);
```

### Integration Agent
**Simulated Mode:**
- Simulates batch processing
- Mock conflict resolution

**Integrated Mode:**
```typescript
// Calls HVR API: POST /api/jobs/integrate
await hvrClient.startIntegrate(channelId);
```

### Compare Agent
**Simulated Mode:**
- Simulates data comparison
- Random discrepancy generation

**Integrated Mode:**
```typescript
// Calls HVR API: POST /api/jobs/compare
await hvrClient.startCompare(channelId, tables);
```

## Prerequisites for HVR Integration

To use the integrated mode with actual HVR 6.0:

1. **HVR 6.0 Installation**: 
   - HVR 6.0 Hub installed and running
   - Web UI and REST API enabled (default port 4340)

2. **Network Access**:
   - Network connectivity to HVR Hub
   - Firewall rules allowing access to HVR API port

3. **Authentication**:
   - Valid HVR user credentials with appropriate permissions
   - Permissions for job management and monitoring

4. **Channel Configuration**:
   - At least one replication channel configured in HVR
   - Source and target locations defined
   - Tables selected for replication

## API Authentication

The HVR Client uses HTTP Basic Authentication:

```typescript
const client = axios.create({
  auth: {
    username: process.env.HVR_API_USERNAME,
    password: process.env.HVR_API_PASSWORD,
  },
});
```

## Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  await hvrClient.startRefresh(channelId);
} catch (error) {
  if (error.response?.status === 401) {
    // Authentication failed
  } else if (error.response?.status === 404) {
    // Channel not found
  } else if (error.code === 'ECONNREFUSED') {
    // HVR server not accessible
  }
}
```

## Monitoring Integration Status

Check HVR connectivity:

```bash
curl -u admin:password http://localhost:4340/api/health
```

Via the UI:
- Dashboard shows connection status
- Agent cards display "Connected to HVR 6.0" when integrated
- Error badges appear if HVR is unreachable

## Migration Path

### Current State (v1.0)
- Standalone simulation mode
- No HVR installation required
- Full UI and multi-agent architecture

### Upgrade to Integrated Mode
1. Install HVR 6.0
2. Configure channels and locations
3. Update `.env` configuration
4. Enable integrated mode
5. System automatically uses real HVR operations

### Benefits of Integration
- ✅ Real data replication using HVR's proven technology
- ✅ Support for all HVR source and target systems
- ✅ Production-grade CDC with minimal latency
- ✅ HVR's advanced features (compression, filtering, transformations)
- ✅ Enterprise-scale performance and reliability

## Supported HVR Features

When integrated with HVR 6.0, the system supports:

### Data Sources
- SAP (HANA, Oracle, DB2, MaxDB)
- Oracle
- SQL Server
- PostgreSQL
- MySQL
- DB2
- And 30+ other databases

### Targets
- Snowflake
- Amazon Redshift
- Google BigQuery
- Azure Synapse
- Databricks
- Amazon S3
- Azure Data Lake
- And more

### Replication Modes
- Initial Load (Refresh)
- Real-time CDC (Capture)
- Burst mode
- Continuous Apply (Integrate)

### Advanced Features
- Table-level parallelism
- Data filtering and transformations
- Bi-directional replication
- Conflict detection and resolution
- Column mapping and data masking
- Automatic schema evolution

## Troubleshooting

### HVR Not Connecting
1. Verify HVR Hub is running: `curl http://hvr-server:4340/api/health`
2. Check firewall rules
3. Verify credentials in `.env`
4. Review logs: `tail -f logs/combined.log`

### Authentication Errors
- Verify HVR_API_USERNAME and HVR_API_PASSWORD
- Check user permissions in HVR
- Ensure user has job management rights

### Job Failures
- Check HVR job logs via API or HVR UI
- Verify channel configuration
- Ensure source/target connectivity
- Review HVR error messages

## Example: Complete Workflow

```typescript
import { getHVRClient } from './hvr/HVRClient';

const hvr = getHVRClient();

// 1. Verify HVR is accessible
if (!await hvr.healthCheck()) {
  throw new Error('HVR is not accessible');
}

// 2. List available channels
const channels = await hvr.listChannels();
console.log('Available channels:', channels);

// 3. Start initial load
const refreshJob = await hvr.startRefresh('sap-to-snowflake', [
  'MARA',  // Material master
  'MAKT',  // Material descriptions
  'VBAK',  // Sales document header
]);

// 4. Monitor job progress
let status = await hvr.getJobStatus(refreshJob.id);
while (status.state === 'RUNNING') {
  await new Promise(r => setTimeout(r, 5000));
  status = await hvr.getJobStatus(refreshJob.id);
  console.log(`Progress: ${status.progress}%`);
}

// 5. Start CDC after initial load completes
if (status.state === 'COMPLETED') {
  await hvr.startCapture('sap-to-snowflake');
  await hvr.startIntegrate('sap-to-snowflake');
}
```

## Documentation References

- [HVR 6.0 Documentation](https://docs.fivetran.com/hvr6)
- [HVR REST API Reference](https://docs.fivetran.com/hvr6/api)
- [HVR Getting Started Guide](https://docs.fivetran.com/hvr6/getting-started)
- [SAP Integration Guide](https://docs.fivetran.com/hvr6/sources/sap)

## Support

For HVR 6.0 specific issues:
- Fivetran Support: https://support.fivetran.com
- HVR Community: https://community.fivetran.com

For this application:
- GitHub Issues: https://github.com/alvinjchua888/hvr6-client-agents/issues
