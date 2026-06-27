import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-semibold text-slate-200"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border border-[var(--border)] bg-surface px-4 py-3 text-white shadow-sm transition-all placeholder:text-slate-500 focus:border-neon-red focus:outline-none focus:ring-4 focus:ring-neon-red/15 disabled:cursor-not-allowed disabled:bg-surface-elevated ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
