import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'selfera_directory_filters';

export interface DirectoryEntry {
  id: string;
  name: string;
  description: string | null;
  regions_served: string[] | null;
  delivery_type: string | null;
  price_range: string | null;
  languages_supported: string[] | null;
  tags: string[] | null;
  verified: boolean;
  links: { website?: string } | null;
  owner_user_id: string;
  owner_profile_id: string | null;
  created_at: string | null;
  // Joined profile data
  profile?: {
    id: string;
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
    user_type: string | null;
    is_verified: boolean;
    email: string | null;
  } | null;
}

export interface DirectoryFilters {
  search: string;
  region: string;
  deliveryType: string;
  priceRange: string;
  roleType: string;
  language: string;
  verifiedOnly: boolean;
}

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

// Load filters from localStorage
function loadPersistedFilters(): DirectoryFilters {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle any new filter keys
      return { ...DEFAULT_FILTERS, ...parsed, search: '' }; // Always reset search
    }
  } catch (e) {
    console.warn('Failed to load directory filters:', e);
  }
  return DEFAULT_FILTERS;
}

// Save filters to localStorage
function persistFilters(filters: DirectoryFilters) {
  try {
    // Don't persist search query
    const { search, ...toStore } = filters;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.warn('Failed to save directory filters:', e);
  }
}

export function useDirectory() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from localStorage
  const [filters, setFilters] = useState<DirectoryFilters>(loadPersistedFilters);

  // Persist filters whenever they change (except search)
  useEffect(() => {
    persistFilters(filters);
  }, [filters]);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Phase C: Directory now shows verified SelfERA users only (profiles with is_verified=true)
      // Filter to verified profiles with user_type in (professional, organization)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_url, user_type, is_verified, bio, country, email')
        .eq('is_verified', true)
        .in('user_type', ['professional', 'organization'])
        .order('display_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Transform profiles into DirectoryEntry format
      const typedEntries: DirectoryEntry[] = (profilesData || []).map(profile => ({
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

      setEntries(typedEntries);
    } catch (err) {
      console.error('Error fetching directory entries:', err);
      setError('Failed to load directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Apply filters client-side for responsiveness
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Verified filter
      if (filters.verifiedOnly && !entry.verified) return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = entry.name.toLowerCase().includes(searchLower);
        const matchesDesc = entry.description?.toLowerCase().includes(searchLower);
        const matchesTags = entry.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      // Region filter
      if (filters.region !== 'all') {
        const regions = entry.regions_served || [];
        const matchesRegion = regions.some(r => 
          r.toLowerCase() === filters.region.toLowerCase() || 
          r.toLowerCase() === 'global' ||
          r.toLowerCase() === 'online'
        );
        if (!matchesRegion) return false;
      }

      // Delivery type filter
      if (filters.deliveryType !== 'all') {
        if (entry.delivery_type !== filters.deliveryType) return false;
      }

      // Price range filter
      if (filters.priceRange !== 'all') {
        if (entry.price_range !== filters.priceRange) return false;
      }

      // Role type filter
      if (filters.roleType !== 'all') {
        const roleTags = ROLE_TAG_MAP[filters.roleType] || [];
        const entryTags = entry.tags || [];
        const matchesRole = entryTags.some(tag => 
          roleTags.some(roleTag => tag.toLowerCase().includes(roleTag.toLowerCase()))
        );
        if (!matchesRole) return false;
      }

      // Language filter
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

  // Get unique values for filter dropdowns
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

  // Check if any filters are active
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

  // Clear all filters
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
  };
}
