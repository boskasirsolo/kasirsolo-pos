import { brand } from '../brand'

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface LogoProps {
  /** Predefined size preset */
  size?: LogoSize
  /** Custom width in pixels (overrides size preset) */
  width?: number
  /** Custom height in pixels (overrides size preset) */
  height?: number
  /** Additional CSS class names */
  className?: string
  /** Alt text override */
  alt?: string
}

const sizeMap: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
}

export function Logo({
  size = 'md',
  width,
  height,
  className = '',
  alt = `${brand.name} Logo`,
}: LogoProps) {
  const resolvedWidth = width ?? sizeMap[size]
  const resolvedHeight = height ?? sizeMap[size]

  return (
    <img
      src={brand.logo}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}
