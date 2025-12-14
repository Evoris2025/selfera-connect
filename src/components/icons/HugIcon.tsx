import { cn } from '@/lib/utils';

interface HugIconProps {
  className?: string;
  size?: number;
}

export function HugIcon({ className, size = 24 }: HugIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
    >
      {/* Face circle */}
      <circle cx="12" cy="12" r="10" />
      {/* Closed happy eyes */}
      <path d="M8.5 9.5c.5-.5 1.5-.5 2 0" />
      <path d="M13.5 9.5c.5-.5 1.5-.5 2 0" />
      {/* Smile */}
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      {/* Hugging hands/cheeks */}
      <path d="M5 11c-.5-1-.5-2 0-3" />
      <path d="M19 11c.5-1 .5-2 0-3" />
    </svg>
  );
}
