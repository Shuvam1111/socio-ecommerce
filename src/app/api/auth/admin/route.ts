import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { safeAdminUser, setAdminSession } from '@/features/auth/services/admin-authorization';
import { clearSellerSession } from '@/features/sellers/services/seller-authorization';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

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

    const file = await fs.readFile(usersFilePath, 'utf-8');

    const data = JSON.parse(file);

    const users = Array.isArray(data.users) ? data.users : [];

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
      firstName: user.firstName,
      lastName: user.lastName,
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
