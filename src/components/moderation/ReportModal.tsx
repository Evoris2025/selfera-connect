import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, AlertTriangle, MessageSquare, Users, FileText, Shield, Heart, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useReports, ReportTargetType, ReportReason } from '@/hooks/useReports';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
}

const reportReasons: { value: ReportReason; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'harassment', 
    label: 'Harassment or bullying', 
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'Targeting someone with abuse'
  },
  { 
    value: 'hate_speech', 
    label: 'Hate or discrimination', 
    icon: <Shield className="h-4 w-4" />,
    description: 'Attacks based on identity'
  },
  { 
    value: 'sexual_content', 
    label: 'Sexual content', 
    icon: <Flag className="h-4 w-4" />,
    description: 'Inappropriate sexual material'
  },
  { 
    value: 'self_harm', 
    label: 'Self-harm content', 
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'Content related to self-harm or suicide'
  },
  { 
    value: 'scam', 
    label: 'Scam or impersonation', 
    icon: <Users className="h-4 w-4" />,
    description: 'Pretending to be someone else or fraud'
  },
  { 
    value: 'spam', 
    label: 'Spam', 
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Repetitive or irrelevant content'
  },
  { 
    value: 'misinformation', 
    label: 'Health misinformation', 
    icon: <FileText className="h-4 w-4" />,
    description: 'False or misleading health claims'
  },
  { 
    value: 'other', 
    label: 'Something else', 
    icon: <Flag className="h-4 w-4" />,
    description: 'Other issue not listed above'
  },
];

export function ReportModal({ 
  open, 
  onOpenChange, 
  targetType, 
  targetId,
  targetLabel 
}: ReportModalProps) {
  const { submitReport, isSubmitting } = useReports();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [step, setStep] = useState<'reason' | 'details' | 'success' | 'crisis'>('reason');

  const handleSubmit = async () => {
    if (!selectedReason) return;

    const result = await submitReport(targetType, targetId, selectedReason, details);
    
    if (result.success) {
      // Show crisis support banner for self-harm reports
      if (result.isSelfHarm) {
        setStep('crisis');
      } else {
        setStep('success');
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setSelectedReason(null);
      setDetails('');
      setStep('reason');
    }, 300);
  };

  const targetTypeLabel = {
    post: 'post',
    comment: 'comment',
    profile: 'user',
    message: 'message',
    interaction: 'interaction',
  }[targetType];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-muted-foreground" />
            Report {targetLabel || targetTypeLabel}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'reason' && (
            <motion.div
              key="reason"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Why are you reporting this {targetTypeLabel}?
              </p>
              
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {reportReasons.map((reason) => (
                  <button
                    key={reason.value}
                    onClick={() => setSelectedReason(reason.value)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all',
                      'border hover:bg-secondary/50',
                      selectedReason === reason.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    )}
                  >
                    <div className={cn(
                      'mt-0.5',
                      selectedReason === reason.value ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {reason.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{reason.label}</p>
                      <p className="text-xs text-muted-foreground">{reason.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep('details')}
                  disabled={!selectedReason}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-sm font-medium mb-2">
                  {reportReasons.find(r => r.value === selectedReason)?.label}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add any additional details that might help us review this report.
                </p>
              </div>

              <Textarea
                placeholder="Tell us more (optional)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="resize-none"
              />

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep('reason')}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Flag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thanks for reporting</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reported content is reviewed by our safety team. Your report helps keep SelfERA safe.
              </p>
              <Link 
                to="/transparency" 
                className="text-xs text-muted-foreground hover:text-foreground underline mb-6 block"
              >
                Community Guidelines
              </Link>
              <Button onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          )}

          {step === 'crisis' && (
            <motion.div
              key="crisis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-crisis/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-crisis" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thanks for reporting</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reported content is reviewed by our safety team.
              </p>
              
              {/* Passive crisis support banner */}
              <div className="bg-crisis/5 border border-crisis/20 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-foreground mb-2">
                  You're not alone. Support is available.
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  If you or someone you know needs help, crisis support resources are available.
                </p>
                <Button variant="crisis" size="sm" asChild>
                  <Link to="/crisis">
                    <Phone className="h-4 w-4 mr-2" />
                    Crisis Support
                  </Link>
                </Button>
              </div>

              <Button onClick={handleClose} variant="outline">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
