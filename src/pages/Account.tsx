import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Shield } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { AppHeader } from '@/components/AppHeader';
import { BrandSectionLabel, BrandSurface, BrandIcon } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { useVerification } from '@/hooks/useVerification';
import { useSubscription } from '@/hooks/useSubscription';

export default function Account() {
  const navigate = useNavigate();
  const { isVerified } = useVerification();
  const { subscription } = useSubscription();

  const planId = subscription?.plan || 'free';
  const isFree = planId === 'free';
  const tierName = isVerified
    ? 'ERA Verified'
    : isFree
    ? 'Free Account'
    : `${planId.charAt(0).toUpperCase()}${planId.slice(1)} Plan`;
  const tierDescription = isVerified
    ? 'Verified status with elevated trust signals across SelfERA.'
    : isFree
    ? 'Full social access on SelfERA, forever free.'
    : 'Active paid plan with extended capabilities.';
  const statusLabel = isVerified || !isFree ? 'Active' : 'Free';

  const benefits = isVerified
    ? [
        'Verified badge on profile & posts',
        'Increased trust with the community',
        'Priority in directory listings',
      ]
    : [
        'Post content & expressions',
        'Basic discovery across SelfERA',
        'Join communities & message peers',
      ];

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null;

  return (
    <AppLayout>
      <AppHeader title="Account" showBackButton onBack={() => navigate('/my-era')} />

      <div className="px-4 py-4 space-y-6">
        {/* CURRENT TIER */}
        <section>
          <div className="mb-3"><BrandSectionLabel>CURRENT TIER</BrandSectionLabel></div>
          <BrandSurface className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <BrandIcon icon={Shield} size={20} />
                <div className="min-w-0">
                  <h2 className="text-title font-semibold text-white truncate">{tierName}</h2>
                  <p className="text-label text-white/55 mt-0.5">{tierDescription}</p>
                </div>
              </div>
              <span
                className={`shrink-0 text-[11px] uppercase tracking-[0.12em] px-2 py-1 rounded-full border ${
                  statusLabel === 'Active'
                    ? 'border-primary/40 text-primary'
                    : 'border-white/15 text-white/55'
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </BrandSurface>
        </section>

        {/* BENEFITS */}
        <section>
          <div className="mb-3"><BrandSectionLabel>BENEFITS</BrandSectionLabel></div>
          <BrandSurface className="p-5">
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" strokeWidth={2.5} />
                  </span>
                  <span className="text-body text-white/85 leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </BrandSurface>
        </section>

        {/* BILLING */}
        <section>
          <div className="mb-3"><BrandSectionLabel>BILLING</BrandSectionLabel></div>
          <BrandSurface className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <BrandIcon icon={CreditCard} size={18} />
              <div className="min-w-0">
                {isFree ? (
                  <p className="text-body text-white/85">No billing on file</p>
                ) : (
                  <>
                    <p className="text-body text-white/85">Active plan: {tierName}</p>
                    {periodEnd && (
                      <p className="text-label text-white/55 mt-0.5">Renews on {periodEnd}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* TODO: wire to billing provider when configured */}
            <Button variant="outline" disabled className="w-full rounded-md">
              Manage billing
            </Button>
          </BrandSurface>
        </section>

        {/* UPGRADE / PLAN */}
        <section>
          <div className="mb-3"><BrandSectionLabel>PLANS</BrandSectionLabel></div>
          <Button
            className="w-full rounded-md"
            onClick={() => {
              // TODO: route to /plans when pricing page exists
            }}
          >
            View plans
          </Button>
        </section>
      </div>
    </AppLayout>
  );
}
