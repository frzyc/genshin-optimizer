import { tag } from '@genshin-optimizer/game-opt/engine'
import {
  prod,
  type NumNode,
  type StrNode,
} from '@genshin-optimizer/pando/engine'
import type { StatKey } from '@genshin-optimizer/sr/consts'
import type { Read, Tag } from '.'
import {
  ownBuff,
  percent,
  reader,
  semiOwnBuff,
  teamBuff,
  type TagMapNodeEntries,
  type TagMapNodeEntry,
} from '.'
import type { ElementalType, Sheet } from './listing'

export type FormulaArg = {
  team?: boolean // true if applies to every member, and false (default) if applies only to self
  isSemiOwn?: boolean
  cond?: string | StrNode
}

export type DmgTag = Partial<
  Pick<Tag, 'damageType1' | 'damageType2' | 'elementalType'>
>

export function register(
  sheet: Sheet,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  const internal = ({ tag, value }: TagMapNodeEntry) => {
    // Sheet-specific `enemy` stats adds to `enemyDeBuff` instead
    if (tag.et === 'enemy') tag = { ...tag, et: 'enemyDeBuff' }
    return { tag: { ...tag, sheet }, value }
  }
  return data.flatMap((data) =>
    Array.isArray(data) ? data.map(internal) : internal(data)
  )
}

/**
 * Registers a buff so it shows up in the `buff` listings.
 * Used for static buffs.
 * Example usage: `register(... , ...registerBuff('ba3_atk_', own.premod.atk_.add(dm.ba3.atk_)))`
 * @param name Unqiue name of buff
 * @param entries Buff/Buffs to register
 * @param cond Hide this buff behind this check
 * @param team Add to team formula listings if true
 * @returns Listing components to register the buff + the buff itself so it can be passed to `register`.
 */
export function registerBuff(
  name: string,
  entries: TagMapNodeEntry | TagMapNodeEntry[],
  cond: string | StrNode = 'unique',
  team = false
): TagMapNodeEntries {
  if (!Array.isArray(entries)) entries = [entries]
  return entries.flatMap((entry) => {
    // Remove unused tags. We cannot use `sheet:null` here because
    // `namedReader` is also used as a `Tag` inside `listingItem`.
    const { sheet: _sheet, ...tag } = entry.tag
    const namedReader = reader.withTag({ ...tag, et: 'display', name }) // register name:<name>
    const listing = (team ? teamBuff : ownBuff).listing.buffs
    return [
      // Add this buff to listing listing
      listing.add(listingItem(namedReader, cond)),
      // Hook for listing
      namedReader.toEntry(entry.value),
      // Still include the original entry
      entry,
    ]
  })
}

/**
 * Registers a buff so it shows up in the `buff` and `formula` listings.
 * Used for scaling buffs that are optimize-able.
 * Example usage: `register(... , ...registerBuff('ba3_atk_', own.premod.atk_.add(prod(dm.ba3.atk_, own.total.atk))))`
 * @param name Unqiue name of buff
 * @param entry Buff to register
 * @param cond Hide this buff behind this check
 * @param team Add to team formula listings if true
 * @returns Listing components to register the buff + the buff itself so it can be passed to `register`.
 */
export function registerBuffFormula(
  name: string,
  entries: TagMapNodeEntry | TagMapNodeEntry[],
  cond: string | StrNode = 'unique',
  team = false
): TagMapNodeEntries {
  if (!Array.isArray(entries)) entries = [entries]
  return entries.flatMap((entry) => {
    // Remove unused tags. We cannot use `sheet:null` here because
    // `namedReader` is also used as a `Tag` inside `listingItem`.
    const { sheet: _sheet, ...tag } = entry.tag
    const namedReader = reader.withTag({ ...tag, et: 'display', name }) // register name:<name>
    const buffListing = (team ? teamBuff : ownBuff).listing.buffs
    const formulaListing = (team ? teamBuff : ownBuff).listing.formulas
    return [
      // Add this buff to listing listing
      buffListing.add(listingItem(namedReader, cond)),
      formulaListing.add(listingItem(namedReader, cond)),
      // Hook for listing
      namedReader.toEntry(entry.value),
      // Still include the original entry
      entry,
    ]
  })
}

function registerFormula(
  name: string,
  team: boolean | undefined,
  q: 'dmg' | 'heal' | 'shield' | 'breakDmg',
  cond: string | StrNode,
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  reader.name(name) // register name:<name>
  const listing = (team ? teamBuff : ownBuff).listing.formulas
  return [
    listing.add(
      listingItem(reader.withTag({ name, et: 'own', qt: 'formula', q }), cond)
    ),
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
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`, and also show the formula in teammates' listing.
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
  { team, isSemiOwn, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries[] {
  return splits.map((split, index) =>
    registerFormula(
      `${name}_${index}`,
      team,
      'dmg',
      tag(cond, dmgTag),
      (isSemiOwn ? semiOwnBuff : ownBuff).formula.base.add(
        prod(base, percent(split))
      ),
      ...extra
    )
  )
}

/**
 * Creates TagMapNodeEntries representing a shield instance, and registers the formula
 * @param name Base name to be used as the key
 * @param base Node representing the shield value
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns TagMapNodeEntries representing the shield instance
 */
export function customShield(
  name: string,
  base: NumNode,
  { team, isSemiOwn, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'shield',
    cond,
    (isSemiOwn ? semiOwnBuff : ownBuff).formula.base.add(base),
    ...extra
  )
}

/**
 * Creates TagMapNodeEntries representing a heal instance, and registers the formula
 * @param name Base name to be used as the key
 * @param base Node representing the heal value
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns TagMapNodeEntries representing the heal instance
 */
export function customHeal(
  name: string,
  base: NumNode,
  { team, isSemiOwn, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'heal',
    cond,
    (isSemiOwn ? semiOwnBuff : ownBuff).formula.base.add(base),
    ...extra
  )
}

/**
 * Creates TagMapNodeEntries representing a break DMG instance, and registers the formula
 * @param name Base name to be used as the key
 * @param dmgTag Tag object containing damageType1, damageType2 and elementalType
 * @param base Node representing the break DMG value
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns TagMapNodeEntries representing the heal instance
 */
export function customBreakDmg(
  name: string,
  dmgTag: DmgTag,
  base: NumNode | number,
  { team, isSemiOwn, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'breakDmg',
    tag(cond, dmgTag),
    (isSemiOwn ? semiOwnBuff : ownBuff).formula.base.add(base),
    ...extra
  )
}

export function getStatFromStatKey(
  buff: typeof ownBuff.premod,
  statKey: StatKey
) {
  switch (statKey) {
    case 'physical_dmg_':
    case 'fire_dmg_':
    case 'ice_dmg_':
    case 'wind_dmg_':
    case 'lightning_dmg_':
    case 'quantum_dmg_':
    case 'imaginary_dmg_':
      // substring will fetch 'physical' from 'physical_dmg_', for example
      return buff.dmg_[
        statKey.substring(0, statKey.indexOf('_')) as ElementalType
      ]
    case 'baseSpd':
      throw new Error(
        'Attempted to use baseSpd to index premod; possibly a mistake?'
      )
    default:
      return buff[statKey]
  }
}
