'use client';

import { useState, useEffect, useCallback } from 'react';
import { BatchAnalyticsResponse } from '@/types';
import { apiService } from '@/services/api';

export function useInstitutionAnalytics() {
  const [analytics, setAnalytics] = useState<BatchAnalyticsResponse | null>(null);
  const [department, setDepartment] = useState<string>('All');
  const [year, setYear] = useState<number>(0);
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBatchAnalytics({
        department: department !== 'All' ? department : undefined,
        year: year !== 0 ? year : undefined,
        role_id: roleId
      });
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load institution batch analytics:', err);
      setError(err.message || 'Failed to load institution analytics');
    } finally {
      setLoading(false);
    }
  }, [department, year, roleId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    department,
    setDepartment,
    year,
    setYear,
    roleId,
    setRoleId,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
}
