import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'avatar' | 'card' | 'image';
}

export function SkeletonLoader({ className, variant = 'text' }: SkeletonLoaderProps) {
  const baseClasses = 'skeleton-shimmer';
  
  const variantClasses = {
    text: 'h-4 w-full',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-48 w-full',
    image: 'aspect-video w-full',
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="avatar" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader className="h-4 w-32" />
          <SkeletonLoader className="h-3 w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonLoader className="h-6 w-16" />
        <SkeletonLoader className="h-6 w-20" />
      </div>
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-3/4" />
      <SkeletonLoader variant="image" />
      <div className="flex gap-2">
        <SkeletonLoader className="h-8 w-24" />
        <SkeletonLoader className="h-8 w-24" />
        <SkeletonLoader className="h-8 w-24" />
      </div>
    </div>
  );
}
