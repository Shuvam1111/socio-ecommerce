import { NextResponse } from 'next/server';
import { readJson, updateJson } from '@/features/storage/services/json-storage-service';

type RecordMap = Record<string, unknown>;
type Dataset = { vendors: RecordMap[] };
type SellerDataset = { sellers: RecordMap[] };

const superSellerPermissions = [
  'manage_products',
  'manage_inventory',
  'manage_orders',
  'add_sellers',
  'remove_sellers',
  'manage_seller_permissions',
  'view_sales',
];

function nextId(records: RecordMap[], prefix: string) {
  const highest = records.reduce((max, record) => {
    const match = String(record.id ?? '').match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(6, '0')}`;
}

function storeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: Request) {
  let createdVendorId: string | undefined;
  let createdSellerId: string | undefined;

  try {
    const registrationData = await request.json();
    const slug = storeSlug(String(registrationData.storeName ?? ''));
    const email = String(registrationData.email ?? '')
      .trim()
      .toLowerCase();

    const current = await readJson<Dataset>('vendors.json', { vendors: [] });
    const existing = (current.vendors ?? []).find((candidate) => {
      const contact = candidate.contact as RecordMap | undefined;
      const store = candidate.store as RecordMap | undefined;
      return (
        (email && String(contact?.email ?? '').toLowerCase() === email) ||
        (slug && String(store?.slug ?? '') === slug)
      );
    });

    if (existing) {
      return NextResponse.json({ success: true, vendor: existing, idempotent: true });
    }

    const vendorId = nextId(current.vendors ?? [], 'VEN');
    const vendor: RecordMap = {
      id: vendorId,
      ownerUserId: registrationData.ownerUserId ?? null,
      store: {
        name: registrationData.storeName,
        slug,
        description: registrationData.storeDescription,
        logo: null,
        coverImage: null,
      },
      business: {
        businessType: registrationData.businessType,
        legalName: registrationData.legalName,
        registrationNumber: registrationData.registrationNumber,
        panNumber: registrationData.panNumber,
        vatRegistered: registrationData.vatRegistered,
      },
      contact: {
        email: registrationData.email,
        phone: registrationData.phone,
        alternatePhone: registrationData.alternatePhone,
      },
      address: {
        province: registrationData.province,
        district: registrationData.district,
        city: registrationData.city,
        street: registrationData.street,
        postalCode: registrationData.postalCode,
      },
      pickupAddress: {
        province: registrationData.pickupProvince,
        district: registrationData.pickupDistrict,
        city: registrationData.pickupCity,
        street: registrationData.pickupStreet,
      },
      returnAddress: {
        province: registrationData.returnProvince,
        district: registrationData.returnDistrict,
        city: registrationData.returnCity,
        street: registrationData.returnStreet,
      },
      documents: { businessRegistration: null, panDocument: null, ownerIdentity: null },
      bankAccount: null,
      superSellerId: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      approvedAt: null,
    };

    await updateJson<Dataset>('vendors.json', { vendors: [] }, (data) => ({
      vendors: [...(data.vendors ?? []), vendor],
    }));
    createdVendorId = vendorId;

    const seller = await updateJson<SellerDataset>('sellers.json', { sellers: [] }, (data) => {
      const sellers = data.sellers ?? [];
      const linked = sellers.find((candidate) => candidate.vendorId === vendorId);
      if (linked) return data;

      const sellerId = nextId(sellers, 'SEL');
      createdSellerId = sellerId;
      return {
        sellers: [
          ...sellers,
          {
            id: sellerId,
            userId: registrationData.ownerUserId ?? '',
            vendorId,
            role: 'super_seller',
            employee: {
              employeeCode: `EMP-${sellerId.slice(4)}`,
              designation: 'Store Manager',
              joiningDate: new Date().toISOString().slice(0, 10),
            },
            permissions: superSellerPermissions,
            createdBy: registrationData.ownerUserId ?? 'system',
            status: 'active',
          },
        ],
      };
    });

    const linkedSeller = (seller.sellers ?? []).find(
      (candidate) => candidate.vendorId === vendorId,
    );
    if (!linkedSeller) throw new Error('Super Seller persistence failed.');

    const updatedVendor = await updateJson<Dataset>('vendors.json', { vendors: [] }, (data) => ({
      vendors: (data.vendors ?? []).map((candidate) =>
        candidate.id === vendorId ? { ...candidate, superSellerId: linkedSeller.id } : candidate,
      ),
    }));
    const persistedVendor = updatedVendor.vendors.find((candidate) => candidate.id === vendorId);
    if (persistedVendor?.superSellerId !== linkedSeller.id) {
      throw new Error('Vendor/Super Seller relationship persistence failed.');
    }

    return NextResponse.json(
      { success: true, vendor: persistedVendor, superSeller: linkedSeller },
      { status: 201 },
    );
  } catch (error) {
    if (createdVendorId) {
      try {
        await updateJson<Dataset>('vendors.json', { vendors: [] }, (data) => ({
          vendors: (data.vendors ?? []).filter((candidate) => candidate.id !== createdVendorId),
        }));
      } catch (rollbackError) {
        console.error('Vendor rollback failed:', rollbackError);
      }
    }
    if (createdSellerId) {
      try {
        await updateJson<SellerDataset>('sellers.json', { sellers: [] }, (data) => ({
          sellers: (data.sellers ?? []).filter((candidate) => candidate.id !== createdSellerId),
        }));
      } catch (rollbackError) {
        console.error('Seller rollback failed:', rollbackError);
      }
    }
    console.error('Vendor registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register vendor.' },
      { status: 500 },
    );
  }
}
