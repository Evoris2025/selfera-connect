import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  Clock,
  Check,
  ArrowRight,
  Eye,
  Calendar,
  MessageCircle,
  Shield,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EraTier, ERA_TIER_CONFIG } from '@/lib/eraTiers';

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

interface PractitionerViewProps {
  activeClients: number;
  pendingRequests: number;
  tierColour: EraTier | null;
  isVerified: boolean;
  profileVisible: boolean;
}

export function PractitionerView({
  activeClients,
  pendingRequests,
  tierColour,
  isVerified,
  profileVisible: initialProfileVisible,
}: PractitionerViewProps) {
  const navigate = useNavigate();
  const tierConfig = tierColour ? ERA_TIER_CONFIG[tierColour] : ERA_TIER_CONFIG.green;
  const [isAvailable, setIsAvailable] = useState(true);
  const [profileVisible, setProfileVisible] = useState(initialProfileVisible);

  return (
    <motion.section
      className="px-4 mt-6 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: 0.2 }}
    >
      {/* Practice Overview Header */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-card/40 backdrop-blur-lg border border-cyan-500/20 p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.25 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-title font-semibold text-foreground mb-1">
              Your Practice Overview
            </h3>
            <p className="text-body text-muted-foreground">
              Manage your support sessions and client connections
            </p>
          </div>
          {isVerified && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-label">
              <Check className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.3 }}
      >
        {/* Active Clients */}
        <div className="bg-card/40 border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-label text-muted-foreground">Active Clients</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{activeClients}</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-card/40 border border-white/[0.06] p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-label text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingRequests}</p>
          {pendingRequests > 0 && (
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
      </motion.div>

      {/* Availability Toggle */}
      <motion.div
        className="bg-card/40 border border-white/[0.06] p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.35 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-body font-medium text-foreground">Availability Status</p>
              <p className="text-label text-muted-foreground">
                {isAvailable ? 'Accepting new clients' : 'Not accepting clients'}
              </p>
            </div>
          </div>
          <button
            className="flex items-center"
            onClick={() => setIsAvailable(!isAvailable)}
          >
            {isAvailable ? (
              <ToggleRight className="w-10 h-10 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-muted-foreground" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Profile Visibility */}
      <motion.div
        className="bg-card/40 border border-white/[0.06] p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-body font-medium text-foreground">Directory Visibility</p>
              <p className="text-label text-muted-foreground">
                {profileVisible ? 'Visible in directory' : 'Hidden from directory'}
              </p>
            </div>
          </div>
          <button
            className="flex items-center"
            onClick={() => setProfileVisible(!profileVisible)}
          >
            {profileVisible ? (
              <ToggleRight className="w-10 h-10 text-primary" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-muted-foreground" />
            )}
          </button>
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
            <p className="text-body font-medium text-foreground">
              {tierConfig.label} Tier
            </p>
            <p className="text-label text-muted-foreground">
              Session cap: ${tierConfig.interactionCap.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Compliance Reminder */}
      <motion.div
        className="bg-amber-500/10 border border-amber-500/20 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.5 }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-body font-medium text-foreground">Compliance Reminder</p>
            <p className="text-label text-muted-foreground mt-1">
              Ensure your credentials are up to date. SelfERA does not provide clinical documentation.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.55 }}
      >
        <Button
          className="w-full rounded-full h-11"
          onClick={() => navigate('/provider-dashboard')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          View interaction requests
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>

        <Button
          variant="secondary"
          className="w-full rounded-full h-11"
          onClick={() => navigate('/directory')}
        >
          <Shield className="w-4 h-4 mr-2" />
          View your directory listing
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </motion.div>
    </motion.section>
  );
}
