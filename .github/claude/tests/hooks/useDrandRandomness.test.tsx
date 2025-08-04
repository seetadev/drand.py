import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDrandRandomness } from '../../src/hooks/useDrandRandomness';
import { DrandProvider } from '../../src/contexts/DrandContext';
import * as DrandService from '../../src/services/DrandService';

jest.mock('../../src/services/DrandService');
const mockDrandService = DrandService as jest.Mocked<typeof DrandService>;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DrandProvider>{children}</DrandProvider>
);

describe('useDrandRandomness Hook', () => {
  const mockRandomnessData = {
    round: 12345,
    randomness: 'test-randomness-beacon',
    signature: 'test-signature',
    previous_signature: 'test-previous-signature'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    expect(result.current.randomness).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastFetched).toBeNull();
  });

  it('fetches latest randomness successfully', async () => {
    mockDrandService.getLatestRandomness.mockResolvedValue(mockRandomnessData);

    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.fetchLatestRandomness();
    });

    expect(result.current.randomness).toEqual(mockRandomnessData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastFetched).not.toBeNull();
  });

  it('handles fetch error gracefully', async () => {
    const errorMessage = 'Failed to fetch randomness';
    mockDrandService.getLatestRandomness.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.fetchLatestRandomness();
    });

    expect(result.current.randomness).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('sets loading state during fetch', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockDrandService.getLatestRandomness.mockReturnValue(promise);

    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    // Start fetching
    act(() => {
      result.current.fetchLatestRandomness();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Resolve the promise
    await act(async () => {
      resolvePromise!(mockRandomnessData);
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.randomness).toEqual(mockRandomnessData);
  });

  it('fetches randomness at specific round', async () => {
    const specificRound = 12340;
    const mockSpecificData = {
      ...mockRandomnessData,
      round: specificRound
    };

    mockDrandService.getRandomnessAtRound.mockResolvedValue(mockSpecificData);

    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.fetchRandomnessAtRound(specificRound);
    });

    expect(mockDrandService.getRandomnessAtRound).toHaveBeenCalledWith(specificRound);
    expect(result.current.randomness).toEqual(mockSpecificData);
  });

  it('verifies randomness data', async () => {
    mockDrandService.getLatestRandomness.mockResolvedValue(mockRandomnessData);
    mockDrandService.verifyRandomness.mockReturnValue(true);

    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.fetchLatestRandomness();
    });

    const isValid = result.current.verifyCurrentRandomness();

    expect(mockDrandService.verifyRandomness).toHaveBeenCalledWith(mockRandomnessData);
    expect(isValid).toBe(true);
  });

  it('handles verification of null randomness', () => {
    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    const isValid = result.current.verifyCurrentRandomness();

    expect(isValid).toBe(false);
    expect(mockDrandService.verifyRandomness).not.toHaveBeenCalled();
  });

  it('clears error on successful fetch after error', async () => {
    mockDrandService.getLatestRandomness
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockRandomnessData);

    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    // First fetch fails
    await act(async () => {
      await result.current.fetchLatestRandomness();
    });

    expect(result.current.error).toBe('Network error');

    // Second fetch succeeds
    await act(async () => {
      await result.current.fetchLatestRandomness();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.randomness).toEqual(mockRandomnessData);
  });

  it('provides refresh functionality', async () => {
    mockDrandService.getLatestRandomness.mockResolvedValue(mockRandomnessData);

    const { result } = renderHook(() => useDrandRandomness(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockDrandService.getLatestRandomness).toHaveBeenCalledTimes(1);
    expect(result.current.randomness).toEqual(mockRandomnessData);
  });
});