import { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'outline-light' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const variantClasses = {
  primary:
    'border-2 border-neon-red bg-neon-red text-white hover:border-neon-red-light hover:bg-neon-red-light focus:ring-neon-red shadow-md shadow-neon-red/30 hover:shadow-lg hover:shadow-neon-red/40 neon-glow-red',
  outline:
    'border-2 border-neon-red bg-transparent text-neon-red hover:bg-neon-red/10 focus:ring-neon-red',
  'outline-light':
    'border-2 border-neon-cyan/80 bg-neon-cyan/10 text-white backdrop-blur-sm hover:border-neon-cyan hover:bg-neon-cyan/20 hover:text-white focus:ring-neon-cyan/40',
  secondary:
    'border-2 border-neon-cyan bg-transparent text-neon-cyan hover:bg-neon-cyan/10 focus:ring-neon-cyan',
  ghost:
    'border-2 border-transparent text-slate-400 hover:bg-white/5 hover:text-white focus:ring-neon-red'
}

const sizeClasses = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? 'Cargando...' : children}
    </button>
  )
}
