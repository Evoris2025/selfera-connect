/**
 * Polished Tab Bar Component
 * 
 * A clean, minimal tab bar with rectangular border highlight on active tab
 * Supports hover labels and responsive label visibility on larger screens
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  showLabelsOnHover?: boolean;
  showLabelsOnLargeScreens?: boolean;
}

export const PolishedTabBar = memo(function PolishedTabBar({
  tabs,
  activeTab,
  onTabChange,
  className,
  showLabels = false,
  showLabelsOnHover = false,
  showLabelsOnLargeScreens = false,
}: PolishedTabBarProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'w-full flex items-center bg-[hsl(240,10%,8%)] border border-border/30 overflow-hidden',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isHovered = hoveredTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors duration-200',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground/60 hover:text-muted-foreground'
            )}
          >
            {/* Active indicator - clean square border */}
            {isActive && (
              <motion.div
                layoutId="polished-tab-indicator"
                className="absolute inset-0 border border-primary bg-primary/5"
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

            {/* Always visible labels */}
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

            {/* Labels visible on large screens */}
            {showLabelsOnLargeScreens && !showLabels && tab.label && (
              <span
                className={cn(
                  'relative z-10 text-sm font-medium transition-colors hidden lg:inline',
                  isActive ? 'text-primary' : ''
                )}
              >
                {tab.label}
              </span>
            )}

            {/* Hover tooltip label */}
            {showLabelsOnHover && !showLabels && tab.label && (
              <AnimatePresence>
                {isHovered && !isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover border border-border shadow-lg z-20 lg:hidden"
                  >
                    <span className="text-xs font-medium text-foreground whitespace-nowrap">
                      {tab.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </button>
        );
      })}
    </div>
  );
});

export default PolishedTabBar;
