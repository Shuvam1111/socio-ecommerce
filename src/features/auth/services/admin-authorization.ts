import { createHmac, timingSafeEqual } from 'crypto';
import { readJson } from '@/features/storage/services/json-storage-service';
import { NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'socio-admin-session';
const sessionSecret =
  process.env.ADMIN_SESSION_SECRET ??
  (process.env.NODE_ENV === 'production' ? '' : 'socio-commerce-admin-development-secret');

export function createAdminSessionValue(userId: string) {
  if (!sessionSecret) throw new Error('ADMIN_SESSION_SECRET is required in production.');
  const signature = createHmac('sha256', sessionSecret).update(userId).digest('hex');
  return `${userId}.${signature}`;
}

function getSessionUserId(value: string | undefined) {
  if (!value || !sessionSecret) return null;
  const [userId, signature] = value.split('.');
  if (!userId || !signature) return null;
  const expected = createAdminSessionValue(userId).split('.')[1];
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null;
  return userId;
}

type AdminUser = {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  status?: string;
  [key: string]: unknown;
};

export async function getAdminContext(request: Request) {
  const sessionValue = request.headers
    .get('cookie')
    ?.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`))?.[1];
  const sessionId = getSessionUserId(sessionValue);

  if (!sessionId) return null;

  const data = await readJson<{ users?: AdminUser[] }>('users.json', { users: [] });
  const user = data.users?.find((candidate) => candidate.id === sessionId);

  if (!user || user.status !== 'active' || !user.roles.includes('admin')) return null;
  return { user };
}

export async function requireAdmin(request: Request) {
  const context = await getAdminContext(request);
  if (context) return { context, response: null };

  const hasSession = request.headers.get('cookie')?.includes(`${ADMIN_SESSION_COOKIE}=`);

  return {
    context: null,
    response: NextResponse.json(
      { message: hasSession ? 'Admin access is required.' : 'Authentication required.' },
      { status: hasSession ? 403 : 401 },
    ),
  };
}

export function setAdminSession(response: NextResponse, userId: string) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionValue(userId),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function safeAdminUser(user: AdminUser) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
