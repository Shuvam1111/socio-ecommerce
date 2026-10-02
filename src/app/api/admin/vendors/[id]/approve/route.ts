import { NextResponse } from 'next/server';
import { readJson, updateJson } from '@/features/storage/services/json-storage-service';
import { randomBytes } from 'crypto';
import { requireAdmin } from '@/features/auth/services/admin-authorization';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roles: string[];
  activeRole: string;
  vendorId?: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
}

interface Vendor {
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
  documents: {
    businessRegistration: string | null;
    panDocument: string | null;
    ownerIdentity: string | null;
  };
  bankAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    verified: boolean;
  } | null;
  superSellerId: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt: string | null;
}

interface Seller {
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

function getNextId(items: { id: string }[], prefix: string) {
  let highest = 0;

  for (const item of items) {
    const match = item.id.match(new RegExp(`^${prefix}-(\\d+)$`));

    if (match) {
      highest = Math.max(highest, Number(match[1]));
    }
  }

  return `${prefix}-${String(highest + 1).padStart(6, '0')}`;
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id: vendorId } = await context.params;

    const [vendorsData, usersData, sellersData] = await Promise.all([
      readJson<{ vendors: Vendor[] }>('vendors.json', { vendors: [] }),
      readJson<{ users: User[] }>('users.json', { users: [] }),
      readJson<{ sellers: Seller[] }>('sellers.json', { sellers: [] }),
    ]);

    const vendors: Vendor[] = vendorsData.vendors ?? [];

    const users: User[] = usersData.users ?? [];

    const sellers: Seller[] = sellersData.sellers ?? [];

    const vendor = vendors.find((item) => item.id === vendorId);

    if (!vendor) {
      return NextResponse.json(
        {
          message: 'Vendor not found.',
        },
        { status: 404 },
      );
    }

    if (vendor.status !== 'pending') {
      return NextResponse.json(
        {
          message: `Only pending vendors can be approved. Current status: ${vendor.status}.`,
        },
        { status: 400 },
      );
    }

    const existingVendorUser = users.find(
      (user) => user.vendorId === vendor.id && user.roles.includes('super_seller'),
    );
    const existingVendorSeller = sellers.find(
      (seller) => seller.vendorId === vendor.id && seller.role === 'super_seller',
    );

    if (vendor.superSellerId) {
      const linkedSeller = sellers.find(
        (seller) => seller.id === vendor.superSellerId && seller.vendorId === vendor.id,
      );

      if (!linkedSeller) {
        return NextResponse.json(
          { message: 'Vendor has an invalid Super Seller relationship.' },
          { status: 409 },
        );
      }

      vendor.status = 'approved';
      vendor.approvedAt = new Date().toISOString();
      await updateJson('vendors.json', { vendors: [] as Vendor[] }, () => ({ vendors }));

      return NextResponse.json({
        message: 'Vendor approved successfully.',
        vendor,
        superSeller: {
          user: existingVendorUser
            ? {
                id: existingVendorUser.id,
                username: existingVendorUser.username,
                email: existingVendorUser.email,
              }
            : null,
          seller: linkedSeller,
        },
      });
    }

    const owner = users.find((user) => user.id === vendor.ownerUserId);

    if (!owner) {
      return NextResponse.json(
        {
          message: 'Vendor owner account was not found.',
        },
        { status: 400 },
      );
    }

    if (existingVendorUser || existingVendorSeller) {
      return NextResponse.json(
        { message: 'Vendor has an incomplete Super Seller relationship.' },
        { status: 409 },
      );
    }

    /*
     * Create Super Seller User
     */

    const superSellerUserId = getNextId(users, 'USR');

    const usernameBase = vendor.store.slug.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'seller';

    let username = `${usernameBase}_manager`;

    let usernameNumber = 1;

    while (users.some((user) => user.username === username)) {
      username = `${usernameBase}_manager${usernameNumber}`;
      usernameNumber++;
    }

    const superSellerUser: User = {
      id: superSellerUserId,
      username,
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: vendor.contact.email,
      phone: vendor.contact.phone,
      password: randomBytes(32).toString('hex'),
      roles: ['super_seller'],
      activeRole: 'super_seller',
      vendorId: vendor.id,
      status: 'active',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    /*
     * Create Super Seller
     */

    const superSellerId = getNextId(sellers, 'SEL');

    const employeeCode = `EMP-${String(sellers.length + 1).padStart(3, '0')}`;

    const superSeller: Seller = {
      id: superSellerId,
      userId: superSellerUserId,
      vendorId: vendor.id,
      role: 'super_seller',
      employee: {
        employeeCode,
        designation: 'Store Manager',
        joiningDate: new Date().toISOString().split('T')[0],
      },
      permissions: [
        'manage_products',
        'manage_inventory',
        'manage_orders',
        'add_sellers',
        'remove_sellers',
        'manage_seller_permissions',
        'view_sales',
      ],
      createdBy: owner.id,
      status: 'active',
    };

    /*
     * Update Vendor
     */

    vendor.status = 'approved';
    vendor.superSellerId = superSellerId;
    vendor.approvedAt = new Date().toISOString();

    /*
     * Save all three files. Roll back completed writes if a later write fails.
     */
    users.push(superSellerUser);
    sellers.push(superSeller);
    await Promise.all([
      updateJson('users.json', { users: [] as User[] }, () => ({ users })),
      updateJson('sellers.json', { sellers: [] as Seller[] }, () => ({ sellers })),
      updateJson('vendors.json', { vendors: [] as Vendor[] }, () => ({ vendors })),
    ]);

    return NextResponse.json({
      message: 'Vendor approved successfully.',
      vendor,
      superSeller: {
        user: {
          id: superSellerUser.id,
          username: superSellerUser.username,
          email: superSellerUser.email,
        },
        seller: superSeller,
      },
    });
  } catch (error) {
    console.error('Vendor approval failed:', error);

    return NextResponse.json(
      {
        message: 'Unable to approve vendor.',
      },
      { status: 500 },
    );
  }
}
