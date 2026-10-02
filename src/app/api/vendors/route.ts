import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const vendorsFilePath = path.join(process.cwd(), 'src', 'data', 'vendors.json');

export async function POST(request: Request) {
  try {
    const registrationData = await request.json();

    const file = await fs.readFile(vendorsFilePath, 'utf-8');

    const data = JSON.parse(file);

    const vendors = Array.isArray(data.vendors) ? data.vendors : [];

    const vendorId = `VEN-${String(vendors.length + 1).padStart(6, '0')}`;

    const vendor = {
      id: vendorId,
      ownerUserId: registrationData.ownerUserId,

      store: {
        name: registrationData.storeName,
        slug: registrationData.storeName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
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

      documents: {
        businessRegistration: null,
        panDocument: null,
        ownerIdentity: null,
      },

      bankAccount: null,

      superSellerId: null,

      status: 'pending',

      createdAt: new Date().toISOString(),

      approvedAt: null,
    };

    vendors.push(vendor);

    await fs.writeFile(vendorsFilePath, JSON.stringify({ vendors }, null, 2), 'utf-8');

    return NextResponse.json(
      {
        success: true,
        vendor,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Vendor registration error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to register vendor.',
      },
      { status: 500 },
    );
  }
}
