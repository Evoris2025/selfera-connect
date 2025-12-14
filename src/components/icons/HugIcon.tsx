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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
    >
      {/* Face circle */}
      <circle cx="12" cy="12" r="10" />
      
      {/* Happy/teary eyes - curved upward */}
      <path d="M7.5 10.5c.8-1 1.5-1.5 2-1.5s1.2.5 2 1.5" />
      <path d="M12.5 10.5c.8-1 1.5-1.5 2-1.5s1.2.5 2 1.5" />
      
      {/* Smile */}
      <path d="M9 14.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5" />
      
      {/* Hugging arms coming from sides */}
      <path d="M3.5 13c1 1 2.5 1.5 4 1" />
      <path d="M20.5 13c-1 1-2.5 1.5-4 1" />
      
      {/* Small heart at bottom center */}
      <path d="M12 19c-.5-.5-1.5-1-1.5-2 0-.5.5-1 1-1 .3 0 .5.2.5.5 0-.3.2-.5.5-.5.5 0 1 .5 1 1 0 1-1 1.5-1.5 2z" />
    </svg>
  );
}
