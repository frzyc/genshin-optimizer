import type { WeaponDataGen } from '@genshin-optimizer/gi-pipeline'
import type { AnyNode, RawTagMapEntries } from '@genshin-optimizer/waverider'
import { prod, subscript } from '@genshin-optimizer/waverider'
import type { Stat } from '../util'
import { allStatics, self, selfBuff } from '../util'

export function entriesForWeapon(
  gen: WeaponDataGen
): RawTagMapEntries<AnyNode> {
  const { refinement, ascension } = self.weapon
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as Stat].add(prod(base, allStatics('static')[curve]))
    ),
    ...gen.ascensionBonus.map(({ key, values }) =>
      selfBuff.base[key as Stat].add(subscript(ascension, values))
    ),
    ...gen.refinementBonus.map(({ key, values }) =>
      selfBuff.premod[key as Stat].add(subscript(refinement, values))
    ),
  ]
}
