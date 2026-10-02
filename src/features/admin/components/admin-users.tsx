'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Ban,
  XCircle,
} from 'lucide-react';

import {
  getAdminUsers,
  updateAdminUserStatus,
  type AdminUser,
} from '../services/user-admin-service';

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');

      const data = await getAdminUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        verification: verificationFilter,
      });

      setUsers(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search, roleFilter, statusFilter, verificationFilter]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;

      return (
        fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
      );
    });
  }, [users, search]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">Unable to load users</h2>

        <p className="mt-1 text-sm text-muted-foreground">{error}</p>

        <button
          type="button"
          onClick={() => void loadUsers()}
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
            <h1 className="text-2xl font-bold text-foreground">Users</h1>

            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {users.length}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage and review registered platform users.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadUsers()}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, username, email or phone..."
          className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="vendor">Vendor</option>
          <option value="super_seller">Super Seller</option>
          <option value="seller">Seller</option>
          <option value="buyer">Buyer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={verificationFilter}
          onChange={(event) => setVerificationFilter(event.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">All verification</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Results */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <UserRound className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold text-foreground">No users found</h2>

          <p className="mt-1 text-sm text-muted-foreground">Try changing your search.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Roles
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Verification
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Registered
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-muted/30">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <UserRound className="size-5 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="text-xs text-muted-foreground">@{user.username}</p>

                          <p className="text-xs text-muted-foreground">{user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span className="text-foreground">{user.email}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{user.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Roles */}
                    <td className="px-5 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {role.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <CheckCircle2 className="size-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                          <XCircle className="size-3.5" />
                          {user.status}
                        </span>
                      )}
                    </td>

                    {/* Verification */}
                    <td className="px-5 py-4">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                          <ShieldCheck className="size-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not verified</span>
                      )}
                    </td>

                    {/* Registered */}
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {user.roles.includes('admin') ? (
                        <span className="text-xs text-muted-foreground">Protected</span>
                      ) : (
                        <button
                          type="button"
                          disabled={actionLoading === user.id}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Set this user ${user.status === 'active' ? 'inactive' : 'active'}?`,
                              )
                            )
                              return;
                            try {
                              setActionLoading(user.id);
                              const updated = await updateAdminUserStatus(
                                user.id,
                                user.status === 'active' ? 'inactive' : 'active',
                              );
                              setUsers((current) =>
                                current.map((item) => (item.id === updated.id ? updated : item)),
                              );
                            } catch (error) {
                              setError(
                                error instanceof Error ? error.message : 'Unable to update user.',
                              );
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
                        >
                          <Ban className="size-3.5" />
                          {actionLoading === user.id
                            ? 'Saving...'
                            : user.status === 'active'
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result Count */}
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}
