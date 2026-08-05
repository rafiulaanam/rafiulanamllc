"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteCategory } from "@/app/admin/categories/actions";
import CategoryForm from "@/components/admin/CategoryForm";

export default function CategoryRowActions({ category, categories }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteCategory(category.id);
        toast.success("Category deleted");
        router.refresh();
      } catch (error) {
        toast.error("Remove or reassign products in this category first");
      }
    });
  };

  if (editing) {
    return (
      <div className="w-64">
        <CategoryForm category={category} categories={categories} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex gap-3 text-sm">
      <button type="button" onClick={() => setEditing(true)} className="text-gray-600 hover:text-gray-900">
        Edit
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
