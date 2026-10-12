import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import type { Member, Sheet } from './data/util'
import { members, sheets } from './data/util'
import { conditionals } from './meta'

export function getConditional(sheet: string, condKey: string) {
  return (conditionals as Record<string, Record<string, IConditionalData>>)[
    sheet
  ]?.[condKey]
}

export function isSheet(sheet: string): sheet is Sheet {
  return (sheets as readonly string[]).includes(sheet)
}

export function isMember(src: string): src is Member {
  return (members as readonly string[]).includes(src)
}
