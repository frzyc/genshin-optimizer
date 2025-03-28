import type { DebugMeta } from '@genshin-optimizer/pando/engine'

export function createFilterDebug(equipmentKeys: string[]) {
  const sheets = new Set(equipmentKeys)
  return (meta: DebugMeta): boolean => !useCounter(meta, sheets)
}

function useCounter(meta: DebugMeta, sheets: Set<string>): boolean {
  const counter = meta.formula.match(/(\S+) (\S+) common.count/)
  if (!counter) return false
  const [, sheet, et] = counter
  return et === 'own' && sheets.has(sheet)
}
