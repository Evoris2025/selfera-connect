import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStudioStep } from './useStudioStep';

describe('useStudioStep', () => {
  it('starts on dashboard by default', () => {
    const { result } = renderHook(() => useStudioStep());
    expect(result.current.step).toBe('dashboard');
    expect(result.current.isDashboard).toBe(true);
  });

  it('honors initialStep', () => {
    const { result } = renderHook(() => useStudioStep({ initialStep: 'video' }));
    expect(result.current.step).toBe('video');
    expect(result.current.isDashboard).toBe(false);
  });

  it('select() moves into a creator and back() returns to dashboard', () => {
    const { result } = renderHook(() => useStudioStep());
    act(() => result.current.select('post'));
    expect(result.current.step).toBe('post');
    act(() => result.current.back());
    expect(result.current.step).toBe('dashboard');
  });

  it('close() resets and fires onClose', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useStudioStep({ initialStep: 'image', onClose }));
    act(() => result.current.close());
    expect(result.current.step).toBe('dashboard');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('success() fires onSuccess without changing step', () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useStudioStep({ initialStep: 'video', onSuccess }));
    act(() => result.current.success());
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.step).toBe('video');
  });
});
