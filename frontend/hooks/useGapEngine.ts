'use client';

import { useState, useEffect, useCallback } from 'react';
import { IndustryRole, RoleMatchResponse } from '@/types';
import { apiService } from '@/services/api';

export function useGapEngine(studentId?: number | null) {
  const [blueprints, setBlueprints] = useState<IndustryRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [matchResult, setMatchResult] = useState<RoleMatchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load Blueprints
  useEffect(() => {
    async function loadRoles() {
      try {
        const roles = await apiService.getBlueprints();
        setBlueprints(roles);
        if (roles.length > 0 && !selectedRoleId) {
          // Default to Software Developer Intern (FR-15)
          const swIntern = roles.find(r => r.title.toLowerCase().includes('intern')) || roles[0];
          setSelectedRoleId(swIntern.id);
        }
      } catch (err: any) {
        console.error('Failed to load blueprints:', err);
      }
    }
    loadRoles();
  }, [selectedRoleId]);

  // Evaluate Gap whenever studentId or selectedRoleId changes
  const evaluateCurrentGap = useCallback(async () => {
    if (!studentId || !selectedRoleId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.evaluateGap(studentId, selectedRoleId);
      setMatchResult(res);
    } catch (err: any) {
      console.error('Failed to evaluate skill gap:', err);
      setError(err.message || 'Failed to evaluate skill gap');
    } finally {
      setLoading(false);
    }
  }, [studentId, selectedRoleId]);

  useEffect(() => {
    evaluateCurrentGap();
  }, [evaluateCurrentGap]);

  const selectRole = (roleId: number) => {
    setSelectedRoleId(roleId);
  };

  return {
    blueprints,
    selectedRoleId,
    selectedRole: blueprints.find(b => b.id === selectedRoleId) || null,
    matchResult,
    loading,
    error,
    selectRole,
    refreshGap: evaluateCurrentGap
  };
}
