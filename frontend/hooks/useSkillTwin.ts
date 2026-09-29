'use client';

import { useState, useEffect, useCallback } from 'react';
import { Student, SkillDNAResponse, SkillHistoryResponse } from '@/types';
import { apiService } from '@/services/api';

export function useSkillTwin(studentId?: number | null) {
  const [student, setStudent] = useState<Student | null>(null);
  const [dna, setDna] = useState<SkillDNAResponse | null>(null);
  const [history, setHistory] = useState<SkillHistoryResponse | null>(null);
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkillTwinData = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      setError(null);
      const [studentData, dnaData, historyData, internshipData] = await Promise.all([
        apiService.getStudent(studentId),
        apiService.getSkillDna(studentId),
        apiService.getSkillHistory(studentId),
        apiService.getInternships(studentId)
      ]);
      setStudent(studentData);
      setDna(dnaData);
      setHistory(historyData);
      setInternships(internshipData);
    } catch (err: any) {
      console.error('Failed to load SkillTwin profile:', err);
      setError(err.message || 'Failed to load SkillTwin profile');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchSkillTwinData();
  }, [fetchSkillTwinData]);

  return {
    student,
    dna,
    history,
    internships,
    loading,
    error,
    refreshSkillTwin: fetchSkillTwinData
  };
}
