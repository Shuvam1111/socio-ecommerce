import { NextResponse } from 'next/server';
import {
  defaultSellerPermissions,
  emailPattern,
  getSellerContext,
  hasPermission,
  isSellerPermission,
  isSellerRole,
  jsonError,
  nextId,
  safeSeller,
  type SellerRecord,
  writeSellerData,
} from '@/features/sellers/services/seller-authorization';

export async function GET(request: Request) {
  const { seller, usersData, sellersData } = await getSellerContext(request);
  if (!seller || seller.status !== 'active') return jsonError('Seller session required.', 401);
  if (!hasPermission(seller, 'add_sellers'))
    return jsonError('You are not allowed to view sellers.', 403);
  return NextResponse.json({
    sellers: sellersData.sellers
      .filter((item) => item.vendorId === seller.vendorId)
      .map((item) =>
        safeSeller(
          item,
          usersData.users.find((user) => user.id === item.userId),
        ),
      ),
  });
}

export async function POST(request: Request) {
  const { seller, usersData, sellersData } = await getSellerContext(request);
  if (!seller || seller.status !== 'active') return jsonError('Seller session required.', 401);
  if (seller.role !== 'super_seller' || !hasPermission(seller, 'add_sellers'))
    return jsonError('Only an active Super Seller can add sellers.', 403);
  try {
    const body = await request.json();
    const username = String(body.username ?? '').trim();
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');
    if (!username || !email || !emailPattern.test(email) || password.length < 6)
      return jsonError(
        'Username, valid email, and a password of at least 6 characters are required.',
        400,
      );
    if (
      usersData.users.some(
        (user) =>
          user.username.toLowerCase() === username.toLowerCase() ||
          user.email.toLowerCase() === email,
      )
    )
      return jsonError('A user with that username or email already exists.', 409);
    const userId = nextId(usersData.users, 'USR-');
    const sellerId = nextId(sellersData.sellers, 'SEL-');
    usersData.users.push({
      id: userId,
      username,
      email,
      password,
      firstName: String(body.firstName ?? username).trim(),
      lastName: String(body.lastName ?? '').trim(),
      roles: ['seller'],
      activeRole: 'seller',
      status: 'active',
    });
    const record: SellerRecord = {
      id: sellerId,
      userId,
      vendorId: seller.vendorId,
      role: 'seller',
      employee: {
        employeeCode: `EMP-${sellerId.slice(-3)}`,
        designation: String(body.designation ?? 'Sales Staff').trim() || 'Sales Staff',
        joiningDate: new Date().toISOString().slice(0, 10),
      },
      permissions: defaultSellerPermissions,
      createdBy: seller.id,
      status: 'active',
    };
    sellersData.sellers.push(record);
    await writeSellerData(sellersData, usersData);
    return NextResponse.json(
      { seller: safeSeller(record, usersData.users.at(-1)) },
      { status: 201 },
    );
  } catch {
    return jsonError('Unable to add seller.', 500);
  }
}

export async function PATCH(request: Request) {
  const { seller, usersData, sellersData } = await getSellerContext(request);
  if (!seller || seller.status !== 'active') return jsonError('Seller session required.', 401);
  if (seller.role !== 'super_seller')
    return jsonError('Only a Super Seller can update sellers.', 403);
  try {
    const body = await request.json();
    const target = sellersData.sellers.find(
      (item) => item.id === body.id && item.vendorId === seller.vendorId,
    );
    if (!target) return jsonError('Seller not found.', 404);
    if (body.role !== undefined && (!isSellerRole(body.role) || body.role === 'super_seller'))
      return jsonError('Only normal seller role can be assigned.', 400);
    if (body.status !== undefined && body.status !== 'active' && body.status !== 'inactive')
      return jsonError('Invalid seller status.', 400);
    if (
      body.permissions !== undefined &&
      (!Array.isArray(body.permissions) || !body.permissions.every(isSellerPermission))
    )
      return jsonError('Invalid seller permissions.', 400);
    const user = usersData.users.find((item) => item.id === target.userId);
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (
        !emailPattern.test(email) ||
        usersData.users.some(
          (item) => item.id !== target.userId && item.email.toLowerCase() === email,
        )
      )
        return jsonError('A valid unique email is required.', 400);
      if (user) user.email = email;
    }
    if (user) {
      if (body.firstName !== undefined) user.firstName = String(body.firstName).trim();
      if (body.lastName !== undefined) user.lastName = String(body.lastName).trim();
    }
    if (body.designation !== undefined)
      target.employee.designation = String(body.designation).trim() || target.employee.designation;
    if (body.status !== undefined) target.status = body.status;
    if (body.permissions !== undefined) target.permissions = body.permissions;
    await writeSellerData(sellersData, usersData);
    return NextResponse.json({ seller: safeSeller(target, user) });
  } catch {
    return jsonError('Unable to update seller.', 500);
  }
}

export async function DELETE(request: Request) {
  const { seller, usersData, sellersData } = await getSellerContext(request);
  if (!seller || seller.status !== 'active') return jsonError('Seller session required.', 401);
  if (seller.role !== 'super_seller' || !hasPermission(seller, 'remove_sellers'))
    return jsonError('Only a Super Seller can remove sellers.', 403);
  const id = new URL(request.url).searchParams.get('id');
  const index = sellersData.sellers.findIndex(
    (item) => item.id === id && item.vendorId === seller.vendorId,
  );
  if (index < 0) return jsonError('Seller not found.', 404);
  if (sellersData.sellers[index].id === seller.id)
    return jsonError('You cannot remove your own seller account.', 400);
  const [removed] = sellersData.sellers.splice(index, 1);
  const userIndex = usersData.users.findIndex((user) => user.id === removed.userId);
  if (userIndex >= 0) usersData.users[userIndex].status = 'inactive';
  await writeSellerData(sellersData, usersData);
  return NextResponse.json({ message: 'Seller removed.' });
}
