/** Logo: three rounded bars sorted by height. Original artwork. */
export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" className={className}>
      <rect width="36" height="36" rx="10" fill="var(--ink-heading)" />
      <rect x="8" y="19" width="5" height="9" rx="2" fill="var(--uwc-teal)" />
      <rect x="15.5" y="14" width="5" height="14" rx="2" fill="var(--uwc-orange)" />
      <rect x="23" y="8" width="5" height="20" rx="2" fill="#7fb6dc" />
    </svg>
  )
}
