/** Shared dim labels for opt chrome, MultiTagField, and generated-build prefixes. */
const DIM_LABEL: Record<string, string> = {
  standardDmg: 'DMG',
  sheerDmg: 'DMG',
  dazeBuildup: 'Daze',
  anomBuildup: 'Anom',
  anomalyDmg: 'Anom',
  final: 'Final',
  initial: 'Initial',
  common: 'Common',
}

export function dimLabel(dim: string): string {
  return DIM_LABEL[dim] ?? dim
}

/** Short value prefix for generated build rows (e.g. DMG, Daze, ATK). */
export function optTargetShortValueLabel(
  dim: string | undefined,
  name?: string
): string {
  if (!dim) return ''
  if (
    DIM_LABEL[dim] &&
    dim !== 'final' &&
    dim !== 'initial' &&
    dim !== 'common'
  )
    return DIM_LABEL[dim]
  if (name)
    return name.endsWith('_')
      ? name.slice(0, -1).toUpperCase()
      : name.toUpperCase()
  return dimLabel(dim)
}
