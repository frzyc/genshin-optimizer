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
import { reader, tag } from './read'
import { self, selfBuff, teamBuff } from './tag'
import type { TagMapNodeEntries, TagMapNodeEntry } from './tagMapType'

// Use `registerArt` for artifacts
export function register(
  sheet: Exclude<Sheet, ArtifactSetKey>,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  const internal = ({ tag, value }: TagMapNodeEntry) => ({
    tag: { ...tag, sheet },
    value,
  })
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
  { team, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'dmg',
    tag(cond, { move }),
    selfBuff.formula.base.add(base),
    self.prep.ele.add(eleOverride ?? self.reaction.infusion),
    ...extra
  )
}

export function customShield(
  name: string,
  ele: ElementKey | undefined,
  base: NumNode,
  { team, cond = 'unique' }: FormulaArg = {},
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
    selfBuff.formula.base.add(base),
    ...extra
  )
}

export function customHeal(
  name: string,
  base: NumNode,
  { team, cond = 'unique' }: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return registerFormula(
    name,
    team,
    'heal',
    cond,
    selfBuff.formula.base.add(base),
    ...extra
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
    listing.add(
      listingItem(reader.withTag({ name, et: 'self', qt: 'formula', q }), cond)
    ),
    ...extra.map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}

export function listingItem(t: Read, cond?: string | StrNode) {
  return tag(cond ?? t.ex ?? 'unique', t.tag)
}

export function readStat(
  list: Record<Stat | 'shield_', Read>,
  key: StatKey
): Read {
  return key.endsWith('_dmg_')
    ? list['dmg_'][key.slice(0, -5) as ElementWithPhyKey]
    : list[key as Stat]
}
