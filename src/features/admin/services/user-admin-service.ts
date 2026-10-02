export interface AdminUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  activeRole: string;
  vendorId?: string;
  status: string;
  isVerified: boolean;
  promotionStatus?: string;
  createdAt: string;
}

export async function getAdminUsers(
  filters: {
    search?: string;
    role?: string;
    status?: string;
    verification?: string;
  } = {},
): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const response = await fetch(`/api/admin/users${params.size ? `?${params}` : ''}`, {
    method: 'GET',
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to load users.');
  }

  return result.users;
}

export async function updateAdminUserStatus(userId: string, status: 'active' | 'inactive') {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Unable to update user.');
  return result.user as AdminUser;
}
