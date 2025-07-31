import {
  hashInvoiceData,
  generateSecureId,
  validateRandomnessFormat,
  encodeInvoiceMetadata,
  decodeInvoiceMetadata,
  createAuditTrail
} from '../../src/utils/cryptoUtils';

describe('cryptoUtils', () => {
  describe('hashInvoiceData', () => {
    const mockInvoiceData = {
      invoiceNumber: 'INV-001',
      clientName: 'Test Client',
      amount: 1000.00,
      timestamp: '2024-01-01T00:00:00.000Z'
    };

    it('generates consistent SHA-256 hash', () => {
      const hash1 = hashInvoiceData(mockInvoiceData);
      const hash2 = hashInvoiceData(mockInvoiceData);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('generates different hashes for different data', () => {
      const invoice1 = { ...mockInvoiceData };
      const invoice2 = { ...mockInvoiceData, amount: 2000.00 };

      const hash1 = hashInvoiceData(invoice1);
      const hash2 = hashInvoiceData(invoice2);

      expect(hash1).not.toBe(hash2);
    });

    it('handles special characters in invoice data', () => {
      const specialInvoice = {
        ...mockInvoiceData,
        clientName: 'Tëst Çlíênt & Co. (Ñeẅ Örlêàns)',
      };

      const hash = hashInvoiceData(specialInvoice);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('handles empty strings gracefully', () => {
      const emptyInvoice = {
        invoiceNumber: '',
        clientName: '',
        amount: 0,
        timestamp: ''
      };

      const hash = hashInvoiceData(emptyInvoice);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('generateSecureId', () => {
    const mockData = 'test-data';
    const mockSalt = 'test-salt';

    it('generates secure ID with salt', () => {
      const id1 = generateSecureId(mockData, mockSalt);
      const id2 = generateSecureId(mockData, mockSalt);
      
      expect(id1).toBe(id2);
      expect(id1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('generates different IDs with different salts', () => {
      const id1 = generateSecureId(mockData, 'salt1');
      const id2 = generateSecureId(mockData, 'salt2');
      
      expect(id1).not.toBe(id2);
    });

    it('generates different IDs with different data', () => {
      const id1 = generateSecureId('data1', mockSalt);
      const id2 = generateSecureId('data2', mockSalt);
      
      expect(id1).not.toBe(id2);
    });

    it('handles undefined salt gracefully', () => {
      const id = generateSecureId(mockData);
      expect(id).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('validateRandomnessFormat', () => {
    it('validates correct randomness format', () => {
      const validRandomness = 'abc123def456ghi789jkl012mno345pqr678';
      expect(validateRandomnessFormat(validRandomness)).toBe(true);
    });

    it('rejects randomness with invalid characters', () => {
      const invalidRandomness = 'abc123def456ghi789jkl012mno345pqr678!@#';
      expect(validateRandomnessFormat(invalidRandomness)).toBe(false);
    });

    it('rejects randomness that is too short', () => {
      const shortRandomness = 'abc123';
      expect(validateRandomnessFormat(shortRandomness)).toBe(false);
    });

    it('rejects empty string', () => {
      expect(validateRandomnessFormat('')).toBe(false);
    });

    it('rejects null or undefined', () => {
      expect(validateRandomnessFormat(null as any)).toBe(false);
      expect(validateRandomnessFormat(undefined as any)).toBe(false);
    });

    it('validates hex strings of different cases', () => {
      const upperCase = 'ABC123DEF456GHI789JKL012MNO345PQR678';
      const lowerCase = 'abc123def456ghi789jkl012mno345pqr678';
      const mixedCase = 'AbC123dEf456GhI789jKl012MnO345pQr678';

      expect(validateRandomnessFormat(upperCase)).toBe(true);
      expect(validateRandomnessFormat(lowerCase)).toBe(true);
      expect(validateRandomnessFormat(mixedCase)).toBe(true);
    });
  });

  describe('encodeInvoiceMetadata', () => {
    const mockMetadata = {
      version: '1.0',
      issuer: 'Government Agency',
      drandRound: 12345,
      timestamp: '2024-01-01T00:00:00.000Z'
    };

    it('encodes metadata to base64', () => {
      const encoded = encodeInvoiceMetadata(mockMetadata);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
      
      // Should be valid base64
      expect(() => atob(encoded)).not.toThrow();
    });

    it('handles empty metadata', () => {
      const encoded = encodeInvoiceMetadata({});
      expect(typeof encoded).toBe('string');
    });

    it('handles special characters in metadata', () => {
      const specialMetadata = {
        ...mockMetadata,
        issuer: 'Gövêrnmént Ágëñcy & Çø.'
      };

      const encoded = encodeInvoiceMetadata(specialMetadata);
      expect(typeof encoded).toBe('string');
      expect(() => atob(encoded)).not.toThrow();
    });
  });

  describe('decodeInvoiceMetadata', () => {
    const mockMetadata = {
      version: '1.0',
      issuer: 'Government Agency',
      drandRound: 12345,
      timestamp: '2024-01-01T00:00:00.000Z'
    };

    it('decodes base64 encoded metadata', () => {
      const encoded = encodeInvoiceMetadata(mockMetadata);
      const decoded = decodeInvoiceMetadata(encoded);
      
      expect(decoded).toEqual(mockMetadata);
    });

    it('throws error for invalid base64', () => {
      const invalidBase64 = 'not-valid-base64!@#';
      expect(() => decodeInvoiceMetadata(invalidBase64)).toThrow();
    });

    it('throws error for malformed JSON', () => {
      const invalidJson = btoa('not valid json');
      expect(() => decodeInvoiceMetadata(invalidJson)).toThrow();
    });

    it('handles empty string', () => {
      expect(() => decodeInvoiceMetadata('')).toThrow();
    });
  });

  describe('createAuditTrail', () => {
    const mockInvoiceId = 'INV-001';
    const mockAction = 'CREATED';
    const mockUser = 'test-user';
    const mockRandomness = 'test-randomness-beacon';

    beforeEach(() => {
      // Mock Date.now for consistent testing
      jest.spyOn(Date, 'now').mockReturnValue(1640995200000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates audit trail entry', () => {
      const auditEntry = createAuditTrail(
        mockInvoiceId,
        mockAction,
        mockUser,
        mockRandomness
      );

      expect(auditEntry).toEqual({
        invoiceId: mockInvoiceId,
        action: mockAction,
        user: mockUser,
        timestamp: new Date(1640995200000).toISOString(),
        randomnessBeacon: mockRandomness,
        hash: expect.stringMatching(/^[a-f0-9]{64}$/)
      });
    });

    it('generates different hashes for different entries', () => {
      const entry1 = createAuditTrail(mockInvoiceId, 'CREATED', mockUser, mockRandomness);
      const entry2 = createAuditTrail(mockInvoiceId, 'UPDATED', mockUser, mockRandomness);

      expect(entry1.hash).not.toBe(entry2.hash);
    });

    it('handles optional randomness parameter', () => {
      const auditEntry = createAuditTrail(mockInvoiceId, mockAction, mockUser);

      expect(auditEntry.randomnessBeacon).toBeUndefined();
      expect(auditEntry.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('includes all required fields', () => {
      const auditEntry = createAuditTrail(
        mockInvoiceId,
        mockAction,
        mockUser,
        mockRandomness
      );

      expect(auditEntry).toHaveProperty('invoiceId');
      expect(auditEntry).toHaveProperty('action');
      expect(auditEntry).toHaveProperty('user');
      expect(auditEntry).toHaveProperty('timestamp');
      expect(auditEntry).toHaveProperty('hash');
    });
  });
});