"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/app/admin/categories/actions";

export default function CategoryForm({ categories, category, onDone }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [parentCategoryId, setParentCategoryId] = useState(category?.parentCategoryId ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (category) {
          await updateCategory(category.id, { name, parentCategoryId });
          toast.success("Category updated");
          onDone?.();
        } else {
          await createCategory({ name, parentCategoryId });
          toast.success("Category created");
          setName("");
          setParentCategoryId("");
        }
        router.refresh();
      } catch (error) {
        toast.error(error.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        required
        placeholder="Category name"
        aria-label="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <select
        aria-label="Parent category"
        value={parentCategoryId}
        onChange={(e) => setParentCategoryId(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">No parent (top-level)</option>
        {categories
          .filter((c) => c.id !== category?.id)
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : category ? "Save" : "Add category"}
      </button>
    </form>
  );
}
