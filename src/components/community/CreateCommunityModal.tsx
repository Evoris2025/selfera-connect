import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Lock, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCommunityModal({ open, onOpenChange, onSuccess }: CreateCommunityModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate handle from name
  const handleNameChange = (value: string) => {
    setName(value);
    // Generate handle: lowercase, replace spaces with underscores, remove special chars
    const generatedHandle = value
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 30);
    setHandle(generatedHandle);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !name.trim() || !handle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name: name.trim(),
          handle: handle.trim().toLowerCase(),
          description: description.trim() || null,
          is_private: isPrivate,
          created_by: user.id,
          member_count: 1, // Creator is first member
          follower_count: 0,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('A community with this handle already exists');
        } else {
          throw error;
        }
        return;
      }

      // Auto-join the creator as admin
      await supabase
        .from('community_memberships')
        .insert({
          community_id: data.id,
          user_id: user.id,
          role: 'admin',
        });

      toast.success('Community created!');
      
      // Reset form
      setName('');
      setHandle('');
      setDescription('');
      setIsPrivate(false);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Create Community
          </DialogTitle>
          <DialogDescription>
            Start a new community for people to connect and share.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Community Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Mindfulness Practice"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          {/* Handle */}
          <div className="space-y-2">
            <Label htmlFor="handle">Handle *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="handle"
                placeholder="community_handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="pl-7"
                maxLength={30}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Letters, numbers, and underscores only
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/300
            </p>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <Lock className="h-5 w-5 text-amber-500" />
              ) : (
                <Globe className="h-5 w-5 text-green-500" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {isPrivate ? 'Private Community' : 'Public Community'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPrivate 
                    ? 'Only members can see posts' 
                    : 'Anyone can see and join'}
                </p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isSubmitting || !name.trim() || !handle.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Community'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
