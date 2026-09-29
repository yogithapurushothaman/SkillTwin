'use client';

import { useState, useEffect, useCallback } from 'react';
import { CandidateMatchItem, IndustryRole } from '@/types';
import { apiService } from '@/services/api';

export function useIndustryMatching() {
  const [blueprints, setBlueprints] = useState<IndustryRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatchItem[]>([]);
  const [minMatch, setMinMatch] = useState<number>(0);
  const [minReadiness, setMinReadiness] = useState<number>(0);
  const [department, setDepartment] = useState<string>('All');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        const roles = await apiService.getBlueprints();
        setBlueprints(roles);
        if (roles.length > 0) {
          setSelectedRoleId(roles[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load roles:', err);
      }
    }
    loadRoles();
  }, []);

  const fetchCandidates = useCallback(async () => {
    if (!selectedRoleId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCandidatesForRole({
        role_id: selectedRoleId,
        min_match_score: minMatch,
        min_readiness_score: minReadiness,
        department: department !== 'All' ? department : undefined
      });
      setCandidates(data);
    } catch (err: any) {
      console.error('Failed to load matched candidates:', err);
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId, minMatch, minReadiness, department]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const toggleShortlist = async (studentId: number) => {
    if (!selectedRoleId) return;
    try {
      const res = await apiService.toggleShortlist(selectedRoleId, studentId);
      setCandidates(prev =>
        prev.map(c => (c.student_id === studentId ? { ...c, is_shortlisted: res.is_shortlisted } : c))
      );
      if (selectedCandidate && selectedCandidate.student_id === studentId) {
        setSelectedCandidate(prev => prev ? { ...prev, is_shortlisted: res.is_shortlisted } : null);
      }
    } catch (err: any) {
      console.error('Failed to toggle shortlist:', err);
    }
  };

  return {
    blueprints,
    selectedRoleId,
    setSelectedRoleId,
    candidates,
    minMatch,
    setMinMatch,
    minReadiness,
    setMinReadiness,
    department,
    setDepartment,
    selectedCandidate,
    setSelectedCandidate,
    loading,
    error,
    toggleShortlist,
    refreshCandidates: fetchCandidates
  };
}
