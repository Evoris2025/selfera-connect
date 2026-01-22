import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type PathwayType = 'creator' | 'professional' | 'organization' | 'support_seeker';
export type PathwayStatus = 'available' | 'in_progress' | 'completed';

interface UserPathway {
  id: string;
  user_id: string;
  pathway_type: PathwayType;
  status: PathwayStatus;
  started_at: string | null;
  completed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface PathwayInfo {
  type: PathwayType;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  icon: string;
}

export const PATHWAY_INFO: PathwayInfo[] = [
  {
    type: 'creator',
    title: 'Become a Wellbeing Creator',
    description: 'Share your journey and inspire others through content creation.',
    requirements: [
      'Active account for 30+ days',
      'At least 10 posts shared',
      'Community guidelines compliance',
    ],
    benefits: [
      'Creator badge on profile',
      'Access to analytics',
      'Priority support',
    ],
    icon: '✨',
  },
  {
    type: 'professional',
    title: 'Apply for Practitioner Verification',
    description: 'Verify your credentials as a mental health professional.',
    requirements: [
      'Valid professional credentials',
      'Proof of licensure or certification',
      'Professional liability insurance',
    ],
    benefits: [
      'Verified practitioner badge',
      'Directory listing',
      'Client connection tools',
    ],
    icon: '🩺',
  },
  {
    type: 'organization',
    title: 'Register an Organisation',
    description: 'Represent your mental health organisation on SelfERA.',
    requirements: [
      'Registered organisation status',
      'Mental health service focus',
      'Authorised representative',
    ],
    benefits: [
      'Organisation profile',
      'Team management',
      'Service directory listing',
    ],
    icon: '🏢',
  },
  {
    type: 'support_seeker',
    title: 'Seek Professional Support',
    description: 'Connect with verified practitioners and organisations.',
    requirements: [
      'No requirements needed',
      'Browse the Directory to find help',
    ],
    benefits: [
      'Connect with verified providers',
      'Message practitioners directly',
      'Track your support connections',
    ],
    icon: '💙',
  },
];

export function useUserPathways() {
  const { user } = useAuth();
  const [pathways, setPathways] = useState<UserPathway[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPathways = useCallback(async () => {
    if (!user) {
      setPathways([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_pathways')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Cast the data to the correct type
      const typedPathways = (data || []).map(p => ({
        ...p,
        pathway_type: p.pathway_type as PathwayType,
        status: p.status as PathwayStatus,
        metadata: p.metadata as Record<string, any>,
      }));

      setPathways(typedPathways);
    } catch (error) {
      console.error('Error fetching pathways:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPathways();
  }, [fetchPathways]);

  // Start a pathway
  const startPathway = useCallback(async (pathwayType: PathwayType) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_pathways')
        .upsert({
          user_id: user.id,
          pathway_type: pathwayType,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,pathway_type',
        });

      if (error) throw error;

      toast.success('Pathway started!');
      await fetchPathways();
      return true;
    } catch (error) {
      console.error('Error starting pathway:', error);
      toast.error('Failed to start pathway');
      return false;
    }
  }, [user, fetchPathways]);

  // Get pathway status
  const getPathwayStatus = useCallback((pathwayType: PathwayType): PathwayStatus => {
    const pathway = pathways.find(p => p.pathway_type === pathwayType);
    return pathway?.status || 'available';
  }, [pathways]);

  // Get pathway with info
  const getPathwaysWithInfo = useCallback(() => {
    return PATHWAY_INFO.map(info => ({
      ...info,
      status: getPathwayStatus(info.type),
      userPathway: pathways.find(p => p.pathway_type === info.type),
    }));
  }, [pathways, getPathwayStatus]);

  return {
    pathways,
    loading,
    startPathway,
    getPathwayStatus,
    getPathwaysWithInfo,
    refresh: fetchPathways,
  };
}
