'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  UserRound,
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
  getAdminVendors,
  rejectVendor,
  type PendingVendor,
} from '../services/vendor-admin-service';

type VendorFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function AdminVendors() {
  const [vendors, setVendors] = useState<PendingVendor[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState<VendorFilter>('all');

  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(null);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  async function loadVendors() {
    try {
      setLoading(true);
      setError('');

      const data = await getAdminVendors();

      setVendors(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load vendors.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadVendors();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        vendor.id.toLowerCase().includes(query) ||
        vendor.store.name.toLowerCase().includes(query) ||
        vendor.store.slug.toLowerCase().includes(query) ||
        vendor.business.legalName.toLowerCase().includes(query) ||
        vendor.contact.email.toLowerCase().includes(query) ||
        vendor.contact.phone.toLowerCase().includes(query) ||
        vendor.address.city.toLowerCase().includes(query) ||
        vendor.address.district.toLowerCase().includes(query)
      );
    });
  }, [vendors, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: vendors.length,

      pending: vendors.filter((vendor) => vendor.status === 'pending').length,

      approved: vendors.filter((vendor) => vendor.status === 'approved').length,

      rejected: vendors.filter((vendor) => vendor.status === 'rejected').length,
    };
  }, [vendors]);

  function openApproveDialog(vendor: PendingVendor) {
    setSelectedVendor(vendor);
    setApproveDialogOpen(true);
  }

  function openRejectDialog(vendor: PendingVendor) {
    setSelectedVendor(vendor);
    setRejectionReason('');
    setRejectDialogOpen(true);
  }

  async function handleApprove() {
    if (!selectedVendor) {
      return;
    }

    try {
      setActionLoading(true);

      await approveVendor(selectedVendor.id);

      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === selectedVendor.id
            ? {
                ...vendor,
                status: 'approved',
                approvedAt: new Date().toISOString(),
              }
            : vendor,
        ),
      );

      setApproveDialogOpen(false);
      setSelectedVendor(null);

      toast.success('Vendor approved successfully.', {
        description: 'The Super Seller account was created automatically.',
      });
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
      toast.error('Rejection reason is required.');
      return;
    }

    try {
      setActionLoading(true);

      await rejectVendor(selectedVendor.id, reason);

      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === selectedVendor.id
            ? {
                ...vendor,
                status: 'rejected',
                rejectionReason: reason,
              }
            : vendor,
        ),
      );

      setRejectDialogOpen(false);
      setSelectedVendor(null);
      setRejectionReason('');

      toast.success('Vendor rejected successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reject vendor.');
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusBadge(status: PendingVendor['status']) {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <CheckCircle2 className="size-3.5" />
          Approved
        </span>
      );
    }

    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
          <XCircle className="size-3.5" />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
        <Clock3 className="size-3.5" />
        Pending
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="size-5 animate-spin" />
          Loading vendors...
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
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <RefreshCw className="size-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Vendors</h1>

            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {vendors.length}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage marketplace vendors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadVendors()}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* Status Filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            statusFilter === 'all'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <p className="text-sm text-muted-foreground">All Vendors</p>

          <p className="mt-1 text-2xl font-bold text-foreground">{counts.all}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            statusFilter === 'pending'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <p className="text-sm text-muted-foreground">Pending</p>

          <p className="mt-1 text-2xl font-bold text-foreground">{counts.pending}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('approved')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            statusFilter === 'approved'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <p className="text-sm text-muted-foreground">Approved</p>

          <p className="mt-1 text-2xl font-bold text-foreground">{counts.approved}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('rejected')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            statusFilter === 'rejected'
              ? 'border-destructive bg-destructive/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <p className="text-sm text-muted-foreground">Rejected</p>

          <p className="mt-1 text-2xl font-bold text-foreground">{counts.rejected}</p>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by store, owner, email, phone, city or vendor ID..."
          className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Vendors */}
      {filteredVendors.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Store className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold text-foreground">No vendors found</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Vendor
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Owner / Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Super Seller
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Registered
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="transition-colors hover:bg-muted/30">
                    {/* Vendor */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
                          {vendor.store.logo ? (
                            <img
                              src={vendor.store.logo}
                              alt={`${vendor.store.name} logo`}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Store className="size-5 text-primary" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{vendor.store.name}</p>

                          <p className="text-xs text-muted-foreground">{vendor.store.slug}</p>

                          <p className="text-xs text-muted-foreground">{vendor.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Owner / Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <UserRound className="size-3.5 text-muted-foreground" />
                          <span className="text-foreground">Owner ID: {vendor.ownerUserId}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{vendor.contact.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{vendor.contact.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                        <div className="text-sm">
                          <p className="text-foreground">{vendor.address.city}</p>

                          <p className="text-muted-foreground">
                            {vendor.address.district}, {vendor.address.province}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {getStatusBadge(vendor.status)}

                      {vendor.status === 'rejected' && vendor.rejectionReason && (
                        <p className="mt-2 max-w-[180px] text-xs text-muted-foreground">
                          {vendor.rejectionReason}
                        </p>
                      )}
                    </td>

                    {/* Super Seller */}
                    <td className="px-5 py-4">
                      {vendor.status === 'approved' ? (
                        vendor.superSellerId ? (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <ShieldCheck className="size-4" />

                            <div>
                              <p className="font-medium">Created</p>

                              <p className="text-xs text-muted-foreground">
                                {vendor.superSellerId}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not assigned</span>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Registered */}
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {vendor.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openApproveDialog(vendor)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:opacity-90"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() => openRejectDialog(vendor)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                          >
                            <XCircle className="size-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="flex justify-end text-xs text-muted-foreground">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result Count */}
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </div>
        </div>
      )}

      {/* Approve Dialog */}
      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Approve Vendor"
        description={
          selectedVendor ? (
            <>
              Are you sure you want to approve <strong>{selectedVendor.store.name}</strong>? A Super
              Seller account will be created automatically for this vendor.
            </>
          ) : null
        }
        confirmText="Approve Vendor"
        cancelText="Cancel"
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      {/* Reject Dialog */}
      <AlertDialog
        open={rejectDialogOpen}
        onOpenChange={actionLoading ? undefined : setRejectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Vendor</AlertDialogTitle>

            <AlertDialogDescription>
              {selectedVendor ? (
                <>
                  You are rejecting <strong>{selectedVendor.store.name}</strong>. Please provide a
                  reason for the rejection.
                </>
              ) : (
                'Please provide a reason for rejecting this vendor.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
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
              className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Vendor'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
