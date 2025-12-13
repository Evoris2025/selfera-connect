import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Globe, DollarSign, BadgeCheck, Filter, ExternalLink } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock directory data
const mockServices = [
  {
    id: '1',
    name: 'Open Path Collective',
    handle: 'openpathcollective',
    avatar: '',
    isVerified: true,
    description: 'Affordable online therapy with licensed professionals. Sliding scale fees starting at $30/session.',
    regions: ['Global', 'Online'],
    deliveryType: 'online',
    priceRange: 'affordable',
    languages: ['English', 'Spanish', 'French'],
    tags: ['Therapy', 'Counseling', 'Affordable'],
    website: 'https://openpathcollective.org',
  },
  {
    id: '2',
    name: 'Crisis Text Line',
    handle: 'crisistextline',
    avatar: '',
    isVerified: true,
    description: 'Free, 24/7 text support for people in crisis. Text HOME to 741741.',
    regions: ['United States', 'Canada', 'UK'],
    deliveryType: 'online',
    priceRange: 'free',
    languages: ['English'],
    tags: ['Crisis Support', 'Text Line', 'Free'],
    website: 'https://crisistextline.org',
  },
  {
    id: '3',
    name: 'The Therapy Centre',
    handle: 'therapycentre',
    avatar: '',
    isVerified: true,
    description: 'Community-based mental health services with sliding scale options. In-person and virtual appointments available.',
    regions: ['London', 'UK'],
    deliveryType: 'hybrid',
    priceRange: 'affordable',
    languages: ['English', 'Arabic', 'Bengali'],
    tags: ['Therapy', 'Community', 'Sliding Scale'],
    website: 'https://therapycentre.org',
  },
];

const regions = ['All Regions', 'Global', 'United States', 'UK', 'Canada', 'Europe', 'Asia', 'Africa', 'Latin America'];

export default function Directory() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [deliveryType, setDeliveryType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredServices = mockServices.filter((service) => {
    if (verifiedOnly && !service.isVerified) return false;
    if (deliveryType !== 'all' && service.deliveryType !== deliveryType) return false;
    if (priceRange !== 'all' && service.priceRange !== priceRange) return false;
    if (searchQuery && !service.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !service.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('directory.title')}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{t('directory.subtitle')}</p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-secondary border-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('directory.filters.region')} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={deliveryType} onValueChange={setDeliveryType}>
              <SelectTrigger className="w-40">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('directory.filters.delivery')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="online">{t('directory.filters.online')}</SelectItem>
                <SelectItem value="inPerson">{t('directory.filters.inPerson')}</SelectItem>
                <SelectItem value="hybrid">{t('directory.filters.hybrid')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-40">
                <DollarSign className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('directory.filters.priceRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">{t('directory.filters.free')}</SelectItem>
                <SelectItem value="affordable">{t('directory.filters.affordable')}</SelectItem>
                <SelectItem value="standard">{t('directory.filters.standard')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                id="verified"
                checked={verifiedOnly}
                onCheckedChange={setVerifiedOnly}
              />
              <Label htmlFor="verified" className="text-sm">{t('directory.filters.verifiedOnly')}</Label>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[hsl(25,95%,53%)]/10 border border-[hsl(25,95%,53%)]/20 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
          {t('directory.disclaimer')}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('directory.noResults')}
            </div>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {service.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                            {service.isVerified && <VerifiedBadge />}
                          </div>
                          <p className="text-sm text-muted-foreground">@{service.handle}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={service.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                          </a>
                        </Button>
                      </div>

                      <p className="text-foreground mt-3 mb-4">{service.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {service.regions.join(', ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {service.languages.join(', ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {service.priceRange.charAt(0).toUpperCase() + service.priceRange.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
