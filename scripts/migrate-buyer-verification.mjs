import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { get, put } from '@vercel/blob';

const blobPath = 'socio-commerce/runtime/users.json';
const localPath = path.join(process.cwd(), 'src', 'data', 'users.json');
const mode = process.argv[2];

if (mode !== '--production' && mode !== '--local') {
  throw new Error('Choose exactly one target: --production or --local.');
}

if (mode === '--production' && process.env.NODE_ENV !== 'production') {
  throw new Error('Production migration requires NODE_ENV=production.');
}

function isBuyer(user) {
  return (
    user?.activeRole === 'buyer' || (Array.isArray(user?.roles) && user.roles.includes('buyer'))
  );
}

async function readUsers() {
  if (mode === '--local') {
    return JSON.parse(await fs.readFile(localPath, 'utf8'));
  }

  if (!process.env.BLOB_STORE_ID) {
    throw new Error('BLOB_STORE_ID is required for production migration.');
  }
  const result = await get(blobPath, { access: 'private', storeId: process.env.BLOB_STORE_ID });
  if (!result) throw new Error(`Production users blob was not found: ${blobPath}`);
  return JSON.parse(await new Response(result.stream).text());
}

async function writeUsers(data) {
  const serialized = JSON.stringify(data, null, 2);
  if (mode === '--local') {
    const temporary = `${localPath}.${process.pid}.tmp`;
    await fs.writeFile(temporary, serialized, 'utf8');
    await fs.rename(temporary, localPath);
    return;
  }
  await put(blobPath, serialized, {
    access: 'private',
    storeId: process.env.BLOB_STORE_ID,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

const data = await readUsers();
if (!data || !Array.isArray(data.users)) throw new Error('Users data must contain a users array.');

const buyers = data.users.filter(isBuyer);
const updatedCount = buyers.filter((user) => user.isVerified !== true).length;
if (updatedCount > 0) {
  await writeUsers({
    ...data,
    users: data.users.map((user) => (isBuyer(user) ? { ...user, isVerified: true } : user)),
  });
}

console.log(
  JSON.stringify({
    target: mode === '--production' ? 'production-blob' : 'local-file',
    buyers: buyers.length,
    updated: updatedCount,
  }),
);
