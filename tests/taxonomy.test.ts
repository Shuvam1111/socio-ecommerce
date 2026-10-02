import { describe, expect, it } from 'vitest';
import {
  validateProductTaxonomy,
  type CategoryRecord,
  type SubcategoryRecord,
} from '@/features/catalog/services/taxonomy-service';

const categories: CategoryRecord[] = [
  { id: 'CAT-A', name: 'A', slug: 'a', status: 'active' },
  { id: 'CAT-B', name: 'B', slug: 'b', status: 'active' },
];
const subcategories: SubcategoryRecord[] = [
  { id: 'SUB-A1', categoryId: 'CAT-A', name: 'A1', slug: 'a1', status: 'active' },
  { id: 'SUB-B1', categoryId: 'CAT-B', name: 'B1', slug: 'b1', status: 'active' },
];

describe('product taxonomy validation', () => {
  it('accepts matching category and subcategory', () =>
    expect(validateProductTaxonomy('CAT-A', 'SUB-A1', categories, subcategories).valid).toBe(true));
  it('rejects a mismatched subcategory', () =>
    expect(validateProductTaxonomy('CAT-A', 'SUB-B1', categories, subcategories).valid).toBe(
      false,
    ));
  it('rejects inactive or missing taxonomy records', () => {
    expect(validateProductTaxonomy('CAT-MISSING', 'SUB-A1', categories, subcategories).valid).toBe(
      false,
    );
    expect(validateProductTaxonomy('CAT-A', 'SUB-MISSING', categories, subcategories).valid).toBe(
      false,
    );
  });
});
