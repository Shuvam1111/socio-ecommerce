import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { readJson } from '@/features/storage/services/json-storage-service';

export async function GET(request: Request) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const data = await readJson<{ users: Array<Record<string, unknown>> }>('users.json', {
      users: [],
    });
    const search = new URL(request.url).searchParams.get('search')?.trim().toLowerCase() ?? '';
    const role = new URL(request.url).searchParams.get('role');
    const adminManagedRoles = new Set(['admin', 'buyer']);
    const status = new URL(request.url).searchParams.get('status');
    const verification = new URL(request.url).searchParams.get('verification');

    const users = (data.users ?? [])
      .filter((user: Record<string, unknown>) => {
        const text = [user.firstName, user.lastName, user.username, user.email]
          .filter((value): value is string => typeof value === 'string')
          .join(' ')
          .toLowerCase();
        const roles = Array.isArray(user.roles) ? user.roles : [];
        const isAdminManagedUser = roles.some(
          (value): value is string => typeof value === 'string' && adminManagedRoles.has(value),
        );
        return (
          isAdminManagedUser &&
          (!search || text.includes(search)) &&
          (!role || (adminManagedRoles.has(role) && roles.includes(role))) &&
          (!status || user.status === status) &&
          (!verification ||
            (verification === 'verified' ? user.isVerified === true : user.isVerified === false))
        );
      })
      .map((user: Record<string, unknown>) => {
        const { password: _password, ...safeUser } = user;
        return safeUser;
      });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error('Failed to load users:', error);

    return NextResponse.json(
      {
        message: 'Unable to load users.',
      },
      { status: 500 },
    );
  }
}
