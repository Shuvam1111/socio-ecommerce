import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as adminLogin } from '@/app/api/auth/admin/route';
import { POST as sellerLogin } from '@/app/api/auth/seller/route';
import { POST as adminLogout } from '@/app/api/auth/admin/logout/route';
import { POST as sellerLogout } from '@/app/api/auth/seller/logout/route';

function request(body: Record<string, string>) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function cookieHeader(response: Response) {
  return response.headers.get('set-cookie') ?? '';
}

describe('authenticated role session isolation', () => {
  it('clears the admin session when seller login succeeds', async () => {
    const response = await sellerLogin(request({ identifier: 'ramstore', password: 'Seller@123' }));
    const cookies = cookieHeader(response);

    expect(response.status).toBe(200);
    expect(cookies).toContain('socio-seller-session=');
    expect(cookies).toContain('socio-admin-session=;');
    expect(cookies).toContain('Max-Age=0');
  });

  it('clears the seller session when admin login succeeds', async () => {
    const response = await adminLogin(request({ identifier: 'admin', password: 'Admin@123' }));
    const cookies = cookieHeader(response);

    expect(response.status).toBe(200);
    expect(cookies).toContain('socio-admin-session=');
    expect(cookies).toContain('socio-seller-session=;');
    expect(cookies).toContain('Max-Age=0');
  });

  it('keeps both existing logout routes functional', async () => {
    const adminResponse = await adminLogout();
    const sellerResponse = await sellerLogout();

    expect(adminResponse.status).toBe(200);
    expect(cookieHeader(adminResponse)).toContain('socio-admin-session=;');
    expect(sellerResponse.status).toBe(200);
    expect(cookieHeader(sellerResponse)).toContain('socio-seller-session=;');
  });
});
