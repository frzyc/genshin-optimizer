import { AnyNode, NumNode, prod, RawTagMapEntries, subscript, sum, tag } from '@genshin-optimizer/waverider'
import { Character, convert, customQueries, Data, Element, enemyTag, Move, moves, percent, Read, reader, Region, Self, self, selfTag, Stat, Tag, usedNames, WeaponType } from '../util'

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

export function shield(name: string, info: CharInfo, base: Stat, tlvlMulti: number[], flat: number[], move: Exclude<Move, 'elemental'>, extra: { ele?: Element } = {}): Data {
  const talentLvl = self.char[talentType(move)], ele = extra.ele
  let eleMulti: number | NumNode
  switch (ele) {
    case 'geo': eleMulti = tag(1.5, reader.geo.tag); break
    case undefined: eleMulti = 0; break
    default: eleMulti = tag(2.5, reader[ele!].tag)
  }
  return customShield(name, info, prod(
    eleMulti,
    sum(
      prod(percent(subscript(talentLvl, tlvlMulti)), self.final[base]),
      subscript(talentLvl, flat)
    )
  ))
}
export function fixedShield(name: string, info: CharInfo, base: Stat, percent: NumNode | number, flat: NumNode | number): Data {
  return customShield(name, info, sum(prod(percent, self.final[base]), flat))
}

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
  const entry = write(info.name, { name }).output.selfBuff

  return [
    entry.dmg.base.addNode(base),
    entry.dmg.move.addNode(move),
    entry.dmg.ele.addNode(ele ?? self.reaction.infusion),

    // Pull up common calcultion
    entry.dmg.outDmg.reread(self.preDmg.outDmg),
    entry.dmg.critMulti.reread(self.preDmg.critMulti),
  ]
}

export function customShield(name: string, info: CharInfo, base: NumNode): Data {
  usedNames.add(name)

  const entry = write(info.name, { name }).output.selfBuff
  return [
    entry.dmg.final.addNode(prod(base, sum(percent(1), self.base.shield_)))
  ]
}

export function customHeal(name: string, info: CharInfo, base: NumNode): Data {
  usedNames.add(name)

  const entry = write(info.name, { name }).output.selfBuff
  return [
    entry.dmg.final.addNode(prod(base, sum(percent(1), self.final.heal_)))
  ]
}

export function entriesForChar(
  selfBuff: Self,
  { name, ele, weaponType, region }: CharInfo,
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
      selfBuff.base[key as any as Stat].addNode(prod(base, self.custom[curve]))),
    ...ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as any as Stat].addNode(subscript(ascension, values))),

    // Constants
    ...[...specials].map(s => selfBuff.common.special.addNode(s)),
    selfBuff.common.weaponType.addNode(weaponType),
    selfBuff.char.ele.addNode(ele),

    // Team counters
    selfBuff.common.count[ele].addNode(tag(1, { src: name })),
    selfBuff.common.count[region].addNode(tag(1, { src: name })),
  ]
}

export function write(src: Character, tag: Omit<Tag, 'src' | 'et'> = {}) {
  return {
    custom: customQueries({ src, et: 'self', ...tag }),
    output: {
      selfBuff: convert(selfTag, { src, et: 'self', ...tag }),
      teamBuff: convert(selfTag, { src, et: 'teamBuff', ...tag }),
      activeCharBuff: convert(selfTag, { src, et: 'active', ...tag }),
      enemyDebuff: convert(enemyTag, { src, et: 'enemy', ...tag }),
    }
  }
}

function talentType(move: Exclude<Move, 'elemental'>): 'auto' | 'skill' | 'burst' {
  switch (move) {
    case 'normal': case 'charged': case 'plunging': return 'auto'
    default: return move
  }
}
