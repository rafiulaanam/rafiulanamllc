import Skeleton from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/admin/TableSkeleton";

export default function Loading() {
  return (
    <main className="px-8 py-8">
      <Skeleton className="h-8 w-40" />
      <TableSkeleton />
    </main>
  );
}
