import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { IntentSelectionStep, VerificationIntent } from './IntentSelectionStep';
import { VerificationApplicationForm } from './VerificationApplicationForm';

interface VerificationFlowProps {
  onBack: () => void;
  onComplete?: () => void;
}

interface UserProfile {
  display_name: string | null;
  handle: string | null;
}

export function VerificationFlow({ onBack, onComplete }: VerificationFlowProps) {
  const { user } = useAuth();
  const { refreshRequest } = useVerification();
  const [step, setStep] = useState<'intent' | 'application'>('intent');
  const [selectedIntent, setSelectedIntent] = useState<VerificationIntent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch user profile for prefill
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, handle')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, [user]);

  const handleIntentSelect = (intent: VerificationIntent) => {
    setSelectedIntent(intent);
  };

  const handleIntentContinue = () => {
    if (selectedIntent) {
      setStep('application');
    }
  };

  const handleApplicationSubmit = async (formData: any) => {
    if (!user || !selectedIntent) return false;
    
    setIsSubmitting(true);
    
    try {
      // Map intent to account_type_requested
      const accountTypeMap: Record<VerificationIntent, string> = {
        creator: 'creator',
        practitioner: 'professional',
        organisation: 'organization',
        support_seeker: 'individual',
      };

      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          status: 'pending',
          account_type_requested: accountTypeMap[selectedIntent],
          submitted_fields: {
            intent_type: selectedIntent,
            ...formData,
          },
        } as any);

      if (error) throw error;

      toast.success('Verification request submitted!', {
        description: 'We\'ll review your application within 2-5 days.',
      });

      await refreshRequest();
      onComplete?.();
      return true;
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit request', {
        description: error.message || 'Please try again.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplicationBack = () => {
    setStep('intent');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Get ERA Verified</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'intent' && (
          <motion.div
            key="intent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <IntentSelectionStep
              selectedIntent={selectedIntent}
              onSelect={handleIntentSelect}
              onContinue={handleIntentContinue}
              onBack={onBack}
            />
          </motion.div>
        )}

        {step === 'application' && selectedIntent && (
          <motion.div
            key="application"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <VerificationApplicationForm
              intent={selectedIntent}
              onSubmit={handleApplicationSubmit}
              onBack={handleApplicationBack}
              isSubmitting={isSubmitting}
              prefillData={{
                display_name: profile?.display_name || undefined,
                handle: profile?.handle || undefined,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
