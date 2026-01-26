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

// Re-export from simulated version for simulation mode
export { useSimulatedDirectory as useDirectory } from './useSimulatedDirectory';
