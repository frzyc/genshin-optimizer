/** Shared dim labels for opt chrome. GI dims are listing `q`. */
const DIM_LABEL: Record<string, string> = {
  dmg: 'DMG',
  heal: 'Heal',
  shield: 'Shield',
  param: 'Param',
  final: 'Final',
  common: 'Common',
}

export function dimLabel(dim: string): string {
  return DIM_LABEL[dim] ?? dim
}

export function optTargetShortValueLabel(dim?: string, name?: string): string {
  if (dim) return dimLabel(dim)
  return name ?? ''
}
