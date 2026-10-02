import { NextResponse } from 'next/server';
import { readJsonIfPresent } from '@/features/storage/services/json-storage-service';
import bootstrapUsers from '@/data/users.json';
import { safeAdminUser, setAdminSession } from '@/features/auth/services/admin-authorization';
import { clearSellerSession } from '@/features/sellers/services/seller-authorization';

export async function POST(request: Request) {
  try {
    const credentials = await request.json();

    const identifier = String(credentials.identifier ?? '')
      .trim()
      .toLowerCase();

    const password = String(credentials.password ?? '');

    if (!identifier || !password) {
      return NextResponse.json(
        {
          message: 'Username/email and password are required.',
        },
        { status: 400 },
      );
    }

    const storedData = await readJsonIfPresent<{
      users?: Array<{
        id: string;
        username: string;
        email: string;
        password: string;
        status: string;
        roles: string[];
        [key: string]: unknown;
      }>;
    }>('users.json');
    const users = storedData?.users ?? bootstrapUsers.users;

    if (!storedData) {
      console.warn(
        '[v0] Admin bootstrap login enabled because users.json is missing; seed Blob datasets immediately.',
      );
    }

    const user = users.find(
      (currentUser: {
        username: string;
        email: string;
        password: string;
        status: string;
        roles: string[];
      }) =>
        (currentUser.username.toLowerCase() === identifier ||
          currentUser.email.toLowerCase() === identifier) &&
        currentUser.password === password,
    );

    if (!user) {
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
          message: 'This account is not active.',
        },
        { status: 403 },
      );
    }

    if (!user.roles.includes('admin')) {
      return NextResponse.json(
        {
          message: 'You do not have permission to access the admin panel.',
        },
        { status: 403 },
      );
    }

    const authUser = {
      id: user.id,
      username: user.username,
      firstName: typeof user.firstName === 'string' ? user.firstName : undefined,
      lastName: typeof user.lastName === 'string' ? user.lastName : undefined,
      email: user.email,
      roles: user.roles,
      activeRole: 'admin',
    };

    const response = NextResponse.json({
      success: true,
      user: safeAdminUser(authUser),
    });
    clearSellerSession(response);
    setAdminSession(response, user.id);
    return response;
  } catch (error) {
    console.error('Admin login error:', error);

    return NextResponse.json(
      {
        message: 'Unable to login. Please try again.',
      },
      { status: 500 },
    );
  }
}
