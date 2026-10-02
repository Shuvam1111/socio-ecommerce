import { beforeEach, describe, expect, it, vi } from 'vitest';

const blobObjects = new Map<string, string>();
const getMock = vi.fn();
const putMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  get: getMock,
  put: putMock,
}));

function blobResult(path: string) {
  const value = blobObjects.get(path);
  if (value === undefined) return null;
  return { stream: new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(value)); controller.close(); } }) };
}

describe('json storage service', () => {
  beforeEach(() => {
    vi.resetModules();
    blobObjects.clear();
    getMock.mockReset().mockImplementation(async (path: string) => blobResult(path));
    putMock.mockReset().mockImplementation(async (path: string, value: string) => {
      blobObjects.set(path, value);
      return { pathname: path };
    });
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BLOB_STORE_ID', 'test-store');
  });

  it('reads an existing Blob dataset without using a fallback', async () => {
    blobObjects.set('socio-commerce/runtime/users.json', JSON.stringify({ users: [] }));
    const { readJson } = await import('@/features/storage/services/json-storage-service');
    await expect(readJson('users.json', { users: [{ id: 'seed' }] })).resolves.toEqual({ users: [] });
    expect(putMock).not.toHaveBeenCalled();
  });

  it('initializes a missing Blob dataset from its local seed', async () => {
    const { readJson } = await import('@/features/storage/services/json-storage-service');
    const result = await readJson('roles.json', { roles: [] });
    expect(result).toEqual(expect.objectContaining({ roles: expect.any(Array) }));
    expect(putMock).toHaveBeenCalledWith(
      'socio-commerce/runtime/roles.json',
      expect.any(String),
      expect.objectContaining({ storeId: 'test-store', allowOverwrite: true }),
    );
  });

  it('does not use local seed data when Blob fails unexpectedly', async () => {
    getMock.mockRejectedValue(new Error('permission denied'));
    const { readJson } = await import('@/features/storage/services/json-storage-service');
    await expect(readJson('users.json', { users: [] })).rejects.toThrow('Unable to read production JSON dataset');
    expect(putMock).not.toHaveBeenCalled();
  });

  it('treats an empty Blob dataset as valid', async () => {
    blobObjects.set('socio-commerce/runtime/products.json', JSON.stringify([]));
    const { readJson } = await import('@/features/storage/services/json-storage-service');
    await expect(readJson('products.json', [{ id: 'seed' }])).resolves.toEqual([]);
    expect(putMock).not.toHaveBeenCalled();
  });

  it('writes and verifies a Blob dataset', async () => {
    const { writeJson } = await import('@/features/storage/services/json-storage-service');
    await expect(writeJson('users.json', { users: [{ id: 'new' }] })).resolves.toBeUndefined();
    expect(blobObjects.get('socio-commerce/runtime/users.json')).toContain('new');
  });
});
