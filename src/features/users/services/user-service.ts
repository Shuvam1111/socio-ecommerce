import type { UserRegistrationData } from '../types/user';

export async function registerUser(data: UserRegistrationData) {
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to register user.');
  }

  return result;
}
