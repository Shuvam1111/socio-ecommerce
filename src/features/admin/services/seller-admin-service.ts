export interface AdminSeller {
  id: string;
  userId: string;
  vendorId: string;

  role: 'super_seller' | 'seller';

  employee: {
    employeeCode: string;
    designation: string;
    joiningDate: string;
  };

  permissions: string[];

  createdBy: string;

  status: 'active' | 'inactive';
}

export async function getAdminSellers(): Promise<AdminSeller[]> {
  const response = await fetch('/api/admin/sellers', {
    method: 'GET',
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to load sellers.');
  }

  return result.sellers;
}
