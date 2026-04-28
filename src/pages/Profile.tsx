import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Lock, MapPin, MessageCircle, Share2, Settings, Plus, Sparkles, User, ImageIcon, ShieldOff, VolumeX, Flag, Shield } from 'lucide-react';
import { DiscoverRow } from '@/components/DiscoverRow';
import { RearrangeableGrid } from '@/components/profile/RearrangeableGrid';
import { RearrangeableTabBar } from '@/components/profile/RearrangeableTabBar';
import { UserListModal, ListType } from '@/components/profile/UserListModal';
import { BlockedProfileState } from '@/components/profile/BlockedProfileState';
import { PrivateProfileState } from '@/components/profile/PrivateProfileState';
import { HighlightRow } from '@/components/profile/HighlightRow';
import { ReportModal } from '@/components/moderation/ReportModal';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EraVerifiedTick, VerificationTier, calculateVerificationTier } from '@/components/EraVerifiedTick';
import { EraVerifiedTooltip } from '@/components/profile/EraVerifiedTooltip';
import { AccountTypeBadge, AccountType } from '@/components/AccountTypeBadge';
import { FollowButton } from '@/components/interactions';
import { cn } from '@/lib/utils';
import { GridLayoutStyle } from '@/hooks/useGridLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSafety } from '@/contexts/SafetyContext';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { useCurrentUserCover } from '@/hooks/useCurrentUserCover';
import { useProfilePhotoUpload } from '@/hooks/useProfilePhotoUpload';
import { useCoverPhotoUpload } from '@/hooks/useCoverPhotoUpload';
import { useProfileStats, useUserPosts } from '@/hooks/useProfileStats';
import { useFollow } from '@/hooks/useFollow';
import { useHighlights } from '@/hooks/useHighlights';
import { supabase } from '@/integrations/supabase/client';
import { useFounderAccess } from '@/hooks/useFounderAccess';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BrandSectionLabel, BrandIcon } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';

// Mock user data with full social metrics
const mockUser = {
  // Keep mock data for now, but ensure the id is a valid UUID so backend queries don't 400.
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Alex Johnson',
  handle: 'alexj',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop',
  bio: 'Advocating for mental health awareness. Sharing my journey one day at a time. #mindfulness #wellbeing #traveller #bookreader',
  location: 'Los Angeles, CA',
  website: 'linktr.ee/alexj',
  country: 'United States',
  languages: ['English', 'Spanish'],
  joinedDate: 'March 2024',
  isVerified: true,
  isPrivate: false,
  userType: 'individual' as const,
  stats: {
    posts: 147,
    followers: 12400,
    following: 567,
    community: 24,
  },
};

// Mock posts grid
const mockPosts = [
  { id: 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop', likes: 1234, comments: 56, isVideo: false },
  { id: 'b2c3d4e5-f6a7-4890-bcde-f01234567890', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop', likes: 892, comments: 34, isVideo: false },
  { id: 'c3d4e5f6-a7b8-4901-cdef-012345678901', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=400&fit=crop', likes: 2341, comments: 89, isVideo: true },
  { id: 'd4e5f6a7-b8c9-4012-def0-123456789012', thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=400&fit=crop', likes: 567, comments: 23, isVideo: false },
  { id: 'e5f6a7b8-c9d0-4123-ef01-234567890123', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', likes: 3456, comments: 128, isVideo: false },
  { id: 'f6a7b8c9-d0e1-4234-f012-345678901234', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', likes: 789, comments: 45, isVideo: true },
];

const mockReels = [
  { id: '1', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=500&fit=crop', views: 45600 },
  { id: '2', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=500&fit=crop', views: 23400 },
  { id: '3', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&h=500&fit=crop', views: 67800 },
];

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

// Clickable stat item for the card profile
function CardStatItem({
  count,
  label,
  onClick,
}: {
  count: number;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex-1 min-w-0 flex flex-col items-center text-center py-3 px-1 transition-colors duration-200',
        onClick && 'hover:bg-white/[0.04] active:scale-[0.97] cursor-pointer',
      )}
    >
      <p className="text-white text-title font-medium leading-none">{formatCount(count)}</p>
      <div className="mt-1.5 w-full">
        <p className="text-caption font-medium uppercase tracking-wider text-white/55 truncate w-full text-center">
          {label}
        </p>
      </div>
    </button>
  );
}

// Render bio with inline hashtags styled
function renderBioWithHashtags(bio: string) {
  return bio.split(/(#\w+)/g).map((part, index) =>
    part.startsWith('#') ? (
      <span
        key={index}
        className="text-gradient-brand cursor-pointer"
      >
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

// Founder admin menu item - only visible to founder
function FounderAdminMenuItem() {
  const navigate = useNavigate();
  const { isFounder, isLoading } = useFounderAccess();
  
  if (isLoading || !isFounder) return null;
  
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-white" onClick={() => navigate('/admin')}>
        <Shield className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">Admin Console</span>
        <Badge variant="secondary" className="text-caption px-1.5 py-0 h-4 bg-white/[0.08] text-white/70 border-0 flex-shrink-0">
          STAFF
        </Badge>
      </DropdownMenuItem>
    </>
  );
}

export default function Profile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { primary: themePrimary } = useThemeColor();
  const { isBlocked, isBlockedByMe, isBlockingMe, blockUser, muteUser, isMuted } = useSafety();
  const { avatarUrl, refreshAvatar } = useCurrentUserAvatar();
  const { coverUrl, refreshCover } = useCurrentUserCover();
  const { uploadProfilePhoto, isUploading } = useProfilePhotoUpload();
  const { uploadCoverPhoto, isUploading: isCoverUploading } = useCoverPhotoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalType, setListModalType] = useState<ListType>('followers');
  const [gridLayout, setGridLayout] = useState<GridLayoutStyle>('uniform');
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Resolve profile user ID from handle or current user
  useEffect(() => {
    const resolveProfileUser = async () => {
      if (!handle) {
        // Own profile
        setProfileUserId(user?.id || null);
        setIsOwnProfile(true);
        return;
      }

      // Check if handle matches current user
      if (user?.id) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('handle')
          .eq('id', user.id)
          .single();

        if (currentProfile?.handle === handle) {
          setProfileUserId(user.id);
          setIsOwnProfile(true);
          return;
        }
      }

      // Lookup profile by handle
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', handle)
        .single();

      if (targetProfile) {
        setProfileUserId(targetProfile.id);
        setIsOwnProfile(false);
      } else {
        // Fallback to mock
        setProfileUserId(mockUser.id);
        setIsOwnProfile(false);
      }
    };

    resolveProfileUser();
  }, [handle, user?.id]);

  // Use real profile stats and follow state
  const { profile, stats, isLoading: statsLoading } = useProfileStats(profileUserId || '');
  const { isFollowing, isPending, toggleFollow, followerCount } = useFollow(profileUserId || '');
  const { posts: userPosts, isLoading: postsLoading } = useUserPosts(profileUserId || '');
  const { highlights, isLoading: highlightsLoading } = useHighlights(profileUserId || undefined);
  
  // Check if current user has muted this profile
  const profileIsMuted = profileUserId ? isMuted(profileUserId) : false;

  // Fallback to mock data when no real profile
  const displayProfile = profile || {
    id: mockUser.id,
    displayName: mockUser.name,
    handle: mockUser.handle,
    avatarUrl: mockUser.avatar,
    coverUrl: mockUser.coverImage,
    bio: mockUser.bio,
    location: mockUser.location,
    isVerified: mockUser.isVerified,
    isPrivate: mockUser.isPrivate,
    userType: mockUser.userType,
    email: null as string | null,
  };

  // Normalize stats to a consistent shape
  const hasRealStats = stats.postCount > 0 || stats.followerCount > 0 || stats.followingCount > 0;
  const normalizedStats = {
    postCount: hasRealStats ? stats.postCount : mockUser.stats.posts,
    followerCount: hasRealStats ? stats.followerCount : mockUser.stats.followers,
    followingCount: hasRealStats ? stats.followingCount : mockUser.stats.following,
    communityCount: hasRealStats ? stats.communityCount : (mockUser.stats.community || 0),
  };

  const displayPosts = userPosts.length > 0 ? userPosts : mockPosts;

  // Safety checks
  const profileIsBlocked = profileUserId ? isBlocked(profileUserId) : false;
  const iAmBlockedByProfile = profileUserId ? isBlockingMe(profileUserId) : false;
  const iBlockedProfile = profileUserId ? isBlockedByMe(profileUserId) : false;
  
  // Private account check - show limited view if profile is private and user is not following
  const isPrivateProfile = displayProfile.isPrivate && !isOwnProfile && !isFollowing;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const newUrl = await uploadProfilePhoto(file);
    if (newUrl) {
      refreshAvatar();
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const newUrl = await uploadCoverPhoto(file);
    if (newUrl) {
      refreshCover();
    }
    
    // Reset input
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const openListModal = (type: ListType) => {
    setListModalType(type);
    setListModalOpen(true);
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Subtle parallax for avatar
  const avatarScale = useTransform(scrollY, [0, 300], [1, 0.92]);
  const avatarY = useTransform(scrollY, [0, 300], [0, 15]);

  const handleFollow = () => {
    toggleFollow();
  };

  // No-op - AppLayout handles CreatorStudio internally now
  const handleCreatePost = undefined;

  const handleBlockUser = async () => {
    if (!profileUserId) return;
    await blockUser(profileUserId);
  };

  const handleMuteUser = async () => {
    if (!profileUserId) return;
    await muteUser(profileUserId);
  };

  // Show blocked state if either party has blocked the other
  if (profileIsBlocked && !isOwnProfile && profileUserId) {
    return (
      <AppLayout showHeader={false}>
        <BlockedProfileState 
          userId={profileUserId} 
          isBlockedByMe={iBlockedProfile} 
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={false}>
      <div className="flex flex-col min-h-dvh relative">
        
        {/* ========== FULL-WIDTH PROFILE HERO ========== */}
        <motion.section
          ref={heroRef}
          className="relative w-full bg-cinematic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Full-Width Cover Image Banner */}
          <motion.div
            className="relative h-48 sm:h-56 md:h-64 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hidden file input for cover */}
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <motion.img
              src={isOwnProfile ? coverUrl : mockUser.coverImage}
              alt=""
              className={cn(
                "w-full h-full object-cover img-cinematic transition-opacity",
                isCoverUploading && "opacity-50"
              )}
              style={{ scale: avatarScale }}
            />
            
            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-transparent h-24" />
            
            
            {/* Loading spinner for cover */}
            {isCoverUploading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-10 h-10 border-2 border-white/30 rounded-full animate-spin"
                  style={{ borderTopColor: themePrimary }}
                />
              </div>
            )}
            
            {/* Top Right Menu Button */}
            {isOwnProfile ? (
              <motion.div
                className="absolute top-3 right-3 z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-200 active:scale-95"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border border-border">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Share2 className="h-4 w-4" />
                      Share profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <FounderAdminMenuItem />
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div
                className="absolute top-3 right-3 z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-200 active:scale-95"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Share2 className="h-4 w-4" />
                      Share profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={handleMuteUser}
                    >
                      <VolumeX className="h-4 w-4" />
                      {profileIsMuted ? 'Unmute' : 'Mute'} @{displayProfile.handle || mockUser.handle}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                      onClick={handleBlockUser}
                    >
                      <ShieldOff className="h-4 w-4" />
                      Block @{displayProfile.handle || mockUser.handle}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer"
                      onClick={() => setReportModalOpen(true)}
                    >
                      <Flag className="h-4 w-4" />
                      Report profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </motion.div>

          {/* Profile Info Section */}
          <div className="px-5 sm:px-8 md:px-10 -mt-14 sm:-mt-16 pb-6">
            
            {/* Avatar + Name/Handle Row */}
            <motion.div
              className="flex items-end gap-5 sm:gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Avatar with gradient ring and upload overlay */}
              <motion.div
                className="relative flex-shrink-0 group"
                style={{ y: avatarY }}
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div
                  className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden relative bg-black"
                  style={{ boxShadow: `0 0 0 2px ${themePrimary}` }}
                >
                  <img
                    src={isOwnProfile ? avatarUrl : mockUser.avatar}
                    alt={mockUser.name}
                    className={cn(
                      'w-full h-full object-cover img-cinematic transition-opacity',
                      (isUploading || isCoverUploading) && 'opacity-50',
                    )}
                  />

                  {/* Loading spinner */}
                  {(isUploading || isCoverUploading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div
                        className="w-8 h-8 border-2 border-white/30 rounded-full animate-spin"
                        style={{ borderTopColor: themePrimary }}
                      />
                    </div>
                  )}
                </div>
                
                {/* Plus button with dropdown menu - only on own profile */}
                {isOwnProfile && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black flex items-center justify-center active:scale-95 transition-all"
                        style={{ border: `1.5px solid ${themePrimary}`, color: themePrimary }}
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      <DropdownMenuItem 
                        className="gap-3 cursor-pointer py-3"
                        onClick={() => navigate('/creator')}
                      >
                        <Sparkles className="h-4 w-4" />
                        Add Expression
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-3 cursor-pointer py-3"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <User className="h-4 w-4" />
                        Edit Profile Picture
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-3 cursor-pointer py-3"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <ImageIcon className="h-4 w-4" />
                        Edit Cover Picture
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>

              {/* Name + Handle + Location + Admin Button */}
              <div className="flex flex-col justify-end min-w-0 pb-1 flex-1">
                {/* Name Row with Admin Button on Right */}
                <div className="flex items-center justify-between gap-2">
                  {/* Name + Verified Badge */}
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h1 className="text-headline sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight truncate">
                      {displayProfile.displayName || mockUser.name}
                    </h1>
                    {displayProfile.isVerified && (
                      <EraVerifiedTooltip 
                        tier={calculateVerificationTier(0, false, displayProfile.email ?? undefined)} 
                        userEmail={displayProfile.email ?? undefined} 
                        size="md" 
                      />
                    )}
                    {displayProfile.userType && displayProfile.userType !== 'individual' && (
                      <AccountTypeBadge type={displayProfile.userType as AccountType} size="md" />
                    )}
                    {displayProfile.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Handle + Location */}
                <p className="text-body sm:text-title text-muted-foreground mt-1 flex items-center flex-wrap gap-x-2">
                  <span className="font-medium">@{displayProfile.handle || mockUser.handle}</span>
                  {(displayProfile.location || mockUser.location) && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground/70">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{displayProfile.location || mockUser.location}</span>
                    </span>
                  )}
                </p>
              </div>
            </motion.div>

            {/* Bio - Full Width Below */}
            <motion.p
              className="text-body sm:text-title text-foreground/85 leading-relaxed mt-5 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {renderBioWithHashtags(displayProfile.bio || mockUser.bio)}
            </motion.p>

            {/* Stats Row — horizontal snap rail to handle column-density at max-w-md */}
            <motion.div
              className="mt-6 -mx-4 flex items-stretch overflow-x-auto snap-x snap-mandatory scrollbar-hide rail-fade-right pl-2 pr-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardStatItem count={normalizedStats.postCount} label="Posts" />
              <div className="w-px self-stretch bg-white/[0.08]" />
              <CardStatItem
                count={followerCount || normalizedStats.followerCount}
                label="Followers"
                onClick={() => openListModal('followers')}
              />
              <div className="w-px self-stretch bg-white/[0.08]" />
              <CardStatItem
                count={normalizedStats.followingCount}
                label="Following"
                onClick={() => openListModal('following')}
              />
              <div className="w-px self-stretch bg-white/[0.08]" />
              <CardStatItem
                count={normalizedStats.communityCount}
                label="Community"
                onClick={() => openListModal('community')}
              />
            </motion.div>

            {/* CTA Buttons - Below Stats */}
            {!isOwnProfile && (
              <motion.div
                className="flex items-center gap-2 mt-5 pt-5 border-t border-white/[0.08]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={isPending}
                  className="inline-flex items-center justify-center bg-transparent border h-9 px-4 rounded-full text-label uppercase tracking-[0.1em] transition-colors disabled:opacity-60"
                  style={
                    isFollowing
                      ? { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)' }
                      : { borderColor: themePrimary, color: themePrimary }
                  }
                >
                  {isPending ? 'Requested' : isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 bg-transparent border border-white/15 text-white h-9 px-4 rounded-full text-label uppercase tracking-[0.1em] transition-colors hover:border-white/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Message
                </button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* ========== CONTENT BELOW HERO ========== */}
        
        {/* Highlights Row - Instagram-style story highlights */}
        {highlights.length > 0 && (
          <div className="mt-2">
            <HighlightRow highlights={highlights} isOwnProfile={isOwnProfile} />
          </div>
        )}
        
        {/* Discover People Row */}
        <div className="mt-2">
          <DiscoverRow />
        </div>

        {/* Content Tabs */}
        <div className="mt-4 border-t border-white/[0.08]">
          <RearrangeableTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOwnProfile={isOwnProfile}
            profileUserId={profileUserId}
            onLayoutChange={setGridLayout}
          />
        </div>

        {/* Tab Content */}
        <div className="mt-1">
          {/* Show private account message if applicable */}
          {isPrivateProfile ? (
            <PrivateProfileState
              displayName={displayProfile.displayName || mockUser.name}
              isFollowing={isFollowing}
              onFollow={handleFollow}
            />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RearrangeableGrid posts={mockPosts} isOwnProfile={isOwnProfile} layoutStyle={gridLayout} />
                </motion.div>
              )}

              {activeTab === 'expressions' && (
                <motion.div
                  key="expressions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RearrangeableGrid posts={mockPosts} isOwnProfile={isOwnProfile} layoutStyle={gridLayout} />
                </motion.div>
              )}

              {activeTab === 'reels' && (
                <motion.div
                  key="reels"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RearrangeableGrid posts={mockPosts} isOwnProfile={isOwnProfile} layoutStyle={gridLayout} />
                </motion.div>
              )}

              {activeTab === 'community' && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 text-muted-foreground text-body"
                >
                  {isOwnProfile ? "Communities you've joined" : 'No communities yet'}
                </motion.div>
              )}

              {activeTab === 'library' && (
                <motion.div
                  key="library"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 text-muted-foreground text-body"
                >
                  {isOwnProfile ? 'Your saved content' : 'Library is private'}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* User List Modal */}
      <UserListModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        type={listModalType}
        userId={profileUserId}
        userName={mockUser.name}
      />

      {/* Report Modal */}
      {profileUserId && (
        <ReportModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          targetId={profileUserId}
          targetType="profile"
        />
      )}
    </AppLayout>
  );
}
