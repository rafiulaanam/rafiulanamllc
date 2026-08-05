import Skeleton from "@/components/ui/Skeleton";

export default function TableSkeleton({ rows = 6 }) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
