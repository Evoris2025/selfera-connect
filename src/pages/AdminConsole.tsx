import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Activity, ArrowLeft, Users, Tag, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminRole } from '@/hooks/useAdminRole';
import { AdminVerificationQueue } from '@/components/admin/AdminVerificationQueue';
import { AdminModerationQueue } from '@/components/admin/AdminModerationQueue';
import { AdminAuditLog } from '@/components/admin/AdminAuditLog';
import { AdminTopicTags } from '@/components/admin/AdminTopicTags';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminConsole() {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminRole();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/feed');
    }
  }, [isAdmin, isLoading, navigate]);

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Console</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Tags</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview onNavigate={setActiveTab} />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="verification">
            <AdminVerificationQueue />
          </TabsContent>

          <TabsContent value="moderation">
            <AdminModerationQueue onBack={() => setActiveTab('overview')} />
          </TabsContent>

          <TabsContent value="tags">
            <AdminTopicTags />
          </TabsContent>

          <TabsContent value="audit">
            <AdminAuditLog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => onNavigate('analytics')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Analytics</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            View platform metrics and activity trends
          </p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => onNavigate('verification')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verification Queue</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Review and process professional verification requests
          </p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => onNavigate('moderation')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Moderation Queue</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Handle user reports and content moderation
          </p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => onNavigate('tags')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Topic Tags</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Create, edit, and manage topic tags
          </p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => onNavigate('audit')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Audit Log</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            View administrative actions and system events
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Platform Integrity</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• All admin actions are logged for accountability</p>
          <p>• Verification decisions require documented reasoning</p>
          <p>• Moderation follows clear community guidelines</p>
          <p>• Role boundaries are enforced at the database level</p>
        </CardContent>
      </Card>
    </div>
  );
}