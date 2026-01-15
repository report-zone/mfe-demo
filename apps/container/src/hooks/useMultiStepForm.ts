/**
 * Multi-Step Form Hook
 * 
 * Following Single Responsibility Principle (SRP),
 * multi-step form state management is extracted into a reusable hook.
 */

import { useState } from 'react';

export interface UseMultiStepFormResult {
  activeStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}

/**
 * Hook for managing multi-step form navigation
 * 
 * @param totalSteps - Total number of steps in the form
 * @returns Methods and state for managing form steps
 */
export const useMultiStepForm = (totalSteps: number): UseMultiStepFormResult => {
  const [activeStep, setActiveStep] = useState(0);

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;

  const nextStep = () => {
    setActiveStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const previousStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setActiveStep(step);
    }
  };

  const reset = () => {
    setActiveStep(0);
  };

  return {
    activeStep,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    goToStep,
    reset,
  };
};
