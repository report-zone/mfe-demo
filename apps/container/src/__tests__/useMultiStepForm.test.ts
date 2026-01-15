import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMultiStepForm } from '../hooks/useMultiStepForm';

describe('useMultiStepForm hook', () => {
  it('should initialize with step 0', () => {
    const { result } = renderHook(() => useMultiStepForm(3));
    
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it('should move to next step', () => {
    const { result } = renderHook(() => useMultiStepForm(3));
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.activeStep).toBe(1);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);
  });

  it('should move to previous step', () => {
    const { result } = renderHook(() => useMultiStepForm(3));
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.activeStep).toBe(1);
    
    act(() => {
      result.current.previousStep();
    });
    
    expect(result.current.activeStep).toBe(0);
  });

  it('should not go below step 0', () => {
    const { result } = renderHook(() => useMultiStepForm(3));
    
    act(() => {
      result.current.previousStep();
    });
    
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
  });

  it('should not go beyond last step', () => {
    const { result } = renderHook(() => useMultiStepForm(3));
    
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
      result.current.nextStep();
    });
    
    expect(result.current.activeStep).toBe(2);
    expect(result.current.isLastStep).toBe(true);
  });

  it('should identify last step correctly', () => {
    const { result } = renderHook(() => useMultiStepForm(3));
    
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
    });
    
    expect(result.current.activeStep).toBe(2);
    expect(result.current.isLastStep).toBe(true);
  });

  it('should go to specific step', () => {
    const { result } = renderHook(() => useMultiStepForm(5));
    
    act(() => {
      result.current.goToStep(3);
    });
    
    expect(result.current.activeStep).toBe(3);
  });

  it('should not go to invalid step (negative)', () => {
    const { result } = renderHook(() => useMultiStepForm(5));
    
    act(() => {
      result.current.goToStep(-1);
    });
    
    expect(result.current.activeStep).toBe(0);
  });

  it('should not go to invalid step (beyond total)', () => {
    const { result } = renderHook(() => useMultiStepForm(5));
    
    act(() => {
      result.current.goToStep(10);
    });
    
    expect(result.current.activeStep).toBe(0);
  });

  it('should reset to step 0', () => {
    const { result } = renderHook(() => useMultiStepForm(3));
    
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
    });
    
    expect(result.current.activeStep).toBe(2);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it('should work with single step form', () => {
    const { result } = renderHook(() => useMultiStepForm(1));
    
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(true);
  });
});
