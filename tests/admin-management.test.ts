import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminSessionValue } from '@/features/auth/services/admin-authorization';

const files = new Map<string, string>();
vi.mock('fs/promises', () => {
  const readFile = vi.fn(async (file: string) => {
    const value = files.get(file);
    if (value === undefined) throw new Error(`Missing fixture: ${file}`);
    return value;
  });
  const writeFile = vi.fn(async (file: string, value: string) => files.set(file, value));
  return { default: { readFile, writeFile }, readFile, writeFile };
});

const pathFor = (name: string) => `${process.cwd()}/src/data/${name}`;
const usersPath = pathFor('users.json');
const vendorsPath = pathFor('vendors.json');
const sellersPath = pathFor('sellers.json');
const cookie = (id: string) => `socio-admin-session=${createAdminSessionValue(id)}`;
const request = (method: string, url: string, session?: string, body?: unknown) =>
  new Request(url, {
    method,
    headers: {
      ...(session ? { cookie: session } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

beforeEach(() => {
  files.clear();
  files.set(
    usersPath,
    JSON.stringify({
      users: [
        {
          id: 'ADM-1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'A',
          lastName: 'D',
          password: 'secret',
          roles: ['admin'],
          status: 'active',
        },
        {
          id: 'USR-1',
          username: 'buyer',
          email: 'buyer@example.com',
          firstName: 'B',
          lastName: 'U',
          password: 'secret',
          roles: ['buyer'],
          status: 'active',
        },
      ],
    }),
  );
  files.set(
    vendorsPath,
    JSON.stringify({
      vendors: [
        {
          id: 'VEN-1',
          status: 'pending',
          ownerUserId: 'USR-1',
          store: { name: 'Store', slug: 'store' },
          contact: { email: 'store@example.com' },
          superSellerId: null,
        },
        {
          id: 'VEN-2',
          status: 'approved',
          ownerUserId: 'USR-1',
          store: { name: 'Approved', slug: 'approved' },
          contact: { email: 'approved@example.com' },
          superSellerId: 'SEL-1',
        },
      ],
    }),
  );
  files.set(
    sellersPath,
    JSON.stringify({ sellers: [{ id: 'SEL-1', vendorId: 'VEN-2', role: 'super_seller' }] }),
  );
});

describe('Admin user and vendor management', () => {
  it('filters users server-side and updates status without exposing credentials', async () => {
    const users = await import('@/app/api/admin/users/route');
    const result = await users.GET(
      request('GET', 'http://localhost/api/admin/users?role=buyer', cookie('ADM-1')),
    );
    expect((await result.json()).users).toHaveLength(1);
    const mutation = await import('@/app/api/admin/users/[id]/route');
    const updated = await mutation.PATCH(
      request('PATCH', 'http://localhost/api/admin/users/USR-1', cookie('ADM-1'), {
        status: 'inactive',
        role: 'admin',
        adminId: 'USR-1',
      }),
      { params: Promise.resolve({ id: 'USR-1' }) },
    );
    expect(updated.status).toBe(200);
    expect(JSON.parse(files.get(usersPath)!).users[1].status).toBe('inactive');
    expect(JSON.stringify(await updated.json())).not.toContain('password');
  });

  it('rejects invalid, missing, and self status changes', async () => {
    const { PATCH } = await import('@/app/api/admin/users/[id]/route');
    expect(
      (
        await PATCH(request('PATCH', 'http://localhost/api/admin/users/USR-1'), {
          params: Promise.resolve({ id: 'USR-1' }),
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await PATCH(
          request('PATCH', 'http://localhost/api/admin/users/USR-1', cookie('ADM-1'), {
            status: 'deleted',
          }),
          { params: Promise.resolve({ id: 'USR-1' }) },
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await PATCH(
          request('PATCH', 'http://localhost/api/admin/users/ADM-1', cookie('ADM-1'), {
            status: 'inactive',
          }),
          { params: Promise.resolve({ id: 'ADM-1' }) },
        )
      ).status,
    ).toBe(400);
  });

  it('lists only safe vendor fields and rejects invalid vendor transitions', async () => {
    const list = await import('@/app/api/admin/vendors/route');
    const response = await list.GET(
      request('GET', 'http://localhost/api/admin/vendors?status=pending', cookie('ADM-1')),
    );
    const vendors = await response.json();
    expect(vendors.vendors).toHaveLength(1);
    expect(vendors.vendors[0]).not.toHaveProperty('bankAccount');
    const approve = await import('@/app/api/admin/vendors/[id]/approve/route');
    expect(
      (
        await approve.POST(
          request('POST', 'http://localhost/api/admin/vendors/VEN-2', cookie('ADM-1')),
          { params: Promise.resolve({ id: 'VEN-2' }) },
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await approve.POST(
          request('POST', 'http://localhost/api/admin/vendors/MISSING', cookie('ADM-1')),
          { params: Promise.resolve({ id: 'MISSING' }) },
        )
      ).status,
    ).toBe(404);
  });
});
