/**
 * SIMULATION MODE: Directory Hook
 * 
 * Returns simulated directory entries for UI testing.
 * Falls back to real data if available.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DIRECTORY_ENTRIES, type MockDirectoryEntry } from '@/data/mockSimulationData';
import type { DirectoryEntry, DirectoryFilters } from '@/hooks/useDirectory';

const SIMULATION_MODE = true;
const STORAGE_KEY = 'selfera_directory_filters';

const DEFAULT_FILTERS: DirectoryFilters = {
  search: '',
  region: 'all',
  deliveryType: 'all',
  priceRange: 'all',
  roleType: 'all',
  language: 'all',
  verifiedOnly: false,
};

const ROLE_TAG_MAP: Record<string, string[]> = {
  counsellor: ['Counsellor', 'Counselling', 'Counselor'],
  psychologist: ['Psychologist'],
  psychiatrist: ['Psychiatrist'],
  'social-worker': ['Social Worker'],
  'occupational-therapist': ['Occupational Therapist'],
  coach: ['Coach'],
  'peer-support': ['Peer Support'],
  wellbeing: ['Wellbeing', 'Non-Profit', 'Community'],
};

function loadPersistedFilters(): DirectoryFilters {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_FILTERS, ...parsed, search: '' };
    }
  } catch (e) {
    console.warn('Failed to load directory filters:', e);
  }
  return DEFAULT_FILTERS;
}

function persistFilters(filters: DirectoryFilters) {
  try {
    const { search, ...toStore } = filters;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.warn('Failed to save directory filters:', e);
  }
}

export function useSimulatedDirectory() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DirectoryFilters>(loadPersistedFilters);

  useEffect(() => {
    persistFilters(filters);
  }, [filters]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let fetchedEntries: DirectoryEntry[] = [];

      // Try real data first if not in simulation mode
      if (!SIMULATION_MODE) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, handle, avatar_url, user_type, is_verified, bio, country, email')
          .eq('is_verified', true)
          .in('user_type', ['professional', 'organization'])
          .order('display_name', { ascending: true });

        if (!profilesError && profilesData && profilesData.length > 0) {
          fetchedEntries = profilesData.map(profile => ({
            id: profile.id,
            name: profile.display_name || 'Unknown',
            description: profile.bio,
            regions_served: profile.country ? [profile.country] : null,
            delivery_type: null,
            price_range: null,
            languages_supported: null,
            tags: profile.user_type === 'professional' ? ['Practitioner'] : ['Organisation'],
            verified: profile.is_verified ?? false,
            links: null,
            owner_user_id: profile.id,
            owner_profile_id: profile.id,
            created_at: null,
            profile: {
              id: profile.id,
              display_name: profile.display_name,
              handle: profile.handle,
              avatar_url: profile.avatar_url,
              user_type: profile.user_type,
              is_verified: profile.is_verified ?? false,
              email: profile.email,
            },
          }));
        }
      }

      // Fall back to simulation data if no real data
      if (fetchedEntries.length === 0) {
        fetchedEntries = MOCK_DIRECTORY_ENTRIES.map(entry => ({
          ...entry,
          // Ensure type compatibility
          profile: entry.profile || null,
        }));
      }

      setEntries(fetchedEntries);
    } catch (err) {
      console.error('Error fetching directory entries:', err);
      // On error, use simulation data
      setEntries(MOCK_DIRECTORY_ENTRIES);
      setError(null); // Don't show error when we have fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Apply filters client-side
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (filters.verifiedOnly && !entry.verified) return false;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = entry.name.toLowerCase().includes(searchLower);
        const matchesDesc = entry.description?.toLowerCase().includes(searchLower);
        const matchesTags = entry.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      if (filters.region !== 'all') {
        const regions = entry.regions_served || [];
        const matchesRegion = regions.some(r => 
          r.toLowerCase() === filters.region.toLowerCase() || 
          r.toLowerCase() === 'global' ||
          r.toLowerCase() === 'online'
        );
        if (!matchesRegion) return false;
      }

      if (filters.deliveryType !== 'all') {
        if (entry.delivery_type !== filters.deliveryType) return false;
      }

      if (filters.priceRange !== 'all') {
        if (entry.price_range !== filters.priceRange) return false;
      }

      if (filters.roleType !== 'all') {
        const roleTags = ROLE_TAG_MAP[filters.roleType] || [];
        const entryTags = entry.tags || [];
        const matchesRole = entryTags.some(tag => 
          roleTags.some(roleTag => tag.toLowerCase().includes(roleTag.toLowerCase()))
        );
        if (!matchesRole) return false;
      }

      if (filters.language !== 'all') {
        const languages = entry.languages_supported || [];
        const matchesLang = languages.some(lang => 
          lang.toLowerCase() === filters.language.toLowerCase()
        );
        if (!matchesLang) return false;
      }

      return true;
    });
  }, [entries, filters]);

  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    entries.forEach(entry => {
      entry.regions_served?.forEach(r => {
        if (r !== 'Online' && r !== 'Global') regions.add(r);
      });
    });
    return Array.from(regions).sort();
  }, [entries]);

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    entries.forEach(entry => {
      entry.languages_supported?.forEach(l => languages.add(l));
    });
    return Array.from(languages).sort();
  }, [entries]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.region !== 'all' ||
      filters.deliveryType !== 'all' ||
      filters.priceRange !== 'all' ||
      filters.roleType !== 'all' ||
      filters.language !== 'all' ||
      filters.verifiedOnly
    );
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    entries: filteredEntries,
    allEntries: entries,
    loading,
    error,
    filters,
    setFilters,
    updateFilter: <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    clearFilters,
    hasActiveFilters,
    refresh: fetchEntries,
    availableRegions,
    availableLanguages,
    isSimulated: SIMULATION_MODE || entries.some(e => e.id.startsWith('mock-')),
  };
}
