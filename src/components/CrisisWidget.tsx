import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CrisisWidgetProps {
  collapsed?: boolean;
}

export function CrisisWidget({ collapsed = false }: CrisisWidgetProps) {
  const { t } = useTranslation();

  // Collapsed state - just show icon with tooltip
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to="/crisis"
            className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-crisis/20 to-crisis/10 border border-crisis/30 hover:from-crisis/30 hover:to-crisis/20 transition-colors"
          >
            <Heart className="h-5 w-5 text-crisis" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {t('landing.crisis.title')}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded state - full widget
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-crisis/10 to-crisis/5 border border-crisis/20 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-crisis/20 shrink-0">
          <Heart className="h-5 w-5 text-crisis" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1 text-body">
            {t('landing.crisis.title')}
          </h3>
          <p className="text-label text-muted-foreground mb-3 line-clamp-2">
            {t('landing.crisis.subtitle')}
          </p>
          <Button variant="crisis" size="sm" asChild className="w-full">
            <Link to="/crisis">
              <Phone className="h-4 w-4 mr-2" />
              {t('landing.crisis.cta')}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
