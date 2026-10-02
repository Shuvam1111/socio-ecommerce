import { get, put } from '@vercel/blob';

const blobPrefix = 'socio-commerce/runtime';
const verificationAttempts = 4;
const updateLocks = new Map<string, Promise<unknown>>();

type BlobMissingError = Error & { status?: number; statusCode?: number; code?: string };

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

function isMissingBlobError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as BlobMissingError;
  return (
    candidate.status === 404 || candidate.statusCode === 404 || candidate.code === 'BLOB_NOT_FOUND'
  );
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

export function resetLocalRuntimeData() {}

export async function readJson<T>(key: string, _fallback = {} as T): Promise<T> {
  const value = await readBlob<T>(key);
  if (value === null) {
    throw new Error(`Production JSON dataset ${blobPath(key)} is unavailable.`);
  }
  return value;
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
  return (await readBlob<unknown>(key)) !== null;
}
