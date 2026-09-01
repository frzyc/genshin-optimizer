import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Tag } from './data/util'
import { isProductionFormulaListing } from './productionFormulaListing'

export { isProductionFormulaListing } from './productionFormulaListing'

/** Whether a formula listing read is exposed outside dev-only ability listings. */
export function shouldExposeFormulaListing(
  tag: Tag,
  options?: { showDevComponents?: boolean }
): boolean {
  const dev = options?.showDevComponents ?? shouldShowDevComponents
  return dev || isProductionFormulaListing(tag)
}

/** Filter calc formula listings to dev + production allowlist policy. */
export function filterExposedFormulaListings<T extends { tag: Tag }>(
  reads: T[],
  options?: { showDevComponents?: boolean }
): T[] {
  return reads.filter((read) => shouldExposeFormulaListing(read.tag, options))
}

/** Whether static per-ability field rows are built from formula meta. */
export function shouldIncludeStaticAbilityFields(options?: {
  includeAbilityFields?: boolean
  showDevComponents?: boolean
}): boolean {
  if (options?.includeAbilityFields !== undefined)
    return options.includeAbilityFields
  return options?.showDevComponents ?? shouldShowDevComponents
}
