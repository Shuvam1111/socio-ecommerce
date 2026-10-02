import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import {
  createSlug,
  loadCategories,
  loadSubcategories,
  normalize,
  nextId,
  saveSubcategories,
  validateName,
  validateStatus,
  type SubcategoryRecord,
} from '@/features/catalog/services/taxonomy-service';
export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const params = request.nextUrl.searchParams;
  const search = normalize(params.get('search') ?? '');
  const categoryId = params.get('categoryId');
  const status = params.get('status');
  const subcategories = (await loadSubcategories()).filter(
    (item) =>
      (!search || `${item.name} ${item.slug}`.toLowerCase().includes(search)) &&
      (!categoryId || item.categoryId === categoryId) &&
      (!status || item.status === status),
  );
  return NextResponse.json({ subcategories });
}
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : '';
    const slug = createSlug(typeof body.slug === 'string' && body.slug.trim() ? body.slug : name);
    const status = body.status ?? 'active';
    const [categories, subcategories] = await Promise.all([loadCategories(), loadSubcategories()]);
    if (!categories.some((item) => item.id === categoryId))
      return NextResponse.json({ message: 'Parent category not found.' }, { status: 400 });
    if (!validateName(name) || !slug || !validateStatus(status))
      return NextResponse.json({ message: 'Subcategory fields are invalid.' }, { status: 400 });
    if (
      subcategories.some(
        (item) =>
          item.slug === slug ||
          (item.categoryId === categoryId && normalize(item.name) === normalize(name)),
      )
    )
      return NextResponse.json(
        { message: 'Subcategory name or slug already exists.' },
        { status: 409 },
      );
    const now = new Date().toISOString();
    const subcategory: SubcategoryRecord = {
      id: nextId(subcategories, 'SUB'),
      categoryId,
      name,
      slug,
      status,
      createdAt: now,
      updatedAt: now,
    };
    subcategories.push(subcategory);
    await saveSubcategories(subcategories);
    return NextResponse.json({ subcategory }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Unable to create subcategory.' }, { status: 500 });
  }
}
