import { AnyNode, dynTag, NumNode, prod, RawTagMapEntries, subscript, sum, tag } from '@genshin-optimizer/waverider'
import { Character, convert, custom, Data, Element, enemy, Move, moves, percent, reader, Region, self, selfBuff, selfTag, Stat, usedNames, WeaponType } from '../util'

export interface CharInfo {
  name: Character, weaponType: WeaponType, ele: Element, region: Region
}
export function dmg(name: string, info: CharInfo, stat: Stat, levelScaling: number[], move: Exclude<typeof moves[number], 'elemental'>, extra: { ele?: Element } = {}, specialMultiplier?: NumNode): Data {
  const { char: { auto, skill, burst }, final } = self
  const talentByMove = { normal: auto, charged: auto, plunging: auto, skill, burst } as const
  const talentMulti = percent(subscript(talentByMove[move], levelScaling))
  const base = prod(final[stat], talentMulti, ...[specialMultiplier!].filter(x => x))
  return customDmg(name, info, move, base, extra)
}

export function shield(name: string, info: CharInfo, stat: Stat, tlvlMulti: number[], flat: number[], move: Exclude<Move, 'elemental'>, extra: { ele?: Element } = {}): Data {
  const lvl = self.char[talentType(move)], ele = extra.ele
  let eleMulti: number | NumNode
  switch (ele) {
    case 'geo': eleMulti = tag(1.5, reader.geo.tag); break
    case undefined: eleMulti = 1; break
    default: eleMulti = tag(2.5, reader[ele!].tag)
  }
  return customShield(name, info, prod(
    eleMulti,
    sum(
      prod(percent(subscript(lvl, tlvlMulti)), self.final[stat]),
      subscript(lvl, flat)
    )
  ))
}
export function fixedShield(name: string, info: CharInfo, base: Stat, percent: number | NumNode, flat: number | NumNode): Data {
  return customShield(name, info, sum(prod(percent, self.final[base]), flat))
}

//
// TODO: Update final formula structures

export function customDmg(name: string, info: CharInfo, move: typeof moves[number], base: NumNode, extra: { ele?: Element } = {}): Data {
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
  // TODO: Set final formula entry
  const entry = convert(selfTag, { name, et: 'self' })
  const withSrc = convert(selfTag, { name, src: info.name, et: 'self' })

  return [
    withSrc.dmg.outDmg.reread(self.preDmg.outDmg),
    withSrc.dmg.base.add(base),
    entry.prep.ele.add(ele ?? self.reaction.infusion),
    entry.prep.move.add(move),

    selfBuff.dmg.final.name(name).withTag({ et: 'prep' }).add(dynTag(prod(
      self.dmg.outDmg, self.preDmg.critMulti, enemy.common.inDmg
    ), {
      src: info.name,
      ele: self.prep.ele,
      move: self.prep.move,
      amp: self.prep.amp,
      cata: self.prep.cata,
    })),
  ]
}

export function customShield(name: string, info: CharInfo, base: NumNode): Data {
  usedNames.add(name)

  // TODO: Add `prep formula`
  const entry = convert(selfTag, { name, et: 'self', src: info.name })
  return [
    entry.dmg.final.add(prod(base, sum(percent(1), self.base.shield_)))
  ]
}

export function customHeal(name: string, info: CharInfo, base: NumNode): Data {
  usedNames.add(name)

  // TODO: Add `prep` formula
  const entry = convert(selfTag, { name, et: 'self', src: info.name })
  return [
    entry.dmg.final.add(prod(base, sum(percent(1), self.final.heal_)))
  ]
}

export function entriesForChar(
  { ele, weaponType, region }: CharInfo,
  { lvlCurves, ascensionBonus }: {
    lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[],
    ascensionBonus: { key: string, values: number[] }[],
  }
): RawTagMapEntries<AnyNode> {
  const specials = new Set(Object.keys(lvlCurves) as Stat[])
  specials.delete('atk')
  specials.delete('def')
  specials.delete('hp')

  const { ascension } = self.char
  return [
    // Stats
    ...lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as any as Stat].add(prod(base, custom[curve]))),
    ...ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as any as Stat].add(subscript(ascension, values))),

    // Constants
    ...[...specials].map(s => selfBuff.common.special.add(s)),
    selfBuff.common.weaponType.add(weaponType),
    selfBuff.char.ele.add(ele),

    // Counters
    selfBuff.common.count[ele].add(1),
    selfBuff.common.count[region].add(1),
  ]
}

function talentType(move: Exclude<Move, 'elemental'>): 'auto' | 'skill' | 'burst' {
  switch (move) {
    case 'normal': case 'charged': case 'plunging': return 'auto'
    default: return move
  }
}
