import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import {
  createSlug,
  loadCategories,
  normalize,
  nextId,
  safeCategory,
  saveCategories,
  validateName,
  validateStatus,
  type CategoryRecord,
} from '@/features/catalog/services/taxonomy-service';

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const params = request.nextUrl.searchParams;
  const search = normalize(params.get('search') ?? '');
  const status = params.get('status');
  const categories = (await loadCategories())
    .filter(
      (item) =>
        (!search || `${item.name} ${item.slug}`.toLowerCase().includes(search)) &&
        (!status || item.status === status),
    )
    .map(safeCategory);
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const slug = createSlug(typeof body.slug === 'string' && body.slug.trim() ? body.slug : name);
    const status = body.status ?? 'active';
    if (!validateName(name) || !slug || !validateStatus(status))
      return NextResponse.json({ message: 'Name, slug, and status are invalid.' }, { status: 400 });
    const categories = await loadCategories();
    if (categories.some((item) => normalize(item.name) === normalize(name) || item.slug === slug))
      return NextResponse.json(
        { message: 'Category name or slug already exists.' },
        { status: 409 },
      );
    const now = new Date().toISOString();
    const category: CategoryRecord = {
      id: nextId(categories, 'CAT'),
      name,
      slug,
      status,
      ...(typeof body.description === 'string' && body.description.trim()
        ? { description: body.description.trim() }
        : {}),
      createdAt: now,
      updatedAt: now,
    };
    categories.push(category);
    await saveCategories(categories);
    return NextResponse.json({ category: safeCategory(category) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Unable to create category.' }, { status: 500 });
  }
}
