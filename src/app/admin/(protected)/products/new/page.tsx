import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export const metadata = { title: "New Product · IYKA Admin" };

export default function NewProductPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-mis-text">New Product</h1>
        <p className="mt-1 text-sm text-mis-text-muted">Fill in the details below to add a product to the store.</p>
      </div>
      <ProductForm action={createProduct} />
    </div>
  );
}
