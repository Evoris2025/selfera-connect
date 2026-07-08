import { useId } from 'react';
import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

const labelMap: Record<ReactionType, string> = {
  like: 'Love',
  relatable: 'Relatable',
  inspiring: 'Inspiring',
  support: 'Support',
  curious: 'Curious',
};

export function FluentEmoji({ type, size = 28, className }: FluentEmojiProps) {
  const id = useId().replace(/:/g, '');
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    role: 'img',
    'aria-label': labelMap[type],
    className,
    style: {
      width: size,
      height: size,
      display: 'inline-block',
      filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.35))',
      userSelect: 'none' as const,
    },
  };

  if (type === 'like') {
    return (
      <svg {...commonProps}>
        <defs>
          <linearGradient id={`${id}-heart`} x1="18" y1="8" x2="49" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff6b83" />
            <stop offset="0.48" stopColor="#f12855" />
            <stop offset="1" stopColor="#b8123d" />
          </linearGradient>
          <radialGradient id={`${id}-heartGlow`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 20) rotate(62) scale(34 26)">
            <stop stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="0.32" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path fill={`url(#${id}-heart)`} d="M32 56S8 42.2 8 23.6C8 14.7 15.2 8 23.5 8c4.9 0 8.1 2.5 10.5 6.2C36.4 10.5 39.6 8 44.5 8 52.8 8 60 14.7 60 23.6 60 42.2 32 56 32 56Z" />
        <path fill={`url(#${id}-heartGlow)`} d="M32 54S10 41.1 10 24.2C10 16.5 16 10 23.4 10c4.7 0 7.5 2.6 9.1 5.8C34.3 12.6 37 10 41.8 10c7.3 0 13.1 5.7 13.1 13.4C54.9 40.6 32 54 32 54Z" />
        <path fill="#fff" fillOpacity="0.55" d="M18.2 18.2c3.4-4 9.1-4.2 12.4-.3.7.8.6 2-.2 2.7-.8.7-1.9.5-2.6-.2-2.1-2.4-5.1-2.1-6.9.1-1.2 1.4-3.8.1-2.7-2.3Z" />
      </svg>
    );
  }

  const faceMood: Record<Exclude<ReactionType, 'like'>, { mouth: JSX.Element; extras?: JSX.Element; brow?: JSX.Element }> = {
    relatable: {
      mouth: <path d="M20 37c3 7 9 10 14 10s11-3 14-10" fill="none" stroke="#6b3300" strokeWidth="4" strokeLinecap="round" />,
      extras: <><path d="M18 35h28" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round" /><path d="M15 29c-5-2-8-6-7-10M49 29c5-2 8-6 7-10" stroke="#4aa3ff" strokeWidth="3" strokeLinecap="round" /></>,
    },
    inspiring: {
      mouth: <ellipse cx="32" cy="43" rx="6" ry="8" fill="#6b3300" />,
      extras: <><path d="M11 14l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.4 2.4.8-5-3.6-3.5 5-.7L11 14ZM52 11l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5L52 11Z" fill="#fff2a8" /></>,
    },
    support: {
      mouth: <path d="M23 42c2.5 2.7 5.6 4 9 4s6.5-1.3 9-4" fill="none" stroke="#6b3300" strokeWidth="4" strokeLinecap="round" />,
      extras: <><path d="M17 42c-6 1-9 5-8 10 6 1 10-2 12-8M47 42c6 1 9 5 8 10-6 1-10-2-12-8" fill="#ffb24a" opacity="0.95" /></>,
      brow: <><path d="M20 25c3-3 7-3 10 0M34 25c3-3 7-3 10 0" fill="none" stroke="#6b3300" strokeWidth="3" strokeLinecap="round" /></>,
    },
    curious: {
      mouth: <path d="M25 44c4-2 9-2 14 0" fill="none" stroke="#6b3300" strokeWidth="4" strokeLinecap="round" />,
      extras: <path d="M41 10c5 1 9 5 9 10 0 6-5 9-10 10" fill="none" stroke="#fff2a8" strokeWidth="4" strokeLinecap="round" />,
      brow: <><path d="M19 24c3-4 7-5 11-2M35 22c4-3 8-2 11 2" fill="none" stroke="#6b3300" strokeWidth="3" strokeLinecap="round" /></>,
    },
  };

  const mood = faceMood[type as Exclude<ReactionType, 'like'>];

  return (
    <svg {...commonProps}>
      <defs>
        <radialGradient id={`${id}-face`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 18) rotate(55) scale(45)">
          <stop stopColor="#fff7a8" />
          <stop offset="0.45" stopColor="#ffd542" />
          <stop offset="1" stopColor="#f39a18" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 17) rotate(48) scale(28 20)">
          <stop stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {mood.extras}
      <circle cx="32" cy="32" r="26" fill={`url(#${id}-face)`} />
      <circle cx="32" cy="32" r="24" fill={`url(#${id}-shine)`} />
      {mood.brow}
      <circle cx="23" cy="30" r="4" fill="#5f2c00" />
      <circle cx="41" cy="30" r="4" fill="#5f2c00" />
      <circle cx="21.6" cy="28.4" r="1.1" fill="#fff" fillOpacity="0.9" />
      <circle cx="39.6" cy="28.4" r="1.1" fill="#fff" fillOpacity="0.9" />
      {mood.mouth}
    </svg>
  );
}

