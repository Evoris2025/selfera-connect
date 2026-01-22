import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Sparkles, 
  Users, 
  CreditCard, 
  Info,
  ChevronRight,
  CheckCircle2,
  Clock,
  MessageCircle,
  ExternalLink,
  BadgeCheck,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPathways, PATHWAY_INFO, PathwayType } from '@/hooks/useUserPathways';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useTranslation } from 'react-i18next';

// Mock data for account type - in production this would come from profile
const getAccountTypeInfo = (userType: string) => {
  const types = {
    individual: {
      label: 'Personal Account',
      description: 'Share your journey and connect with others',
      color: 'bg-blue-500/10 text-blue-600',
    },
    creator: {
      label: 'Creator Account',
      description: 'Create content and inspire your community',
      color: 'bg-purple-500/10 text-purple-600',
    },
    professional: {
      label: 'Professional Account',
      description: 'Verified mental health practitioner',
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    organization: {
      label: 'Organisation Account',
      description: 'Mental health service provider',
      color: 'bg-amber-500/10 text-amber-600',
    },
  };
  return types[userType as keyof typeof types] || types.individual;
};

export default function MyERA() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPathwaysWithInfo, startPathway, loading: pathwaysLoading } = useUserPathways();
  const { activeProviders, pendingProviders, loading: supportLoading } = useSupportLinks();
  
  // Mock values - would come from profile in production
  const accountType = 'individual';
  const isVerified = false;
  const planType = 'free';

  const accountInfo = getAccountTypeInfo(accountType);
  const pathways = getPathwaysWithInfo();

  const handleStartPathway = async (pathwayType: PathwayType) => {
    if (pathwayType === 'professional') {
      navigate('/settings?view=verification');
    } else if (pathwayType === 'support_seeker') {
      navigate('/directory');
    } else {
      await startPathway(pathwayType);
    }
  };

  return (
    <AppLayout title="MyERA">
      <div className="flex flex-col min-h-full pb-6">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">MyERA</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your SelfERA experience</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Section 1: Account Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Account Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${accountInfo.color}`}>
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{accountInfo.label}</h3>
                    {isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{accountInfo.description}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Verification Status</span>
                </div>
                <Badge variant={isVerified ? 'default' : 'secondary'}>
                  {isVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pathways & Upgrades */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Pathways & Upgrades</CardTitle>
              </div>
              <CardDescription>
                Explore ways to grow your presence on SelfERA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pathways.map((pathway) => (
                <motion.div
                  key={pathway.type}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => handleStartPathway(pathway.type)}
                >
                  <div className="text-2xl">{pathway.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{pathway.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{pathway.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pathway.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {pathway.status === 'in_progress' && (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Section 3: Support Connections */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Support Connections</CardTitle>
              </div>
              <CardDescription>
                Your connected practitioners and organisations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supportLoading ? (
                <div className="py-4 text-center text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : activeProviders.length > 0 || pendingProviders.length > 0 ? (
                <div className="space-y-3">
                  {[...activeProviders, ...pendingProviders].map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={link.provider?.avatar_url || ''} />
                        <AvatarFallback>
                          {link.provider?.display_name?.[0] || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm truncate">
                            {link.provider?.display_name || 'Provider'}
                          </span>
                          {link.provider?.is_verified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {link.provider_role}
                          {link.organization_name && ` • ${link.organization_name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.status === 'pending' && (
                          <Badge variant="secondary" className="text-xs">Pending</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate('/messages')}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No support connections yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/directory')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Browse Directory
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Payments & Plans */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Plan & Billing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium capitalize">{planType} Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    {planType === 'free' ? 'Basic access to SelfERA' : 'Full access to all features'}
                  </p>
                </div>
                <Badge variant={planType === 'free' ? 'secondary' : 'default'}>
                  {planType === 'free' ? 'Free' : 'Active'}
                </Badge>
              </div>
              
              <Button variant="outline" className="w-full" disabled>
                Manage Plan
              </Button>
            </CardContent>
          </Card>

          {/* Section 5: Boundaries & Transparency */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">About SelfERA</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                SelfERA provides connection, access, and discovery to mental health resources. 
                We help you find support, connect with practitioners, and join communities.
              </p>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Clinical treatment occurs independently with your providers
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    SelfERA does not store medical records or treatment notes
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    We are a platform, not a healthcare provider
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
