import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminSessionValue } from '@/features/auth/services/admin-authorization';

const files = new Map<string, string>();

vi.mock('fs/promises', () => {
  const readFile = vi.fn(async (file: string) => {
    const value = files.get(file);
    if (value === undefined) throw new Error(`Missing fixture: ${file}`);
    return value;
  });
  const writeFile = vi.fn(async (file: string, value: string) => {
    files.set(file, value);
  });
  return { default: { readFile, writeFile }, readFile, writeFile };
});

const dataPath = (name: string) => `${process.cwd()}/src/data/${name}`;
const usersPath = dataPath('users.json');
const vendorsPath = dataPath('vendors.json');
const sellersPath = dataPath('sellers.json');
const productsPath = dataPath('products.json');
const reviewsPath = dataPath('reviews.json');

const admin = {
  id: 'ADM-1',
  username: 'admin',
  email: 'admin@example.com',
  password: 'secret',
  roles: ['admin'],
  status: 'active',
};
const inactiveAdmin = {
  ...admin,
  id: 'ADM-INACTIVE',
  username: 'inactive-admin',
  email: 'inactive@example.com',
  status: 'inactive',
};
const roleUsers = [
  'seller',
  'super_seller',
  'vendor',
  'buyer',
  'influencer',
  'affiliate_marketer',
].map((role) => ({
  id: `USR-${role}`,
  username: role,
  email: `${role}@example.com`,
  password: 'secret',
  roles: [role],
  status: 'active',
}));

function authCookie(userId: string) {
  return `socio-admin-session=${createAdminSessionValue(userId)}`;
}

function request(cookie?: string, body?: unknown) {
  return new Request('http://localhost/api/admin/test', {
    method: body ? 'POST' : 'GET',
    headers: cookie ? { cookie } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  files.clear();
  files.set(
    usersPath,
    JSON.stringify({
      users: [
        admin,
        inactiveAdmin,
        { ...roleUsers[0], firstName: 'Seller', lastName: 'Owner' },
        ...roleUsers.slice(1),
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
          ownerUserId: 'USR-seller',
          store: { slug: 'vendor-one' },
          contact: { email: 'vendor@example.com', phone: '555' },
          superSellerId: null,
        },
      ],
    }),
  );
  files.set(sellersPath, JSON.stringify({ sellers: [] }));
  files.set(productsPath, JSON.stringify({ products: [] }));
  files.set(reviewsPath, JSON.stringify({ reviews: [] }));
});

describe('Admin authentication and authorization', () => {
  it('denies unauthenticated dashboard, users, vendors, and pending requests', async () => {
    const [{ GET: dashboard }, { GET: users }, { GET: vendors }, { GET: pending }] =
      await Promise.all([
        import('@/app/api/admin/dashboard/route'),
        import('@/app/api/admin/users/route'),
        import('@/app/api/admin/vendors/route'),
        import('@/app/api/admin/vendors/pending/route'),
      ]);
    for (const handler of [dashboard, users, vendors, pending])
      expect((await handler(request())).status).toBe(401);
  });

  it('accepts an active Admin session and never returns passwords', async () => {
    const { GET } = await import('@/app/api/admin/users/route');
    const response = await GET(request(authCookie('ADM-1')));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.users.every((user: Record<string, unknown>) => !('password' in user))).toBe(
      true,
    );
  });

  it.each(roleUsers.map(({ id, roles }) => [roles[0], id]))(
    'rejects non-admin role %s',
    async (_role, id) => {
      const { GET } = await import('@/app/api/admin/dashboard/route');
      expect((await GET(request(authCookie(id)))).status).toBe(403);
    },
  );

  it('rejects an inactive Admin session', async () => {
    const { GET } = await import('@/app/api/admin/dashboard/route');
    expect((await GET(request('socio-admin-session=ADM-INACTIVE'))).status).toBe(403);
  });

  it('creates an HttpOnly Admin cookie on successful login', async () => {
    const { POST } = await import('@/app/api/auth/admin/route');
    const response = await POST(
      request(undefined, {
        identifier: 'admin',
        password: 'secret',
        role: 'buyer',
        userId: 'USR-buyer',
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('socio-admin-session=ADM-1.');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
  });

  it('rejects non-admin and inactive login attempts', async () => {
    const { POST } = await import('@/app/api/auth/admin/route');
    expect(
      (await POST(request(undefined, { identifier: 'buyer', password: 'secret' }))).status,
    ).toBe(403);
    expect(
      (await POST(request(undefined, { identifier: 'inactive-admin', password: 'secret' }))).status,
    ).toBe(403);
  });

  it('logout clears the Admin cookie', async () => {
    const { POST } = await import('@/app/api/auth/admin/logout/route');
    const response = await POST();
    expect(response.headers.get('set-cookie')).toContain('socio-admin-session=');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('protects vendor approval from non-admin callers', async () => {
    const { POST } = await import('@/app/api/admin/vendors/[id]/approve/route');
    const context = { params: Promise.resolve({ id: 'VEN-1' }) };
    expect((await POST(request(), context)).status).toBe(401);
    expect((await POST(request(authCookie('USR-seller')), context)).status).toBe(403);
    expect((await POST(request(authCookie('ADM-1')), context)).status).toBe(200);
  });

  it('allows Admin vendor listing but not a client-supplied role or vendor identity', async () => {
    const { GET } = await import('@/app/api/admin/vendors/route');
    const response = await GET(request(authCookie('ADM-1')));
    expect(response.status).toBe(200);
    expect((await response.json()).vendors[0].id).toBe('VEN-1');
  });
});
