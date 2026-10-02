import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import {
  createSlug,
  loadCategories,
  loadProducts,
  loadSubcategories,
  normalize,
  safeCategory,
  saveCategories,
  validateName,
  validateStatus,
} from '@/features/catalog/services/taxonomy-service';

export async function GET(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const { id } = (await params) as { id: string };
  const category = (await loadCategories()).find((item) => item.id === id);
  return category
    ? NextResponse.json({ category: safeCategory(category) })
    : NextResponse.json({ message: 'Category not found.' }, { status: 404 });
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  try {
    const { id } = (await params) as { id: string };
    const body = await request.json();
    const categories = await loadCategories();
    const index = categories.findIndex((item) => item.id === id);
    if (index < 0) return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    const current = categories[index];
    const name =
      body.name === undefined
        ? current.name
        : typeof body.name === 'string'
          ? body.name.trim()
          : '';
    const slug = body.slug === undefined ? current.slug : createSlug(String(body.slug));
    const status = body.status === undefined ? current.status : body.status;
    if (!validateName(name) || !slug || !validateStatus(status))
      return NextResponse.json({ message: 'Category fields are invalid.' }, { status: 400 });
    if (
      categories.some(
        (item) =>
          item.id !== id && (normalize(item.name) === normalize(name) || item.slug === slug),
      )
    )
      return NextResponse.json(
        { message: 'Category name or slug already exists.' },
        { status: 409 },
      );
    const updated = {
      ...current,
      name,
      slug,
      status,
      ...(typeof body.description === 'string' ? { description: body.description.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };
    categories[index] = updated;
    await saveCategories(categories);
    return NextResponse.json({ category: safeCategory(updated) });
  } catch {
    return NextResponse.json({ message: 'Unable to update category.' }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const { id } = (await params) as { id: string };
  const [categories, subcategories, products] = await Promise.all([
    loadCategories(),
    loadSubcategories(),
    loadProducts(),
  ]);
  if (!categories.some((item) => item.id === id))
    return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
  if (
    subcategories.some((item) => item.categoryId === id) ||
    products.some((item) => item.categoryId === id)
  )
    return NextResponse.json(
      { message: 'Category is in use. Deactivate it instead of deleting it.' },
      { status: 409 },
    );
  await saveCategories(categories.filter((item) => item.id !== id));
  return NextResponse.json({ success: true });
}
