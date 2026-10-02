import * as BlobSdk from '@vercel/blob';

const { get, put } = BlobSdk;

const blobPrefix = 'socio-commerce/runtime';
const verificationAttempts = 4;
const updateLocks = new Map<string, Promise<unknown>>();

type BlobMissingError = Error & {
  status?: number;
  statusCode?: number;
  code?: string;
  name?: string;
  cause?: unknown;
};

const missingBlobMessage = 'vercel blob: the requested blob does not exist';


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

function getBlobErrorDiagnostics(error: unknown) {
  if (!error || typeof error !== 'object') return { type: typeof error };
  const candidate = error as BlobMissingError;
  const notFoundConstructor = Object.prototype.hasOwnProperty.call(BlobSdk, 'BlobNotFoundError')
    ? (Reflect.get(BlobSdk, 'BlobNotFoundError') as
        | (abstract new (...args: never[]) => object)
        | undefined)
    : undefined;
  const cause = candidate.cause;
  const causeObject = cause && typeof cause === 'object' ? (cause as BlobMissingError) : undefined;
  return {
    constructorName: candidate.constructor?.name,
    name: candidate.name,
    message: candidate.message,
    code: candidate.code,
    status: candidate.status,
    statusCode: candidate.statusCode,
    causeConstructorName: causeObject?.constructor?.name,
    causeName: causeObject?.name,
    causeMessage: causeObject?.message,
    isBlobNotFoundError: Boolean(notFoundConstructor && candidate instanceof notFoundConstructor),
    causeIsBlobNotFoundError: Boolean(
      notFoundConstructor && causeObject instanceof notFoundConstructor,
    ),
  };
}

function isMissingBlobError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as BlobMissingError;
  const message = candidate.message?.trim().toLowerCase();
  const constructorName = (candidate.constructor as { name?: string } | undefined)?.name;

  if (
    candidate.status === 404 ||
    candidate.statusCode === 404 ||
    candidate.code === 'BLOB_NOT_FOUND' ||
    candidate.name === 'BlobNotFoundError' ||
    constructorName === 'BlobNotFoundError' ||
    message === missingBlobMessage ||
    message === 'the requested blob does not exist'
  ) {
    return true;
}

  return candidate.cause !== error && isMissingBlobError(candidate.cause);
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
    const missing = isMissingBlobError(error);
    console.error('[v0] Blob dataset read failed', {
      key,
      path: blobPath(key),
      packageVersion: '2.8.0',
      missing,
      error: getBlobErrorDiagnostics(error),
    });
    if (missing) return null;
    throw new Error(`Unable to read production JSON dataset ${blobPath(key)}.`, { cause: error });
  }
}

export function resetLocalRuntimeData() {
  (
    globalThis as typeof globalThis & { __resetTestBlobStorage?: () => void }
  ).__resetTestBlobStorage?.();
}

export async function readJsonIfPresent<T>(key: string): Promise<T | null> {
  return readBlob<T>(key);
}

export async function readJson<T>(key: string, _fallback = {} as T): Promise<T> {
  const value = await readJsonIfPresent<T>(key);
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

export async function seedJsonIfMissing<T>(key: string, seed: T): Promise<boolean> {
  if (await exists(key)) return false;
  await writeJson(key, seed);
  return true;
}

type DatasetRecord = { id?: string | number };
type DatasetValue = DatasetRecord[] | Record<string, unknown>;

function recordsFor(value: DatasetValue): DatasetRecord[] {
  if (Array.isArray(value)) return value;
  const collection = Object.values(value).find(Array.isArray);
  return (collection as DatasetRecord[] | undefined) ?? [];
}

function mergeRecords(existing: DatasetValue, seed: DatasetValue): DatasetValue {
  if (Array.isArray(existing) && Array.isArray(seed)) {
    const ids = new Set(existing.map((record) => record.id).filter((id) => id !== undefined));
    return [...existing, ...seed.filter((record) => record.id === undefined || !ids.has(record.id))];
  }

  if (Array.isArray(existing) || Array.isArray(seed)) return existing;

  const key = Object.keys(seed).find((candidate) => Array.isArray(seed[candidate]));
  if (!key || !Array.isArray(existing[key]) || !Array.isArray(seed[key])) return existing;

  const current = existing[key] as DatasetRecord[];
  const ids = new Set(current.map((record) => record.id).filter((id) => id !== undefined));
  return {
    ...existing,
    [key]: [...current, ...(seed[key] as DatasetRecord[]).filter(
      (record) => record.id === undefined || !ids.has(record.id),
    )],
  };
}

export type MigrationReport = {
  dataset: string;
  existingRecords: number;
  seedRecords: number;
  recordsToAdd: number;
  recordsPreserved: number;
};

export async function mergeJsonSeed<T extends DatasetValue>(
  key: string,
  seed: T,
  dryRun = false,
): Promise<MigrationReport> {
  const existing = await readJsonIfPresent<T>(key);
  const seedRecords = recordsFor(seed).filter((record) => record.id !== undefined);
  if (existing === null) {
    if (!dryRun) await writeJson(key, seed);
    return { dataset: key, existingRecords: 0, seedRecords: seedRecords.length, recordsToAdd: seedRecords.length, recordsPreserved: 0 };
  }
  const existingRecords = recordsFor(existing);
  const ids = new Set(existingRecords.map((record) => record.id).filter((id) => id !== undefined));
  const recordsToAdd = seedRecords.filter(
    (record) => record.id !== undefined && !ids.has(record.id),
  ).length;
  if (!dryRun && recordsToAdd > 0) await writeJson(key, mergeRecords(existing, seed) as T);
  return { dataset: key, existingRecords: existingRecords.length, seedRecords: seedRecords.length, recordsToAdd, recordsPreserved: existingRecords.length };
}
