import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Globe, 
  DollarSign, 
  Filter, 
  ExternalLink,
  Languages,
  User,
  ChevronDown,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { ProviderDetailModal } from '@/components/directory/ProviderDetailModal';
import { DirectorySearchBar } from '@/components/directory/DirectorySearchBar';
import { useDirectory, DirectoryEntry } from '@/hooks/useDirectory';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

const priceLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'sliding-scale': { label: 'Sliding Scale', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  affordable: { label: 'Affordable', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  standard: { label: 'Standard', color: 'bg-muted text-muted-foreground border-border' },
};

const roleTypes = [
  { value: 'all', label: 'All Providers' },
  { value: 'counsellor', label: 'Counsellor' },
  { value: 'psychologist', label: 'Psychologist' },
  { value: 'psychiatrist', label: 'Psychiatrist' },
  { value: 'social-worker', label: 'Social Worker' },
  { value: 'occupational-therapist', label: 'OT' },
  { value: 'coach', label: 'Coach' },
  { value: 'peer-support', label: 'Peer Support' },
  { value: 'wellbeing', label: 'Wellbeing Org' },
];

export default function Directory() {
  const { t } = useTranslation();
  const {
    entries,
    allEntries,
    loading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    availableRegions,
    availableLanguages,
  } = useDirectory();

  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const handleViewDetails = (entry: DirectoryEntry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springGentle}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('directory.title')}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t('directory.subtitle')}
          </p>
        </motion.div>

        {/* Global Access Note */}
        <motion.div 
          className="flex items-start gap-3 p-4 rounded-xl glass-subtle mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.05 }}
        >
          <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-foreground">{t('directory.globalAccess')}</p>
            <p className="text-muted-foreground mt-1">{t('directory.affordabilityNote')}</p>
          </div>
        </motion.div>

        {/* Search with Real-time Results */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.1 }}
        >
          <DirectorySearchBar
            value={filters.search}
            onChange={(value) => updateFilter('search', value)}
            entries={entries}
            loading={loading}
            onSelectEntry={handleViewDetails}
            placeholder={t('directory.searchPlaceholder') || 'Search providers, services, or topics...'}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springGentle, delay: 0.15 }}
        >
          <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                        Active
                      </Badge>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={clearFilters}
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="verified"
                  checked={filters.verifiedOnly}
                  onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
                />
                <Label htmlFor="verified" className="text-sm text-muted-foreground">
                  {t('directory.filters.verifiedOnly')}
                </Label>
              </div>
            </div>

            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Role Type */}
                <Select value={filters.roleType} onValueChange={(v) => updateFilter('roleType', v)}>
                  <SelectTrigger className="rounded-xl">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t('directory.filters.roleType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roleTypes.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Region */}
                <Select value={filters.region} onValueChange={(v) => updateFilter('region', v)}>
                  <SelectTrigger className="rounded-xl">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t('directory.filters.region')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('directory.filters.allRegions')}</SelectItem>
                    {availableRegions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Delivery Type */}
                <Select value={filters.deliveryType} onValueChange={(v) => updateFilter('deliveryType', v)}>
                  <SelectTrigger className="rounded-xl">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t('directory.filters.delivery')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('directory.filters.allDelivery')}</SelectItem>
                    <SelectItem value="online">{t('directory.filters.online')}</SelectItem>
                    <SelectItem value="in-person">{t('directory.filters.inPerson')}</SelectItem>
                    <SelectItem value="hybrid">{t('directory.filters.hybrid')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Price Range */}
                <Select value={filters.priceRange} onValueChange={(v) => updateFilter('priceRange', v)}>
                  <SelectTrigger className="rounded-xl">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t('directory.filters.priceRange')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('directory.filters.allPrices')}</SelectItem>
                    <SelectItem value="free">{t('directory.filters.free')}</SelectItem>
                    <SelectItem value="sliding-scale">{t('directory.filters.slidingScale')}</SelectItem>
                    <SelectItem value="affordable">{t('directory.filters.affordable')}</SelectItem>
                    <SelectItem value="standard">{t('directory.filters.standard')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Language */}
                <Select value={filters.language} onValueChange={(v) => updateFilter('language', v)}>
                  <SelectTrigger className="rounded-xl">
                    <Languages className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t('directory.filters.languages')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('directory.filters.allLanguages')}</SelectItem>
                    {availableLanguages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...springGentle, delay: 0.2 }}
        >
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            {t('directory.disclaimer')}
          </p>
        </motion.div>

        {/* Results Count */}
        {!loading && (
          <motion.p 
            className="text-sm text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('directory.resultsCount', { count: entries.length })}
          </motion.p>
        )}

        {/* Results */}
        <div className="space-y-3">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-border/50 bg-card/50">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : entries.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">{t('directory.noResults')}</p>
            </motion.div>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.05 * Math.min(index, 10) }}
              >
                <GlassCard
                  variant="card"
                  hover
                  className="p-4 cursor-pointer"
                  onClick={() => handleViewDetails(entry)}
                >
                  <div className="flex items-start gap-4">
                    <CinematicAvatar
                      src={entry.profile?.avatar_url || undefined}
                      alt={entry.name}
                      fallback={entry.name.charAt(0)}
                      size="lg"
                      ring={entry.verified ? 'gradient' : 'muted'}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-foreground truncate">
                              {entry.name}
                            </h3>
                            {entry.verified && <EraVerifiedTick size="sm" userEmail={entry.profile?.email || undefined} />}
                          </div>
                          {entry.profile?.handle && (
                            <p className="text-sm text-muted-foreground">
                              @{entry.profile.handle}
                            </p>
                          )}
                        </div>
                        
                        {entry.price_range && priceLabels[entry.price_range] && (
                          <Badge className={`shrink-0 text-xs ${priceLabels[entry.price_range].color}`}>
                            {priceLabels[entry.price_range].label}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {entry.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {entry.tags?.slice(0, 4).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs rounded-full"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {entry.tags && entry.tags.length > 4 && (
                          <Badge variant="secondary" className="text-xs rounded-full">
                            +{entry.tags.length - 4}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        {entry.regions_served && entry.regions_served.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>
                              {entry.regions_served.slice(0, 2).join(', ')}
                              {entry.regions_served.length > 2 && ` +${entry.regions_served.length - 2}`}
                            </span>
                          </div>
                        )}
                        {entry.delivery_type && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            <span className="capitalize">{entry.delivery_type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Provider Detail Modal */}
      <ProviderDetailModal
        entry={selectedEntry}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </AppLayout>
  );
}
