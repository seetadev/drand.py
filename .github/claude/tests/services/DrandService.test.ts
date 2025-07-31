import { DrandService } from '../../src/services/DrandService';
import { DrandClient } from '../../src/types/DrandTypes';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('DrandService', () => {
  let drandService: DrandService;
  const mockChainHash = 'test-chain-hash-123';
  const mockBaseUrl = 'https://api.drand.sh';

  beforeEach(() => {
    drandService = new DrandService(mockChainHash, mockBaseUrl);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getLatestRandomness', () => {
    const mockRandomnessResponse = {
      round: 12345,
      randomness: 'abc123def456ghi789',
      signature: 'mock-signature-data',
      previous_signature: 'mock-previous-signature'
    };

    it('fetches latest randomness successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRandomnessResponse,
      } as Response);

      const result = await drandService.getLatestRandomness();

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/${mockChainHash}/public/latest`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        })
      );

      expect(result).toEqual(mockRandomnessResponse);
    });

    it('throws error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(drandService.getLatestRandomness()).rejects.toThrow(
        'Failed to fetch randomness: 500 Internal Server Error'
      );
    });

    it('throws error when network request fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(drandService.getLatestRandomness()).rejects.toThrow(
        'Network error'
      );
    });

    it('handles timeout correctly', async () => {
      // Mock a delayed response
      mockFetch.mockImplementation(() => 
        new Promise((resolve) => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockRandomnessResponse,
          } as Response), 15000)
        )
      );

      await expect(drandService.getLatestRandomness()).rejects.toThrow();
    });
  });

  describe('getRandomnessAtRound', () => {
    const mockRound = 12340;
    const mockRoundResponse = {
      round: mockRound,
      randomness: 'round-specific-randomness',
      signature: 'round-signature',
      previous_signature: 'round-previous-signature'
    };

    it('fetches randomness for specific round successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoundResponse,
      } as Response);

      const result = await drandService.getRandomnessAtRound(mockRound);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/${mockChainHash}/public/${mockRound}`,
        expect.any(Object)
      );

      expect(result).toEqual(mockRoundResponse);
    });

    it('throws error for invalid round number', async () => {
      await expect(drandService.getRandomnessAtRound(-1)).rejects.toThrow(
        'Round number must be positive'
      );

      await expect(drandService.getRandomnessAtRound(0)).rejects.toThrow(
        'Round number must be positive'
      );
    });
  });

  describe('verifyRandomness', () => {
    const mockRandomnessData = {
      round: 12345,
      randomness: 'test-randomness',
      signature: 'test-signature',
      previous_signature: 'test-previous-signature'
    };

    it('verifies valid randomness data', () => {
      const isValid = drandService.verifyRandomness(mockRandomnessData);
      expect(isValid).toBe(true);
    });

    it('rejects randomness with invalid signature format', () => {
      const invalidData = {
        ...mockRandomnessData,
        signature: 'invalid-signature-format'
      };

      const isValid = drandService.verifyRandomness(invalidData);
      expect(isValid).toBe(false);
    });

    it('rejects randomness with missing fields', () => {
      const incompleteData = {
        round: 12345,
        randomness: 'test-randomness'
        // missing signature and previous_signature
      } as any;

      const isValid = drandService.verifyRandomness(incompleteData);
      expect(isValid).toBe(false);
    });
  });

  describe('generateSecureInvoiceId', () => {
    const mockInvoiceData = {
      invoiceNumber: 'INV-001',
      clientName: 'Test Client',
      amount: 1000.00,
      timestamp: '2024-01-01T00:00:00.000Z'
    };

    const mockRandomness = 'test-randomness-beacon';

    it('generates consistent secure invoice ID', () => {
      const id1 = drandService.generateSecureInvoiceId(mockInvoiceData, mockRandomness);
      const id2 = drandService.generateSecureInvoiceId(mockInvoiceData, mockRandomness);
      
      expect(id1).toBe(id2);
      expect(id1).toMatch(/^[a-f0-9]{64}$/); // 64-character hex string (SHA-256)
    });

    it('generates different IDs for different invoice data', () => {
      const invoice1 = { ...mockInvoiceData };
      const invoice2 = { ...mockInvoiceData, amount: 2000.00 };

      const id1 = drandService.generateSecureInvoiceId(invoice1, mockRandomness);
      const id2 = drandService.generateSecureInvoiceId(invoice2, mockRandomness);

      expect(id1).not.toBe(id2);
    });

    it('generates different IDs for different randomness', () => {
      const randomness1 = 'randomness-1';
      const randomness2 = 'randomness-2';

      const id1 = drandService.generateSecureInvoiceId(mockInvoiceData, randomness1);
      const id2 = drandService.generateSecureInvoiceId(mockInvoiceData, randomness2);

      expect(id1).not.toBe(id2);
    });
  });

  describe('getChainInfo', () => {
    const mockChainInfo = {
      public_key: 'mock-public-key',
      period: 30,
      genesis_time: 1640995200,
      hash: mockChainHash
    };

    it('fetches chain info successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChainInfo,
      } as Response);

      const result = await drandService.getChainInfo();

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/${mockChainHash}/info`,
        expect.any(Object)
      );

      expect(result).toEqual(mockChainInfo);
    });

    it('caches chain info after first request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockChainInfo,
      } as Response);

      // First call
      await drandService.getChainInfo();
      // Second call
      await drandService.getChainInfo();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});