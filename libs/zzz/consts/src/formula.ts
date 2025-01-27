import { allAnomalyDmgKeys, allAttributeDamageKeys } from './common'

export const allFormulaKeys = [
  'initial_atk',
  ...allAttributeDamageKeys,
  ...allAnomalyDmgKeys,
] as const
export type FormulaKey = (typeof allFormulaKeys)[number]
