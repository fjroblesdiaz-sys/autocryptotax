/**
 * Report Request Service
 * Handles all API interactions for report requests
 */

import { DataSourceType, ReportType } from '../types/reports.types';

export interface ReportRequestData {
  id: string;
  createdAt: string;
  updatedAt: string;
  dataSource?: DataSourceType;
  sourceData?: any;
  reportType?: ReportType;
  fiscalYear?: number;
  status: 'draft' | 'processing' | 'completed' | 'error';
  generatedReport?: any;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  fileFormat?: string;
  taxpayerNif?: string;
  taxpayerName?: string;
  taxpayerSurname?: string;
  errorMessage?: string;
  totalTransactions?: number;
  totalGains?: number;
  totalLosses?: number;
  netResult?: number;
}

export interface CreateReportRequestInput {
  dataSource?: DataSourceType;
  sourceData?: any;
  reportType?: ReportType;
  fiscalYear?: number;
  taxpayerNif?: string;
  taxpayerName?: string;
  taxpayerSurname?: string;
}

export interface UpdateReportRequestInput {
  dataSource?: DataSourceType;
  sourceData?: any;
  reportType?: ReportType;
  fiscalYear?: number;
  taxpayerNif?: string;
  taxpayerName?: string;
  taxpayerSurname?: string;
  status?: 'draft' | 'processing' | 'completed' | 'error';
}

/**
 * Create a new report request
 */
export async function createReportRequest(
  data: CreateReportRequestInput
): Promise<ReportRequestData> {
  const response = await fetch('/api/report-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create report request');
  }

  const result = await response.json();
  return result.reportRequest;
}

/**
 * Get a specific report request by ID
 */
export async function getReportRequest(id: string): Promise<ReportRequestData> {
  const response = await fetch(`/api/report-requests/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch report request');
  }

  const result = await response.json();
  return result.reportRequest;
}

/**
 * Update a report request
 */
export async function updateReportRequest(
  id: string,
  data: UpdateReportRequestInput
): Promise<ReportRequestData> {
  const response = await fetch(`/api/report-requests/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update report request');
  }

  const result = await response.json();
  return result.reportRequest;
}

/**
 * Delete a report request
 */
export async function deleteReportRequest(id: string): Promise<void> {
  const response = await fetch(`/api/report-requests/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete report request');
  }
}

/**
 * Get all report requests
 */
export async function getAllReportRequests(
  limit = 10,
  status?: string
): Promise<ReportRequestData[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(status && { status }),
  });

  const response = await fetch(`/api/report-requests?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch report requests');
  }

  const result = await response.json();
  return result.reportRequests;
}

/**
 * Poll a report request until it's completed or errored
 * @param id - Report request ID
 * @param intervalMs - Polling interval in milliseconds (default: 2000)
 * @param timeoutMs - Timeout in milliseconds (default: 60000)
 */
export async function pollReportRequest(
  id: string,
  intervalMs = 2000,
  timeoutMs = 60000
): Promise<ReportRequestData> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const reportRequest = await getReportRequest(id);

        // Check if completed or errored
        if (reportRequest.status === 'completed') {
          resolve(reportRequest);
          return;
        }

        if (reportRequest.status === 'error') {
          reject(new Error(reportRequest.errorMessage || 'Report generation failed'));
          return;
        }

        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Report generation timeout'));
          return;
        }

        // Continue polling
        setTimeout(poll, intervalMs);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

