import { describe, expect, it } from 'vitest';
import {
  resolveBuyerId,
  validateShippingAddress,
} from '@/features/checkout/services/checkout-service';

describe('checkout validation', () => {
  const address = {
    fullName: 'Buyer',
    phone: '9800000000',
    province: 'Bagmati',
    district: 'Kathmandu',
    city: 'Kathmandu',
    street: 'New Road',
    postalCode: '44600',
  };
  it('accepts complete shipping information', () =>
    expect(validateShippingAddress(address)).toBe(true));
  it('rejects incomplete shipping information', () =>
    expect(validateShippingAddress({ ...address, city: '' })).toBe(false));
  it('falls back to the guest cart when an invalid buyer token has a cart', async () =>
    expect(await resolveBuyerId('not-a-valid-token', 'cart-1')).toBe('GUEST-cart-1'));
  it('does not invent a guest identity when no token or cart exists', async () =>
    expect(await resolveBuyerId(null)).toBeNull());
  it('validates the existing demo buyer token against users.json', async () =>
    expect(await resolveBuyerId('demo-user-token-USR-000005', 'cart-1')).toBe('USR-000005'));
  it('does not resolve a seller token as a buyer', async () =>
    expect(await resolveBuyerId('demo-user-token-USR-000003', 'cart-1')).toBe('GUEST-cart-1'));
  it('resolves a valid buyer without requiring a cart cookie', async () =>
    expect(await resolveBuyerId('demo-user-token-USR-000005')).toBe('USR-000005'));
});
