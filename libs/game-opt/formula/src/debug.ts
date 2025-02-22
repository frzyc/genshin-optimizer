import type { DebugMeta } from '@genshin-optimizer/pando/engine'

export function createFilterDebug(equipmentKeys: string[]) {
  return (debug: DebugMeta) => !debugIsUnequippedEquipment(debug, equipmentKeys)
}

function debugIsUnequippedEquipment(debug: DebugMeta, equipmentKeys: string[]) {
  if (!debug.formula || !debug.deps || debug.deps.length < 1) return false
  const f = debug.formula
  const disabledBuffForEquip =
    f.includes('[0]') &&
    f.includes('common.count') &&
    equipmentKeys.some((key) => f.includes(key))
  const depGathered0ForCount =
    debug.deps[0].formula?.includes('gather 0 node') &&
    debug.deps[0].formula?.includes('common.count')
  return disabledBuffForEquip && depGathered0ForCount
}
