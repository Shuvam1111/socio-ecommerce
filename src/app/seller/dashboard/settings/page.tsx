'use client';

import { useState } from 'react';
import { Check, ShieldCheck, Store } from 'lucide-react';
import { SellerShell } from '@/features/sellers/components/seller-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SellerSettingsPage() {
  const [storeName, setStoreName] = useState('My Socio Store');

  function saveSettings() {
    toast.success('Store settings saved.');
  }

  return (
    <SellerShell title="Settings" description="Manage your seller profile and store preferences">
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Store profile</CardTitle>
            <CardDescription>Keep the details customers see up to date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store name</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description">Store description</Label>
              <textarea
                id="store-description"
                defaultValue="Quality products, thoughtfully selected for everyday life."
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button onClick={saveSettings}>
              <Check className="size-4" /> Save changes
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="size-5 text-primary" /> Store status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500" /> Store is active
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" /> Account security
              </CardTitle>
              <CardDescription>
                Your seller session is protected by an httpOnly cookie.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </SellerShell>
  );
}
