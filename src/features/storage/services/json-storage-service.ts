import fs from 'fs/promises';
import path from 'path';
import { get, put } from '@vercel/blob';

const dataDirectory = path.join(process.cwd(), 'src', 'data');
const blobPrefix = 'socio-commerce/runtime';

function isProductionStorageEnabled() {
  return process.env.NODE_ENV === 'production';
}

function blobPath(key: string) {
  return `${blobPrefix}/${key.replace(/^\/+/, '')}`;
}

function localPath(key: string) {
  return path.join(dataDirectory, key);
}

function requireProductionToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required for production JSON persistence.');
  }
}

async function readBlob<T>(key: string): Promise<T | null> {
  requireProductionToken();
  const result = await get(blobPath(key), { access: 'private' });
  if (!result) return null;
  return JSON.parse(await new Response(result.stream).text()) as T;
}

export async function readSeedJson<T>(key: string): Promise<T> {
  return JSON.parse(await fs.readFile(localPath(key), 'utf8')) as T;
}

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  if (isProductionStorageEnabled()) {
    const value = await readBlob<T>(key);
    return value ?? fallback;
  }

  try {
    return JSON.parse(await fs.readFile(localPath(key), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, data: T): Promise<void> {
  if (isProductionStorageEnabled()) {
    requireProductionToken();
    await put(blobPath(key), JSON.stringify(data, null, 2), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return;
  }

  const file = localPath(key);
  const temporary = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(temporary, file);
}

export async function updateJson<T>(
  key: string,
  fallback: T,
  updater: (current: T) => T | Promise<T>,
): Promise<T> {
  const current = await readJson(key, fallback);
  const updated = await updater(current);
  await writeJson(key, updated);
  return updated;
}

export async function exists(key: string): Promise<boolean> {
  if (isProductionStorageEnabled()) return (await readBlob<unknown>(key)) !== null;
  try {
    await fs.access(localPath(key));
    return true;
  } catch {
    return false;
  }
}
