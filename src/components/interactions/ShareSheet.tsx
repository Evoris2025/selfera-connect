import { useTranslation } from 'react-i18next';
import { Copy, MessageCircle, Users, Check, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Drawer } from '@/components/ui/drawer';
import {
  BrandDrawerContent,
  BrandSheetTitle,
  BrandSheetItem,
} from '@/components/ui/sheet-system';

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onSuccess?: () => void;
}

const springConfig = { type: 'spring' as const, stiffness: 400, damping: 30 };

const ROW_ACCENT = 'hsl(217 91% 60%)'; // brand blue — matches --gradient-start

export function ShareSheet({ open, onOpenChange, postId, onSuccess }: ShareSheetProps) {
  const { t } = useTranslation();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);

    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    onSuccess?.();

    setTimeout(() => {
      setCopiedLink(false);
      onOpenChange(false);
    }, 500);
  };

  const handleSendMessage = () => onOpenChange(false);
  const handleShareToCommunity = () => onOpenChange(false);

  const shareOptions: Array<{
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    showCheck?: boolean;
  }> = [
    { icon: Copy, label: t('share.copyLink'), onClick: handleCopyLink, showCheck: copiedLink },
    { icon: MessageCircle, label: t('share.sendMessage'), onClick: handleSendMessage },
    { icon: Users, label: t('share.shareToCommunity'), onClick: handleShareToCommunity },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <BrandDrawerContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
        >
          <BrandSheetTitle setup="share" emphasis="THIS" srDescription={t('share.title')} />

          <div className="flex flex-col gap-2 mt-2">
            {shareOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: index * 0.05 }}
                >
                  <BrandSheetItem
                    icon={
                      <AnimatePresence mode="wait">
                        {option.showCheck ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="inline-flex"
                          >
                            <Check
                              size={22}
                              strokeWidth={1.6}
                              stroke="url(#selfera-brand-gradient)"
                              fill="none"
                              aria-hidden
                            />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="inline-flex"
                          >
                            <Icon
                              size={22}
                              strokeWidth={1.6}
                              stroke="url(#selfera-brand-gradient)"
                              fill="none"
                              aria-hidden
                              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}
                            />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    }
                    title={option.label}
                    accentColor={ROW_ACCENT}
                    onClick={option.onClick}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </BrandDrawerContent>
    </Drawer>
  );
}
