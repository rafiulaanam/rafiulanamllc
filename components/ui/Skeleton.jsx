export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-sand ${className}`}
    >
      <span className="animate-shimmer absolute inset-0" />
    </div>
  );
}
