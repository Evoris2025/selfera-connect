import * as React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Compact mobile-style settings list.
 * Rows: [small icon] [label + optional helper] [trailing / chevron]
 * Grouped under small uppercase section headers with 1px dividers.
 * Use for Settings, Internal Admin, filter sheets, and future menu screens.
 */

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <section className={cn('mb-6', className)}>
      {title && (
        <h2 className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </h2>
      )}
      <div className="bg-card/40 border-y border-border/60 divide-y divide-border/60">
        {children}
      </div>
    </section>
  );
}

interface SettingsRowProps {
  icon?: LucideIcon;
  iconClassName?: string;
  label: React.ReactNode;
  helper?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  as?: 'button' | 'div';
  className?: string;
  children?: React.ReactNode; // for inline controls under the label
}

export function SettingsRow({
  icon: Icon,
  iconClassName,
  label,
  helper,
  trailing,
  onClick,
  showChevron,
  as,
  className,
  children,
}: SettingsRowProps) {
  const Comp: any = as ?? (onClick ? 'button' : 'div');
  const interactive = !!onClick;
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left',
        interactive && 'transition-colors hover:bg-accent/5 active:bg-accent/10',
        className
      )}
    >
      {Icon && (
        <span className="flex-shrink-0">
          <Icon className={cn('h-[18px] w-[18px] text-foreground/80', iconClassName)} />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] leading-tight text-foreground truncate">{label}</div>
        {helper && (
          <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground truncate">
            {helper}
          </div>
        )}
        {children}
      </div>
      {trailing && (
        <div className="flex-shrink-0 text-[13px] text-muted-foreground">{trailing}</div>
      )}
      {showChevron && (
        <ChevronRight className="flex-shrink-0 h-4 w-4 text-muted-foreground/70" />
      )}
    </Comp>
  );
}

/** Compact stat tile used for admin overview grid. */
interface StatTileProps {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  accentClassName?: string;
  className?: string;
}

export function StatTile({ icon: Icon, label, value, helper, accentClassName, className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 px-3 py-3 bg-card/40 border border-border/60',
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className={cn('h-3.5 w-3.5', accentClassName)} />}
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] truncate">
          {label}
        </span>
      </div>
      <div className="text-[20px] font-bold leading-none text-foreground">{value}</div>
      {helper && <div className="text-[11px] text-muted-foreground truncate">{helper}</div>}
    </div>
  );
}
