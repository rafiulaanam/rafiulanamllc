"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { importProductsCsv } from "@/app/admin/products/actions";

export default function CsvImportForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        startTransition(async () => {
          const outcome = await importProductsCsv(parsed.data);
          setResult(outcome);
          if (outcome.created > 0) {
            toast.success(`Imported ${outcome.created} product(s)`);
          }
        });
      },
      error: () => toast.error("Could not read CSV file"),
    });

    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900">CSV columns</p>
        <code className="mt-1 block overflow-x-auto whitespace-nowrap text-xs">
          name, description, category, basePrice, compareAtPrice, images, sku, stockQuantity, isActive
        </code>
        <ul className="mt-2 list-disc pl-4">
          <li><code>images</code>: pipe-separated URLs, e.g. <code>url1|url2</code></li>
          <li><code>category</code>: created automatically if it doesn&apos;t exist</li>
          <li>Each row creates one product with a single default variant — add size/color variants afterward via Edit</li>
        </ul>
      </div>

      <input
        type="file"
        accept=".csv"
        aria-label="CSV file to import"
        onChange={handleFile}
        disabled={isPending}
      />

      {isPending && <p className="text-sm text-gray-500">Importing...</p>}

      {result && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <p>Created {result.created} product(s).</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-4 text-red-600">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
