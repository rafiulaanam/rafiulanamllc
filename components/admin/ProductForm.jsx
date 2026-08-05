"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createProduct, updateProduct } from "@/app/admin/products/actions";

function parseAttributes(text) {
  if (!text?.trim()) return {};
  return Object.fromEntries(
    text
      .split(",")
      .map((pair) => pair.split(":").map((s) => s.trim()))
      .filter(([key, value]) => key && value)
  );
}

function stringifyAttributes(attributes) {
  return Object.entries(attributes || {})
    .map(([key, value]) => `${key}:${value}`)
    .join(", ");
}

export default function ProductForm({ categories, product }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    basePrice: product?.basePrice ?? "",
    compareAtPrice: product?.compareAtPrice ?? "",
    images: (product?.images ?? []).join("\n"),
    isActive: product?.isActive ?? false,
  });

  const [variants, setVariants] = useState(
    product?.variants?.length
      ? product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          attributesText: stringifyAttributes(v.attributes),
          price: v.price,
          stockQuantity: v.stockQuantity,
        }))
      : [{ sku: "", attributesText: "", price: "", stockQuantity: 0 }]
  );

  const updateVariant = (index, patch) => {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addVariant = () => {
    setVariants((rows) => [...rows, { sku: "", attributesText: "", price: "", stockQuantity: 0 }]);
  };

  const removeVariant = (index) => {
    setVariants((rows) => rows.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      images: form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        attributes: parseAttributes(v.attributesText),
        price: v.price,
        stockQuantity: v.stockQuantity,
      })),
    };

    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, payload);
          toast.success("Product updated");
        } else {
          await createProduct(payload);
          toast.success("Product created");
        }
        router.push("/admin/products");
        router.refresh();
      } catch (error) {
        toast.error(error.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Slug (optional — derived from name)
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Description
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Category
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Published (visible on storefront)
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Base price
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Compare-at price (optional)
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.compareAtPrice}
            onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Image URLs (one per line)
          <textarea
            rows={3}
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="https://..."
          />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Variants</h2>
          <button
            type="button"
            onClick={addVariant}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            + Add variant
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? index}
              className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-5"
            >
              <input
                required
                placeholder="SKU"
                aria-label={`SKU for variant ${index + 1}`}
                value={variant.sku}
                onChange={(e) => updateVariant(index, { sku: e.target.value })}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Attributes e.g. size:M, color:Red"
                aria-label={`Attributes for variant ${index + 1}`}
                value={variant.attributesText}
                onChange={(e) => updateVariant(index, { attributesText: e.target.value })}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm sm:col-span-2"
              />
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                aria-label={`Price for variant ${index + 1}`}
                value={variant.price}
                onChange={(e) => updateVariant(index, { price: e.target.value })}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="Stock"
                  aria-label={`Stock for variant ${index + 1}`}
                  value={variant.stockQuantity}
                  onChange={(e) => updateVariant(index, { stockQuantity: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="px-2 text-red-600"
                    aria-label="Remove variant"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
