import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { BrandSectionLabel } from '@/components/brand';
import { cn } from '@/lib/utils';

const calmFade = { duration: 0.25, ease: 'easeOut' as const };
const calmSlide = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const };

export function FollowRequestsSection() {
  const { pendingRequests, pendingCount, isLoading, approveRequest, rejectRequest } = useFollowRequests();
  const [isExpanded, setIsExpanded] = useState(true);

  // Safety net: if the hook gets stuck in `isLoading` (auth race, network hang),
  // collapse to the empty branch after 5s instead of showing skeletons forever.
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }
    const id = window.setTimeout(() => setLoadingTimedOut(true), 5000);
    return () => window.clearTimeout(id);
  }, [isLoading]);

  // Empty state — render NOTHING. No header, no skeleton, no spacing artifact.
  // Covers: confirmed-empty, loading-but-already-empty, and stuck-loading > 5s.
  if ((!isLoading || loadingTimedOut) && pendingCount === 0) {
    return null;
  }

  // Still loading and we don't yet know if there are requests:
  // render nothing rather than a sticky skeleton with a stale header.
  if (isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={calmFade}
      className="pt-2"
    >
      <button
        type="button"
        className="w-full flex items-center mt-6 mb-3 px-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <BrandSectionLabel>FOLLOW REQUESTS</BrandSectionLabel>
        <span className="ml-2 text-caption font-medium uppercase tracking-[0.12em] text-white/55">
          ({pendingCount})
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={calmFade}
          className="ml-auto"
        >
          <ChevronDown className="h-3.5 w-3.5 text-white/45" />
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
                className="flex items-center gap-3 px-4 py-3"
              >
                <Link
                  to={`/profile/${request.follower.handle}`}
                  className="relative shrink-0"
                >
                  <Avatar className="h-9 w-9 border border-white/[0.12]">
                    <AvatarImage src={request.follower.avatar} alt={request.follower.name} />
                    <AvatarFallback className="bg-gradient-to-br from-white/10 to-white/5 text-white text-label font-medium">
                      {request.follower.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Link
                  to={`/profile/${request.follower.handle}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-body leading-snug">
                    <span className="font-medium text-white">{request.follower.name}</span>
                    <span className="text-white/85">{' '}wants to follow you</span>
                  </p>
                  <p className="text-caption text-white/45 uppercase tracking-[0.08em] mt-1">
                    @{request.follower.handle} · {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                  </p>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      approveRequest(request.id);
                    }}
                    aria-label="Approve"
                    className={cn(
                      'h-8 w-8 rounded-full border border-white/15 bg-transparent',
                      'flex items-center justify-center text-white/85',
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      rejectRequest(request.id);
                    }}
                    aria-label="Reject"
                    className={cn(
                      'h-8 w-8 rounded-full border border-white/15 bg-transparent',
                      'flex items-center justify-center text-white/55',
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
