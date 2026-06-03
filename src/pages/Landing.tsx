import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandMark } from '@/components/BrandMark';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fe: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fe.email = err.message;
        if (err.path[0] === 'password') fe.password = err.message;
      });
      setErrors(fe);
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message.includes('Invalid login credentials')
            ? 'Invalid email or password. Please try again.'
            : error.message,
          variant: 'destructive',
        });
      } else {
        navigate('/feed');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Users, title: t('landing.features.community'), description: t('landing.features.communityDesc') },
    { icon: Heart, title: t('landing.features.resources'), description: t('landing.features.resourcesDesc') },
    { icon: Shield, title: t('landing.features.safe'), description: t('landing.features.safeDesc') },
  ];

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/crisis">
                <Phone className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t('nav.crisisSupport')}</span>
              </Link>
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main split: marketing (left) + login card (right) */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[55fr_45fr] gap-10 lg:gap-12 items-center min-h-[calc(100dvh-5rem)]">
          {/* RIGHT on desktop / TOP on mobile: Login card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 lg:order-2 w-full max-w-md mx-auto lg:ml-auto lg:mr-0"
          >
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex justify-center mb-6">
                <BrandMark />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                  {errors.email && <p className="text-body text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-body text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.login')}
                </Button>

                <Link
                  to="/auth?mode=forgot"
                  className="block text-center text-body text-primary hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-label text-muted-foreground uppercase tracking-wider">
                      or
                    </span>
                  </div>
                </div>

                <Button type="button" variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/auth?mode=signup">Create new account</Link>
                </Button>
              </form>
            </div>
          </motion.div>

          {/* LEFT on desktop / BOTTOM on mobile: Marketing */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-body font-medium">
                <Heart className="h-4 w-4" />
                <span>Mental health support for everyone</span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              {t('landing.hero.title')}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-title sm:text-headline text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div variants={fadeInUp} className="grid sm:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-5 text-center hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-body font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-label text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Crisis CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-crisis/10 to-crisis/5 border border-crisis/20 rounded-2xl p-8 md:p-12 text-center">
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <BrandMark />
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-body text-muted-foreground">
              <Link to="/transparency" className="hover:text-foreground transition-colors">Trust & Transparency</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
              <Link to="/guidelines" className="hover:text-foreground transition-colors">{t('footer.guidelines')}</Link>
              <Link to="/crisis" className="hover:text-foreground transition-colors">Crisis Support</Link>
            </nav>
            <p className="text-body text-muted-foreground">© {new Date().getFullYear()} SelfERA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
