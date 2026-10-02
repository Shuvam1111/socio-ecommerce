import type { AdminStats } from '../types/admin';

export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch('/api/admin/dashboard', {
    method: 'GET',
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to load dashboard.');
  }

  return result.stats;
}
