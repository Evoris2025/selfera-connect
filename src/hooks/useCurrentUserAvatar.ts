import { useAuth } from '@/contexts/AuthContext';

// Single source of truth for current user's avatar
// Uses the same mock avatar as the Profile page for consistency
const MOCK_AVATAR_URL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';

export function useCurrentUserAvatar() {
  const { user } = useAuth();
  
  // Priority: 
  // 1. User metadata avatar_url (when user uploads their own)
  // 2. Profile table avatar_url (future: fetch from DB)
  // 3. Mock avatar for demo consistency
  const avatarUrl = user?.user_metadata?.avatar_url || MOCK_AVATAR_URL;
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  
  return {
    avatarUrl,
    displayName,
    userId: user?.id,
  };
}
