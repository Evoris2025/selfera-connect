import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportModal } from '@/components/moderation/ReportModal';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FlagInteractionButtonProps {
  interactionId: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'icon';
}

export function FlagInteractionButton({ 
  interactionId, 
  variant = 'ghost',
  size = 'sm' 
}: FlagInteractionButtonProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={() => setIsReportOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Flag className="h-4 w-4" />
            {size !== 'icon' && <span className="ml-1">Flag</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Flag this interaction for review</p>
        </TooltipContent>
      </Tooltip>

      <ReportModal
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        targetType="interaction"
        targetId={interactionId}
        targetLabel="interaction"
      />
    </>
  );
}
