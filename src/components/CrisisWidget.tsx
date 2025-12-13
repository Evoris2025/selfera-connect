import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CrisisWidget() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl bg-gradient-to-br from-crisis/10 to-crisis/5 border border-crisis/20 p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-crisis/20">
          <Heart className="h-5 w-5 text-crisis" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            {t('landing.crisis.title')}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t('landing.crisis.subtitle')}
          </p>
          <Button variant="crisis" size="sm" asChild>
            <Link to="/crisis">
              <Phone className="h-4 w-4 mr-2" />
              {t('landing.crisis.cta')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
