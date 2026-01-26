import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CreditCard,
  UserCheck,
  X,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type GateReason = 
  | 'client_paid_required' 
  | 'verification_required' 
  | 'provider_only' 
  | 'client_only';

interface RoleGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: GateReason;
}

const gateContent: Record<GateReason, {
  icon: typeof Shield;
  iconGradient: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaAction: string;
}> = {
  client_paid_required: {
    icon: CreditCard,
    iconGradient: 'from-rose-500 to-pink-500',
    title: 'Upgrade to Request Interactions',
    description: 'To connect with verified providers, you need a Client Paid subscription. This unlocks direct interaction requests.',
    ctaLabel: 'View Plans',
    ctaAction: '/settings?view=billing',
  },
  verification_required: {
    icon: UserCheck,
    iconGradient: 'from-emerald-500 to-green-500',
    title: 'Verification Required',
    description: 'This feature is available to ERA Verified accounts. Complete verification to unlock full provider features.',
    ctaLabel: 'Start Verification',
    ctaAction: '/my-era',
  },
  provider_only: {
    icon: Shield,
    iconGradient: 'from-cyan-500 to-blue-500',
    title: 'Provider Dashboard',
    description: 'This area is for verified creators, practitioners, and organisations. If you provide support services, apply for verification.',
    ctaLabel: 'Learn More',
    ctaAction: '/my-era',
  },
  client_only: {
    icon: Lock,
    iconGradient: 'from-amber-500 to-orange-500',
    title: 'Client Feature',
    description: 'This feature is designed for clients seeking support. As a provider, you can receive interactions instead.',
    ctaLabel: 'View Dashboard',
    ctaAction: '/provider-dashboard',
  },
};

export function RoleGateModal({ open, onOpenChange, reason }: RoleGateModalProps) {
  const navigate = useNavigate();
  const content = gateContent[reason];
  const IconComponent = content.icon;

  const handleCTA = () => {
    onOpenChange(false);
    navigate(content.ctaAction);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-white/10 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header with gradient background */}
          <div className={`relative p-6 pb-8 bg-gradient-to-br ${content.iconGradient} bg-opacity-10`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90" />
            <div className="relative">
              <DialogHeader className="text-center">
                <motion.div
                  className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${content.iconGradient} flex items-center justify-center shadow-lg`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </motion.div>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {content.title}
                </DialogTitle>
              </DialogHeader>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-2 space-y-6">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              {content.description}
            </p>

            {/* CTA Button */}
            <div className="space-y-3">
              <Button
                className="w-full h-12 rounded-full"
                onClick={handleCTA}
              >
                {content.ctaLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="ghost"
                className="w-full h-10 rounded-full text-muted-foreground"
                onClick={() => onOpenChange(false)}
              >
                Maybe later
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
