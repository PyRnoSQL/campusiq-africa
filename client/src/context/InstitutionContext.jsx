import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { getTypeConfig } from '../config/institutionTypes';

const InstitutionContext = createContext(null);

function authHeaders() {
  const token = localStorage.getItem('campusiq_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function InstitutionProvider({ children }) {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [activeId, setActiveId] = useState(() => localStorage.getItem('campusiq_active_institution') || null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/institutions', { headers: authHeaders() });
      const list = res.data.data || [];
      setInstitutions(list);
      // Non-SuperAdmin is always scoped to their own institution.
      if (user.role !== 'SuperAdmin') {
        setActiveId(user.institution_id);
      } else if (!activeId && list.length > 0) {
        setActiveId(list[0].id);
      }
    } catch (err) {
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  function switchInstitution(id) {
    setActiveId(id);
    localStorage.setItem('campusiq_active_institution', id);
  }

  const active = institutions.find((i) => i.id === activeId) || null;
  const typeConfig = getTypeConfig(active?.type);

  return (
    <InstitutionContext.Provider value={{ institutions, active, activeId, switchInstitution, typeConfig, loading, refresh }}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  return useContext(InstitutionContext);
}
