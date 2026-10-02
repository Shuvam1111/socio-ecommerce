'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Mail, MapPin, Phone, ShieldCheck, Store } from 'lucide-react';
import { SellerShell } from '@/features/sellers/components/seller-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Vendor {
  id: string;
  store: { name: string; slug: string; description: string };
  business: {
    legalName: string;
    businessType: string;
    registrationNumber: string;
    vatRegistered: boolean;
  };
  contact: { email: string; phone: string };
  address: { city: string; district: string; province: string; street: string; postalCode: string };
  status: string;
}
export default function SellerStorePage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  useEffect(() => {
    fetch('/api/vendors')
      .then((response) => response.json())
      .then((result) => {
        const stored = localStorage.getItem('socio-seller');
        const session = stored ? JSON.parse(stored) : null;
        setVendor(
          (result.vendors ?? []).find((item: Vendor) => item.id === session?.vendorId) ??
            result.vendors?.[0] ??
            null,
        );
      });
  }, []);
  return (
    <SellerShell title="Store" description="View your vendor profile and business details">
      <div className="space-y-6">
        {vendor ? (
          <>
            <div>
              <p className="text-sm font-medium text-primary">Vendor profile</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{vendor.store.name}</h1>
              <p className="mt-2 text-muted-foreground">
                The business information connected to your seller account.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="size-5 text-primary" /> Store details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <Detail
                    icon={Building2}
                    label="Legal business name"
                    value={vendor.business.legalName}
                  />
                  <Detail
                    icon={ShieldCheck}
                    label="Business type"
                    value={vendor.business.businessType}
                  />
                  <Detail icon={Mail} label="Email" value={vendor.contact.email} />
                  <Detail icon={Phone} label="Phone" value={vendor.contact.phone} />
                  <Detail
                    icon={MapPin}
                    label="Address"
                    value={`${vendor.address.street}, ${vendor.address.city}, ${vendor.address.district}`}
                  />
                  <Detail
                    icon={MapPin}
                    label="Province / postal code"
                    value={`${vendor.address.province} · ${vendor.address.postalCode}`}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="size-5" /> Store approved
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Registration: {vendor.business.registrationNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    VAT registered: {vendor.business.vatRegistered ? 'Yes' : 'No'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Store details are unavailable.
            </CardContent>
          </Card>
        )}
      </div>
    </SellerShell>
  );
}
function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
