// ERA Tier System - Phase D
// Defines pricing tiers for ERA Verified providers

export type EraTier = 'pink' | 'green' | 'blue' | 'purple' | 'orange';
export type PlanType = 'free' | 'client' | 'provider';

// Tier thresholds (subscriber counts)
export const ERA_TIER_THRESHOLDS = {
  orange: 5_000_000,  // ≥ 5M subscribers
  purple: 1_000_000,  // ≥ 1M subscribers
  blue: 250_000,      // ≥ 250K subscribers
  green: 0,           // Default verified provider tier
} as const;

// Tier interaction price caps
export const ERA_TIER_PRICES: Record<EraTier, number> = {
  pink: 24.99,    // Client tier
  green: 24.99,   // Entry provider tier
  blue: 54.99,    // 250K+ subscribers
  purple: 84.99,  // 1M+ subscribers
  orange: 124.99, // 5M+ subscribers
};

// Client base subscription price
export const CLIENT_BASE_PRICE = 24.99;

// Tier display configuration
export const ERA_TIER_CONFIG: Record<EraTier, {
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  color: string;
  interactionCap: number;
}> = {
  pink: {
    label: 'Client',
    description: 'ERA Verified Client',
    colorClass: 'text-pink-500',
    bgClass: 'bg-pink-500/10',
    borderClass: 'border-pink-500/30',
    color: '#ec4899',
    interactionCap: ERA_TIER_PRICES.pink,
  },
  green: {
    label: 'Verified',
    description: 'ERA Verified Provider',
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    color: '#10b981',
    interactionCap: ERA_TIER_PRICES.green,
  },
  blue: {
    label: 'Verified Pro',
    description: '250K+ Subscribers',
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    color: '#3b82f6',
    interactionCap: ERA_TIER_PRICES.blue,
  },
  purple: {
    label: 'Verified Elite',
    description: '1M+ Subscribers',
    colorClass: 'text-purple-500',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    color: '#a855f7',
    interactionCap: ERA_TIER_PRICES.purple,
  },
  orange: {
    label: 'Verified Legend',
    description: '5M+ Subscribers',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
    color: '#f97316',
    interactionCap: ERA_TIER_PRICES.orange,
  },
};

/**
 * Determines the ERA tier based on subscriber count
 * Evaluation runs top-down: Orange → Purple → Blue → Green
 */
export function getEraTierFromSubscribers(subscriberCount: number): EraTier {
  if (subscriberCount >= ERA_TIER_THRESHOLDS.orange) return 'orange';
  if (subscriberCount >= ERA_TIER_THRESHOLDS.purple) return 'purple';
  if (subscriberCount >= ERA_TIER_THRESHOLDS.blue) return 'blue';
  return 'green';
}

/**
 * Gets the interaction price cap for a given tier
 */
export function getTierPriceCap(tier: EraTier): number {
  return ERA_TIER_PRICES[tier];
}

/**
 * Calculates the amount a client must pay for an interaction
 * Client pays the difference between provider tier price and base subscription
 * Formula: max(provider_tier_price - 24.99, 0)
 */
export function calculateInteractionAmountDue(providerTier: EraTier): number {
  const tierPrice = ERA_TIER_PRICES[providerTier];
  const difference = tierPrice - CLIENT_BASE_PRICE;
  // Never negative, never exceed provider tier cap
  return Math.max(0, Math.min(difference, tierPrice));
}

/**
 * Formats price for display
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Gets tier information for display
 */
export function getTierInfo(tier: EraTier | null) {
  if (!tier) return null;
  return {
    ...ERA_TIER_CONFIG[tier],
    price: ERA_TIER_PRICES[tier],
    formattedPrice: formatPrice(ERA_TIER_PRICES[tier]),
  };
}
