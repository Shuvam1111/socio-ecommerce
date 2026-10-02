'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { registerVendor } from '../services/vendor-service';
import type { VendorRegistrationData } from '../types/vendor';

const initialForm: VendorRegistrationData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',

  storeName: '',
  storeDescription: '',

  businessType: '',
  legalName: '',
  registrationNumber: '',
  panNumber: '',
  vatRegistered: false,

  alternatePhone: '',

  province: '',
  district: '',
  city: '',
  street: '',
  postalCode: '',

  pickupProvince: '',
  pickupDistrict: '',
  pickupCity: '',
  pickupStreet: '',

  returnProvince: '',
  returnDistrict: '',
  returnCity: '',
  returnStreet: '',
};

export function VendorRegistrationForm() {
  const [form, setForm] = useState<VendorRegistrationData>(initialForm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof VendorRegistrationData, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validate(): string | null {
    if (!form.firstName.trim()) {
      return 'First name is required.';
    }

    if (!form.lastName.trim()) {
      return 'Last name is required.';
    }

    if (!form.username.trim()) {
      return 'Username is required.';
    }

    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      return 'Username can only contain letters, numbers, and underscores.';
    }

    if (!form.email.trim()) {
      return 'Email is required.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Please enter a valid email address.';
    }

    if (!form.phone.trim()) {
      return 'Phone number is required.';
    }

    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone)) {
      return 'Please enter a valid phone number.';
    }

    if (form.password.length < 8) {
      return 'Password must contain at least 8 characters.';
    }

    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }

    if (!form.storeName.trim()) {
      return 'Store name is required.';
    }

    if (!form.businessType.trim()) {
      return 'Business type is required.';
    }

    if (!form.legalName.trim()) {
      return 'Legal business name is required.';
    }

    if (!form.panNumber.trim()) {
      return 'PAN number is required.';
    }

    if (!form.province.trim()) {
      return 'Province is required.';
    }

    if (!form.district.trim()) {
      return 'District is required.';
    }

    if (!form.city.trim()) {
      return 'City is required.';
    }

    if (!form.street.trim()) {
      return 'Street address is required.';
    }

    if (!form.pickupProvince.trim()) {
      return 'Pickup province is required.';
    }

    if (!form.pickupDistrict.trim()) {
      return 'Pickup district is required.';
    }

    if (!form.pickupCity.trim()) {
      return 'Pickup city is required.';
    }

    if (!form.pickupStreet.trim()) {
      return 'Pickup street is required.';
    }

    if (!form.returnProvince.trim()) {
      return 'Return province is required.';
    }

    if (!form.returnDistrict.trim()) {
      return 'Return district is required.';
    }

    if (!form.returnCity.trim()) {
      return 'Return city is required.';
    }

    if (!form.returnStreet.trim()) {
      return 'Return street is required.';
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const vendor = await registerVendor(form);

      toast.success('Vendor registration submitted successfully.', {
        description: `${vendor.store.name} is waiting for admin approval.`,
      });

      setForm(initialForm);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to register vendor. Please try again.';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-5xl">
      <CardHeader>
        <CardTitle className="text-2xl">Vendor Registration</CardTitle>

        <p className="text-sm text-muted-foreground">
          Register your business to start selling on Socio Commerce. Your application will be
          reviewed by an administrator.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Account Information */}
          <FormSection
            title="Account Information"
            description="Create the account you will use to manage your vendor business."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="First Name"
                value={form.firstName}
                onChange={(value) => updateField('firstName', value)}
                required
              />

              <Field
                label="Last Name"
                value={form.lastName}
                onChange={(value) => updateField('lastName', value)}
                required
              />

              <Field
                label="Username"
                value={form.username}
                placeholder="e.g. ramstore"
                onChange={(value) => updateField('username', value.toLowerCase())}
                required
              />

              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField('email', value)}
                required
              />

              <Field
                label="Phone"
                value={form.phone}
                placeholder="98XXXXXXXX"
                onChange={(value) => updateField('phone', value)}
                required
              />

              <div />

              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(value) => updateField('password', value)}
                required
              />

              <Field
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(value) => updateField('confirmPassword', value)}
                required
              />
            </div>
          </FormSection>

          {/* Store Information */}
          <FormSection
            title="Store Information"
            description="Provide the basic information about your online store."
          >
            <div className="space-y-5">
              <Field
                label="Store Name"
                value={form.storeName}
                placeholder="e.g. Ram Electronics"
                onChange={(value) => updateField('storeName', value)}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>

                <textarea
                  id="storeDescription"
                  value={form.storeDescription}
                  onChange={(event) => updateField('storeDescription', event.target.value)}
                  placeholder="Describe your store and products..."
                  rows={4}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>
          </FormSection>

          {/* Business Information */}
          <FormSection
            title="Business Information"
            description="Provide your legal and business registration details."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Business Type"
                value={form.businessType}
                placeholder="e.g. Individual, Partnership, Pvt. Ltd."
                onChange={(value) => updateField('businessType', value)}
                required
              />

              <Field
                label="Legal Name"
                value={form.legalName}
                placeholder="Registered legal business name"
                onChange={(value) => updateField('legalName', value)}
                required
              />

              <Field
                label="Registration Number"
                value={form.registrationNumber}
                placeholder="e.g. REG-123456"
                onChange={(value) => updateField('registrationNumber', value)}
              />

              <Field
                label="PAN Number"
                value={form.panNumber}
                placeholder="Enter PAN number"
                onChange={(value) => updateField('panNumber', value)}
                required
              />

              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  id="vatRegistered"
                  type="checkbox"
                  checked={form.vatRegistered}
                  onChange={(event) => updateField('vatRegistered', event.target.checked)}
                  className="size-4 rounded border-input"
                />

                <Label htmlFor="vatRegistered" className="cursor-pointer">
                  Business is VAT registered
                </Label>
              </div>
            </div>
          </FormSection>

          {/* Contact Information */}
          <FormSection
            title="Contact Information"
            description="Provide an alternate contact number if available."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Primary Phone"
                value={form.phone}
                onChange={(value) => updateField('phone', value)}
                required
              />

              <Field
                label="Alternate Phone"
                value={form.alternatePhone}
                onChange={(value) => updateField('alternatePhone', value)}
              />
            </div>
          </FormSection>

          {/* Business Address */}
          <FormSection title="Business Address" description="Provide your main business location.">
            <AddressFields
              province={form.province}
              district={form.district}
              city={form.city}
              street={form.street}
              postalCode={form.postalCode}
              onChange={updateField}
              prefix=""
              includePostalCode
            />
          </FormSection>

          {/* Pickup Address */}
          <FormSection
            title="Pickup Address"
            description="Provide the location where products will be collected."
          >
            <AddressFields
              province={form.pickupProvince}
              district={form.pickupDistrict}
              city={form.pickupCity}
              street={form.pickupStreet}
              onChange={updateField}
              prefix="pickup"
            />
          </FormSection>

          {/* Return Address */}
          <FormSection
            title="Return Address"
            description="Provide the location where returned products should be sent."
          >
            <AddressFields
              province={form.returnProvince}
              district={form.returnDistrict}
              city={form.returnCity}
              street={form.returnStreet}
              onChange={updateField}
              prefix="return"
            />
          </FormSection>

          {/* Submission */}
          <div className="border-t border-border pt-6">
            <div className="mb-5 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Your vendor account will be created with a
                <span className="font-medium text-foreground"> pending</span> status. An
                administrator must approve your application before your vendor account becomes
                active.
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}

              {isSubmitting ? 'Submitting...' : 'Submit Vendor Registration'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>

        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {children}
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

interface AddressFieldsProps {
  province: string;
  district: string;
  city: string;
  street: string;
  postalCode?: string;
  onChange: (field: keyof VendorRegistrationData, value: string | boolean) => void;
  prefix: 'pickup' | 'return' | '';
  includePostalCode?: boolean;
}

function AddressFields({
  province,
  district,
  city,
  street,
  postalCode,
  onChange,
  prefix,
  includePostalCode = false,
}: AddressFieldsProps) {
  const provinceField =
    prefix === 'pickup' ? 'pickupProvince' : prefix === 'return' ? 'returnProvince' : 'province';

  const districtField =
    prefix === 'pickup' ? 'pickupDistrict' : prefix === 'return' ? 'returnDistrict' : 'district';

  const cityField =
    prefix === 'pickup' ? 'pickupCity' : prefix === 'return' ? 'returnCity' : 'city';

  const streetField =
    prefix === 'pickup' ? 'pickupStreet' : prefix === 'return' ? 'returnStreet' : 'street';

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        label="Province"
        value={province}
        onChange={(value) => onChange(provinceField, value)}
        required
      />

      <Field
        label="District"
        value={district}
        onChange={(value) => onChange(districtField, value)}
        required
      />

      <Field label="City" value={city} onChange={(value) => onChange(cityField, value)} required />

      <Field
        label="Street"
        value={street}
        onChange={(value) => onChange(streetField, value)}
        required
      />

      {includePostalCode && (
        <Field
          label="Postal Code"
          value={postalCode ?? ''}
          onChange={(value) => onChange('postalCode', value)}
        />
      )}
    </div>
  );
}
