import fs from 'fs/promises';
import path from 'path';
import { get, put } from '@vercel/blob';

const dataDirectory = path.join(process.cwd(), 'src', 'data');
const blobPrefix = 'socio-commerce/runtime';
const verificationAttempts = 4;
const initializationLocks = new Map<string, Promise<void>>();
const updateLocks = new Map<string, Promise<unknown>>();
const localRuntimeData = new Map<string, unknown>();

type BlobMissingError = Error & { status?: number; statusCode?: number; code?: string };

function isProductionStorageEnabled() {
  return process.env.NODE_ENV === 'production';
}

function getBlobStoreId() {
  const storeId = process.env.BLOB_STORE_ID;

  if (!storeId) {
    throw new Error('BLOB_STORE_ID is required for production JSON storage.');
  }

  return storeId;
}

function blobPath(key: string) {
  return `${blobPrefix}/${key.replace(/^\/+/, '')}`;
}

function localPath(key: string) {
  return path.join(dataDirectory, key);
}

function isMissingBlobError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as BlobMissingError;
  return candidate.status === 404 || candidate.statusCode === 404 || candidate.code === 'BLOB_NOT_FOUND';
}

async function readBlob<T>(key: string): Promise<T | null> {
  try {
    const result = await get(blobPath(key), {
      access: 'private',
      storeId: getBlobStoreId(),
      useCache: false,
    });
    if (!result) return null;
    return JSON.parse(await new Response(result.stream).text()) as T;
  } catch (error) {
    if (isMissingBlobError(error)) return null;
    throw new Error(`Unable to read production JSON dataset ${blobPath(key)}.`, { cause: error });
  }
}

async function readLocalJson<T>(key: string): Promise<T> {
  return JSON.parse(await fs.readFile(localPath(key), 'utf8')) as T;
}

export async function readSeedJson<T>(key: string): Promise<T> {
  return readLocalJson<T>(key);
}

async function initializeDataset<T>(key: string): Promise<void> {
  const existingLock = initializationLocks.get(key);
  if (existingLock) return existingLock;

  const initialization = (async () => {
    const current = await readBlob<T>(key);
    if (current !== null) return;

    const seed = await readLocalJson<T>(key);
    await writeJson(key, seed);
    const persisted = await readBlob<T>(key);
    if (persisted === null) {
      throw new Error(`Blob initialization verification failed for ${blobPath(key)}.`);
    }
  })();

  initializationLocks.set(key, initialization);
  try {
    await initialization;
  } finally {
    initializationLocks.delete(key);
  }
}

export function resetLocalRuntimeData() {
  localRuntimeData.clear();
}

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  if (!isProductionStorageEnabled()) {
    if (localRuntimeData.has(key)) return localRuntimeData.get(key) as T;
    try {
      return await readLocalJson<T>(key);
    } catch {
      return fallback;
    }
  }

  const value = await readBlob<T>(key);
  if (value !== null) return value;

  await initializeDataset<T>(key);
  const initialized = await readBlob<T>(key);
  if (initialized === null) {
    throw new Error(`Production JSON dataset ${blobPath(key)} is unavailable after initialization.`);
  }
  return initialized;
}

async function readBlobWithRetry<T>(key: string): Promise<T | null> {
  for (let attempt = 0; attempt < verificationAttempts; attempt += 1) {
    const persisted = await readBlob<T>(key);
    if (persisted !== null) return persisted;
    if (attempt < verificationAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
  }
  return null;
}

export async function writeJson<T>(key: string, data: T): Promise<void> {
  if (isProductionStorageEnabled()) {
    const serialized = JSON.stringify(data, null, 2);
    await put(blobPath(key), serialized, {
      access: 'private',
      storeId: getBlobStoreId(),
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });

    const persisted = await readBlobWithRetry<T>(key);
    if (persisted === null || JSON.stringify(persisted, null, 2) !== serialized) {
      throw new Error(`Blob persistence verification failed for ${blobPath(key)}.`);
    }
    return;
  }

  const serialized = JSON.stringify(data, null, 2);
  await fs.writeFile(localPath(key), serialized, 'utf8');
  localRuntimeData.set(key, data);
}

export async function updateJson<T>(
  key: string,
  fallback: T,
  updater: (current: T) => T | Promise<T>,
): Promise<T> {
  const previous = updateLocks.get(key) ?? Promise.resolve();
  const operation = previous.then(async () => {
    const current = await readJson(key, fallback);
    const updated = await updater(current);
    await writeJson(key, updated);
    return updated;
  });
  updateLocks.set(key, operation);
  try {
    return await operation;
  } finally {
    if (updateLocks.get(key) === operation) updateLocks.delete(key);
  }
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
