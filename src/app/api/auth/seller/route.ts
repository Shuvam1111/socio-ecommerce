import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { clearAdminSession } from '@/features/auth/services/admin-authorization';

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

    const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');

    const sellersPath = path.join(process.cwd(), 'src', 'data', 'sellers.json');

    const [usersFile, sellersFile] = await Promise.all([
      fs.readFile(usersPath, 'utf-8'),
      fs.readFile(sellersPath, 'utf-8'),
    ]);

    const usersData = JSON.parse(usersFile);
    const sellersData = JSON.parse(sellersFile);

    const user = (usersData.users ?? []).find(
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

    const seller = (sellersData.sellers ?? []).find(
      (item: { userId: string; status: string }) =>
        item.userId === user.id && item.status === 'active',
    );

    if (!seller) {
      return NextResponse.json(
        {
          message: 'No active seller account is associated with this user.',
        },
        { status: 403 },
      );
    }

    const isSeller = seller.role === 'seller' || seller.role === 'super_seller';

    if (!isSeller) {
      return NextResponse.json(
        {
          message: 'This account cannot use Seller Login.',
        },
        { status: 403 },
      );
    }

    const { password: _password, ...safeUser } = user;

    const response = NextResponse.json({
      user: {
        ...safeUser,
        sellerId: seller.id,
        sellerRole: seller.role,
        vendorId: seller.vendorId,
        permissions: seller.permissions,
      },
      seller,
      token: `demo-seller-token-${user.id}`,
    });

    clearAdminSession(response);
    response.cookies.set('socio-seller-session', seller.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Seller login failed:', error);

    return NextResponse.json(
      {
        message: 'Unable to login.',
      },
      { status: 500 },
    );
  }
}
