export default function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-surface-elevated p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-7 w-20 animate-pulse rounded bg-white/10" />
          <div className="h-9 w-28 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  )
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </div>
  )
}
