import { CharacterKey, ElementKey, ElementWithPhyKey, MoveKey, RegionKey, WeaponTypeKey } from '@genshin-optimizer/consts'
import { AnyNode, NumNode, prod, RawTagMapEntries, subscript, sum, tag } from '@genshin-optimizer/waverider'
import { allCustoms, convert, Data, percent, reader, self, selfBuff, selfTag, Stat, usedNames } from '../util'

export interface CharInfo {
  key: CharacterKey /* Might need to change this to CharacterSheetKey */
  ele: ElementKey
  weaponType: WeaponTypeKey
  region: RegionKey | ""
}
export type CharDataGen = {
  charKey: CharacterKey
  ele?: ElementKey
  weaponType: WeaponTypeKey
  region?: RegionKey
  lvlCurves: { key: string, base: number, curve: string }[]
  ascensionBonus: { key: string, values: number[] }[]
}
export function dataGenToCharInfo(data_gen: CharDataGen, travelerEle: ElementKey = "anemo"): CharInfo {
  return {
    key: data_gen.charKey,
    ele: data_gen.ele ?? travelerEle,
    weaponType: data_gen.weaponType,
    region: data_gen.region ?? "",
  }
}

export function dmg(name: string, info: CharInfo, stat: Stat, levelScaling: number[], move: Exclude<MoveKey, 'elemental'>, extra: { ele?: ElementWithPhyKey } = {}, specialMultiplier?: NumNode): Data {
  const { char: { auto, skill, burst }, final } = self
  const talentByMove = { normal: auto, charged: auto, plunging: auto, skill, burst } as const
  const talentMulti = percent(subscript(talentByMove[move], levelScaling))
  const base = prod(final[stat], talentMulti, ...(specialMultiplier ? [specialMultiplier] : []))
  return customDmg(name, info, move, base, extra)
}

export function shield(name: string, info: CharInfo, stat: Stat, tlvlMulti: number[], flat: number[], move: Exclude<MoveKey, 'elemental'>, extra: { ele?: ElementWithPhyKey } = {}): Data {
  const lvl = self.char[talentType(move)]
  return customShield(name, info,
    sum(
      prod(percent(subscript(lvl, tlvlMulti)), self.final[stat]),
      subscript(lvl, flat)
    ), extra)
}
export function fixedShield(name: string, info: CharInfo, base: Stat, percent: number | NumNode, flat: number | NumNode, extra: { ele?: ElementWithPhyKey } = {}): Data {
  return customShield(name, info, sum(prod(percent, self.final[base]), flat), extra)
}

export function customDmg(name: string, info: CharInfo, move: MoveKey, base: NumNode, extra: { ele?: ElementWithPhyKey } = {}): Data {
  usedNames.add(name)

  let { ele } = extra
  if (!ele)
    switch (move) {
      case 'skill': case 'burst': ele = info.ele; break
      default:
        switch (info.weaponType) {
          case 'catalyst': ele = info.ele; break
          case 'bow': ele = 'physical'; break
        }
    }
  const entry = convert(selfTag, { name, et: 'self' })

  return [
    entry.formula.base.add(base),
    entry.prep.ele.add(ele ?? self.reaction.infusion),
    entry.prep.move.add(move),
  ]
}

export function customShield(name: string, info: CharInfo, base: NumNode, extra: { ele?: ElementWithPhyKey } = {}): Data {
  usedNames.add(name)

  const ele = extra.ele
  let eleMulti: number | NumNode
  switch (ele) {
    case 'geo': eleMulti = tag(1.5, reader.geo.tag); break
    case undefined: eleMulti = 1; break
    default: eleMulti = tag(2.5, reader[ele as ElementKey].tag)
  }
  const entry = convert(selfTag, { name, et: 'self', src: info.key })
  return [
    entry.prep.ele.add(ele ?? ''),
    entry.formula.preMulti.add(eleMulti),
    entry.formula.base.add(base),
  ]
}

export function customHeal(name: string, info: CharInfo, base: NumNode): Data {
  usedNames.add(name)

  const entry = convert(selfTag, { name, et: 'self', src: info.key })
  return [
    entry.formula.base.add(base)
  ]
}

export function entriesForChar(
  { ele, weaponType, region }: CharInfo,
  { lvlCurves, ascensionBonus }: {
    lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[],
    ascensionBonus: { key: string, values: number[] }[],
  }
): RawTagMapEntries<AnyNode> {
  const specials = new Set(Object.keys(lvlCurves.map(({ key }) => key)))
  specials.delete('atk')
  specials.delete('def')
  specials.delete('hp')

  const { ascension } = self.char
  return [
    // Stats
    ...lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as Stat].add(prod(base, allCustoms('static')[curve]))),
    ...ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as Stat].add(subscript(ascension, values))),

    // Constants
    ...[...specials].map(s => selfBuff.common.special.add(s)),
    selfBuff.common.weaponType.add(weaponType),
    selfBuff.char.ele.add(ele),

    // Counters
    selfBuff.common.count[ele].add(1),
    ...(region !== "" ? [selfBuff.common.count[region].add(1)] : []),
  ]
}

function talentType(move: Exclude<MoveKey, 'elemental'>): 'auto' | 'skill' | 'burst' {
  switch (move) {
    case 'normal': case 'charged': case 'plunging': return 'auto'
    default: return move
  }
}
