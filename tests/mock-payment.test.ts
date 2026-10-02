import { describe, expect, it } from 'vitest';
import {
  createMockTransactionId,
  simulateMockFailure,
} from '@/features/checkout/services/mock-payment-service';

describe('mock payment service', () => {
  it('creates provider-like transaction IDs server-side', () => {
    const id = createMockTransactionId();
    expect(id).toMatch(/^MOCK-TXN-[A-Z0-9]{12}$/);
  });

  it('returns a clearly simulated failure result', () => {
    expect(simulateMockFailure().reason).toContain('demo payment');
  });
});
