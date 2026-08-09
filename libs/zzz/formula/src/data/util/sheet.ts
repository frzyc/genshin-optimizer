import { tag } from '@genshin-optimizer/game-opt/engine'
import type { NumNode, StrNode } from '@genshin-optimizer/pando/engine'
import type { PandoStatKey } from '@genshin-optimizer/zzz/consts'
import type { Read, Tag } from '.'
import {
  ownBuff,
  reader,
  type TagMapNodeEntries,
  type TagMapNodeEntry,
  teamBuff,
} from '.'
import type { Attribute, Sheet } from './listing'

export type FormulaArg = {
  team?: boolean // true if applies to every member, and false (default) if applies only to self
  cond?: string | StrNode
}

export type DmgTag = Partial<
  Pick<Tag, 'damageType1' | 'damageType2' | 'attribute' | 'skillType'>
>

/** Entry types that register on `teamBuff.listing` when `team` is omitted. */
const TEAM_LISTING_ENTRY_TYPES = new Set<Tag['et']>([
  'teamBuff',
  'notOwnBuff',
  'enemy',
  'enemyDeBuff',
])

/** UI listing placement (not calc targeting). Explicit `team` overrides inference. */
function resolveTeamBuffListing(
  entry: TagMapNodeEntry,
  team?: boolean
): boolean {
  return team ?? TEAM_LISTING_ENTRY_TYPES.has(entry.tag.et)
}

function getBuffListingRoot(useTeamListing: boolean) {
  return useTeamListing ? teamBuff : ownBuff
}

function displayNamedReader(entry: TagMapNodeEntry, name: string) {
  // Cannot use `sheet: null`; namedReader is also used as a `Tag` in `listingItem`.
  const { sheet: _sheet, ...tag } = entry.tag
  return reader.withTag({ ...tag, et: 'display', name })
}

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
 * Example usage: `register(... , ...registerBuff('ba3_atk_', own.initial.atk_.add(dm.ba3.atk_)))`
 * @param name Unqiue name of buff
 * @param entries Buff/Buffs to register
 * @param cond Hide this buff behind this check
 * @param team Add to team buff listings if true, own buff listings if false, or infer from entry `et` if omitted
 * @param includeOriginalEntry Set to false for buffs that are applied as additional entries into specific moves, so this buff won't get added to the character's stats
 * @returns Listing components to register the buff + the buff itself so it can be passed to `register`.
 */
export function registerBuff(
  name: string,
  entries: TagMapNodeEntry | TagMapNodeEntry[],
  cond: string | StrNode = 'infer',
  team?: boolean,
  includeOriginalEntry = true
): TagMapNodeEntries {
  if (!Array.isArray(entries)) entries = [entries]
  return entries.flatMap((entry) => {
    const namedReader = displayNamedReader(entry, name)
    const buffListing = buffListingRoot(resolveTeamBuffListing(entry, team))
      .listing.buffs
    return [
      buffListing.add(listingItem(namedReader, cond)),
      namedReader.toEntry(entry.value),
      ...(includeOriginalEntry ? [entry] : []),
    ]
  })
}

/**
 * Registers a buff so it shows up in the `buff` and `formula` listings.
 * Used for scaling buffs that are optimize-able.
 * Example usage: `register(... , ...registerBuff('ba3_atk_', own.initial.atk_.add(prod(dm.ba3.atk_, own.total.atk))))`
 * @param name Unqiue name of buff
 * @param entry Buff to register
 * @param cond Hide this buff behind this check
 * @param team Add to team buff listings if true, own buff listings if false, or infer from entry `et` if omitted
 * @returns Listing components to register the buff + the buff itself so it can be passed to `register`.
 */
export function registerBuffFormula(
  name: string,
  entry: TagMapNodeEntry,
  cond: string | StrNode = 'infer',
  team?: boolean
): TagMapNodeEntries {
  const namedReader = displayNamedReader(entry, name)
  const listingRoot = buffListingRoot(resolveTeamBuffListing(entry, team))
  return [
    listingRoot.listing.buffs.add(listingItem(namedReader, cond)),
    listingRoot.listing.formulas.add(listingItem(namedReader, cond)),
    namedReader.toEntry(entry.value),
    entry,
  ]
}

function registerFormula(
  name: string,
  team: boolean | undefined,
  q:
    | 'standardDmg'
    | 'sheerDmg'
    | 'heal'
    | 'shield'
    | 'anomalyDmg'
    | 'dazeBuildup'
    | 'anomBuildup'
    | 'abloomDmg',
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
  return tag(cond ?? t.ex ?? 'infer', t.tag)
}

/**
 * Creates an array of TagMapNodeEntries representing a damage instance split by their multipliers, and registers their formulas
 * @param name Base name to be used as the key
 * @param dmgTag Tag object containing damageType1, damageType2 and attribute
 * @param base Node representing the full damage value
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
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'standardDmg',
    tag(cond, dmgTag),
    ownBuff.formula.standardDmgBase.add(base),
    ...extra
  )
}

/**
 * Creates an array of TagMapNodeEntries representing a sheer damage instance split by their multipliers, and registers their formulas
 * @param name Base name to be used as the key
 * @param dmgTag Tag object containing damageType1, damageType2 and attribute
 * @param base Node representing the full sheer damage value
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this sheer damage instance
 * @returns Array of TagMapNodeEntries representing the sheer damage instance
 */
export function customSheerDmg(
  name: string,
  dmgTag: DmgTag,
  base: NumNode,
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'sheerDmg',
    tag(cond, dmgTag),
    ownBuff.formula.sheerDmgBase.add(base),
    ...extra
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
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'shield',
    cond,
    ownBuff.formula.shieldBase.add(base),
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
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'heal',
    cond,
    ownBuff.formula.healBase.add(base),
    ...extra
  )
}

/**
 * Creates TagMapNodeEntries representing a break DMG instance, and registers the formula
 * @param name Base name to be used as the key
 * @param dmgTag Tag object containing damageType1, damageType2 and attribute
 * @param base Node representing the break DMG value
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns TagMapNodeEntries representing the heal instance
 */
export function customAnomalyDmg(
  name: string,
  dmgTag: DmgTag,
  base: NumNode | number,
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'anomalyDmg',
    tag(cond, dmgTag),
    ownBuff.formula.anomalyDmgBase.add(base),
    ...extra
  )
}

/**
 * Creates TagMapNodeEntries representing a daze instance, and registers the formula
 * @param name Base name to be used as the key
 * @param base Node representing the daze value
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns TagMapNodeEntries representing the daze instance
 */
export function customDaze(
  name: string,
  dmgTag: DmgTag,
  base: NumNode,
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'dazeBuildup',
    tag(cond, dmgTag),
    ownBuff.formula.dazeBuildupBase.add(base),
    ...extra
  )
}

/**
 * Creates TagMapNodeEntries representing an anomaly buildup instance, and registers the formula
 * @param name Base name to be used as the key
 * @param base Node representing the anomaly buildup value
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`, and also show the formula in teammates' listing.
 *
 * `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns TagMapNodeEntries representing the anomaly buildup instance
 */
export function customAnomalyBuildup(
  name: string,
  dmgTag: DmgTag,
  base: NumNode,
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'anomBuildup',
    tag(cond, dmgTag),
    ownBuff.formula.anomBuildupBase.add(base),
    ...extra
  )
}

export function getStatFromStatKey(
  buff: typeof ownBuff.initial,
  statKey: PandoStatKey
) {
  switch (statKey) {
    case 'fire_dmg_':
    case 'electric_dmg_':
    case 'ice_dmg_':
    case 'physical_dmg_':
    case 'ether_dmg_':
    case 'wind_dmg_':
      // substring will fetch 'physical' from 'physical_dmg_', for example
      return buff.dmg_[statKey.substring(0, statKey.indexOf('_')) as Attribute]
    case 'dmg_':
      return buff.common_dmg_
    default:
      return buff[statKey]
  }
}
