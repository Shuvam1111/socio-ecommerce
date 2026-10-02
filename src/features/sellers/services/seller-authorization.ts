import fs from 'fs/promises';
import path from 'path';
import type { NextResponse } from 'next/server';

export type SellerRole = 'seller' | 'super_seller';
export type SellerStatus = 'active' | 'inactive';
export type SellerPermission =
  | 'manage_products'
  | 'manage_inventory'
  | 'manage_orders'
  | 'process_orders'
  | 'add_sellers'
  | 'remove_sellers'
  | 'manage_seller_permissions'
  | 'view_sales';

export interface SellerRecord {
  id: string;
  userId: string;
  vendorId: string;
  role: SellerRole;
  employee: { employeeCode: string; designation: string; joiningDate: string };
  permissions: SellerPermission[];
  createdBy: string;
  status: SellerStatus;
}

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  status: string;
  [key: string]: unknown;
}

async function readJson<T>(fileName: string): Promise<T> {
  const file = await fs.readFile(path.join(process.cwd(), 'src', 'data', fileName), 'utf8');
  return JSON.parse(file) as T;
}

export async function getSellerContext(request: Request) {
  const sessionId = request.headers
    .get('cookie')
    ?.match(/(?:^|;\s*)socio-seller-session=([^;]+)/)?.[1];
  const [sellersData, usersData] = await Promise.all([
    readJson<{ sellers: SellerRecord[] }>('sellers.json'),
    readJson<{ users: UserRecord[] }>('users.json'),
  ]);
  const seller = sellersData.sellers.find((item) => item.id === sessionId);
  const user = seller ? usersData.users.find((item) => item.id === seller.userId) : undefined;
  return { seller, user, sellersData, usersData };
}

export function hasPermission(seller: SellerRecord, permission: SellerPermission) {
  return seller.role === 'super_seller' || seller.permissions.includes(permission);
}

export function authError(message: string, status: 401 | 403 | 404) {
  return { message, status };
}

export function safeSeller(seller: SellerRecord, user?: UserRecord) {
  return {
    ...seller,
    user: user
      ? {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        }
      : undefined,
  };
}

export async function writeSellerData(
  sellersData: { sellers: SellerRecord[] },
  usersData: { users: UserRecord[] },
) {
  await Promise.all([
    fs.writeFile(
      path.join(process.cwd(), 'src', 'data', 'sellers.json'),
      JSON.stringify(sellersData, null, 2),
    ),
    fs.writeFile(
      path.join(process.cwd(), 'src', 'data', 'users.json'),
      JSON.stringify(usersData, null, 2),
    ),
  ]);
}

export const SELLER_SESSION_COOKIE = 'socio-seller-session';

export function clearSellerSession(response: NextResponse) {
  response.cookies.set({
    name: SELLER_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export type SellerResponse = NextResponse;
export { readJson };

export const sellerPermissions: SellerPermission[] = [
  'manage_products',
  'manage_inventory',
  'manage_orders',
  'process_orders',
  'add_sellers',
  'remove_sellers',
  'manage_seller_permissions',
  'view_sales',
];

export const defaultSellerPermissions: SellerPermission[] = [
  'manage_products',
  'manage_inventory',
  'process_orders',
  'view_sales',
];

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function nextId(records: Array<{ id: string }>, prefix: string) {
  const number =
    Math.max(0, ...records.map((record) => Number(record.id.replace(prefix, '')) || 0)) + 1;
  return `${prefix}${String(number).padStart(6, '0')}`;
}

export function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}

export function isSellerRole(value: unknown): value is SellerRole {
  return value === 'seller' || value === 'super_seller';
}

export function isSellerStatus(value: unknown): value is SellerStatus {
  return value === 'active' || value === 'inactive';
}

export function isSellerPermission(value: unknown): value is SellerPermission {
  return typeof value === 'string' && sellerPermissions.includes(value as SellerPermission);
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof Response;
}

export { path };
