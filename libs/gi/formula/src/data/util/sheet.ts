import { tag } from '@genshin-optimizer/game-opt/engine'
import type {
  ArtifactSetKey,
  ElementKey,
  ElementWithPhyKey,
  MoveKey,
} from '@genshin-optimizer/gi/consts'
import type { StatKey } from '@genshin-optimizer/gi/dm'
import type { NumNode, StrNode } from '@genshin-optimizer/pando/engine'
import { prod } from '@genshin-optimizer/pando/engine'
import type { Sheet, Stat } from './listing'
import type { Read } from './read'
import { reader } from './read'
import { own, ownBuff, teamBuff } from './tag'
import type { TagMapNodeEntries, TagMapNodeEntry } from './tagMapType'

// Use `registerArt` for artifacts
export function register(
  sheet: Exclude<Sheet, ArtifactSetKey>,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  const internal = ({ tag, value }: TagMapNodeEntry) => {
    // Sheet-specific `enemy` stats adds to `enemyDeBuff` instead
    if (tag.et === 'enemy') tag = { ...tag, et: 'enemyDeBuff' }
    // Keep addOnce / stackToken channels on the non-stack group sheet.
    if (tag.qt === 'stackIn' || tag.qt === 'stackTmp' || tag.qt === 'stackOut')
      return { tag, value }
    return { tag: { ...tag, sheet }, value }
  }
  return data.flatMap((data) =>
    Array.isArray(data) ? data.map(internal) : internal(data)
  )
}

export type FormulaArg = {
  team?: boolean // true if applies to every member, and false (default) if applies only to self
  cond?: string | StrNode
}

export function customDmg(
  name: string,
  eleOverride: ElementWithPhyKey | undefined,
  move: MoveKey,
  base: NumNode,
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'dmg',
    tag(cond, { move, ...(eleOverride ? { ele: eleOverride } : {}) }),
    ownBuff.formula.base.add(base),
    ownBuff.prep.ele.add(eleOverride ?? own.reaction.infusion),
    ...extra
  )
}

export function customShield(
  name: string,
  ele: ElementKey | undefined,
  base: NumNode,
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  switch (ele) {
    case undefined:
      break
    case 'geo':
      base = prod(tag(1.5, reader.geo.tag), base)
      break
    default:
      base = prod(tag(2.5, reader[ele].tag), base)
  }

  return registerFormula(
    name,
    team,
    'shield',
    ele ? tag(cond, { ele }) : cond,
    ownBuff.formula.base.add(base),
    ...extra
  )
}

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
    ownBuff.formula.base.add(base),
    ...extra
  )
}

/** Talent-sheet scalar (CD, duration, chance, stamina). Not a heal/dmg/shield. */
export function customParam(
  name: string,
  base: number | NumNode,
  { team, cond = 'infer' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'param',
    cond,
    ownBuff.formula.base.add(base),
    ...extra
  )
}

function registerFormula(
  name: string,
  team: boolean | undefined,
  q: 'dmg' | 'heal' | 'shield' | 'param',
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

/** This member's contribution to `team.common.hexerei` (0/1, often a Lock Homework cond). */
export function hexereiTally(value: number | NumNode): TagMapNodeEntry {
  return ownBuff.common.hexerei.add(value)
}

export function readStat(
  list: Record<Stat | 'shield_', Read>,
  key: StatKey
): Read {
  if (key.endsWith('_dmg_'))
    return list['dmg_'][key.slice(0, -5) as ElementWithPhyKey]
  if (key.endsWith('_res_') && !key.endsWith('_enemyRes_'))
    return list['res_'][key.slice(0, -5) as ElementWithPhyKey]
  return list[key as Stat]
}
