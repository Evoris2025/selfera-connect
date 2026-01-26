import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Clock,
  Check,
  ArrowRight,
  Eye,
  UserPlus,
  MessageCircle,
  Shield,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EraTier, ERA_TIER_CONFIG } from '@/lib/eraTiers';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

interface OrganisationViewProps {
  teamMemberCount: number;
  activeInteractions: number;
  pendingInteractions: number;
  tierColour: EraTier | null;
  isVerified: boolean;
  directoryListingActive: boolean;
}

export function OrganisationView({
  teamMemberCount,
  activeInteractions,
  pendingInteractions,
  tierColour,
  isVerified,
  directoryListingActive,
}: OrganisationViewProps) {
  const navigate = useNavigate();
  const tierConfig = tierColour ? ERA_TIER_CONFIG[tierColour] : ERA_TIER_CONFIG.green;

  return (
    <motion.section
      className="px-4 mt-6 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: 0.2 }}
    >
      {/* Organisation Overview Header */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-card/40 backdrop-blur-lg border border-violet-500/20 p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.25 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground mb-1">
              Organisation Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage your team and organisation presence
            </p>
          </div>
          {isVerified && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              <Check className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.3 }}
      >
        {/* Team Members */}
        <div className="bg-card/40 border border-white/[0.06] p-4 text-center">
          <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-xl font-bold text-foreground">{teamMemberCount}</p>
          <p className="text-[10px] text-muted-foreground">Team</p>
        </div>

        {/* Active */}
        <div className="bg-card/40 border border-white/[0.06] p-4 text-center">
          <Check className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
          <p className="text-xl font-bold text-foreground">{activeInteractions}</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </div>

        {/* Pending */}
        <div className="bg-card/40 border border-white/[0.06] p-4 text-center relative">
          <Clock className="w-5 h-5 mx-auto mb-2 text-amber-400" />
          <p className="text-xl font-bold text-foreground">{pendingInteractions}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
          {pendingInteractions > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
      </motion.div>

      {/* Team Members Placeholder */}
      <motion.div
        className="bg-card/40 border border-white/[0.06] p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.35 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Team Members
          </h3>
          <Badge variant="outline" className="text-xs">
            Coming Soon
          </Badge>
        </div>
        <div className="text-center py-4">
          <Users className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Team management coming soon
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Add and manage team practitioners
          </p>
        </div>
      </motion.div>

      {/* Visibility & Directory Status */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.4 }}
      >
        {/* Visibility Tier */}
        <div className="bg-card/40 border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Tier</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tierConfig.color }}
            />
            <span className="text-sm font-medium text-foreground capitalize">
              {tierColour || 'Green'}
            </span>
          </div>
        </div>

        {/* Directory Status */}
        <div className="bg-card/40 border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Directory</span>
          </div>
          <div className="flex items-center gap-2">
            {directoryListingActive ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-foreground">Active</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Inactive</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tier Info */}
      <motion.div
        className="bg-card/30 border border-white/5 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.45 }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 flex items-center justify-center"
            style={{ backgroundColor: `${tierConfig.color}20` }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: tierConfig.color }}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {tierConfig.label} Tier
            </p>
            <p className="text-xs text-muted-foreground">
              Interaction cap: ${tierConfig.interactionCap.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.5 }}
      >
        <Button
          className="w-full rounded-full h-11"
          onClick={() => navigate('/provider-dashboard')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          View all interactions
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>

        <Button
          variant="secondary"
          className="w-full rounded-full h-11"
          onClick={() => navigate('/directory')}
        >
          <Shield className="w-4 h-4 mr-2" />
          Manage directory listing
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </motion.div>
    </motion.section>
  );
}
