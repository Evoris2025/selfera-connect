import { motion } from 'framer-motion';
import { 
  Heart, 
  ShieldCheck, 
  Ban, 
  Sparkles,
  Check,
  Info,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25 };

const freeForever = [
  'Post content and expressions',
  'Join and create communities',
  'Message peers and connections',
  'Discover providers in directory',
  'Access crisis resources',
  'Follow creators you value',
  'Full social participation',
];

const whatWeNeverSell = [
  'Boosted posts or paid reach',
  'Algorithm ranking advantages',
  'Per-client or per-session fees',
  'Clinical or health data',
  'Your attention to advertisers',
  'Access to crisis support',
];

const howRevenueSupports = [
  'Platform development & safety',
  'Moderation and trust teams',
  'Crisis resource partnerships',
  'Global accessibility improvements',
  'Mental health research contributions',
];

export function TransparencyPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: 0.2 }}
    >
      <GlassCard variant="card" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Our commitment to you</h3>
            <p className="text-body text-muted-foreground">Transparency in everything we do</p>
          </div>
        </div>

        <Accordion type="multiple" className="w-full">
          {/* Free forever */}
          <AccordionItem value="free-forever" className="border-border/50">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400" />
                <span className="text-body font-medium">What's free forever</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pt-2">
                {freeForever.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-body text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-label text-muted-foreground/70 mt-3 pt-3 border-t border-border/30">
                Social participation will never require payment. SelfERA believes expression should be accessible to everyone.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* What we never sell */}
          <AccordionItem value="never-sell" className="border-border/50">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-400" />
                <span className="text-body font-medium">What SelfERA does NOT sell</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pt-2">
                {whatWeNeverSell.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-body text-muted-foreground">
                    <Ban className="w-3.5 h-3.5 text-rose-400/70 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-label text-muted-foreground/70 mt-3 pt-3 border-t border-border/30">
                Professionals pay for visibility tools — never for algorithm priority or guaranteed clients.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* How revenue supports the platform */}
          <AccordionItem value="revenue" className="border-border/50">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-body font-medium">How revenue supports SelfERA</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pt-2">
                {howRevenueSupports.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-body text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-label text-muted-foreground/70 mt-3 pt-3 border-t border-border/30">
                Sustainable revenue helps us stay independent and prioritise user wellbeing over profit.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Provider ethics */}
          <AccordionItem value="ethics" className="border-border/50">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-body font-medium">Provider connection ethics</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2 text-body text-muted-foreground">
                <p>When you connect with a provider through SelfERA:</p>
                <ul className="space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>SelfERA does <strong>not</strong> take commission on sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>We <strong>never</strong> interfere with care relationships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Providers set their own pricing independently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Clinical content stays between you and your provider</span>
                  </li>
                </ul>
                <p className="text-label text-muted-foreground/70 mt-2 pt-3 border-t border-border/30">
                  SelfERA facilitates discovery and connection — nothing more. Your care journey is yours.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </GlassCard>
    </motion.div>
  );
}
