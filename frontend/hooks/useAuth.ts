'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { apiService } from '@/services/api';

export function useAuth() {
  const [personas, setPersonas] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPersonas() {
      try {
        setLoading(true);
        const data = await apiService.getPersonas();
        setPersonas(data);
        // Default to student persona (Aarav Sharma)
        const defaultStudent = data.find(u => u.role === 'student') || data[0];
        setCurrentUser(defaultStudent || null);
      } catch (err: any) {
        console.error('Failed to load personas', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPersonas();
  }, []);

  const switchPersona = (userId: number) => {
    const selected = personas.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const switchRole = (role: UserRole) => {
    const matching = personas.find(u => u.role === role);
    if (matching) {
      setCurrentUser(matching);
    }
  };

  return {
    personas,
    currentUser,
    loading,
    error,
    switchPersona,
    switchRole
  };
}
