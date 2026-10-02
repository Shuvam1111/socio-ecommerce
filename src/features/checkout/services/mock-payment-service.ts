import { randomUUID } from 'crypto';

export function createMockTransactionId() {
  return `MOCK-TXN-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
}

export function simulateMockFailure() {
  return { reason: 'The demo payment was intentionally declined.' };
}
