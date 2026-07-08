import { Users, Flag, CheckCircle, MessageSquare, Activity, Shield } from 'lucide-react';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { StatTile } from '@/components/ui/settings-list';

// Simulated platform metrics for Phase K
const MOCK_PLATFORM_METRICS = {
  totalUsers: 12847,
  verifiedUsers: 892,
  eraTierDistribution: {
    free: 9420,
    pink: 1850,
    green: 420,
    blue: 115,
    purple: 32,
    orange: 10,
  },
  clientProviderRatio: { clients: 8940, providers: 3907 },
  interactions: {
    active: 234,
    completed: 1856,
    cancelled: 89,
    flagged: 12,
  },
  pendingVerifications: 23,
  reportsSubmitted: 156,
  reportsNew: 18,
  reportsReviewing: 7,
};

const tierColors: Record<string, string> = {
  free: 'bg-muted',
  pink: 'bg-tier-pink',
  green: 'bg-tier-green',
  blue: 'bg-tier-blue',
  purple: 'bg-tier-purple',
  orange: 'bg-tier-orange',
};

export function AdminPlatformOverview() {
  useMockSystem();
  const m = MOCK_PLATFORM_METRICS;

  return (
    <div className="space-y-5">
      {/* Compact header */}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h2 className="text-section">Platform Overview</h2>
      </div>

      {/* Primary Stats — tight 2×2 / 4-col grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatTile
          icon={Users}
          accentClassName="text-primary"
          label="Total Users"
          value={m.totalUsers.toLocaleString()}
          helper={`${m.verifiedUsers} verified`}
        />
        <StatTile
          icon={MessageSquare}
          accentClassName="text-blue-500"
          label="Active"
          value={m.interactions.active}
          helper={`${m.interactions.completed.toLocaleString()} completed`}
        />
        <StatTile
          icon={CheckCircle}
          accentClassName="text-verified"
          label="Pending Verif."
          value={m.pendingVerifications}
          helper="awaiting review"
        />
        <StatTile
          icon={Flag}
          accentClassName="text-destructive"
          label="Open Reports"
          value={m.reportsNew + m.reportsReviewing}
          helper={`${m.reportsNew} new · ${m.reportsReviewing} reviewing`}
        />
      </div>

      {/* ERA Tier Distribution */}
      <section>
        <div className="flex items-center gap-2 px-1 mb-2">
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            ERA Tier Distribution
          </h3>
        </div>
        <div className="bg-card/40 border border-border/60 divide-y divide-border/60">
          {Object.entries(m.eraTierDistribution).map(([tier, count]) => {
            const pct = (count / m.totalUsers) * 100;
            return (
              <div key={tier} className="px-3 py-2 flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${tierColors[tier]}`} />
                <span className="text-[13px] capitalize font-medium text-foreground w-16">{tier}</span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tierColors[tier]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[12px] text-muted-foreground tabular-nums w-24 text-right">
                  {count.toLocaleString()} ({pct.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* User Types + Interaction Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <section>
          <h3 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            User Types
          </h3>
          <div className="bg-card/40 border border-border/60 px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[18px] font-bold leading-none">{m.clientProviderRatio.clients.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Clients</p>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-bold leading-none">{m.clientProviderRatio.providers.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Providers</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
              <div className="h-full bg-primary" style={{ width: `${(m.clientProviderRatio.clients / m.totalUsers) * 100}%` }} />
              <div className="h-full bg-verified" style={{ width: `${(m.clientProviderRatio.providers / m.totalUsers) * 100}%` }} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Interaction Health
          </h3>
          <div className="bg-card/40 border border-border/60 divide-y divide-border/60">
            {[
              { label: 'Completed', value: m.interactions.completed.toLocaleString(), color: 'text-emerald-500' },
              { label: 'Active', value: m.interactions.active, color: 'text-blue-500' },
              { label: 'Cancelled', value: m.interactions.cancelled, color: 'text-amber-500' },
              { label: 'Flagged', value: m.interactions.flagged, color: 'text-destructive' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between px-3 py-2">
                <span className="text-[13px] text-muted-foreground">{r.label}</span>
                <span className={`text-[13px] font-semibold tabular-nums ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Simulation Notice */}
      <p className="text-[11px] text-muted-foreground text-center border-t border-dashed border-border/60 pt-3">
        All data shown is simulated for development and testing purposes.
      </p>
    </div>
  );
}
