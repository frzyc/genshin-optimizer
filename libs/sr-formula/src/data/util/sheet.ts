import type { NumNode, StrNode } from '@genshin-optimizer/pando'
import type { TypeKey } from '@genshin-optimizer/sr-consts'
import type { Read } from '.'
import {
  reader,
  selfBuff,
  tag,
  teamBuff,
  type TagMapNodeEntries,
  type TagMapNodeEntry,
} from '.'
import type { AttackType, Source } from './listing'

export type FormulaArg = {
  team?: boolean // true if applies to every member, and false (default) if applies only to self
  cond?: string | StrNode
}

export function register(
  src: Source,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  const internal = ({ tag, value }: TagMapNodeEntry) => ({
    tag: { ...tag, src },
    value,
  })
  return data.flatMap((data) =>
    Array.isArray(data) ? data.map(internal) : internal(data)
  )
}

function registerFormula(
  name: string,
  team: boolean | undefined,
  q: 'dmg' | 'heal' | 'shield',
  cond: string | StrNode,
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  reader.name(name) // register name:<name>
  const listing = (team ? teamBuff : selfBuff).listing.formulas
  return [
    listing.add(listingItem(reader.withTag({ name, qt: 'formula', q }), cond)),
    ...extra.map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}

export function listingItem(t: Read, cond?: string | StrNode) {
  return tag(cond ?? t.ex ?? 'unique', t.tag)
}

export function customDmg(
  name: string,
  type: TypeKey,
  attackType: AttackType,
  base: NumNode,
  { team, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
) {
  const buff = team ? teamBuff : selfBuff
  return registerFormula(
    name,
    team,
    'dmg',
    tag(cond, { attackType }),
    buff.formula.base.add(base),
    buff.prep.type.add(type),
    ...extra
  )
}

export function customShield(
  name: string,
  base: NumNode,
  { team, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  const buff = team ? teamBuff : selfBuff
  return registerFormula(
    name,
    team,
    'shield',
    cond,
    buff.formula.base.add(base),
    ...extra
  )
}
