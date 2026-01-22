import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'moderator' | 'user';

export function useAdminRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsModerator(false);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = (data || []).map(r => r.role as AppRole);
        setRoles(userRoles);
        setIsAdmin(userRoles.includes('admin'));
        setIsModerator(userRoles.includes('moderator') || userRoles.includes('admin'));
      } catch (error) {
        console.error('Failed to fetch user roles:', error);
        setIsAdmin(false);
        setIsModerator(false);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  return { isAdmin, isModerator, roles, isLoading };
}
