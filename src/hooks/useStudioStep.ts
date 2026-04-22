import { useCallback, useState } from 'react';
import type { ContentType } from '@/components/creator/ContentTypeDashboard';

export type StudioStep = 'dashboard' | ContentType;

export interface UseStudioStepOptions {
  initialStep?: StudioStep;
  onClose?: () => void;
  onSuccess?: () => void;
}

/**
 * Shared step-machine for ERA Studio shells (Studio.tsx + CreatorStudio.tsx).
 * Centralizes back/close/select/success transitions so both shells behave identically.
 */
export function useStudioStep(options: UseStudioStepOptions = {}) {
  const { initialStep = 'dashboard', onClose, onSuccess } = options;
  const [step, setStep] = useState<StudioStep>(initialStep);

  const select = useCallback((type: ContentType) => {
    setStep(type);
  }, []);

  const back = useCallback(() => {
    setStep('dashboard');
  }, []);

  const close = useCallback(() => {
    setStep('dashboard');
    onClose?.();
  }, [onClose]);

  const success = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  const reset = useCallback(() => {
    setStep('dashboard');
  }, []);

  return {
    step,
    isDashboard: step === 'dashboard',
    select,
    back,
    close,
    success,
    reset,
    setStep,
  };
}
