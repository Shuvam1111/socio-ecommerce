export type VendorStatus = 'pending' | 'approved' | 'rejected';

export interface VendorRegistrationData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

  storeName: string;
  storeDescription: string;

  businessType: string;
  legalName: string;
  registrationNumber: string;
  panNumber: string;
  vatRegistered: boolean;

  alternatePhone: string;

  province: string;
  district: string;
  city: string;
  street: string;
  postalCode: string;

  pickupProvince: string;
  pickupDistrict: string;
  pickupCity: string;
  pickupStreet: string;

  returnProvince: string;
  returnDistrict: string;
  returnCity: string;
  returnStreet: string;
}

export interface Vendor {
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
  status: VendorStatus;
  createdAt: string;
  approvedAt: string | null;
}
