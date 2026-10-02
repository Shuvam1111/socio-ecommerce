import { readJson, writeJson } from '@/features/storage/services/json-storage-service';


export type TaxonomyStatus = 'active' | 'inactive';
export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  status: TaxonomyStatus;
  createdAt?: string;
  updatedAt?: string;
}
export interface SubcategoryRecord {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  status: TaxonomyStatus;
  createdAt?: string;
  updatedAt?: string;
}
interface ProductsData {
  products: Array<{ categoryId?: string; subcategoryId?: string | null }>;
}

const normalize = (value: string) => value.trim().toLowerCase();

const slugify = (value: string) =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function readDataset<T>(name: string, fallback: T): Promise<T> {
  return readJson<T>(name, fallback);
}
async function writeDataset(name: string, data: unknown) {
  await writeJson(name, data);
}

export const createSlug = slugify;
export async function loadCategories() {
  return (await readDataset<{ categories: CategoryRecord[] }>('categories.json', { categories: [] })).categories;

}
export async function loadSubcategories() {
  return (
    await readDataset<{ subcategories: SubcategoryRecord[] }>('subcategories.json', {
      subcategories: [],
    })
  ).subcategories;

}
export async function loadProducts() {
  return (await readDataset<ProductsData>('products.json', { products: [] })).products;

}
export async function saveCategories(categories: CategoryRecord[]) {
  await writeDataset('categories.json', { categories });
}
export async function saveSubcategories(subcategories: SubcategoryRecord[]) {
  await writeDataset('subcategories.json', { subcategories });
}
export function validateStatus(status: unknown): status is TaxonomyStatus {
  return status === 'active' || status === 'inactive';
}
export function validateName(name: unknown) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
}
export function safeCategory(category: CategoryRecord) {
  const { icon, description, ...safe } = category;
  return { ...safe, ...(icon ? { icon } : {}), ...(description ? { description } : {}) };
}
export function safeSubcategory(subcategory: SubcategoryRecord) {
  return subcategory;
}
export function nextId(records: Array<{ id: string }>, prefix: string) {
  const max = records.reduce((highest, record) => {
    const match = record.id.match(new RegExp(`^${prefix}-(\\d+)$`));
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}
export function validateProductTaxonomy(
  categoryId: unknown,
  subcategoryId: unknown,
  categories: CategoryRecord[],
  subcategories: SubcategoryRecord[],
) {
  const category = categories.find((item) => item.id === categoryId);
  if (!category || category.status !== 'active')
    return { valid: false, message: 'Active category not found.' };
  if (subcategoryId == null || subcategoryId === '') return { valid: true };
  const subcategory = subcategories.find((item) => item.id === subcategoryId);
  if (!subcategory || subcategory.status !== 'active')
    return { valid: false, message: 'Active subcategory not found.' };
  if (subcategory.categoryId !== category.id)
    return { valid: false, message: 'Subcategory does not belong to the selected category.' };
  return { valid: true };
}
export { normalize };
