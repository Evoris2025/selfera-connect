import { useTranslation } from 'react-i18next';
import { Copy, MessageCircle, Users, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onSuccess?: () => void;
}

const springConfig = { type: "spring" as const, stiffness: 400, damping: 30 };

export function ShareSheet({ open, onOpenChange, postId, onSuccess }: ShareSheetProps) {
  const { t } = useTranslation();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
    
    onSuccess?.();
    
    setTimeout(() => {
      setCopiedLink(false);
      onOpenChange(false);
    }, 500);
  };

  const handleSendMessage = () => {
    // Navigate to messages with post attached - coming soon
    onOpenChange(false);
  };

  const handleShareToCommunity = () => {
    // Open community share modal - coming soon
    onOpenChange(false);
  };

  const shareOptions = [
    {
      icon: Copy,
      label: t('share.copyLink'),
      onClick: handleCopyLink,
      showCheck: copiedLink,
    },
    {
      icon: MessageCircle,
      label: t('share.sendMessage'),
      onClick: handleSendMessage,
    },
    {
      icon: Users,
      label: t('share.shareToCommunity'),
      onClick: handleShareToCommunity,
    },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-safe">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
        >
          <DrawerHeader className="text-center">
            <DrawerTitle>{t('share.title')}</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 pt-0 grid grid-cols-3 gap-4">
            {shareOptions.map((option, index) => (
              <motion.div
                key={option.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: index * 0.05 }}
              >
                <Button
                  variant="ghost"
                  className="w-full h-auto flex flex-col items-center gap-2 p-4 hover:bg-secondary/50"
                  onClick={option.onClick}
                >
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {option.showCheck ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"
                        >
                          <Check className="h-5 w-5 text-primary" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="icon"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"
                        >
                          <option.icon className="h-5 w-5 text-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">
                    {option.label}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
}
