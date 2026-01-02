# SAP Data Replication Step-by-Step Guide

This guide walks you through replicating data from SAP using the HVR 6.0 Client Agents system, providing the same workflow as the HVR UI.

## Overview

Replicating data from SAP involves these main steps:
1. Configure source (SAP) and target connections
2. Create a replication channel
3. Select tables to replicate
4. Perform initial data load (Refresh)
5. Start continuous replication (CDC)
6. Monitor and validate data

## Prerequisites

### For Standalone Mode (Demo/Testing)
- Node.js 18+ installed
- This application installed and running
- No HVR installation needed

### For Integrated Mode (Production)
- HVR 6.0 installed and configured
- SAP source system accessible
- Target system (Snowflake, Redshift, etc.) accessible
- Network connectivity between all systems

## Step-by-Step Instructions

### Step 1: Start the Application

```bash
# Install dependencies (first time only)
npm install
cd client && npm install && cd ..

# Start the application
npm run dev
```

The application starts on:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- WebSocket: http://localhost:3001

### Step 2: Configure Environment (For Integrated Mode)

If connecting to actual HVR 6.0, edit `.env`:

```bash
# HVR 6.0 Connection
HVR_API_BASE_URL=http://your-hvr-server:4340
HVR_API_USERNAME=admin
HVR_API_PASSWORD=your-password
HVR_INTEGRATED_MODE=true
```

Restart the application after changes.

### Step 3: Configure SAP Source Connection (In HVR)

**In HVR UI equivalent, you would:**
1. Go to Locations → New Location
2. Configure SAP connection details

**Using this system with HVR Integration:**

The system uses HVR's pre-configured locations. Ensure your SAP connection is configured in HVR:

```bash
# Via HVR UI or CLI, create SAP location:
# - Location name: SAP_PROD
# - Database: HANA (or Oracle, DB2, MaxDB)
# - Host: sap-server.company.com
# - Port: 30015 (for HANA)
# - Database name: PRD
# - User: HVRADMIN
# - Password: ********
```

**Required SAP Setup:**
- SAP user with replication permissions
- Archive logging enabled (for HANA)
- Log reader permissions configured
- Network access from HVR Hub to SAP

### Step 4: Configure Target Connection (In HVR)

**In HVR UI equivalent:**
1. Go to Locations → New Location
2. Configure target (Snowflake, Redshift, etc.)

**Using this system with HVR Integration:**

Configure target location in HVR:

```bash
# Example for Snowflake target:
# - Location name: SNOWFLAKE_DW
# - Type: Snowflake
# - Account: company.us-east-1
# - Warehouse: COMPUTE_WH
# - Database: ANALYTICS_DB
# - Schema: SAP_REPLICA
# - User: HVR_USER
# - Password: ********
```

### Step 5: Create Replication Channel

**Using the UI:**

1. **Navigate to Dashboard** (http://localhost:5173)
2. **Click "Create New Channel"** button (or via API)

**Using the API:**

```bash
# Create channel via HVR API (if integrated)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "SCHEDULE",
    "action": "create_channel",
    "parameters": {
      "channelName": "sap-to-snowflake",
      "sourceLocation": "SAP_PROD",
      "targetLocation": "SNOWFLAKE_DW",
      "description": "SAP Production to Snowflake DW"
    },
    "priority": 5
  }'
```

**In HVR UI equivalent:**
- Channels → New Channel
- Select source and target locations
- Name the channel

### Step 6: Select SAP Tables for Replication

**Common SAP Tables to Replicate:**

| Table | Description | Typical Size |
|-------|-------------|--------------|
| MARA | Material Master | Large |
| MAKT | Material Descriptions | Medium |
| VBAK | Sales Document Header | Large |
| VBAP | Sales Document Items | Very Large |
| KNA1 | Customer Master | Medium |
| LFA1 | Vendor Master | Medium |
| BKPF | Accounting Document Header | Very Large |
| BSEG | Accounting Document Segment | Very Large |
| EKKO | Purchase Order Header | Large |
| EKPO | Purchase Order Items | Very Large |

**Via the API:**

```bash
# Configure tables for the channel
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "SCHEDULE",
    "action": "configure_tables",
    "parameters": {
      "channelId": "sap-to-snowflake",
      "tables": [
        {
          "sourceSchema": "SAPSR3",
          "sourceTable": "MARA",
          "targetSchema": "SAP_REPLICA",
          "targetTable": "MARA"
        },
        {
          "sourceSchema": "SAPSR3",
          "sourceTable": "MAKT",
          "targetSchema": "SAP_REPLICA",
          "targetTable": "MAKT"
        },
        {
          "sourceSchema": "SAPSR3",
          "sourceTable": "VBAK",
          "targetSchema": "SAP_REPLICA",
          "targetTable": "VBAK"
        }
      ]
    },
    "priority": 5
  }'
```

**In HVR UI equivalent:**
- Select channel → Table Selection
- Browse SAP schemas
- Select tables to replicate
- Configure column mappings if needed

### Step 7: Perform Initial Data Load (Refresh)

This copies existing data from SAP to the target.

**Via the UI:**

1. Navigate to **Jobs** page
2. Click **"Submit New Task"**
3. Select:
   - Agent Type: **REFRESH**
   - Action: **refresh**
   - Channel ID: **sap-to-snowflake**
4. Configure tables in JSON:

```json
[
  {
    "sourceSchema": "SAPSR3",
    "sourceTable": "MARA",
    "targetSchema": "SAP_REPLICA",
    "targetTable": "MARA"
  },
  {
    "sourceSchema": "SAPSR3",
    "sourceTable": "MAKT",
    "targetSchema": "SAP_REPLICA",
    "targetTable": "MAKT"
  }
]
```

5. Click **"Submit Task"**

**Via the API:**

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
          "sourceSchema": "SAPSR3",
          "sourceTable": "MARA",
          "targetSchema": "SAP_REPLICA",
          "targetTable": "MARA"
        },
        {
          "sourceSchema": "SAPSR3",
          "sourceTable": "MAKT",
          "targetSchema": "SAP_REPLICA",
          "targetTable": "MAKT"
        }
      ],
      "estimatedRows": 5000000
    },
    "priority": 8
  }'
```

**Monitor Progress:**
- Go to **Jobs** page to see real-time progress
- Watch the progress bar and records processed
- View logs for detailed information

**In HVR UI equivalent:**
- Select channel → Initialize
- Choose "Refresh" (bulk load)
- Start the job
- Monitor in job dashboard

### Step 8: Start Change Data Capture (CDC)

After initial load completes, start CDC to capture ongoing changes.

**Via the UI:**

1. Navigate to **Jobs** page
2. Click **"Submit New Task"**
3. Select:
   - Agent Type: **CDC**
   - Action: **capture**
   - Channel ID: **sap-to-snowflake**
4. Click **"Submit Task"**

**Via the API:**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "CDC",
    "action": "capture",
    "parameters": {
      "channelId": "sap-to-snowflake",
      "mode": "continuous",
      "duration": 3600000
    },
    "priority": 7
  }'
```

**What CDC Does:**
- Monitors SAP transaction logs
- Captures INSERT, UPDATE, DELETE operations
- Queues changes for integration
- Minimal impact on SAP performance

**In HVR UI equivalent:**
- Select channel → Start Capture
- CDC runs continuously
- Monitor in job dashboard

### Step 9: Start Data Integration

Apply captured changes to the target.

**Via the UI:**

1. Navigate to **Jobs** page
2. Click **"Submit New Task"**
3. Select:
   - Agent Type: **INTEGRATE**
   - Action: **integrate**
   - Channel ID: **sap-to-snowflake**
4. Click **"Submit Task"**

**Via the API:**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "INTEGRATE",
    "action": "integrate",
    "parameters": {
      "channelId": "sap-to-snowflake",
      "batchSize": 1000,
      "mode": "continuous"
    },
    "priority": 7
  }'
```

**What Integration Does:**
- Reads captured changes from queue
- Applies changes to target in batches
- Handles conflicts and errors
- Maintains transaction consistency

**In HVR UI equivalent:**
- Select channel → Start Integrate
- Integration runs continuously
- Monitor apply rate and latency

### Step 10: Monitor Replication

**Via the Dashboard:**

1. Navigate to **Dashboard**
2. View system health metrics:
   - Active agents
   - Running jobs
   - CPU and memory usage

3. Navigate to **Agents** page:
   - See all 6 agent types
   - View individual agent metrics
   - Check task completion rates

4. Navigate to **Jobs** page:
   - Monitor active jobs
   - View progress and records processed
   - Check for errors or failures

**Via the API:**

```bash
# Get system health
curl http://localhost:3000/api/health

# Get all jobs
curl http://localhost:3000/api/jobs

# Get specific job details
curl http://localhost:3000/api/jobs/{job-id}
```

**Key Metrics to Monitor:**
- **Latency**: Time between change in SAP and apply to target
- **Throughput**: Records/second being replicated
- **Error Rate**: Failed transactions
- **Backlog**: Queued changes waiting to apply

**In HVR UI equivalent:**
- Channel dashboard shows these metrics
- Job monitor shows active jobs
- Alerts for errors or high latency

### Step 11: Validate Data (Optional)

Run comparison to verify data accuracy.

**Via the UI:**

1. Navigate to **Jobs** page
2. Click **"Submit New Task"**
3. Select:
   - Agent Type: **COMPARE**
   - Action: **compare**
   - Channel ID: **sap-to-snowflake**
4. Click **"Submit Task"**

**Via the API:**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "COMPARE",
    "action": "compare",
    "parameters": {
      "channelId": "sap-to-snowflake",
      "tables": [
        {
          "sourceSchema": "SAPSR3",
          "sourceTable": "MARA",
          "targetSchema": "SAP_REPLICA",
          "targetTable": "MARA"
        }
      ],
      "comparisonType": "checksum"
    },
    "priority": 5
  }'
```

**What Compare Does:**
- Compares source and target data
- Detects discrepancies
- Reports mismatches
- Validates row counts

**In HVR UI equivalent:**
- Select channel → Compare
- Choose tables and comparison type
- Review discrepancy report

## Complete Workflow Example

Here's a complete workflow for replicating SAP data:

```bash
#!/bin/bash
API_BASE="http://localhost:3000/api"
CHANNEL="sap-to-snowflake"

echo "Step 1: Initial Data Load (Refresh)"
curl -X POST $API_BASE/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "REFRESH",
    "action": "refresh",
    "parameters": {
      "channelId": "'$CHANNEL'",
      "tables": [
        {"sourceSchema": "SAPSR3", "sourceTable": "MARA", "targetSchema": "SAP_REPLICA", "targetTable": "MARA"},
        {"sourceSchema": "SAPSR3", "sourceTable": "MAKT", "targetSchema": "SAP_REPLICA", "targetTable": "MAKT"}
      ],
      "estimatedRows": 5000000
    },
    "priority": 8
  }'

echo "Step 2: Wait for refresh to complete (check Jobs page)"
sleep 300

echo "Step 3: Start CDC"
curl -X POST $API_BASE/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "CDC",
    "action": "capture",
    "parameters": {
      "channelId": "'$CHANNEL'",
      "mode": "continuous"
    },
    "priority": 7
  }'

echo "Step 4: Start Integration"
curl -X POST $API_BASE/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "INTEGRATE",
    "action": "integrate",
    "parameters": {
      "channelId": "'$CHANNEL'",
      "mode": "continuous"
    },
    "priority": 7
  }'

echo "Replication started! Monitor at http://localhost:5173"
```

## Troubleshooting

### Issue: "No jobs found"
**Solution:** Submit a task through the Jobs page or API

### Issue: Job fails immediately
**Solution:** 
- Check HVR connectivity (if in integrated mode)
- Verify channel exists in HVR
- Check source/target connections
- Review logs in the job details

### Issue: Slow replication
**Solution:**
- Check network bandwidth
- Increase batch size in integration
- Add more agent instances
- Check SAP database load

### Issue: Data discrepancies
**Solution:**
- Run Compare job to identify issues
- Check for failed transactions in logs
- Verify data type mappings
- Review transformation rules

## Comparison with HVR UI

| HVR UI | This System (UI) | This System (API) |
|--------|------------------|-------------------|
| Locations → New | Pre-configured in HVR | Pre-configured in HVR |
| Channels → New | Dashboard → Create Channel | POST /api/tasks (SCHEDULE agent) |
| Channel → Initialize → Refresh | Jobs → Submit Task (REFRESH) | POST /api/tasks (REFRESH agent) |
| Channel → Start Capture | Jobs → Submit Task (CDC) | POST /api/tasks (CDC agent) |
| Channel → Start Integrate | Jobs → Submit Task (INTEGRATE) | POST /api/tasks (INTEGRATE agent) |
| Channel → Compare | Jobs → Submit Task (COMPARE) | POST /api/tasks (COMPARE agent) |
| Job Monitor | Jobs page | GET /api/jobs |
| Channel Dashboard | Dashboard page | GET /api/health |

## Next Steps

After setting up basic replication:

1. **Configure Filters**: Add WHERE clauses to replicate subsets
2. **Set Up Transformations**: Map and transform data during replication
3. **Configure Alerting**: Set up Monitor agent for health checks
4. **Schedule Jobs**: Use Schedule agent for automated workflows
5. **Optimize Performance**: Tune batch sizes and parallelism
6. **Add More Tables**: Expand replication to additional tables

## Additional Resources

- [HVR_INTEGRATION.md](./HVR_INTEGRATION.md) - Complete HVR integration guide
- [README.md](./README.md) - Application setup and configuration
- [Fivetran HVR Documentation](https://docs.fivetran.com/hvr6)
- [SAP Integration Guide](https://docs.fivetran.com/hvr6/sources/sap)

## Support

For issues with:
- **This application**: Open a GitHub issue
- **HVR 6.0**: Contact Fivetran Support
- **SAP connectivity**: Consult SAP administrator
