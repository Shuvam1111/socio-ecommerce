import type { VendorRegistrationData } from '../types/vendor';
export async function registerVendor(data: VendorRegistrationData) {
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const response = await fetch('/api/vendors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to register vendor.');
  }

  return result.vendor;
}
