/**
 * PHASE J — Trust Transparency Copy
 * 
 * Subtle, human-tone messaging about trust and safety systems.
 * No legal disclaimers. No threatening language.
 */

import React from 'react';
import { Shield, CheckCircle2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransparencyCopyProps {
  variant: 'verified-badge' | 'trust-safety' | 'era-identity';
  className?: string;
}

const COPY_VARIANTS = {
  'verified-badge': {
    icon: CheckCircle2,
    text: 'ERA Verified reflects identity and contribution, not endorsement.',
    tone: 'subtle',
  },
  'trust-safety': {
    icon: Shield,
    text: 'Trust and safety systems operate continuously.',
    tone: 'subtle',
  },
  'era-identity': {
    icon: Heart,
    text: 'Your ERA identity is about authenticity, not performance.',
    tone: 'warm',
  },
} as const;

export function TrustTransparencyCopy({ variant, className }: TransparencyCopyProps) {
  const { icon: Icon, text, tone } = COPY_VARIANTS[variant];
  
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-label',
        tone === 'subtle' && 'text-muted-foreground/70',
        tone === 'warm' && 'text-muted-foreground',
        className
      )}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

/**
 * Inline transparency note for tooltips and small spaces
 */
export function TrustNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-label text-muted-foreground/60 italic', className)}>
      {children}
    </p>
  );
}

/**
 * System separation notice - ensures users understand boundaries
 */
export function SystemSeparationNote({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-1', className)}>
      <TrustNote>Trust systems inform safety, not monetisation.</TrustNote>
      <TrustNote>Visibility reflects contribution, not algorithmic punishment.</TrustNote>
    </div>
  );
}
