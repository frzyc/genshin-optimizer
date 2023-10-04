import type {
  ArtifactSetKey,
  ElementKey,
  ElementWithPhyKey,
  MoveKey,
} from '@genshin-optimizer/consts'
import type { NumNode, StrNode } from '@genshin-optimizer/pando'
import { prod } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries, Source, Stat, TagMapNodeEntry } from '.'
import { reader, self, selfBuff, tag, teamBuff } from '.'

// Use `registerArt` for artifacts
export function register(
  src: Exclude<Source, ArtifactSetKey>,
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

export function addStatCurve(key: string, value: NumNode): TagMapNodeEntry {
  return (
    key.endsWith('_dmg_')
      ? selfBuff.premod['dmg_'][key.slice(0, -5) as ElementWithPhyKey]
      : selfBuff.base[key as Stat]
  ).add(value)
}
export function registerStatListing(key: string): TagMapNodeEntry {
  const tags = key.endsWith('_dmg_')
    ? {
        qt: 'premod',
        q: 'dmg_',
        ele: key.slice(0, -5) as ElementWithPhyKey,
      }
    : { qt: 'base', q: key }
  return selfBuff.formula.listing.add(tag('sum', tags))
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
  const buff = team ? teamBuff : selfBuff
  return registerFormula(
    name,
    team,
    'dmg',
    tag(cond, { move }),
    buff.formula.base.add(base),
    buff.prep.ele.add(eleOverride ?? self.reaction.infusion),
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

  const buff = team ? teamBuff : selfBuff
  return registerFormula(
    name,
    team,
    'shield',
    ele ? tag(cond, { ele }) : cond,
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

function registerFormula(
  name: string,
  team: boolean | undefined,
  q: 'dmg' | 'heal' | 'shield',
  cond: string | StrNode,
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  reader.name(name) // register name:<name>
  const buff = team ? teamBuff : selfBuff
  return [
    buff.formula.listing.add(tag(cond, { name, q })),
    ...extra.map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}
