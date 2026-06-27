'use client'

export default function AuthDivider({ label = 'o continúa con email' }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-[var(--border)]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-surface px-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>
    </div>
  )
}
