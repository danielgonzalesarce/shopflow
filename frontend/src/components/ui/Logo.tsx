import Link from 'next/link'

interface LogoProps {
  variant?: 'default' | 'white'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl'
}

export default function Logo({ variant = 'default', size = 'md', href = '/' }: LogoProps) {
  const content = (
    <span className={`font-extrabold tracking-tight ${sizeClasses[size]}`}>
      {variant === 'white' ? (
        <>
          <span className="text-white">Shop</span>
          <span className="neon-text-cyan">Flow</span>
        </>
      ) : (
        <>
          <span className="text-white">Shop</span>
          <span className="text-neon-red">Flow</span>
        </>
      )}
    </span>
  )

  return (
    <Link href={href} className="inline-block transition-opacity hover:opacity-90">
      {content}
    </Link>
  )
}
