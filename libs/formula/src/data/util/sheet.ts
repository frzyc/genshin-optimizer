import { ElementKey, ElementWithPhyKey, MoveKey } from '@genshin-optimizer/consts';
import { NumNode, StrNode, tag } from '@genshin-optimizer/waverider';
import { convert, Data, reader, self, selfTag, Source, usedNames } from '.';

export function register(src: Source, ...data: (Data[number] | Data)[]): Data {
  function internal({ tag, value }: Data[number]): Data[number] {
    if (tag.name) tag = { ...tag, nameSrc: src }
    else tag = { ...tag, src }
    return { tag, value }
  }
  return data.flatMap(data => Array.isArray(data) ? data.map(internal) : internal(data))
}

export type FormulaArg = { et?: 'self' | 'teamBuff', cond?: string | StrNode }

export function customDmg(name: string, eleOverride: ElementWithPhyKey | undefined, move: MoveKey, base: NumNode, { et = 'self', cond = 'dmg' }: FormulaArg = {}, ...extra: Data): Data {
  usedNames.add(name)

  const entry = convert(selfTag, { name, et })

  return [
    entry.formula.base.add(base),
    entry.prep.ele.add(eleOverride ?? self.reaction.infusion),
    entry.prep.move.add(move),

    ...extra.map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}

export function customShield(name: string, ele: ElementKey | undefined, base: NumNode, { et = 'self', cond = 'shield' }: FormulaArg = {}, ...extra: Data): Data {
  usedNames.add(name)

  let eleMulti: number | NumNode
  switch (ele) {
    case undefined: eleMulti = 1; break
    case 'geo': eleMulti = tag(1.5, reader.geo.tag); break
    default: eleMulti = tag(2.5, reader[ele].tag)
  }

  const entry = convert(selfTag, { name, et })
  return [
    entry.prep.ele.add(ele ?? ''),
    entry.formula.preMulti.add(eleMulti),
    entry.formula.base.add(base),

    ...extra.map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}

export function customHeal(name: string, base: NumNode, { et = 'self', cond = 'heal' }: FormulaArg = {}, ...extra: Data): Data {
  usedNames.add(name)

  const entry = convert(selfTag, { name, et })
  return [
    entry.formula.base.add(base),

    ...extra.map(({ tag, value }) => ({ tag: { ...tag, name }, value })),
  ]
}
