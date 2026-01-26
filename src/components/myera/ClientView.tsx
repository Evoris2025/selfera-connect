import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Compass,
  MessageCircle,
  Calendar,
  Shield,
  ArrowRight,
  Clock,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

interface Interaction {
  id: string;
  provider_name: string;
  status: string;
  created_at: string;
}

interface ClientViewProps {
  interactions?: Interaction[];
  supportNetworkCount: number;
  onFindSupport: () => void;
}

export function ClientView({ interactions = [], supportNetworkCount, onFindSupport }: ClientViewProps) {
  const navigate = useNavigate();
  const upcomingInteractions = interactions.filter(i => i.status === 'confirmed');
  const pastInteractions = interactions.filter(i => i.status === 'completed');

  return (
    <motion.section
      className="px-4 mt-6 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: 0.2 }}
    >
      {/* Welcome Card - Calm and Reassuring */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-card/40 backdrop-blur-lg border border-white/[0.06] p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.25 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground mb-1">
              Your Support Journey
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SelfERA is here for you. Connect with verified support when you're ready.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Active Interactions */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.3 }}
      >
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Your Active Interactions
        </h3>

        {upcomingInteractions.length === 0 ? (
          <div className="bg-card/30 border border-white/5 p-5 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No upcoming interactions
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Connect with a provider to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="flex items-center gap-3 p-3 bg-card/50 border border-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {interaction.provider_name}
                  </p>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                    <Check className="w-2 h-2 mr-0.5" />
                    Confirmed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Your Support Network */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.35 }}
      >
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          Your Support Network
        </h3>

        <div className="bg-card/30 border border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{supportNetworkCount}</p>
              <p className="text-xs text-muted-foreground">Connected providers</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => navigate('/directory')}
            >
              View all
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Find Verified Support CTA */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-emerald-500/10 to-card/40 border border-primary/20 p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.4 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center flex-shrink-0">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">
              Find Verified Support
            </h3>
            <p className="text-xs text-muted-foreground">
              Browse ERA-verified professionals
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-full"
            onClick={onFindSupport}
          >
            Explore
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </motion.div>

      {/* Past Interactions */}
      {pastInteractions.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.45 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            Past Interactions
          </h3>
          <div className="space-y-2">
            {pastInteractions.slice(0, 3).map((interaction) => (
              <div
                key={interaction.id}
                className="flex items-center gap-3 p-3 bg-card/30 border border-white/5 opacity-70"
              >
                <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {interaction.provider_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
