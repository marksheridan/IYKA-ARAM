"use client";

import { useActionState } from "react";
import type { Product } from "@/generated/prisma/client";

type ActionFn = (_: unknown, formData: FormData) => Promise<{ error: string } | void>;

const CATEGORIES = ["Hair Care", "Skin Care", "Wellness", "Yoga", "Gifts"];

export function ProductForm({
  product,
  action,
}: {
  product?: Product | null;
  action: ActionFn;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      {/* Basic info */}
      <Section title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product Name *" name="name" defaultValue={product?.name} required />
          <Field
            label="Slug *"
            name="slug"
            defaultValue={product?.slug}
            hint="URL-friendly ID, e.g. keshanidhi-hair-oil"
            required
          />
        </div>
        <Field label="Tagline" name="tagline" defaultValue={product?.tagline ?? ""} />
        <Textarea label="Description" name="description" defaultValue={product?.description ?? ""} rows={4} />
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (₹) *" name="price" type="number" step="0.01" defaultValue={product ? String(product.price) : ""} required />
          <Field label="MRP (₹)" name="mrp" type="number" step="0.01" defaultValue={product?.mrp ? String(product.mrp) : ""} />
          <Field label="Badge" name="badge" defaultValue={product?.badge ?? ""} hint='e.g. "Bestseller"' />
        </div>
      </Section>

      {/* Details */}
      <Section title="Product Details">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
            <select name="category" defaultValue={product?.category ?? ""} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-neutral-500 focus:outline-none">
              <option value="">— Select —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Size / Volume" name="size" defaultValue={product?.size ?? ""} hint='e.g. "100 ml"' />
          <Field label="Rating" name="rating" type="number" step="0.1" min="0" max="5" defaultValue={product?.rating ? String(product.rating) : ""} />
        </div>
        <Field label="Reviews count" name="reviews" type="number" defaultValue={product?.reviews ? String(product.reviews) : ""} />
        <Textarea label="Ingredients" name="ingredients" defaultValue={product?.ingredients ?? ""} rows={2} />
        <Textarea label="Usage / How to Use" name="usage" defaultValue={product?.usage ?? ""} rows={3} />
        <Textarea
          label="Benefits (one per line)"
          name="benefits"
          defaultValue={product?.benefits?.join("\n") ?? ""}
          rows={4}
          hint="Each line becomes one bullet point"
        />
        <Textarea
          label="Images (one URL per line)"
          name="images"
          defaultValue={product?.images?.join("\n") ?? ""}
          rows={3}
          hint="Relative paths like /products/my-product.jpg"
        />
      </Section>

      {/* Inventory & visibility */}
      <Section title="Inventory & Visibility">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stock quantity" name="stock" type="number" defaultValue={product?.stock ? String(product.stock) : "0"} />
          <div className="flex flex-col gap-3 pt-1">
            <Toggle name="inStock" label="In stock" defaultChecked={product?.inStock ?? true} />
            <Toggle name="isPublished" label="Published on store" defaultChecked={product?.isPublished ?? true} />
          </div>
        </div>
      </Section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {pending ? "Saving…" : product ? "Save Changes" : "Create Product"}
        </button>
        <a href="/admin/products" className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
          Cancel
        </a>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-neutral-800">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, name, type = "text", defaultValue, hint, required, step, min, max,
}: {
  label: string; name: string; type?: string; defaultValue?: string;
  hint?: string; required?: boolean; step?: string; min?: string; max?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
      />
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function Textarea({
  label, name, defaultValue, rows = 3, hint,
}: {
  label: string; name: string; defaultValue?: string; rows?: number; hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
      />
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input type="hidden" name={name} value="false" />
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="h-4 w-4 rounded border-neutral-300 accent-neutral-900" />
      <span className="text-sm text-neutral-700">{label}</span>
    </label>
  );
}
