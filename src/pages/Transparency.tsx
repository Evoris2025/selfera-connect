import { Heart, Shield, Users, Scale, Lock, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Transparency() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Heart,
      title: 'What SelfERA Is',
      content: [
        'A peer support and community platform for mental wellness',
        'A space to share experiences, connect with others, and discover professional support',
        'A directory to find verified mental health professionals',
        'A tool for professionals to connect with people seeking support',
      ],
    },
    {
      icon: Shield,
      title: 'What SelfERA Is Not',
      content: [
        'Not a healthcare provider or medical service',
        'Not a crisis intervention service (though we provide crisis resources)',
        'Not a replacement for professional therapy or treatment',
        'Not a diagnostic tool or treatment platform',
      ],
    },
    {
      icon: Scale,
      title: 'Clinical Care Boundaries',
      content: [
        'SelfERA does not provide clinical diagnosis or treatment',
        'Professionals listed in our directory operate independently',
        'We facilitate connections but do not control practitioner services',
        'Treatment decisions remain between you and your chosen provider',
        'We do not store clinical notes or treatment records',
      ],
    },
    {
      icon: Lock,
      title: 'Data & Privacy Principles',
      content: [
        'We do not sell your personal data to third parties',
        'Your messages are private between you and your recipients',
        'We use minimal data necessary to provide our services',
        'You control your content and can delete it at any time',
        'Revenue comes from professional subscriptions, not your data',
      ],
    },
    {
      icon: Users,
      title: 'Moderation Principles',
      content: [
        'All reports are reviewed by trained human moderators',
        'We maintain clear community guidelines for safety',
        'Moderation decisions are logged for accountability',
        'We prioritize user safety while respecting expression',
        'Appeals are handled fairly with documented processes',
      ],
    },
    {
      icon: MessageCircle,
      title: 'Verification Standards',
      content: [
        'Professional verification requires credential documentation',
        'Verification indicates identity confirmation, not endorsement',
        'We verify licensing status where applicable',
        'Organisation accounts require registration documentation',
        'Verification badges indicate completed review, not guaranteed quality',
      ],
    },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Trust & Transparency
          </h1>
          <p className="text-muted-foreground text-lg">
            Understanding how SelfERA works, what we stand for, and how we protect you.
          </p>
        </div>

        <Separator className="my-6" />

        {/* Core Message */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-center text-foreground leading-relaxed">
              SelfERA exists to make mental wellness support more accessible, connected, and human. 
              We believe in transparency, user autonomy, and ethical technology. 
              This page explains our commitments to you.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <Separator />
          <p className="text-sm text-muted-foreground pt-4">
            Questions about our practices? We're committed to open dialogue.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/crisis')}>
              Crisis Resources
            </Button>
            <Button variant="outline" onClick={() => navigate('/directory')}>
              Find Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
