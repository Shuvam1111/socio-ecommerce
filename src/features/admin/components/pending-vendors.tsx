'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Store,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

import {
  approveVendor,
  getPendingVendors,
  rejectVendor,
  type PendingVendor,
} from '../services/vendor-admin-service';

export function PendingVendors() {
  const [vendors, setVendors] = useState<PendingVendor[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(null);

  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    void loadVendors();
  }, []);

  async function loadVendors() {
    try {
      setLoading(true);
      setError('');

      const data = await getPendingVendors();

      setVendors(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load vendors.');
    } finally {
      setLoading(false);
    }
  }

  function openApproveDialog(vendor: PendingVendor) {
    setSelectedVendor(vendor);
    setDialogType('approve');
  }

  function openRejectDialog(vendor: PendingVendor) {
    setSelectedVendor(vendor);
    setRejectionReason('');
    setDialogType('reject');
  }

  function closeDialog() {
    if (actionLoading) {
      return;
    }

    setSelectedVendor(null);
    setDialogType(null);
    setRejectionReason('');
  }

  async function handleApprove() {
    if (!selectedVendor) {
      return;
    }

    try {
      setActionLoading(true);

      await approveVendor(selectedVendor.id);

      setVendors((current) => current.filter((vendor) => vendor.id !== selectedVendor.id));

      toast.success('Vendor approved successfully.');

      setSelectedVendor(null);
      setDialogType(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to approve vendor.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedVendor) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      toast.error('Please provide a rejection reason.');

      return;
    }

    try {
      setActionLoading(true);

      await rejectVendor(selectedVendor.id, reason);

      setVendors((current) => current.filter((vendor) => vendor.id !== selectedVendor.id));

      toast.success('Vendor rejected successfully.');

      setSelectedVendor(null);
      setDialogType(null);
      setRejectionReason('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reject vendor.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading pending vendors...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">Unable to load vendors</h2>

        <p className="mt-1 text-sm text-muted-foreground">{error}</p>

        <button
          type="button"
          onClick={() => void loadVendors()}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Pending Vendor Registrations</h1>

            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {vendors.length}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Review vendor applications before approving their stores.
          </p>
        </div>

        {vendors.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Store className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-lg font-semibold text-foreground">No pending vendors</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no vendor registrations waiting for approval.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Building2 className="size-5 text-primary" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-foreground">
                          {vendor.store.name}
                        </h2>

                        <p className="text-sm text-muted-foreground">Vendor ID: {vendor.id}</p>
                      </div>
                    </div>

                    <p className="max-w-3xl text-sm text-muted-foreground">
                      {vendor.store.description || 'No store description provided.'}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-foreground">{vendor.contact.email}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-foreground">{vendor.contact.phone}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-foreground">
                          {vendor.address.city}, {vendor.address.district}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-foreground">{vendor.business.businessType}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex w-fit shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    Pending Review
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Legal Name:{' '}
                      <strong className="text-foreground">{vendor.business.legalName}</strong>
                    </span>

                    <span className="hidden sm:inline">•</span>

                    <span>
                      PAN: <strong className="text-foreground">{vendor.business.panNumber}</strong>
                    </span>

                    <span className="hidden sm:inline">•</span>

                    <span>
                      Registered:{' '}
                      <strong className="text-foreground">
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openRejectDialog(vendor)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <XCircle className="size-4" />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => openApproveDialog(vendor)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <CheckCircle2 className="size-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={dialogType === 'approve' && selectedVendor !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        title="Approve Vendor"
        description={
          selectedVendor
            ? `Are you sure you want to approve "${selectedVendor.store.name}"? A Super Seller account will be created automatically for this vendor.`
            : undefined
        }
        confirmText="Approve Vendor"
        cancelText="Cancel"
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      {/* Reject Dialog */}
      <AlertDialog
        open={dialogType === 'reject' && selectedVendor !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Vendor</AlertDialogTitle>

            <AlertDialogDescription>
              {selectedVendor
                ? `Provide a reason for rejecting "${selectedVendor.store.name}".`
                : 'Provide a rejection reason.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label htmlFor="rejection-reason" className="text-sm font-medium text-foreground">
              Rejection Reason
            </label>

            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter the reason for rejecting this vendor..."
              disabled={actionLoading}
              rows={4}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>

            <button
              type="button"
              onClick={() => void handleReject()}
              disabled={actionLoading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 size-4" />
                  Reject Vendor
                </>
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
