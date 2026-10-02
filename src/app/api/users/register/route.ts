import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

export async function POST(request: Request) {
  try {
    const registrationData = await request.json();

    const firstName = String(registrationData.firstName ?? '').trim();

    const lastName = String(registrationData.lastName ?? '').trim();

    const username = String(registrationData.username ?? '').trim();

    const email = String(registrationData.email ?? '')
      .trim()
      .toLowerCase();

    const phone = String(registrationData.phone ?? '').trim();

    const password = String(registrationData.password ?? '');

    const confirmPassword = String(registrationData.confirmPassword ?? '');

    if (!firstName || !lastName || !username || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        {
          message: 'All fields are required.',
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          message: 'Passwords do not match.',
        },
        { status: 400 },
      );
    }

    const file = await fs.readFile(usersFilePath, 'utf-8');

    const data = JSON.parse(file);

    const users = Array.isArray(data.users) ? data.users : [];

    const usernameExists = users.some(
      (user: { username: string }) => user.username.toLowerCase() === username.toLowerCase(),
    );

    if (usernameExists) {
      return NextResponse.json(
        {
          message: 'Username is already registered.',
        },
        { status: 409 },
      );
    }

    const emailExists = users.some((user: { email: string }) => user.email.toLowerCase() === email);

    if (emailExists) {
      return NextResponse.json(
        {
          message: 'Email is already registered.',
        },
        { status: 409 },
      );
    }

    const phoneExists = users.some((user: { phone: string }) => user.phone === phone);

    if (phoneExists) {
      return NextResponse.json(
        {
          message: 'Phone number is already registered.',
        },
        { status: 409 },
      );
    }

    const lastUserNumber = users.reduce((maximum: number, user: { id: string }) => {
      const match = user.id.match(/^USR-(\d+)$/);

      if (!match) {
        return maximum;
      }

      return Math.max(maximum, Number(match[1]));
    }, 0);

    const userId = `USR-${String(lastUserNumber + 1).padStart(6, '0')}`;

    const newUser = {
      id: userId,
      username,
      firstName,
      lastName,
      email,
      phone,
      password,
      roles: ['buyer'],
      activeRole: 'buyer',
      status: 'active',
      isVerified: false,
      promotionStatus: 'not_eligible',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    await fs.writeFile(
      usersFilePath,
      JSON.stringify(
        {
          users,
        },
        null,
        2,
      ),
      'utf-8',
    );

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully.',
        user: {
          id: newUser.id,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          roles: newUser.roles,
          activeRole: newUser.activeRole,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('User registration error:', error);

    return NextResponse.json(
      {
        message: 'Unable to register user. Please try again.',
      },
      { status: 500 },
    );
  }
}
