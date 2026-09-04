export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[rgba(255,255,255,0.06)] ${className}`}
      aria-hidden
    />
  );
}
