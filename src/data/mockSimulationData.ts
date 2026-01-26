/**
 * SIMULATION MODE DATA
 * 
 * This file contains all mock/simulated data for the SelfERA platform.
 * Used when real database records don't exist or for testing workflows.
 * 
 * IMPORTANT: This is intentionally NOT production data.
 * All features should gracefully fall back to this data.
 */

import type { SubscriptionPlan, BillingPeriod, SubscriptionStatus } from '@/hooks/useSubscription';

// =============================================================================
// SUBSCRIPTION SIMULATION
// =============================================================================

export interface MockSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_period: BillingPeriod | null;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier_colour: 'pink' | 'green' | 'blue' | 'purple' | 'orange' | null;
  amount_due: number;
  subscriber_count: number;
  created_at: string;
  updated_at: string;
}

// Different subscription scenarios for testing
export const MOCK_SUBSCRIPTIONS: Record<string, MockSubscription> = {
  free: {
    id: 'mock-sub-free',
    user_id: 'mock-user',
    plan: 'free',
    status: 'active',
    billing_period: null,
    current_period_start: null,
    current_period_end: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    tier_colour: null,
    amount_due: 0,
    subscriber_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  creator: {
    id: 'mock-sub-creator',
    user_id: 'mock-user',
    plan: 'creator',
    status: 'active',
    billing_period: 'monthly',
    current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    stripe_customer_id: 'cus_mock_creator',
    stripe_subscription_id: 'sub_mock_creator',
    tier_colour: 'pink',
    amount_due: 9,
    subscriber_count: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  professional: {
    id: 'mock-sub-professional',
    user_id: 'mock-user',
    plan: 'professional',
    status: 'active',
    billing_period: 'monthly',
    current_period_start: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    current_period_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    stripe_customer_id: 'cus_mock_pro',
    stripe_subscription_id: 'sub_mock_pro',
    tier_colour: 'green',
    amount_due: 29,
    subscriber_count: 2500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  organization: {
    id: 'mock-sub-org',
    user_id: 'mock-user',
    plan: 'organization',
    status: 'active',
    billing_period: 'yearly',
    current_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    current_period_end: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
    stripe_customer_id: 'cus_mock_org',
    stripe_subscription_id: 'sub_mock_org',
    tier_colour: 'blue',
    amount_due: 699,
    subscriber_count: 125000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  past_due: {
    id: 'mock-sub-past-due',
    user_id: 'mock-user',
    plan: 'professional',
    status: 'past_due',
    billing_period: 'monthly',
    current_period_start: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    current_period_end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    stripe_customer_id: 'cus_mock_pastdue',
    stripe_subscription_id: 'sub_mock_pastdue',
    tier_colour: 'green',
    amount_due: 29,
    subscriber_count: 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Default simulation subscription (professional plan for rich UI testing)
export const DEFAULT_MOCK_SUBSCRIPTION = MOCK_SUBSCRIPTIONS.professional;

// =============================================================================
// VERIFICATION SIMULATION
// =============================================================================

export interface MockVerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  account_type_requested: string;
  submitted_fields: {
    display_name?: string;
    country?: string;
    credentials_summary?: string;
    registration_number?: string;
    website?: string;
    proof_url?: string;
    terms_accepted?: boolean;
  } | null;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export const MOCK_VERIFICATION_REQUESTS: Record<string, MockVerificationRequest> = {
  none: {
    id: '',
    user_id: '',
    status: 'pending',
    account_type_requested: '',
    submitted_fields: null,
    created_at: '',
  },
  pending: {
    id: 'mock-ver-pending',
    user_id: 'mock-user',
    status: 'pending',
    account_type_requested: 'professional',
    submitted_fields: {
      display_name: 'Dr. Sarah Chen',
      country: 'Australia',
      credentials_summary: 'Licensed Clinical Psychologist with 10+ years experience',
      registration_number: 'PSY-2024-12345',
      website: 'https://drsarahchen.com',
      terms_accepted: true,
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  approved: {
    id: 'mock-ver-approved',
    user_id: 'mock-user',
    status: 'approved',
    account_type_requested: 'professional',
    submitted_fields: {
      display_name: 'Dr. Sarah Chen',
      country: 'Australia',
      credentials_summary: 'Licensed Clinical Psychologist',
      terms_accepted: true,
    },
    admin_notes: 'Credentials verified. Welcome to ERA Verified!',
    reviewed_by: 'admin-user',
    reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  rejected: {
    id: 'mock-ver-rejected',
    user_id: 'mock-user',
    status: 'rejected',
    account_type_requested: 'organization',
    submitted_fields: {
      display_name: 'Wellness Corp',
      country: 'USA',
      credentials_summary: 'Mental health startup',
      terms_accepted: true,
    },
    admin_notes: 'Unable to verify organization registration. Please provide additional documentation.',
    reviewed_by: 'admin-user',
    reviewed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

// Default: show approved status for rich UI
export const DEFAULT_MOCK_VERIFICATION = MOCK_VERIFICATION_REQUESTS.approved;

// =============================================================================
// INTERACTIONS SIMULATION
// =============================================================================

export interface MockInteraction {
  id: string;
  client_user_id: string;
  provider_user_id: string;
  provider_tier_price: number;
  client_base_price: number;
  amount_due: number;
  status: 'draft' | 'requested' | 'accepted' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
  notes: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  // Joined data for display
  client?: {
    id: string;
    display_name: string;
    handle: string;
    avatar_url: string;
  };
  provider?: {
    id: string;
    display_name: string;
    handle: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export const MOCK_INTERACTIONS: MockInteraction[] = [
  {
    id: 'mock-int-1',
    client_user_id: 'mock-client-1',
    provider_user_id: 'mock-user',
    provider_tier_price: 54.99,
    client_base_price: 24.99,
    amount_due: 30.00,
    status: 'requested',
    notes: 'Looking for guidance on anxiety management techniques.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    client: {
      id: 'mock-client-1',
      display_name: 'Alex Johnson',
      handle: 'alexj',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    },
  },
  {
    id: 'mock-int-2',
    client_user_id: 'mock-client-2',
    provider_user_id: 'mock-user',
    provider_tier_price: 54.99,
    client_base_price: 24.99,
    amount_due: 30.00,
    status: 'confirmed',
    notes: 'Follow-up session for mindfulness coaching.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    client: {
      id: 'mock-client-2',
      display_name: 'Jamie Lee',
      handle: 'jamielee',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    },
  },
  {
    id: 'mock-int-3',
    client_user_id: 'mock-client-3',
    provider_user_id: 'mock-user',
    provider_tier_price: 54.99,
    client_base_price: 24.99,
    amount_due: 30.00,
    status: 'completed',
    notes: 'Initial consultation completed successfully.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: 'mock-client-3',
      display_name: 'Morgan Taylor',
      handle: 'morgant',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
  },
  {
    id: 'mock-int-4',
    client_user_id: 'mock-user',
    provider_user_id: 'mock-provider-1',
    provider_tier_price: 84.99,
    client_base_price: 24.99,
    amount_due: 60.00,
    status: 'accepted',
    notes: 'Career coaching session.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'mock-provider-1',
      display_name: 'Dr. Emily Stone',
      handle: 'dremily',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      is_verified: true,
    },
  },
];

// =============================================================================
// DIRECTORY SIMULATION
// =============================================================================

export interface MockDirectoryEntry {
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
  profile: {
    id: string;
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
    user_type: string | null;
    is_verified: boolean;
    email: string | null;
  };
}

export const MOCK_DIRECTORY_ENTRIES: MockDirectoryEntry[] = [
  {
    id: 'mock-dir-1',
    name: 'Dr. Sarah Chen',
    description: 'Licensed Clinical Psychologist specializing in anxiety, depression, and trauma recovery. 10+ years of experience with evidence-based therapies.',
    regions_served: ['Australia', 'Online'],
    delivery_type: 'hybrid',
    price_range: 'premium',
    languages_supported: ['English', 'Mandarin'],
    tags: ['Psychologist', 'Anxiety', 'Depression', 'Trauma'],
    verified: true,
    links: { website: 'https://drsarahchen.com' },
    owner_user_id: 'mock-provider-sarah',
    owner_profile_id: 'mock-provider-sarah',
    created_at: new Date().toISOString(),
    profile: {
      id: 'mock-provider-sarah',
      display_name: 'Dr. Sarah Chen',
      handle: 'drsarahchen',
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
      user_type: 'professional',
      is_verified: true,
      email: 'sarah@example.com',
    },
  },
  {
    id: 'mock-dir-2',
    name: 'Mind Matters Wellness',
    description: 'Holistic mental health clinic offering counselling, psychiatry, and wellness programs. Serving the community since 2015.',
    regions_served: ['USA', 'Canada', 'Online'],
    delivery_type: 'hybrid',
    price_range: 'moderate',
    languages_supported: ['English', 'Spanish', 'French'],
    tags: ['Organisation', 'Counselling', 'Psychiatry', 'Wellness'],
    verified: true,
    links: { website: 'https://mindmatters.com' },
    owner_user_id: 'mock-org-mindmatters',
    owner_profile_id: 'mock-org-mindmatters',
    created_at: new Date().toISOString(),
    profile: {
      id: 'mock-org-mindmatters',
      display_name: 'Mind Matters Wellness',
      handle: 'mindmatters',
      avatar_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop',
      user_type: 'organization',
      is_verified: true,
      email: 'contact@mindmatters.com',
    },
  },
  {
    id: 'mock-dir-3',
    name: 'James Wilson, LCSW',
    description: 'Licensed Clinical Social Worker with expertise in family therapy, relationship counselling, and life transitions.',
    regions_served: ['UK', 'Online'],
    delivery_type: 'online',
    price_range: 'moderate',
    languages_supported: ['English'],
    tags: ['Social Worker', 'Family Therapy', 'Relationships'],
    verified: true,
    links: { website: 'https://jameswilsonlcsw.com' },
    owner_user_id: 'mock-provider-james',
    owner_profile_id: 'mock-provider-james',
    created_at: new Date().toISOString(),
    profile: {
      id: 'mock-provider-james',
      display_name: 'James Wilson',
      handle: 'jwilsonlcsw',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      user_type: 'professional',
      is_verified: true,
      email: 'james@example.com',
    },
  },
  {
    id: 'mock-dir-4',
    name: 'Calm Collective',
    description: 'Non-profit organisation providing free peer support groups and mental health education resources.',
    regions_served: ['Global', 'Online'],
    delivery_type: 'online',
    price_range: 'free',
    languages_supported: ['English', 'Hindi', 'Arabic'],
    tags: ['Non-Profit', 'Peer Support', 'Community', 'Education'],
    verified: true,
    links: { website: 'https://calmcollective.org' },
    owner_user_id: 'mock-org-calm',
    owner_profile_id: 'mock-org-calm',
    created_at: new Date().toISOString(),
    profile: {
      id: 'mock-org-calm',
      display_name: 'Calm Collective',
      handle: 'calmcollective',
      avatar_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=200&fit=crop',
      user_type: 'organization',
      is_verified: true,
      email: 'hello@calmcollective.org',
    },
  },
  {
    id: 'mock-dir-5',
    name: 'Dr. Priya Sharma',
    description: 'Psychiatrist specializing in mood disorders, ADHD, and medication management. Telehealth appointments available.',
    regions_served: ['India', 'Singapore', 'Online'],
    delivery_type: 'hybrid',
    price_range: 'premium',
    languages_supported: ['English', 'Hindi', 'Tamil'],
    tags: ['Psychiatrist', 'Mood Disorders', 'ADHD', 'Medication'],
    verified: true,
    links: { website: 'https://drpriyasharma.in' },
    owner_user_id: 'mock-provider-priya',
    owner_profile_id: 'mock-provider-priya',
    created_at: new Date().toISOString(),
    profile: {
      id: 'mock-provider-priya',
      display_name: 'Dr. Priya Sharma',
      handle: 'drpriya',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
      user_type: 'professional',
      is_verified: true,
      email: 'priya@example.com',
    },
  },
];

// =============================================================================
// CREATOR SCORE SIMULATION
// =============================================================================

export interface MockCreatorScore {
  id: string;
  user_id: string;
  ccs_score: number;
  interactions_completed: number;
  interactions_declined: number;
  reports_received: number;
  reports_against_others: number;
  account_age_days: number;
  activity_score: number;
  community_participation: number;
  tier_multiplier: number;
  eligible_for_earnings: boolean;
  eligibility_reason: string | null;
  visibility_weight: number;
  estimated_reach: number;
  profile_views_30d: number;
  interaction_views_30d: number;
  completion_rate: number;
}

export const DEFAULT_MOCK_CREATOR_SCORE: MockCreatorScore = {
  id: 'mock-ccs-1',
  user_id: 'mock-user',
  ccs_score: 847,
  interactions_completed: 45,
  interactions_declined: 3,
  reports_received: 0,
  reports_against_others: 2,
  account_age_days: 180,
  activity_score: 78,
  community_participation: 65,
  tier_multiplier: 1.25,
  eligible_for_earnings: true,
  eligibility_reason: null,
  visibility_weight: 1.35,
  estimated_reach: 12500,
  profile_views_30d: 1847,
  interaction_views_30d: 342,
  completion_rate: 94,
};

// =============================================================================
// SUPPORT LINKS SIMULATION
// =============================================================================

export interface MockSupportLink {
  id: string;
  user_id: string;
  provider_user_id: string;
  provider_role: string;
  organization_name: string | null;
  status: 'pending' | 'active' | 'inactive' | 'ended';
  created_at: string;
  updated_at: string;
  provider?: {
    id: string;
    display_name: string;
    handle: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export const MOCK_SUPPORT_LINKS: MockSupportLink[] = [
  {
    id: 'mock-link-1',
    user_id: 'mock-user',
    provider_user_id: 'mock-provider-sarah',
    provider_role: 'Psychologist',
    organization_name: null,
    status: 'active',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    provider: {
      id: 'mock-provider-sarah',
      display_name: 'Dr. Sarah Chen',
      handle: 'drsarahchen',
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
      is_verified: true,
    },
  },
  {
    id: 'mock-link-2',
    user_id: 'mock-user',
    provider_user_id: 'mock-provider-james',
    provider_role: 'Counsellor',
    organization_name: 'Mind Matters Wellness',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    provider: {
      id: 'mock-provider-james',
      display_name: 'James Wilson',
      handle: 'jwilsonlcsw',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      is_verified: true,
    },
  },
];

// =============================================================================
// SIMULATION MODE HELPERS
// =============================================================================

/**
 * Get the current simulation mode subscription scenario
 * Can be changed to test different states
 */
let currentSubscriptionScenario: keyof typeof MOCK_SUBSCRIPTIONS = 'professional';

export function setSubscriptionScenario(scenario: keyof typeof MOCK_SUBSCRIPTIONS) {
  currentSubscriptionScenario = scenario;
}

export function getCurrentMockSubscription(): MockSubscription {
  return MOCK_SUBSCRIPTIONS[currentSubscriptionScenario];
}

/**
 * Get the current verification scenario
 */
let currentVerificationScenario: keyof typeof MOCK_VERIFICATION_REQUESTS = 'approved';

export function setVerificationScenario(scenario: keyof typeof MOCK_VERIFICATION_REQUESTS) {
  currentVerificationScenario = scenario;
}

export function getCurrentMockVerification(): MockVerificationRequest {
  return MOCK_VERIFICATION_REQUESTS[currentVerificationScenario];
}

// =============================================================================
// PROFILE SIMULATION
// =============================================================================

export interface MockProfile {
  id: string;
  display_name: string;
  handle: string;
  avatar_url: string;
  cover_url?: string;
  bio: string;
  country: string;
  is_verified: boolean;
  is_private: boolean;
  user_type: 'individual' | 'professional' | 'organization';
  email: string;
  created_at: string;
  follower_count: number;
  following_count: number;
  post_count: number;
}

export const MOCK_CURRENT_USER_PROFILE: MockProfile = {
  id: 'mock-current-user',
  display_name: 'Alex Morgan',
  handle: 'alexmorgan',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop',
  bio: 'Mental health advocate 💚 | Mindfulness practitioner | Sharing my journey to wellness',
  country: 'Australia',
  is_verified: true,
  is_private: false,
  user_type: 'professional',
  email: 'alex@example.com',
  created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  follower_count: 2847,
  following_count: 312,
  post_count: 47,
};
