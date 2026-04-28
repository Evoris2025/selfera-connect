import { useEffect, useMemo, useState, useCallback } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BrandSectionLabel, BrandUnderlineTabs } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';
import { cn } from '@/lib/utils';
import { ExploreVerifiedTick } from './ExploreVerifiedTick';
import {
  MOCK_ACCOUNTS,
  MOCK_TAGS,
  MOCK_POSTS,
  type SearchAccount,
  type SearchTag,
  type SearchPost,
} from './searchResultsData';

/**
 * ExploreSearchResults — submitted-search overlay shown after the user
 * presses Enter or taps a row in ExploreSearchOverlay. Sub-tabs: TOP /
 * ACCOUNTS / TAGS / POSTS, all live-filtered against the current query.
 */

type Subtab = 'top' | 'accounts' | 'tags' | 'posts';

interface ExploreSearchResultsProps {
  query: string;
  submissionId: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function FollowButton() {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsFollowing((v) => !v);
      }}
      className={cn(
        'px-3 py-1.5 rounded-full text-caption font-medium uppercase tracking-[0.08em] transition-colors flex-shrink-0',
        isFollowing
          ? 'border border-white/20 text-white/60 bg-transparent'
          : 'border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]',
      )}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

function FollowTagButton() {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsFollowing((v) => !v);
      }}
      className={cn(
        'px-3 py-1.5 rounded-full text-caption font-medium uppercase tracking-[0.08em] transition-colors flex-shrink-0',
        isFollowing
          ? 'border border-white/20 text-white/60 bg-transparent'
          : 'border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]',
      )}
    >
      {isFollowing ? 'Following' : 'Follow tag'}
    </button>
  );
}

function AccountRow({ a }: { a: SearchAccount }) {
  return (
    <button
      type="button"
      onClick={() => {
        // eslint-disable-next-line no-console
        console.log('[ExploreSearchResults] open account', a.handle);
      }}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={a.avatarUrl} alt="" />
        <AvatarFallback className="bg-white/[0.06] text-white/70 text-label">
          {a.displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-body text-white truncate">{a.displayName}</span>
          <ExploreVerifiedTick tier={a.tier} size="sm" />
        </div>
        <p className="text-caption text-white/45 truncate">
          @{a.handle} · {formatCount(a.followerCount)} followers
        </p>
      </div>
      <FollowButton />
    </button>
  );
}

function TagRow({ t }: { t: SearchTag }) {
  return (
    <button
      type="button"
      onClick={() => {
        // eslint-disable-next-line no-console
        console.log('[ExploreSearchResults] open tag', t.name);
      }}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] text-white/70 text-title font-semibold flex-shrink-0">
        #
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-body text-white truncate">#{t.name}</p>
        <p className="text-caption text-white/45">{formatCount(t.postCount)} posts</p>
      </div>
      <FollowTagButton />
    </button>
  );
}

function PostRow({ p }: { p: SearchPost }) {
  return (
    <button
      type="button"
      onClick={() => {
        // eslint-disable-next-line no-console
        console.log('[ExploreSearchResults] open post', p.id);
      }}
      className="w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.08]"
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={p.author.avatarUrl} alt="" />
          <AvatarFallback className="bg-white/[0.06] text-white/70 text-caption">
            {p.author.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-label text-white font-medium truncate">{p.author.displayName}</span>
          <ExploreVerifiedTick tier={p.author.tier} size="sm" />
          <span className="text-caption text-white/45 truncate">
            · @{p.author.handle} · {p.timeAgo}
          </span>
        </div>
      </div>
      <p className="text-body text-white/85 leading-relaxed mb-2 line-clamp-3">{p.body}</p>
      <div className="flex items-center gap-4 text-white/45 text-caption tabular-nums">
        <span>♥ {formatCount(p.likes)}</span>
        <span>💬 {formatCount(p.comments)}</span>
      </div>
    </button>
  );
}

function EmptyState({ subtab, query }: { subtab: string; query: string }) {
  return (
    <div className="px-4 py-12 text-center">
      <SearchIcon className="w-8 h-8 text-white/30 mx-auto mb-3" strokeWidth={1.5} />
      <p className="text-body text-white/70">
        No {subtab} match "{query}".
      </p>
      <p className="text-label text-white/45 mt-1">Try a different search term.</p>
    </div>
  );
}

export function ExploreSearchResults({ query, submissionId }: ExploreSearchResultsProps) {
  const { primary: themePrimary } = useThemeColor();
  const [activeSubtab, setActiveSubtab] = useState<Subtab>('top');

  useEffect(() => {
    setActiveSubtab('top');
  }, [submissionId]);

  const q = query.trim().toLowerCase();

  const filteredAccounts = useMemo(
    () =>
      q
        ? MOCK_ACCOUNTS.filter(
            (a) =>
              a.displayName.toLowerCase().includes(q) ||
              a.handle.toLowerCase().includes(q.replace(/^@/, '')),
          )
        : MOCK_ACCOUNTS,
    [q],
  );
  const filteredTags = useMemo(
    () =>
      q ? MOCK_TAGS.filter((t) => t.name.toLowerCase().includes(q.replace(/^#/, ''))) : MOCK_TAGS,
    [q],
  );
  const filteredPosts = useMemo(
    () =>
      q
        ? MOCK_POSTS.filter(
            (p) =>
              p.body.toLowerCase().includes(q) ||
              p.author.displayName.toLowerCase().includes(q) ||
              p.author.handle.toLowerCase().includes(q.replace(/^@/, '')),
          )
        : MOCK_POSTS,
    [q],
  );

  const subtabs = [
    { id: 'top', label: 'Top' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'tags', label: 'Tags' },
    { id: 'posts', label: 'Posts' },
  ];

  const seeAllClass = 'text-caption font-medium uppercase tracking-[0.08em] hover:opacity-80 transition-opacity';

  const renderTop = () => {
    const sections = [
      filteredAccounts.length > 0 && (
        <section key="accounts" className="mb-6">
          <div className="px-4 mb-2 flex items-center justify-between">
            <BrandSectionLabel>ACCOUNTS</BrandSectionLabel>
            <button
              type="button"
              onClick={() => setActiveSubtab('accounts')}
              className={seeAllClass}
              style={{ color: themePrimary }}
            >
              See all
            </button>
          </div>
          <ul role="list">
            {filteredAccounts.slice(0, 3).map((a) => (
              <li key={a.id}>
                <AccountRow a={a} />
              </li>
            ))}
          </ul>
        </section>
      ),
      filteredTags.length > 0 && (
        <section key="tags" className="mb-6">
          <div className="px-4 mb-2 flex items-center justify-between">
            <BrandSectionLabel>TAGS</BrandSectionLabel>
            <button
              type="button"
              onClick={() => setActiveSubtab('tags')}
              className={seeAllClass}
              style={{ color: themePrimary }}
            >
              See all
            </button>
          </div>
          <ul role="list">
            {filteredTags.slice(0, 3).map((t) => (
              <li key={t.id}>
                <TagRow t={t} />
              </li>
            ))}
          </ul>
        </section>
      ),
      filteredPosts.length > 0 && (
        <section key="posts" className="mb-6">
          <div className="px-4 mb-2 flex items-center justify-between">
            <BrandSectionLabel>POSTS</BrandSectionLabel>
            <button
              type="button"
              onClick={() => setActiveSubtab('posts')}
              className={seeAllClass}
              style={{ color: themePrimary }}
            >
              See all
            </button>
          </div>
          <div>
            {filteredPosts.slice(0, 3).map((p) => (
              <PostRow key={p.id} p={p} />
            ))}
          </div>
        </section>
      ),
    ].filter(Boolean);

    if (sections.length === 0) return <EmptyState subtab="results" query={query} />;
    return <>{sections}</>;
  };

  return (
    <motion.div
      key={submissionId}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex-1 bg-background overflow-y-auto"
      role="region"
      aria-label="Search results"
    >
      {/* Sub-tab strip — not sticky, sits under the search row */}
      <div className="px-3 border-b border-white/[0.08]">
        <BrandUnderlineTabs
          tabs={subtabs}
          value={activeSubtab}
          onChange={(id) => setActiveSubtab(id as Subtab)}
          ariaLabel="Search results sub-tabs"
        />
      </div>

      <div className="pt-4 pb-12">
        {activeSubtab === 'top' && renderTop()}

        {activeSubtab === 'accounts' &&
          (filteredAccounts.length > 0 ? (
            <ul role="list">
              {filteredAccounts.map((a) => (
                <li key={a.id}>
                  <AccountRow a={a} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState subtab="accounts" query={query} />
          ))}

        {activeSubtab === 'tags' &&
          (filteredTags.length > 0 ? (
            <ul role="list">
              {filteredTags.map((t) => (
                <li key={t.id}>
                  <TagRow t={t} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState subtab="tags" query={query} />
          ))}

        {activeSubtab === 'posts' &&
          (filteredPosts.length > 0 ? (
            <div>
              {filteredPosts.map((p) => (
                <PostRow key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <EmptyState subtab="posts" query={query} />
          ))}
      </div>
    </motion.div>
  );
}
