import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandMark } from '@/components/BrandMark';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

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

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Floating brand mark top-left */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center">
          <BrandMark />
        </Link>
      </div>

      {/* Main split: tagline (left) + login card (right) */}
      <main className="flex-1 flex items-center px-6 md:px-12 lg:px-20 pt-24 pb-12">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT: Hero tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[1.05] tracking-tight">
              Your{' '}
              <span className="bg-gradient-to-r from-[#3b82f6] via-[#a855f7] to-[#f97316] bg-clip-text text-transparent">
                wellbeing
              </span>
              <br />
              matters
              <span className="text-primary">.</span>
            </h1>
            <p className="mt-6 text-title sm:text-headline text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {t('landing.hero.subtitle')}
            </p>
          </motion.div>

          {/* RIGHT: Login card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2 w-full max-w-md mx-auto lg:ml-auto lg:mr-0"
          >
            <div className="bg-card border border-border p-6 sm:p-8 shadow-2xl">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
                {errors.email && <p className="text-body text-destructive -mt-2">{errors.email}</p>}

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-body text-destructive -mt-2">{errors.password}</p>}

                <Button type="submit" variant="gradient" size="lg" className="w-full h-12" disabled={loading}>
                  {loading ? t('common.loading') : 'Log in'}
                </Button>

                <Link
                  to="/auth?mode=forgot"
                  className="block text-center text-body text-primary hover:underline pt-1"
                >
                  Forgotten password?
                </Link>

                <div className="border-t border-border my-2" />

                <Button type="button" variant="outline" size="lg" className="w-full h-12" asChild>
                  <Link to="/auth?mode=signup">Create new account</Link>
                </Button>
              </form>
            </div>

            <p className="text-center text-label text-muted-foreground mt-4">
              <Link to="/crisis" className="hover:text-foreground transition-colors underline underline-offset-2">
                Need support now? Crisis resources
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 lg:px-20 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-center sm:justify-start gap-4 pb-3 border-b border-border/50">
            <LanguageSwitcher />
          </div>
          <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-label text-muted-foreground">
            <Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">Sign up</Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">Log in</Link>
            <Link to="/directory" className="hover:text-foreground transition-colors">Directory</Link>
            <Link to="/crisis" className="hover:text-foreground transition-colors">Crisis Support</Link>
            <Link to="/transparency" className="hover:text-foreground transition-colors">Trust & Transparency</Link>
            <Link to="/guidelines" className="hover:text-foreground transition-colors">{t('footer.guidelines')}</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
          </nav>
          <p className="text-label text-muted-foreground/70">
            © {new Date().getFullYear()} SelfERA
          </p>
        </div>
      </footer>
    </div>
  );
}
