import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Loader2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VerifiedProfile {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  user_type: string | null;
  is_verified: boolean;
  email: string | null;
}

interface VerifiedDirectoryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (profileId: string) => void;
}

export function VerifiedDirectoryPicker({
  open,
  onOpenChange,
  onAdd,
}: VerifiedDirectoryPickerProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState<VerifiedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Fetch verified profiles (creators, practitioners, organisations only)
  useEffect(() => {
    async function fetchVerifiedProfiles() {
      if (!open) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, handle, avatar_url, user_type, is_verified, email')
          .eq('is_verified', true)
          .in('user_type', ['professional', 'organization'])
          .neq('id', user?.id || '')
          .order('display_name');

        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        console.error('Error fetching verified profiles:', err);
        toast.error('Failed to load verified profiles');
      } finally {
        setLoading(false);
      }
    }
    
    fetchVerifiedProfiles();
  }, [open, user?.id]);

  // Filter by search
  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    
    const query = search.toLowerCase();
    return profiles.filter(p => 
      p.display_name?.toLowerCase().includes(query) ||
      p.handle?.toLowerCase().includes(query) ||
      p.user_type?.toLowerCase().includes(query)
    );
  }, [profiles, search]);

  // Handle adding a profile to support network
  const handleAdd = async (profileId: string) => {
    if (!user || addingId) return;
    
    setAddingId(profileId);
    try {
      // Get the profile's user_type for provider_role
      const profile = profiles.find(p => p.id === profileId);
      
      const { error } = await supabase
        .from('user_support_links')
        .insert({
          user_id: user.id,
          provider_user_id: profileId,
          provider_role: profile?.user_type || 'professional',
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Already in your network', {
            description: 'This provider is already in your support network.',
          });
        } else {
          throw error;
        }
      } else {
        toast.success('Request sent!', {
          description: 'Your connection request has been sent.',
        });
        onAdd?.(profileId);
        onOpenChange(false);
      }
    } catch (err: any) {
      console.error('Error adding to network:', err);
      toast.error('Failed to send request', {
        description: err.message,
      });
    } finally {
      setAddingId(null);
    }
  };

  const getUserTypeLabel = (type: string | null) => {
    switch (type) {
      case 'professional': return 'Practitioner';
      case 'organization': return 'Organisation';
      case 'creator': return 'Creator';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add to My Network</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search verified profiles..."
            className="pl-10 pr-10 rounded-xl"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {search ? 'No profiles match your search' : 'No verified profiles available'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredProfiles.map((profile, idx) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center gap-3 p-3 bg-card/40 border border-white/[0.06] hover:bg-card/60 transition-colors"
                >
                  <CinematicAvatar
                    src={profile.avatar_url || undefined}
                    alt={profile.display_name || 'User'}
                    fallback={profile.display_name?.[0] || 'U'}
                    size="md"
                    ring="gradient"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-body text-foreground truncate">
                        {profile.display_name || 'Unknown'}
                      </span>
                      <EraVerifiedTick size="sm" userEmail={profile.email || undefined} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-label text-muted-foreground truncate">
                        @{profile.handle || 'user'}
                      </span>
                      <Badge variant="outline" className="text-caption h-4">
                        {getUserTypeLabel(profile.user_type)}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full h-8 px-3"
                    disabled={addingId === profile.id}
                    onClick={() => handleAdd(profile.id)}
                  >
                    {addingId === profile.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
