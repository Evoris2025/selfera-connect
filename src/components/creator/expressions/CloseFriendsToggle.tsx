import { motion } from 'framer-motion';
import { Users, Star } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface CloseFriendsToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  closeFriendsCount?: number;
}

export function CloseFriendsToggle({ enabled, onChange, closeFriendsCount = 0 }: CloseFriendsToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl transition-colors",
        enabled 
          ? "bg-green-500/20 border border-green-500/50" 
          : "bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
          enabled ? "bg-green-500" : "bg-muted"
        )}>
          {enabled ? (
            <Star className="w-5 h-5 text-white" />
          ) : (
            <Users className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className={cn(
            "font-semibold text-sm",
            enabled ? "text-green-400" : "text-foreground"
          )}>
            Close Friends
          </p>
          <p className="text-xs text-muted-foreground">
            {enabled 
              ? `Only ${closeFriendsCount} people will see this`
              : 'Share with everyone'
            }
          </p>
        </div>
      </div>
      
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className={cn(
          enabled && "data-[state=checked]:bg-green-500"
        )}
      />
    </motion.div>
  );
}

// Green ring indicator for Close Friends expressions
interface CloseFriendsRingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CloseFriendsRing({ size = 'md', className }: CloseFriendsRingProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };
  
  return (
    <div 
      className={cn(
        "rounded-full p-[3px] bg-gradient-to-tr from-green-400 to-green-600",
        sizeClasses[size],
        className
      )}
    >
      <div className="w-full h-full rounded-full bg-background" />
    </div>
  );
}
