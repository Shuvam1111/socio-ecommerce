'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  createSellerProduct,
  updateSellerProduct,
} from '../services/seller-product-service';

import type {
  CreateSellerProductInput,
  SellerProduct,
} from '../types/product';

interface SellerProductFormProps {
  product?: SellerProduct | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface VariantForm {
  id: string;
  storage: string;
  color: string;
  sku: string;
  barcode: string;
  price: string;
  quantity: string;
}

const emptyVariant = (): VariantForm => ({
  id: `VAR-${Date.now()}`,
  storage: '',
  color: '',
  sku: '',
  barcode: '',
  price: '',
  quantity: '0',
});

export function SellerProductForm({
  product,
  onSuccess,
  onCancel,
}: SellerProductFormProps) {
  const isEditing = Boolean(product);

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] =
    useState('');

  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] =
    useState('');

  const [primaryImage, setPrimaryImage] = useState('');
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);

  const [regularPrice, setRegularPrice] =
    useState('');
  const [salePrice, setSalePrice] = useState('');

  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] =
    useState('5');

  const [shippingFee, setShippingFee] =
    useState('0');
  const [freeShipping, setFreeShipping] =
    useState(false);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] =
    useState('2-5');

  const [returnable, setReturnable] = useState(true);
  const [returnDays, setReturnDays] = useState('7');

  const [influencerPercentage, setInfluencerPercentage] =
    useState('5');
  const [affiliatePercentage, setAffiliatePercentage] =
    useState('3');

  const [variants, setVariants] = useState<
    VariantForm[]
  >([]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setName(product.name);
    setSlug(product.slug);
    setBrand(product.brand);
    setModel(product.model);

    setCategoryId(product.categoryId);
    setSubcategoryId(product.subcategoryId ?? '');

    setDescription(product.description);
    setShortDescription(product.shortDescription);

    setPrimaryImage(product.images[0] ?? '');
    setSecondaryImages(product.images.slice(1));

    setRegularPrice(
      String(product.pricing.regularPrice),
    );

    setSalePrice(
      String(product.pricing.salePrice),
    );

    setSku(product.inventory.sku);
    setBarcode(product.inventory.barcode);
    setQuantity(
      String(product.inventory.quantity),
    );

    setLowStockThreshold(
      String(
        product.inventory.lowStockThreshold,
      ),
    );

    setShippingFee(
      String(product.shipping.shippingFee),
    );

    setFreeShipping(
      product.shipping.freeShipping,
    );

    setEstimatedDeliveryDays(
      product.shipping.estimatedDeliveryDays,
    );

    setReturnable(product.returnPolicy.returnable);

    setReturnDays(
      String(product.returnPolicy.returnDays),
    );

    setInfluencerPercentage(
      String(
        product.commission.influencerPercentage,
      ),
    );

    setAffiliatePercentage(
      String(
        product.commission.affiliatePercentage,
      ),
    );

    setVariants(
      product.variants.map((variant) => ({
        id: variant.id,
        storage: variant.attributes.storage ?? '',
        color: variant.attributes.color ?? '',
        sku: variant.sku,
        barcode: variant.barcode,
        price: String(variant.price),
        quantity: String(variant.quantity),
      })),
    );
  }, [product]);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  }

  function calculateDiscount() {
    const regular = Number(regularPrice);
    const sale = Number(salePrice);

    if (!regular || !sale || regular <= 0) {
      return 0;
    }

    return Number(
      (((regular - sale) / regular) * 100).toFixed(
        2,
      ),
    );
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      emptyVariant(),
    ]);
  }

  function removeVariant(id: string) {
    setVariants((current) =>
      current.filter((variant) => variant.id !== id),
    );
  }

  function updateVariant(
    id: string,
    field: keyof VariantForm,
    value: string,
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required.');
      return;
    }

    if (!categoryId.trim()) {
      toast.error('Category ID is required.');
      return;
    }

    if (!description.trim()) {
      toast.error('Product description is required.');
      return;
    }

    const imageValues = [primaryImage, ...secondaryImages].map((image) => image.trim());
    const imagePattern = /^(https?:\/\/|\/images\/)/;

    if (!primaryImage.trim() || !imagePattern.test(primaryImage.trim())) {
      toast.error('A valid primary image URL is required.');
      return;
    }

    if (secondaryImages.length > 8 || secondaryImages.some((image) => !image.trim() || !imagePattern.test(image.trim()))) {
      toast.error('Add up to 8 valid secondary image URLs.');
      return;
    }

    if (new Set(imageValues).size !== imageValues.length) {
      toast.error('Image URLs must be unique.');
      return;
    }

    if (!sku.trim()) {
      toast.error('SKU is required.');
      return;
    }

    const regular = Number(regularPrice);
    const sale = Number(salePrice);
    const stock = Number(quantity);

    if (regular <= 0 || sale <= 0) {
      toast.error('Prices must be greater than zero.');
      return;
    }

    if (sale > regular) {
      toast.error(
        'Sale price cannot be greater than regular price.',
      );
      return;
    }

    if (stock < 0) {
      toast.error('Stock cannot be negative.');
      return;
    }

    const payload: CreateSellerProductInput = {
      categoryId,
      subcategoryId: subcategoryId || null,

      name: name.trim(),
      slug: slug.trim() || generateSlug(name),
      brand: brand.trim(),
      model: model.trim(),

      description: description.trim(),
      shortDescription:
        shortDescription.trim(),

      images: imageValues,
      video: product?.video ?? null,

      pricing: {
        regularPrice: regular,
        salePrice: sale,
        currency: 'NPR',
        discountPercentage:
          calculateDiscount(),
      },

      inventory: {
        sku: sku.trim(),
        barcode: barcode.trim(),
        quantity: stock,
        availableQuantity: product
          ? Math.max(
              0,
              stock -
                product.inventory.reservedQuantity,
            )
          : stock,
        reservedQuantity:
          product?.inventory.reservedQuantity ?? 0,
        lowStockThreshold: Number(
          lowStockThreshold,
        ),
      },

      variants: variants.map((variant) => ({
        id: variant.id,
        attributes: {
          ...(variant.storage
            ? { storage: variant.storage }
            : {}),
          ...(variant.color
            ? { color: variant.color }
            : {}),
        },
        sku: variant.sku,
        barcode: variant.barcode,
        price: Number(variant.price),
        quantity: Number(variant.quantity),
      })),

      attributes: product?.attributes ?? {},

      shipping: {
        freeShipping,
        shippingFee: Number(shippingFee),
        estimatedDeliveryDays,
      },

      returnPolicy: {
        returnable,
        returnDays: Number(returnDays),
      },

      commission: {
        influencerPercentage: Number(
          influencerPercentage,
        ),
        affiliatePercentage: Number(
          affiliatePercentage,
        ),
      },
    };

    try {
      setSaving(true);

      if (product) {
        await updateSellerProduct(product.id, payload);
        toast.success(
          'Product updated successfully.',
        );
      } else {
        await createSellerProduct(payload);
        toast.success(
          'Product created successfully and sent for approval.',
        );
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to save product.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center gap-3 px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing
                ? 'Edit Product'
                : 'Add Product'}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? 'Update your product information.'
                : 'Add a new product to your store.'}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >
        {/* Basic information */}
        <Section
          title="Basic Information"
          description="Enter the main product details."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Product Name"
              value={name}
              onChange={handleNameChange}
              required
            />

            <Field
              label="Slug"
              value={slug}
              onChange={setSlug}
              required
            />

            <Field
              label="Brand"
              value={brand}
              onChange={setBrand}
            />

            <Field
              label="Model"
              value={model}
              onChange={setModel}
            />

            <Field
              label="Category ID"
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Example: CAT-001"
              required
            />

            <Field
              label="Subcategory ID"
              value={subcategoryId}
              onChange={setSubcategoryId}
              placeholder="Example: SUB-001"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Short Description
            </label>

            <textarea
              value={shortDescription}
              onChange={(event) =>
                setShortDescription(
                  event.target.value,
                )
              }
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Description
              <span className="ml-1 text-destructive">
                *
              </span>
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        </Section>

        {/* Product images */}
        <Section
          title="Product Images"
          description="Use image URLs from your existing catalog or approved image host."
        >
          <div className="space-y-4">
            <Field
              label="Primary Product Image"
              value={primaryImage}
              onChange={setPrimaryImage}
              placeholder="https://example.com/product.jpg"
              required
            />
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Secondary Product Images</p>
                <p className="mt-1 text-xs text-muted-foreground">Add up to 8 additional image URLs.</p>
              </div>
              {secondaryImages.map((image, index) => (
                <div key={`secondary-image-${index}`} className="flex gap-2">
                  <input
                    aria-label={`Secondary product image ${index + 1}`}
                    value={image}
                    onChange={(event) =>
                      setSecondaryImages((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))
                    }
                    placeholder="https://example.com/product-detail.jpg"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setSecondaryImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="rounded-lg border border-border px-3 text-sm text-destructive hover:bg-secondary"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSecondaryImages((current) => current.length < 8 ? [...current, ''] : current)}
                disabled={secondaryImages.length >= 8}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" />
                Add another image
              </button>
            </div>
          </div>
        </Section>

        {/* Pricing */}
        <Section
          title="Pricing"
          description="Set regular and sale prices."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Regular Price (NPR)"
              type="number"
              value={regularPrice}
              onChange={setRegularPrice}
              required
            />

            <Field
              label="Sale Price (NPR)"
              type="number"
              value={salePrice}
              onChange={setSalePrice}
              required
            />

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Discount
              </p>

              <div className="flex h-10 items-center rounded-lg border border-border bg-secondary px-3 text-sm text-foreground">
                {calculateDiscount()}%
              </div>
            </div>
          </div>
        </Section>

        {/* Inventory */}
        <Section
          title="Inventory"
          description="Manage SKU, barcode and stock."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field
              label="SKU"
              value={sku}
              onChange={setSku}
              required
            />

            <Field
              label="Barcode"
              value={barcode}
              onChange={setBarcode}
            />

            <Field
              label="Quantity"
              type="number"
              value={quantity}
              onChange={setQuantity}
              required
            />

            <Field
              label="Low Stock Threshold"
              type="number"
              value={lowStockThreshold}
              onChange={setLowStockThreshold}
            />
          </div>
        </Section>

        {/* Variants */}
        <Section
          title="Variants"
          description="Add product variations such as storage or color."
        >
          <div className="space-y-4">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <Field
                    label="Storage"
                    value={variant.storage}
                    onChange={(value) =>
                      updateVariant(
                        variant.id,
                        'storage',
                        value,
                      )
                    }
                  />

                  <Field
                    label="Color"
                    value={variant.color}
                    onChange={(value) =>
                      updateVariant(
                        variant.id,
                        'color',
                        value,
                      )
                    }
                  />

                  <Field
                    label="SKU"
                    value={variant.sku}
                    onChange={(value) =>
                      updateVariant(
                        variant.id,
                        'sku',
                        value,
                      )
                    }
                  />

                  <Field
                    label="Price"
                    type="number"
                    value={variant.price}
                    onChange={(value) =>
                      updateVariant(
                        variant.id,
                        'price',
                        value,
                      )
                    }
                  />

                  <Field
                    label="Quantity"
                    type="number"
                    value={variant.quantity}
                    onChange={(value) =>
                      updateVariant(
                        variant.id,
                        'quantity',
                        value,
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeVariant(variant.id)
                  }
                  className="mt-3 inline-flex items-center gap-2 text-sm text-destructive"
                >
                  <Trash2 className="size-4" />
                  Remove Variant
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <Plus className="size-4" />
              Add Variant
            </button>
          </div>
        </Section>

        {/* Shipping */}
        <Section
          title="Shipping"
          description="Configure delivery information."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Shipping Fee (NPR)"
              type="number"
              value={shippingFee}
              onChange={setShippingFee}
            />

            <Field
              label="Estimated Delivery"
              value={estimatedDeliveryDays}
              onChange={setEstimatedDeliveryDays}
              placeholder="2-5"
            />

            <div className="flex items-end">
              <label className="flex h-10 cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={freeShipping}
                  onChange={(event) =>
                    setFreeShipping(
                      event.target.checked,
                    )
                  }
                  className="size-4 accent-primary"
                />
                Free Shipping
              </label>
            </div>
          </div>
        </Section>

        {/* Return */}
        <Section
          title="Return Policy"
          description="Configure product returns."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-end">
              <label className="flex h-10 cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={returnable}
                  onChange={(event) =>
                    setReturnable(
                      event.target.checked,
                    )
                  }
                  className="size-4 accent-primary"
                />
                Product is returnable
              </label>
            </div>

            <Field
              label="Return Period (days)"
              type="number"
              value={returnDays}
              onChange={setReturnDays}
              disabled={!returnable}
            />
          </div>
        </Section>

        {/* Commission */}
        <Section
          title="Promotion Commission"
          description="Commission percentages for promotional roles."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Influencer Commission (%)"
              type="number"
              value={influencerPercentage}
              onChange={setInfluencerPercentage}
            />

            <Field
              label="Affiliate Commission (%)"
              type="number"
              value={affiliatePercentage}
              onChange={setAffiliatePercentage}
            />
          </div>
        </Section>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="size-4" />

            {saving
              ? 'Saving...'
              : isEditing
                ? 'Update Product'
                : 'Create Product'}
          </button>
        </div>
      </form>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5">
        <h2 className="font-semibold text-foreground">
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}

        {required && (
          <span className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
