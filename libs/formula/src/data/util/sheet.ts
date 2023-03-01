import { CharacterKey, ElementKey, ElementWithPhyKey, MoveKey, WeaponKey } from '@genshin-optimizer/consts';
import { NumNode, prod, StrNode, tag } from '@genshin-optimizer/waverider';
import { Data, reader, self, selfBuff, teamBuff, usedNames } from '.';

export function register(src: CharacterKey | WeaponKey, ...data: (Data[number] | Data)[]): Data {
  const internal = ({ tag, value }: Data[number]) => ({ tag: { ...tag, src }, value })
  return data.flatMap(data => Array.isArray(data) ? data.map(internal) : internal(data))
}

export type FormulaArg = {
  team?: boolean // true if applies to every member, and false (default) if applies only to self
  cond?: string | StrNode
}

export function customDmg(name: string, eleOverride: ElementWithPhyKey | undefined, move: MoveKey, base: NumNode, { team, cond = 'dmg' }: FormulaArg = {}, ...extra: Data): Data {
  usedNames.add(name)

  const entry = team ? teamBuff : selfBuff
  return [
    entry.formula.listing.reread(entry.formula.prepType.name(name)),
    ...[
      entry.formula.base.add(base),
      entry.prep.ele.add(eleOverride ?? self.reaction.infusion),
      entry.prep.move.add(move),
      entry.formula.prepType.add(cond),

      ...extra,
    ].map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}

export function customShield(name: string, ele: ElementKey | undefined, base: NumNode, { team, cond = 'shield' }: FormulaArg = {}, ...extra: Data): Data {
  usedNames.add(name)

  switch (ele) {
    case undefined: break
    case 'geo': base = prod(tag(1.5, reader.geo.tag), base); break
    default: base = prod(tag(2.5, reader[ele].tag), base)
  }

  const entry = team ? teamBuff : selfBuff
  return [
    entry.formula.listing.reread(entry.formula.prepType.name(name)),
    ...[
      entry.prep.ele.add(ele ?? ''),
      entry.formula.base.add(base),
      entry.formula.prepType.add(cond),

      ...extra,
    ].map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}

export function customHeal(name: string, base: NumNode, { team, cond = 'heal' }: FormulaArg = {}, ...extra: Data): Data {
  usedNames.add(name)

  const entry = team ? teamBuff : selfBuff
  return [
    entry.formula.listing.reread(entry.formula.prepType.name(name)),
    ...[
      entry.formula.base.add(base),
      entry.formula.prepType.add(cond),

      ...extra,
    ].map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}
