import { prod, type NumNode, type StrNode } from '@genshin-optimizer/pando'
import type { TypeKey } from '@genshin-optimizer/sr-consts'
import type { Read } from '.'
import {
  TypeKeyToListingType,
  percent,
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

/**
 * Creates an array of TagMapNodeEntries representing a damage instance, and registers their formulas
 * @param name Base name to be used as the key
 * @param type Type of the damage
 * @param AttackType Type of attack damage that is dealt
 * @param splits Array of decimals that should add up to 1. Each entry represents the percentage of damage that hit deals, for multi-hit moves
 * @param arg
 * @param extra Buffs that should only apply to this damage instance
 * @returns Array of TagMapNodeEntries representing the damage instance
 */
export function customDmg(
  name: string,
  typeKey: TypeKey,
  attackType: AttackType,
  base: NumNode,
  splits: number[] = [1],
  { team, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries[] {
  const buff = team ? teamBuff : selfBuff
  const type = TypeKeyToListingType[typeKey]
  return splits.map((split, index) =>
    registerFormula(
      `${name}_${index}`,
      team,
      'dmg',
      tag(cond, { attackType, type }),
      buff.formula.base.add(prod(base, percent(split))),
      ...extra
    )
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

export function customHeal(
  name: string,
  base: NumNode,
  { team, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  const buff = team ? teamBuff : selfBuff
  return registerFormula(
    name,
    team,
    'heal',
    cond,
    buff.formula.base.add(base),
    ...extra
  )
}
