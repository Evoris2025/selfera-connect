import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Heart, Users, AlertTriangle, Ban, Flag, MessageCircle, Scale } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const guidelines = [
  {
    icon: Heart,
    title: 'Respect & Kindness',
    description: 'Treat everyone with dignity. We are a community focused on mental health and wellbeing. Harassment, bullying, or hate speech of any kind is not tolerated.',
    points: [
      'Be supportive and encouraging',
      'Respect different perspectives and experiences',
      'Use inclusive and welcoming language',
    ],
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Your safety and the safety of our community is our priority. We take reports seriously and review all flagged content.',
    points: [
      'Report content that violates guidelines',
      'Block or mute users who make you uncomfortable',
      'Never share personal information publicly',
    ],
  },
  {
    icon: Users,
    title: 'Authentic Connections',
    description: 'Build genuine relationships. Impersonation, spam, and misleading content undermine trust in our community.',
    points: [
      'Be authentic and honest in your interactions',
      'Do not impersonate others or misrepresent yourself',
      'Respect professional boundaries with providers',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Content Responsibility',
    description: 'Share content that contributes positively. Mark sensitive content appropriately and respect content warnings.',
    points: [
      'Use content warnings for potentially triggering material',
      'Do not share graphic or explicit content',
      'Respect intellectual property and give proper credit',
    ],
  },
  {
    icon: Ban,
    title: 'Prohibited Content',
    description: 'Certain content is never allowed on SelfERA. Violations may result in immediate account suspension.',
    points: [
      'No harassment, threats, or intimidation',
      'No hate speech or discrimination',
      'No explicit sexual content',
      'No promotion of self-harm or dangerous activities',
      'No spam, scams, or fraudulent schemes',
    ],
  },
  {
    icon: Flag,
    title: 'Reporting & Moderation',
    description: 'Our safety team reviews all reports. We aim to take action within 24-48 hours of receiving a report.',
    points: [
      'Use the report feature for violations',
      'Provide details when reporting to help us investigate',
      'False reports may result in account restrictions',
    ],
  },
];

export default function Guidelines() {
  const { t } = useTranslation();

  return (
    <AppLayout title="Community Guidelines">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        className="max-w-3xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Community Guidelines</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            SelfERA is a platform dedicated to mental health and wellbeing. These guidelines help us maintain a safe, supportive, and respectful community for everyone.
          </p>
        </motion.div>

        <Separator />

        {/* Guidelines Cards */}
        <motion.div variants={fadeIn} className="space-y-6">
          {guidelines.map((guideline, index) => (
            <motion.div
              key={guideline.title}
              variants={fadeIn}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-title">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <guideline.icon className="h-5 w-5 text-primary" />
                    </div>
                    {guideline.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-body">{guideline.description}</p>
                  <ul className="space-y-2">
                    {guideline.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-body text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Separator />

        {/* Footer Section */}
        <motion.div variants={fadeIn} className="text-center space-y-4 py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2">
            <MessageCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-headline font-semibold text-foreground">Need Support?</h2>
          <p className="text-muted-foreground text-body max-w-md mx-auto">
            If you're experiencing a mental health crisis, please visit our{' '}
            <a href="/crisis" className="text-primary hover:underline">
              Crisis Support
            </a>{' '}
            page for immediate resources.
          </p>
          <p className="text-label text-muted-foreground">
            Last updated: January 2026
          </p>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}