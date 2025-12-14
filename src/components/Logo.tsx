import { Link } from 'react-router-dom';
import logo from '@/assets/logo.jpg';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    icon: 'w-8 h-8',
    gap: 'gap-1.5',
    self: 'text-base',
    era: 'text-base',
  },
  md: {
    icon: 'w-10 h-10',
    gap: 'gap-2',
    self: 'text-lg',
    era: 'text-lg',
  },
  lg: {
    icon: 'w-11 h-11',
    gap: 'gap-2',
    self: 'text-xl',
    era: 'text-xl',
  },
  xl: {
    icon: 'w-14 h-14',
    gap: 'gap-2.5',
    self: 'text-2xl',
    era: 'text-2xl',
  },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      <img 
        src={logo} 
        alt="SelfERA" 
        className={cn(config.icon, 'rounded-xl object-cover flex-shrink-0')} 
      />
      {showText && (
        <span className="font-semibold">
          <span 
            className={cn(
              config.self,
              'text-foreground/90 tracking-tight'
            )}
          >
            Self
          </span>
          <span 
            className={cn(
              config.era,
              'gradient-brand-text tracking-wide font-bold'
            )}
          >
            ERA
          </span>
        </span>
      )}
    </div>
  );
}

export function LogoLink({ 
  to = '/feed', 
  size = 'md', 
  showText = true,
  className 
}: LogoProps & { to?: string }) {
  return (
    <Link to={to} className={cn('flex items-center hover:opacity-90 transition-opacity', className)}>
      <Logo size={size} showText={showText} />
    </Link>
  );
}
