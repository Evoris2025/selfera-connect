import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, UserPlus, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

const calmFade = { duration: 0.25, ease: 'easeOut' as const };
const calmSlide = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const };

function RequestSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function FollowRequestsSection() {
  const { pendingRequests, pendingCount, isLoading, approveRequest, rejectRequest } = useFollowRequests();
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="pt-4">
        <div className="px-5 pb-2 flex items-center gap-2">
          <span className="font-semibold text-[15px] text-foreground tracking-tight">Follow Requests</span>
        </div>
        <RequestSkeleton />
        <RequestSkeleton />
      </div>
    );
  }

  if (pendingCount === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={calmFade}
      className="pt-4"
    >
      <button
        className="px-5 pb-3 flex items-center gap-2 w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-primary/10">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-[15px] text-foreground tracking-tight">
            Follow Requests
          </span>
          <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={calmFade}
          className="ml-auto"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={calmSlide}
            className="overflow-hidden"
          >
            {pendingRequests.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...calmSlide, delay: idx * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
              >
                <Link
                  to={`/profile/${request.follower.handle}`}
                  className="relative shrink-0"
                >
                  <Avatar className="h-12 w-12 ring-1 ring-border/50">
                    <AvatarImage src={request.follower.avatar} alt={request.follower.name} />
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-foreground font-medium">
                      {request.follower.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-background border border-border/50 shadow-sm">
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                  </div>
                </Link>

                <Link
                  to={`/profile/${request.follower.handle}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-[14px] text-foreground leading-snug font-medium">
                    <span className="font-semibold">{request.follower.name}</span>
                    {' '}wants to follow you
                  </p>
                  <p className="text-[13px] text-muted-foreground/70 truncate mt-0.5">
                    @{request.follower.handle} · {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                  </p>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      size="icon"
                      variant="default"
                      className="h-9 w-9 rounded-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        approveRequest(request.id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-full border-border/50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        rejectRequest(request.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
