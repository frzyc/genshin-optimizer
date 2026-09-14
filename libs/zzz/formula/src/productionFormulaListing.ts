import { allAttributeAnomalyKeys } from '@genshin-optimizer/zzz/consts'

/** Named inst formulas exposed outside dev-only ability listings. */
export const productionFormulaNames = [
  'standardDmgInst',
  'sheerDmgInst',
  'anomalyDmgInst',
  'abloomDmgInst',
  'anomalyBuildupInst',
  'dazeInst',
  ...allAttributeAnomalyKeys.map((k) => `disorderDmgInst_${k}`),
  'disorderDmgInst_frost',
  ...allAttributeAnomalyKeys.map((k) => `vortexDmgInst_${k}`),
  'vortexDmgInst_frost',
] as const

export type ProductionFormulaName = (typeof productionFormulaNames)[number]

export function isProductionFormulaName(
  name: string | null | undefined
): name is ProductionFormulaName {
  return !!name && (productionFormulaNames as readonly string[]).includes(name)
}

/** Matches `Calculator.listFormulas` filtering for non-dev builds. */
export function isProductionFormulaListing(tag: {
  qt?: string | null
  name?: string | null
}): boolean {
  return tag.qt !== 'formula' || isProductionFormulaName(tag.name)
}
