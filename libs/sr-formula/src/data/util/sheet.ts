import { prod, type NumNode, type StrNode } from '@genshin-optimizer/pando'
import type { Read, Tag } from '.'
import {
  percent,
  reader,
  selfBuff,
  tag,
  teamBuff,
  type TagMapNodeEntries,
  type TagMapNodeEntry,
} from '.'
import type { Source } from './listing'

export type FormulaArg = {
  team?: boolean // true if applies to every member, and false (default) if applies only to self
  cond?: string | StrNode
}

export type DmgTag = Pick<Tag, 'damageType1' | 'damageType2' | 'elementalType'>

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
 * Creates an array of TagMapNodeEntries representing a damage instance split by their multipliers, and registers their formulas
 * @param name Base name to be used as the key
 * @param dmgTag Tag object containing damageType1, damageType2 and elementalType
 * @param base Node representing the full damage value
 * @param splits Array of decimals that should add up to 1. Each entry represents the percentage of damage that hit deals, for multi-hit moves. We get splits from SRSim devs, see the array at the top of https://github.com/simimpact/srsim/blob/main/internal/character/march7th/ult.go for example.
 * @param arg `{ team: true }` to use `teamBuff` instead of `selfBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns Array of TagMapNodeEntries representing the damage instance
 */
export function customDmg(
  name: string,
  dmgTag: DmgTag,
  base: NumNode,
  splits: number[] = [1],
  { team, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries[] {
  const buff = team ? teamBuff : selfBuff
  return splits.map((split, index) =>
    registerFormula(
      `${name}_${index}`,
      team,
      'dmg',
      tag(cond, dmgTag),
      buff.formula.base.add(prod(base, percent(split))),
      ...extra
    )
  )
}

/**
 * Creates TagMapNodeEntries representing a shield instance, and registers the formula
 * @param name Base name to be used as the key
 * @param base Node representing the shield value
 * @param arg `{ team: true }` to use `teamBuff` instead of `selfBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns TagMapNodeEntries representing the shield instance
 */
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

/**
 * Creates TagMapNodeEntries representing a heal instance, and registers the formula
 * @param name Base name to be used as the key
 * @param base Node representing the heal value
 * @param arg `{ team: true }` to use `teamBuff` instead of `selfBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns TagMapNodeEntries representing the heal instance
 */
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
