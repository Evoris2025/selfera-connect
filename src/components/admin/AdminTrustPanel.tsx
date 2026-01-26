import { useState } from 'react';
import { Shield, AlertTriangle, TrendingUp, User, Eye, Flag, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { TrustFlag, EscalationLevel, ESCALATION_LEVELS } from '@/lib/governance';

// Mock trust profiles for display
const MOCK_TRUST_DATA = [
  {
    id: 'user-1',
    displayName: 'Sarah Chen',
    handle: 'sarahc',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    trustScore: 92,
    escalationLevel: 0,
    eraTier: 'green',
    isVerified: true,
    flags: ['clean_record'] as TrustFlag[],
    factors: {
      accountAgeDays: 245,
      interactionCompletionRate: 0.98,
      reportsReceived: 0,
      reportsUpheld: 0,
      blocksReceived: 0,
      positiveIndicators: 12,
    },
    notes: '',
  },
  {
    id: 'user-2',
    displayName: 'Mind Matters',
    handle: 'mindmatters',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    trustScore: 78,
    escalationLevel: 1,
    eraTier: 'blue',
    isVerified: true,
    flags: ['declined_interactions_pattern'] as TrustFlag[],
    factors: {
      accountAgeDays: 890,
      interactionCompletionRate: 0.72,
      reportsReceived: 2,
      reportsUpheld: 0,
      blocksReceived: 1,
      positiveIndicators: 45,
    },
    notes: 'High volume provider - some declined interactions, monitoring.',
  },
  {
    id: 'user-3',
    displayName: 'James Wilson',
    handle: 'jwilson',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    trustScore: 45,
    escalationLevel: 2,
    eraTier: 'pink',
    isVerified: false,
    flags: ['frequent_reports', 'spam_activity'] as TrustFlag[],
    factors: {
      accountAgeDays: 30,
      interactionCompletionRate: 0.40,
      reportsReceived: 5,
      reportsUpheld: 2,
      blocksReceived: 4,
      positiveIndicators: 3,
    },
    notes: 'New account with multiple reports. Under review.',
  },
  {
    id: 'user-4',
    displayName: 'Wellness Hub',
    handle: 'wellnesshub',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    trustScore: 88,
    escalationLevel: 0,
    eraTier: 'purple',
    isVerified: true,
    flags: ['clean_record'] as TrustFlag[],
    factors: {
      accountAgeDays: 1200,
      interactionCompletionRate: 0.95,
      reportsReceived: 1,
      reportsUpheld: 0,
      blocksReceived: 0,
      positiveIndicators: 89,
    },
    notes: '',
  },
];

const FLAG_LABELS: Record<TrustFlag, { label: string; severity: 'info' | 'warning' | 'danger' }> = {
  clean_record: { label: 'Clean Record', severity: 'info' },
  frequent_reports: { label: 'Frequent Reports', severity: 'danger' },
  interaction_abuse: { label: 'Interaction Abuse', severity: 'danger' },
  declined_interactions_pattern: { label: 'Declined Pattern', severity: 'warning' },
  spam_activity: { label: 'Spam Activity', severity: 'danger' },
  identity_mismatch: { label: 'Identity Mismatch', severity: 'danger' },
};

const TIER_COLORS = {
  free: 'bg-muted text-muted-foreground',
  pink: 'bg-tier-pink text-white',
  green: 'bg-tier-green text-white',
  blue: 'bg-tier-blue text-white',
  purple: 'bg-tier-purple text-white',
  orange: 'bg-tier-orange text-white',
};

export function AdminTrustPanel() {
  const [profiles, setProfiles] = useState(MOCK_TRUST_DATA);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [annotationNotes, setAnnotationNotes] = useState<Record<string, string>>({});

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-destructive';
  };

  const getEscalationBadge = (level: EscalationLevel) => {
    const config = ESCALATION_LEVELS[level];
    const colors = {
      0: 'bg-emerald-500/10 text-emerald-600',
      1: 'bg-amber-500/10 text-amber-600',
      2: 'bg-destructive/10 text-destructive',
      3: 'bg-destructive/20 text-destructive',
      4: 'bg-destructive/30 text-destructive',
    };
    return (
      <Badge variant="outline" className={cn('text-xs', colors[level])}>
        L{level}: {config.label}
      </Badge>
    );
  };

  const getFlagBadge = (flag: TrustFlag) => {
    const config = FLAG_LABELS[flag];
    const colors = {
      info: 'bg-emerald-500/10 text-emerald-600',
      warning: 'bg-amber-500/10 text-amber-600',
      danger: 'bg-destructive/10 text-destructive',
    };
    return (
      <Badge key={flag} variant="outline" className={cn('text-xs', colors[config.severity])}>
        {config.label}
      </Badge>
    );
  };

  const saveAnnotation = (userId: string) => {
    setProfiles(prev => prev.map(p => 
      p.id === userId ? { ...p, notes: annotationNotes[userId] || p.notes } : p
    ));
    setSelectedProfile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Trust & Governance Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            Informational only — No automatic restrictions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-muted-foreground">Level 0: Clean</span>
            </div>
            <p className="text-2xl font-bold">{profiles.filter(p => p.escalationLevel === 0).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-muted-foreground">Level 1: Observation</span>
            </div>
            <p className="text-2xl font-bold">{profiles.filter(p => p.escalationLevel === 1).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Flag className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Level 2: Review</span>
            </div>
            <p className="text-2xl font-bold">{profiles.filter(p => p.escalationLevel === 2).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Trust Score</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.round(profiles.reduce((sum, p) => sum + p.trustScore, 0) / profiles.length)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trust Profiles List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">User Trust Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profiles.map(profile => (
            <div 
              key={profile.id}
              className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold">{profile.displayName}</span>
                    <span className="text-sm text-muted-foreground">@{profile.handle}</span>
                    <Badge variant="outline" className={cn('text-xs capitalize', TIER_COLORS[profile.eraTier as keyof typeof TIER_COLORS])}>
                      {profile.eraTier}
                    </Badge>
                    {profile.isVerified && (
                      <Badge variant="outline" className="text-xs bg-verified/10 text-verified">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Trust Score:</span>
                      <span className={cn('font-bold', getScoreColor(profile.trustScore))}>
                        {profile.trustScore}
                      </span>
                    </div>
                    {getEscalationBadge(profile.escalationLevel as EscalationLevel)}
                  </div>

                  {/* Trust Factors */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                    <span>Account age: {profile.factors.accountAgeDays}d</span>
                    <span>Completion rate: {(profile.factors.interactionCompletionRate * 100).toFixed(0)}%</span>
                    <span>Reports received: {profile.factors.reportsReceived}</span>
                    <span>Reports upheld: {profile.factors.reportsUpheld}</span>
                    <span>Blocks received: {profile.factors.blocksReceived}</span>
                    <span>Positive indicators: {profile.factors.positiveIndicators}</span>
                  </div>

                  {/* Flags */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {profile.flags.map(flag => getFlagBadge(flag))}
                  </div>

                  {/* Notes */}
                  {profile.notes && (
                    <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2 mb-2">
                      <span className="font-medium">Notes: </span>{profile.notes}
                    </div>
                  )}

                  {/* Annotation Section */}
                  {selectedProfile === profile.id ? (
                    <div className="space-y-2 mt-3">
                      <Textarea
                        value={annotationNotes[profile.id] || profile.notes}
                        onChange={(e) => setAnnotationNotes(prev => ({ ...prev, [profile.id]: e.target.value }))}
                        placeholder="Add internal annotation..."
                        className="text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveAnnotation(profile.id)}>
                          Save Note
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedProfile(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedProfile(profile.id)}
                    >
                      Annotate
                    </Button>
                  )}
                </div>

                {/* Trust Score Visual */}
                <div className="text-center">
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold',
                    profile.trustScore >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                    profile.trustScore >= 60 ? 'bg-amber-500/10 text-amber-600' :
                    'bg-destructive/10 text-destructive'
                  )}>
                    {profile.trustScore}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Simulation Notice */}
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            This panel is for monitoring only. Trust scores do not trigger automatic restrictions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
