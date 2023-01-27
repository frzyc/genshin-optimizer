import { AnyNode, constant, prod, RawTagMapEntries, subscript } from '@genshin-optimizer/waverider'
import { convert, customQueries, enemyTag, Self, self, selfTag, Stat, Tag, Weapon } from '../util'

export function entriesForWeapon(
  selfBuff: Self,
  gen: {
    weaponType: string, // TODO: Weapon Type
    lvlCurves: { key: string, base: number, curve: string /* TODO: key of char curves */ }[],
    ascensionBonus: { key: string, values: number[] }[],
    refinementBonus: { key: string, values: number[] }[],
  }
): RawTagMapEntries<AnyNode> {
  const { refinement, ascension } = self.weapon
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as any as Stat].addNode(prod(base, self.custom[curve]))),
    ...gen.ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as any as Stat].addNode(subscript(ascension, values))),
    ...gen.refinementBonus.map(({ key, values }) =>
      selfBuff.premod[key as any as Stat].addNode(subscript(refinement, values))),

    // Constants
    selfBuff.common.weaponType.addNode(constant(gen.weaponType)),
  ]
}


export function write(src: Weapon, tag: Omit<Tag, 'src' | 'et'> = {}) {
  return {
    custom: customQueries({ src, et: 'self', ...tag }),
    output: {
      selfBuff: convert(selfTag, { src, et: 'self', ...tag }),
      teamBuff: convert(selfTag, { src, et: 'teamBuff', ...tag }),
      activeCharBuff: convert(selfTag, { src, et: 'active', ...tag }),
      enemyDebuff: convert(enemyTag, { src, et: 'enemy', ...tag })
    }
  }
}
