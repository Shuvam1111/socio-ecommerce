import { NextResponse } from 'next/server';

import { readJson } from '@/features/storage/services/json-storage-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';

    const password = typeof body.password === 'string' ? body.password : '';

    if (!identifier || !password) {
      return NextResponse.json(
        {
          message: 'Username/email and password are required.',
        },
        { status: 400 },
      );
    }

    const data = await readJson<{
      users: Array<{
        username: string;
        email: string;
        password: string;
        status: string;
        roles: string[];
        [key: string]: unknown;
      }>;
    }>('users.json', { users: [] });

    const user = (data.users ?? []).find(
      (item: { username: string; email: string; password: string }) =>
        item.username.toLowerCase() === identifier.toLowerCase() ||
        item.email.toLowerCase() === identifier.toLowerCase(),
    );

    if (!user || user.password !== password) {
      return NextResponse.json(
        {
          message: 'Invalid username/email or password.',
        },
        { status: 401 },
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        {
          message: 'Your account is not active.',
        },
        { status: 403 },
      );
    }

    if (!user.roles.includes('buyer')) {
      return NextResponse.json(
        {
          message: 'This account cannot use User Login.',
        },
        { status: 403 },
      );
    }

    const { password: _password, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
      token: `demo-user-token-${user.id}`,
    });
  } catch (error) {
    console.error('User login failed:', error);

    return NextResponse.json(
      {
        message: 'Unable to login.',
      },
      { status: 500 },
    );
  }
}
