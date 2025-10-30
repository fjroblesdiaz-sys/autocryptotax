/**
 * useReportRequest Hook
 * React hook for managing report requests
 */

import { useState, useEffect } from 'react';
import {
  ReportRequestData,
  CreateReportRequestInput,
  UpdateReportRequestInput,
  createReportRequest,
  getReportRequest,
  updateReportRequest,
  pollReportRequest,
} from '../services/report-request.service';

export interface UseReportRequestResult {
  reportRequest: ReportRequestData | null;
  isLoading: boolean;
  error: string | null;
  create: (data: CreateReportRequestInput) => Promise<ReportRequestData>;
  update: (data: UpdateReportRequestInput) => Promise<ReportRequestData>;
  refresh: () => Promise<void>;
  poll: () => Promise<ReportRequestData>;
  reset: () => void;
}

/**
 * Hook to manage a single report request
 */
export function useReportRequest(initialId?: string): UseReportRequestResult {
  const [reportRequest, setReportRequest] = useState<ReportRequestData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial report request if ID is provided
  useEffect(() => {
    if (initialId) {
      loadReportRequest(initialId);
    }
  }, [initialId]);

  const loadReportRequest = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReportRequest(id);
      setReportRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report request');
    } finally {
      setIsLoading(false);
    }
  };

  const create = async (data: CreateReportRequestInput): Promise<ReportRequestData> => {
    setIsLoading(true);
    setError(null);
    try {
      const newReportRequest = await createReportRequest(data);
      setReportRequest(newReportRequest);
      return newReportRequest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report request';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (data: UpdateReportRequestInput): Promise<ReportRequestData> => {
    if (!reportRequest?.id) {
      throw new Error('No report request to update');
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedReportRequest = await updateReportRequest(reportRequest.id, data);
      setReportRequest(updatedReportRequest);
      return updatedReportRequest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update report request';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async (): Promise<void> => {
    if (!reportRequest?.id) {
      throw new Error('No report request to refresh');
    }
    await loadReportRequest(reportRequest.id);
  };

  const poll = async (): Promise<ReportRequestData> => {
    if (!reportRequest?.id) {
      throw new Error('No report request to poll');
    }

    setIsLoading(true);
    setError(null);
    try {
      const completedReportRequest = await pollReportRequest(reportRequest.id);
      setReportRequest(completedReportRequest);
      return completedReportRequest;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to poll report request';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setReportRequest(null);
    setIsLoading(false);
    setError(null);
  };

  return {
    reportRequest,
    isLoading,
    error,
    create,
    update,
    refresh,
    poll,
    reset,
  };
}

