import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useBlocks } from '@/hooks/useBlocks';
import { useMutes } from '@/hooks/useMutes';

interface SafetyContextType {
  // Block state
  blockedUserIds: Set<string>;
  blockedByUserIds: Set<string>;
  isBlocking: boolean;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  isBlockedByMe: (userId: string) => boolean;
  isBlockingMe: (userId: string) => boolean;
  isBlocked: (userId: string) => boolean;
  
  // Mute state
  mutedUserIds: Set<string>;
  isMuting: boolean;
  muteUser: (userId: string) => Promise<boolean>;
  unmuteUser: (userId: string) => Promise<boolean>;
  isMuted: (userId: string) => boolean;
  
  // Combined visibility check
  shouldHideUser: (userId: string) => boolean;
  shouldHideFromFeed: (userId: string) => boolean;
  
  // Refresh
  refetchAll: () => Promise<void>;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const blocks = useBlocks();
  const mutes = useMutes();

  // Combined check: hide user entirely (blocked on either side)
  const shouldHideUser = (userId: string) => {
    return blocks.isBlocked(userId);
  };

  // Feed-level check: hide from feed (blocked OR muted)
  const shouldHideFromFeed = (userId: string) => {
    return blocks.isBlocked(userId) || mutes.isMuted(userId);
  };

  const refetchAll = async () => {
    await Promise.all([blocks.refetch(), mutes.refetch()]);
  };

  const value = useMemo(() => ({
    // Block state
    blockedUserIds: blocks.blockedUserIds,
    blockedByUserIds: blocks.blockedByUserIds,
    isBlocking: blocks.isBlocking,
    blockUser: blocks.blockUser,
    unblockUser: blocks.unblockUser,
    isBlockedByMe: blocks.isBlockedByMe,
    isBlockingMe: blocks.isBlockingMe,
    isBlocked: blocks.isBlocked,
    
    // Mute state
    mutedUserIds: mutes.mutedUserIds,
    isMuting: mutes.isMuting,
    muteUser: mutes.muteUser,
    unmuteUser: mutes.unmuteUser,
    isMuted: mutes.isMuted,
    
    // Combined
    shouldHideUser,
    shouldHideFromFeed,
    refetchAll,
  }), [blocks, mutes]);

  return (
    <SafetyContext.Provider value={value}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (context === undefined) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}
