import usersSeed from '@/data/users.json';
import vendorsSeed from '@/data/vendors.json';
import sellersSeed from '@/data/sellers.json';
import productsSeed from '@/data/products.json';
import categoriesSeed from '@/data/categories.json';
import subcategoriesSeed from '@/data/subcategories.json';
import ordersSeed from '@/data/orders.json';
import reviewsSeed from '@/data/reviews.json';
import notificationsSeed from '@/data/notifications.json';
import cartsSeed from '@/data/carts.json';
import platformSettingsSeed from '@/data/platform-settings.json';
import inventoryActivitiesSeed from '@/data/inventory-activities.json';
import { readJsonIfPresent, writeJson } from './json-storage-service';

type RecordWithId = { id?: string };
type Dataset = Record<string, unknown>;
type Report = { dataset: string; existing: number; seed: number; toAdd: number; preserved: number };

const datasets: Record<string, Dataset> = {
  'users.json': usersSeed as Dataset,
  'vendors.json': vendorsSeed as Dataset,
  'sellers.json': sellersSeed as Dataset,
  'products.json': productsSeed as Dataset,
  'categories.json': categoriesSeed as Dataset,
  'subcategories.json': subcategoriesSeed as Dataset,
  'orders.json': ordersSeed as Dataset,
  'reviews.json': reviewsSeed as Dataset,
  'notifications.json': notificationsSeed as Dataset,
  'carts.json': cartsSeed as Dataset,
  'platform-settings.json': platformSettingsSeed as Dataset,
  'inventory-activities.json': inventoryActivitiesSeed as Dataset,
};

function records(dataset: Dataset): RecordWithId[] {
  const value = Object.values(dataset).find(Array.isArray);
  return (value ?? []) as RecordWithId[];
}

function mergedDataset(existing: Dataset | null, seed: Dataset): { value: Dataset; report: Report } {
  const seedRecords = records(seed);
  const existingRecords = existing ? records(existing) : [];
  const ids = new Set(existingRecords.map((record) => record.id).filter(Boolean));
  const additions = seedRecords.filter((record) => !record.id || !ids.has(record.id));
  const key = Object.keys(seed).find((name) => Array.isArray(seed[name])) ?? 'items';
  return {
    value: { ...(existing ?? {}), [key]: [...existingRecords, ...additions] },
    report: {
      dataset: '',
      existing: existingRecords.length,
      seed: seedRecords.length,
      toAdd: additions.length,
      preserved: existingRecords.length,
    },
  };
}

export async function getBlobSeedMigrationReport(): Promise<Report[]> {
  const report: Report[] = [];
  for (const [dataset, seed] of Object.entries(datasets)) {
    const result = mergedDataset(await readJsonIfPresent<Dataset>(dataset), seed);
    result.report.dataset = dataset;
    report.push(result.report);
  }
  return report;
}

export async function migrateBlobSeedDatasets(): Promise<Report[]> {
  const report: Report[] = [];
  for (const [dataset, seed] of Object.entries(datasets)) {
    const existing = await readJsonIfPresent<Dataset>(dataset);
    const result = mergedDataset(existing, seed);
    result.report.dataset = dataset;
    if (result.report.toAdd > 0 || existing === null) await writeJson(dataset, result.value);
    report.push(result.report);
  }
  return report;
}

export function migrationTotalAdded(report: Report[]) {
  return report.reduce((total, item) => total + item.toAdd, 0);
}

export type { Report as BlobSeedMigrationReport };
