/**
 * Polished Tab Bar Component
 * 
 * A clean, minimal tab bar with border highlight on active tab
 * Matches the design reference with subtle, elegant styling
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label?: string;
  icon?: React.ElementType;
}

interface PolishedTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  showLabels?: boolean;
}

export const PolishedTabBar = memo(function PolishedTabBar({
  tabs,
  activeTab,
  onTabChange,
  className,
  showLabels = false,
}: PolishedTabBarProps) {
  return (
    <div
      className={cn(
        'w-full flex items-center bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-1',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all duration-200',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground/70'
            )}
          >
            {/* Active indicator border */}
            {isActive && (
              <motion.div
                layoutId="polished-tab-indicator"
                className="absolute inset-0 rounded-lg border border-primary/50 bg-primary/5"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Icon */}
            {Icon && (
              <Icon
                className={cn(
                  'relative z-10 w-5 h-5 transition-colors',
                  isActive ? 'text-primary' : ''
                )}
              />
            )}

            {/* Label */}
            {showLabels && tab.label && (
              <span
                className={cn(
                  'relative z-10 text-sm font-medium transition-colors',
                  isActive ? 'text-primary' : ''
                )}
              >
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

export default PolishedTabBar;
