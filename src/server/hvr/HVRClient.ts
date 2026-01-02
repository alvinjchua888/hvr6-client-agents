import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

/**
 * HVR 6.0 API Client
 * Provides integration with Fivetran's HVR 6.0 REST API
 * 
 * API Documentation: https://docs.fivetran.com/hvr6/api
 */
export class HVRClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(baseUrl?: string, username?: string, password?: string) {
    this.baseUrl = baseUrl || process.env.HVR_API_BASE_URL || 'http://localhost:4340';
    this.username = username || process.env.HVR_API_USERNAME || 'admin';
    this.password = password || process.env.HVR_API_PASSWORD || '';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.username,
        password: this.password,
      },
    });

    logger.info(`HVR Client initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Check if HVR API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.status === 200;
    } catch (error) {
      logger.warn('HVR API health check failed:', error);
      return false;
    }
  }

  /**
   * List all channels (replication channels)
   */
  async listChannels(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/channels');
      return response.data;
    } catch (error) {
      logger.error('Failed to list HVR channels:', error);
      throw error;
    }
  }

  /**
   * Get channel details
   */
  async getChannel(channelName: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/channels/${channelName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get HVR channel ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Start a refresh (initial load) job
   */
  async startRefresh(channelName: string, tables?: string[]): Promise<any> {
    try {
      const payload: any = {
        channel: channelName,
        mode: 'refresh',
      };
      
      if (tables && tables.length > 0) {
        payload.tables = tables;
      }

      const response = await this.client.post('/api/jobs/refresh', payload);
      logger.info(`Started refresh job for channel ${channelName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to start refresh for channel ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Start CDC (Change Data Capture)
   */
  async startCapture(channelName: string): Promise<any> {
    try {
      const response = await this.client.post('/api/jobs/capture', {
        channel: channelName,
        mode: 'continuous',
      });
      logger.info(`Started CDC for channel ${channelName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to start CDC for channel ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Start integration (apply changes to target)
   */
  async startIntegrate(channelName: string): Promise<any> {
    try {
      const response = await this.client.post('/api/jobs/integrate', {
        channel: channelName,
      });
      logger.info(`Started integration for channel ${channelName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to start integration for channel ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Compare source and target data
   */
  async startCompare(channelName: string, tables?: string[]): Promise<any> {
    try {
      const payload: any = {
        channel: channelName,
      };
      
      if (tables && tables.length > 0) {
        payload.tables = tables;
      }

      const response = await this.client.post('/api/jobs/compare', payload);
      logger.info(`Started comparison for channel ${channelName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to start comparison for channel ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get job status for ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get job logs
   */
  async getJobLogs(jobId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/jobs/${jobId}/logs`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get job logs for ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Stop a running job
   */
  async stopJob(jobId: string): Promise<any> {
    try {
      const response = await this.client.post(`/api/jobs/${jobId}/stop`);
      logger.info(`Stopped job ${jobId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to stop job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channelName: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/channels/${channelName}/stats`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get stats for channel ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * List locations (connection definitions)
   */
  async listLocations(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/locations');
      return response.data;
    } catch (error) {
      logger.error('Failed to list HVR locations:', error);
      throw error;
    }
  }

  /**
   * Test location connection
   */
  async testLocation(locationName: string): Promise<any> {
    try {
      const response = await this.client.post(`/api/locations/${locationName}/test`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to test location ${locationName}:`, error);
      throw error;
    }
  }
}

// Singleton instance
let hvrClientInstance: HVRClient | null = null;

/**
 * Get or create HVR client instance
 */
export function getHVRClient(): HVRClient {
  if (!hvrClientInstance) {
    hvrClientInstance = new HVRClient();
  }
  return hvrClientInstance;
}
