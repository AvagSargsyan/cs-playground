/** Logo: three bars sorted by height, in module colors. Original artwork. */
export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" className={className}>
      <rect width="36" height="36" rx="3" fill="var(--uwc-blue)" />
      <rect x="7" y="19" width="6" height="10" fill="#fff" opacity="0.65" />
      <rect x="15" y="13" width="6" height="16" fill="#fff" opacity="0.82" />
      <rect x="23" y="7" width="6" height="22" fill="#fff" />
    </svg>
  )
}
