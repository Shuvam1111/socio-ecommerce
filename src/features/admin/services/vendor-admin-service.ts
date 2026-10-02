export interface PendingVendor {
  id: string;
  ownerUserId: string;

  store: {
    name: string;
    slug: string;
    description: string;
    logo: string | null;
    coverImage: string | null;
  };

  business: {
    businessType: string;
    legalName: string;
    registrationNumber: string;
    panNumber: string;
    vatRegistered: boolean;
  };

  contact: {
    email: string;
    phone: string;
    alternatePhone: string;
  };

  address: {
    province: string;
    district: string;
    city: string;
    street: string;
    postalCode: string;
  };

  pickupAddress: {
    province: string;
    district: string;
    city: string;
    street: string;
  };

  returnAddress: {
    province: string;
    district: string;
    city: string;
    street: string;
  };

  status: 'pending' | 'approved' | 'rejected';

  rejectionReason?: string | null;

  createdAt: string;

  superSellerId: string | null;

  approvedAt: string | null;
}

/**
 * Get all vendors.
 */
export async function getAdminVendors(): Promise<PendingVendor[]> {
  const response = await fetch('/api/admin/vendors', {
    method: 'GET',
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to load vendors.');
  }

  return result.vendors;
}

/**
 * Get only pending vendors.
 */
export async function getPendingVendors(): Promise<PendingVendor[]> {
  const response = await fetch('/api/admin/vendors/pending', {
    method: 'GET',
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to load pending vendors.');
  }

  return result.vendors;
}

/**
 * Approve a pending vendor.
 *
 * Approval automatically creates:
 * - Super Seller user
 * - Super Seller record
 * - Vendor → superSellerId relationship
 */
export async function approveVendor(vendorId: string) {
  const response = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
    method: 'POST',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to approve vendor.');
  }

  return result;
}

/**
 * Reject a pending vendor.
 */
export async function rejectVendor(vendorId: string, reason: string) {
  const response = await fetch(`/api/admin/vendors/${vendorId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to reject vendor.');
  }

  return result;
}
