import type { AuthUser, LoginCredentials, LoginResult } from '../types/auth';

export async function loginAdmin(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await fetch('/api/auth/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to login.');
  }

  return {
    user: result.user as AuthUser,
    token: `demo-token-${result.user.id}`,
  };
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await fetch('/api/auth/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to login.');
  }

  return {
    user: result.user as AuthUser,
    token: result.token,
  };
}
export async function loginSeller(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await fetch('/api/auth/seller', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to login.');
  }

  return {
    user: result.user as AuthUser,
    token: result.token,
  };
}
