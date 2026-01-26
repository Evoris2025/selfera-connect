/**
 * Polished Tab Bar Component
 * 
 * A clean, minimal tab bar with rectangular border highlight on active tab
 * Matches the exact design reference: dark solid background, simple border indicator
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
        'w-full flex items-center bg-[hsl(240,10%,8%)] border border-border/20 rounded-lg overflow-hidden',
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
              'relative flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors duration-200',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground/60 hover:text-muted-foreground'
            )}
          >
            {/* Active indicator - rectangular border */}
            {isActive && (
              <motion.div
                layoutId="polished-tab-indicator"
                className="absolute inset-1 rounded-md border border-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
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
