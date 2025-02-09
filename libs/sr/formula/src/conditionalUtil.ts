import type { IConditionalData } from '@genshin-optimizer/game-opt/formula'
import type { Sheet } from './data/util'
import { conditionals } from './meta'

export function getConditional(sheet: Sheet, condKey: string) {
  return (conditionals as any)[sheet]?.[condKey] as IConditionalData | undefined
}
