import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import {
  createSlug,
  loadCategories,
  loadProducts,
  loadSubcategories,
  normalize,
  saveSubcategories,
  validateName,
  validateStatus,
} from '@/features/catalog/services/taxonomy-service';

export async function GET(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const { id } = (await params) as { id: string };
  const item = (await loadSubcategories()).find((record) => record.id === id);
  return item
    ? NextResponse.json({ subcategory: item })
    : NextResponse.json({ message: 'Subcategory not found.' }, { status: 404 });
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  try {
    const { id } = (await params) as { id: string };
    const body = await request.json();
    const [categories, subcategories] = await Promise.all([loadCategories(), loadSubcategories()]);
    const index = subcategories.findIndex((record) => record.id === id);
    if (index < 0) return NextResponse.json({ message: 'Subcategory not found.' }, { status: 404 });
    const current = subcategories[index];
    const categoryId = body.categoryId ?? current.categoryId;
    const name =
      body.name === undefined
        ? current.name
        : typeof body.name === 'string'
          ? body.name.trim()
          : '';
    const slug = body.slug === undefined ? current.slug : createSlug(String(body.slug));
    const status = body.status === undefined ? current.status : body.status;
    if (
      !categories.some((category) => category.id === categoryId) ||
      !validateName(name) ||
      !slug ||
      !validateStatus(status)
    )
      return NextResponse.json({ message: 'Subcategory fields are invalid.' }, { status: 400 });
    if (
      subcategories.some(
        (record) =>
          record.id !== id &&
          (record.slug === slug ||
            (record.categoryId === categoryId && normalize(record.name) === normalize(name))),
      )
    )
      return NextResponse.json(
        { message: 'Subcategory name or slug already exists.' },
        { status: 409 },
      );
    const updated = {
      ...current,
      categoryId,
      name,
      slug,
      status,
      updatedAt: new Date().toISOString(),
    };
    subcategories[index] = updated;
    await saveSubcategories(subcategories);
    return NextResponse.json({ subcategory: updated });
  } catch {
    return NextResponse.json({ message: 'Unable to update subcategory.' }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<unknown> }) {
  const { response } = await requireAdmin(request);
  if (response) return response;
  const { id } = (await params) as { id: string };
  const [subcategories, products] = await Promise.all([loadSubcategories(), loadProducts()]);
  if (!subcategories.some((record) => record.id === id))
    return NextResponse.json({ message: 'Subcategory not found.' }, { status: 404 });
  if (products.some((product) => product.subcategoryId === id))
    return NextResponse.json(
      { message: 'Subcategory is in use. Deactivate it instead of deleting it.' },
      { status: 409 },
    );
  await saveSubcategories(subcategories.filter((record) => record.id !== id));
  return NextResponse.json({ success: true });
}
