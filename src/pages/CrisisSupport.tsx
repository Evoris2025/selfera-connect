import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Phone, MessageSquare, Globe, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Crisis resources by country
const crisisResources = {
  US: {
    country: 'United States',
    resources: [
      { name: '988 Suicide & Crisis Lifeline', phone: '988', type: 'call', available247: true },
      { name: 'Crisis Text Line', phone: 'Text HOME to 741741', type: 'text', available247: true },
      { name: 'Veterans Crisis Line', phone: '1-800-273-8255', type: 'call', available247: true },
    ],
  },
  UK: {
    country: 'United Kingdom',
    resources: [
      { name: 'Samaritans', phone: '116 123', type: 'call', available247: true },
      { name: 'Crisis Text Line', phone: 'Text SHOUT to 85258', type: 'text', available247: true },
      { name: 'CALM', phone: '0800 58 58 58', type: 'call', available247: false },
    ],
  },
  CA: {
    country: 'Canada',
    resources: [
      { name: 'Talk Suicide Canada', phone: '1-833-456-4566', type: 'call', available247: true },
      { name: 'Crisis Text Line', phone: 'Text HOME to 686868', type: 'text', available247: true },
    ],
  },
  AU: {
    country: 'Australia',
    resources: [
      { name: 'Lifeline', phone: '13 11 14', type: 'call', available247: true },
      { name: 'Beyond Blue', phone: '1300 22 4636', type: 'call', available247: true },
    ],
  },
  IN: {
    country: 'India',
    resources: [
      { name: 'iCALL', phone: '9152987821', type: 'call', available247: false },
      { name: 'Vandrevala Foundation', phone: '1860 2662 345', type: 'call', available247: true },
    ],
  },
  DE: {
    country: 'Germany',
    resources: [
      { name: 'Telefonseelsorge', phone: '0800 111 0 111', type: 'call', available247: true },
    ],
  },
  FR: {
    country: 'France',
    resources: [
      { name: 'SOS Amitié', phone: '09 72 39 40 50', type: 'call', available247: true },
    ],
  },
  BR: {
    country: 'Brazil',
    resources: [
      { name: 'CVV', phone: '188', type: 'call', available247: true },
    ],
  },
};

export default function CrisisSupport() {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState('US');
  const countryData = crisisResources[selectedCountry as keyof typeof crisisResources];

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Emergency Notice */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">{t('crisis.subtitle')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Emergency services: 911 (US), 999 (UK), 112 (EU)
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(25,95%,53%)]/20 flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-[hsl(25,95%,53%)]" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('crisis.title')}</h1>
          <p className="text-muted-foreground">
            Free, confidential support is available.
          </p>
        </div>

        {/* Country Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('crisis.selectCountry')}
          </label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full max-w-xs">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(crisisResources).map(([code, data]) => (
                <SelectItem key={code} value={code}>{data.country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {t('crisis.hotlines')}
          </h2>

          {countryData?.resources.map((resource, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{resource.name}</h3>
                      <div className="flex items-center gap-2">
                        {resource.available247 && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {t('crisis.available247')}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {resource.type === 'call' ? 'Call' : resource.type === 'text' ? t('crisis.textLine') : t('crisis.chatSupport')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border bg-secondary/30 p-4">
                  <a
                    href={resource.type === 'call' ? `tel:${resource.phone.replace(/\D/g, '')}` : undefined}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                      {resource.phone}
                    </span>
                    {resource.type === 'call' && (
                      <Button variant="gradient" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    )}
                    {resource.type === 'text' && (
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Text
                      </Button>
                    )}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* International Resources */}
        <div className="mt-12 bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="font-semibold text-foreground mb-2">Can't find your country?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Visit the International Association for Suicide Prevention for a directory of crisis centers worldwide.
          </p>
          <Button variant="outline" asChild>
            <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-2" />
              Find International Resources
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
