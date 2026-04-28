import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Flag, CheckCircle, MessageSquare, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useFounderAccess } from '@/hooks/useFounderAccess';
import { AdminPlatformOverview } from '@/components/admin/AdminPlatformOverview';
import { AdminReportsPanel } from '@/components/admin/AdminReportsPanel';
import { AdminVerificationPanel } from '@/components/admin/AdminVerificationPanel';
import { AdminTrustPanel } from '@/components/admin/AdminTrustPanel';
import { AdminInteractionsPanel } from '@/components/admin/AdminInteractionsPanel';
import { AdminGovernanceLog } from '@/components/admin/AdminGovernanceLog';

export default function AdminConsole() {
  const navigate = useNavigate();
  const { isFounder, isLoading } = useFounderAccess();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect non-founders
  if (!isLoading && !isFounder) {
    navigate('/feed', { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/feed')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Internal Admin</h1>
              <p className="text-label text-muted-foreground">Simulation Mode — No Enforcement Actions</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1">
              <Flag className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="trust" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Trust</span>
            </TabsTrigger>
            <TabsTrigger value="interactions" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><AdminPlatformOverview /></TabsContent>
          <TabsContent value="reports"><AdminReportsPanel /></TabsContent>
          <TabsContent value="verification"><AdminVerificationPanel /></TabsContent>
          <TabsContent value="trust"><AdminTrustPanel /></TabsContent>
          <TabsContent value="interactions"><AdminInteractionsPanel /></TabsContent>
          <TabsContent value="governance"><AdminGovernanceLog /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
