import { NextResponse } from 'next/server';
import { readJson, updateJson } from '@/features/storage/services/json-storage-service';
import { requireAdmin, safeAdminUser } from '@/features/auth/services/admin-authorization';

type UserRecord = {
  id: string;
  username: string;
  email: string;
  status: string;
  roles: string[];
  [key: string]: unknown;
};

const allowedStatuses = new Set(['active', 'inactive']);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { context: adminContext, response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: unknown };

    if (typeof body.status !== 'string' || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ message: 'Invalid user status.' }, { status: 400 });
    }

    if (id === adminContext.user.id) {
      return NextResponse.json(
        { message: 'The current Admin account cannot be changed here.' },
        { status: 400 },
      );
    }

    const data = await readJson<{ users?: UserRecord[] }>('users.json', { users: [] });
    const users = data.users ?? [];
    const user = users.find((candidate) => candidate.id === id);

    if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

    user.status = body.status;
    await updateJson<{ users: UserRecord[] }>('users.json', { users: [] }, () => ({ users }));

    return NextResponse.json({ user: safeAdminUser(user) });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ message: 'Unable to update user.' }, { status: 500 });
  }
}
