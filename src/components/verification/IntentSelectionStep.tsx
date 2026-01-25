import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Stethoscope, 
  Building2, 
  Heart,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type VerificationIntent = 'creator' | 'practitioner' | 'organisation' | 'support_seeker';

interface IntentOption {
  id: VerificationIntent;
  icon: React.ElementType;
  title: string;
  description: string;
  depth: string;
  gradient: string;
}

const intentOptions: IntentOption[] = [
  {
    id: 'creator',
    icon: Sparkles,
    title: 'Creator / Influencer',
    description: 'Wellbeing or mental health content creator',
    depth: 'Light verification',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
  },
  {
    id: 'practitioner',
    icon: Stethoscope,
    title: 'Practitioner',
    description: 'Counsellor, psychologist, psychiatrist, social worker, OT',
    depth: 'Full verification',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
  },
  {
    id: 'organisation',
    icon: Building2,
    title: 'Organisation',
    description: 'Clinic, service provider, wellbeing org',
    depth: 'Full verification',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    id: 'support_seeker',
    icon: Heart,
    title: 'Seeking Support',
    description: 'Access paid support features as a client',
    depth: 'Simple profile',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
  },
];

interface IntentSelectionStepProps {
  selectedIntent: VerificationIntent | null;
  onSelect: (intent: VerificationIntent) => void;
  onContinue: () => void;
  onBack: () => void;
}

const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

export function IntentSelectionStep({
  selectedIntent,
  onSelect,
  onContinue,
  onBack,
}: IntentSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Choose Your Intent</h2>
        <p className="text-sm text-muted-foreground">
          How will you be using SelfERA? This helps us tailor your verification.
        </p>
      </div>

      <div className="grid gap-3">
        {intentOptions.map((option, idx) => {
          const isSelected = selectedIntent === option.id;
          const Icon = option.icon;
          
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                'relative w-full text-left p-4 rounded-2xl border transition-all',
                'hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20',
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-white/[0.08] bg-card/40'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springGentle, delay: idx * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  'bg-gradient-to-br shadow-md',
                  option.gradient
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground">
                      {option.title}
                    </h3>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 mt-1 inline-block">
                    {option.depth}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          variant="ghost"
          className="flex-1 rounded-full"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 rounded-full"
          disabled={!selectedIntent}
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
