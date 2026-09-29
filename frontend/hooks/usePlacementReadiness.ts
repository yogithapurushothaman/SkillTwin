'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlacementReadinessResponse } from '@/types';
import { apiService } from '@/services/api';

export function usePlacementReadiness(studentId?: number | null) {
  const [readiness, setReadiness] = useState<PlacementReadinessResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadiness = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPlacementReadiness(studentId);
      setReadiness(data);
    } catch (err: any) {
      console.error('Failed to load placement readiness:', err);
      setError(err.message || 'Failed to load placement readiness');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  return {
    readiness,
    loading,
    error,
    refreshReadiness: fetchReadiness
  };
}
