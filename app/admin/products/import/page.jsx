import CsvImportForm from "@/components/admin/CsvImportForm";

export default function ImportProductsPage() {
  return (
    <main className="px-8 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Import products</h1>
      <CsvImportForm />
    </main>
  );
}
