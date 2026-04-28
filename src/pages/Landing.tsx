import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Shield, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandMark } from '@/components/BrandMark';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Users,
      title: t('landing.features.community'),
      description: t('landing.features.communityDesc'),
    },
    {
      icon: Heart,
      title: t('landing.features.resources'),
      description: t('landing.features.resourcesDesc'),
    },
    {
      icon: Shield,
      title: t('landing.features.safe'),
      description: t('landing.features.safeDesc'),
    },
  ];

  return (
    <div className="min-h-dvh bg-background">
      {/* Header - Capacitor-style clean sizing */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BrandMark />
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/crisis">
                <Phone className="h-4 w-4 mr-1" />
                {t('nav.crisisSupport')}
              </Link>
            </Button>
            <LanguageSwitcher />
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">{t('auth.login')}</Link>
            </Button>
            <Button variant="gradient" size="sm" asChild className="hidden sm:flex">
              <Link to="/auth?mode=signup">{t('auth.signup')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-20 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-body font-medium mb-8">
              <Heart className="h-4 w-4" />
              <span>Mental health support for everyone</span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            {t('landing.hero.title')}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-title sm:text-headline text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t('landing.hero.subtitle')}
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gradient" size="xl" asChild>
              <Link to="/auth?mode=signup">
                {t('landing.hero.cta')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/directory">{t('landing.hero.explore')}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-headline font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Crisis CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div
            variants={fadeInUp}
            className="bg-gradient-to-br from-crisis/10 to-crisis/5 border border-crisis/20 rounded-2xl p-8 md:p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-crisis/20 flex items-center justify-center mx-auto mb-6">
              <Phone className="h-8 w-8 text-crisis" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t('landing.crisis.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t('landing.crisis.subtitle')}
            </p>
            <Button variant="crisis" size="lg" asChild>
              <Link to="/crisis">{t('landing.crisis.cta')}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <BrandMark />
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-body text-muted-foreground">
              <Link to="/transparency" className="hover:text-foreground transition-colors">
                Trust & Transparency
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                {t('footer.terms')}
              </Link>
              <Link to="/guidelines" className="hover:text-foreground transition-colors">
                {t('footer.guidelines')}
              </Link>
              <Link to="/crisis" className="hover:text-foreground transition-colors">
                Crisis Support
              </Link>
            </nav>

            <p className="text-body text-muted-foreground">
              © {new Date().getFullYear()} SelfERA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
