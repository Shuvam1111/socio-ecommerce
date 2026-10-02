import { NextResponse } from 'next/server';

import { exists, updateJson } from '@/features/storage/services/json-storage-service';

type StoredUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roles: string[];
  activeRole: string;
  status: string;
  isVerified: boolean;
  promotionStatus: string;
  createdAt: string;
};

type UsersFile = { users: StoredUser[] };

const emptyUsersFile: UsersFile = { users: [] };

class RegistrationError extends Error {}

export async function POST(request: Request) {
  try {
    const registrationData = await request.json();
    const firstName = typeof registrationData.firstName === 'string' ? registrationData.firstName.trim() : '';
    const lastName = typeof registrationData.lastName === 'string' ? registrationData.lastName.trim() : '';
    const username = typeof registrationData.username === 'string' ? registrationData.username.trim() : '';
    const email = typeof registrationData.email === 'string' ? registrationData.email.trim().toLowerCase() : '';
    const phone = typeof registrationData.phone === 'string' ? registrationData.phone.trim() : '';
    const password = typeof registrationData.password === 'string' ? registrationData.password : '';
    const confirmPassword = typeof registrationData.confirmPassword === 'string' ? registrationData.confirmPassword : '';

    if (!firstName || !lastName || !username || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: 'Passwords do not match.' }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'production' && !(await exists('users.json'))) {
      throw new Error('Production users.json is missing from the configured Blob store.');
    }

    let createdUser: StoredUser | undefined;
    await updateJson<UsersFile>('users.json', emptyUsersFile, (data) => {
      const users = Array.isArray(data.users) ? data.users : [];
      const usernameExists = users.some((user) => user.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) throw new RegistrationError('Username is already registered.');
      const emailExists = users.some((user) => user.email.toLowerCase() === email);
      if (emailExists) throw new RegistrationError('Email is already registered.');
      const phoneExists = users.some((user) => user.phone === phone);
      if (phoneExists) throw new RegistrationError('Phone number is already registered.');

      const lastUserNumber = users.reduce((maximum, user) => {
        const match = user.id.match(/^USR-(\d+)$/);
        return match ? Math.max(maximum, Number(match[1])) : maximum;
      }, 0);

      createdUser = {
        id: `USR-${String(lastUserNumber + 1).padStart(6, '0')}`,
        username,
        firstName,
        lastName,
        email,
        phone,
        password,
        roles: ['buyer'],
        activeRole: 'buyer',
        status: 'active',
        isVerified: true,
        promotionStatus: 'not_eligible',
        createdAt: new Date().toISOString(),
      };
      return { users: [...users, createdUser] };
    });

    if (!createdUser) throw new Error('Registration did not create a user.');
    const { password: _password, ...safeUser } = createdUser;
    return NextResponse.json(
      { success: true, message: 'User registered successfully.', user: safeUser },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof RegistrationError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error('User registration error:', error);
    return NextResponse.json(
      { message: 'Unable to register user. Please try again.' },
      { status: 500 },
    );
  }
}
