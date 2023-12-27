import { type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { prod, subscript } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { allStatics, readStat, self, selfBuff } from '../util'

export function entriesForWeapon(key: WeaponKey): TagMapNodeEntries {
  const gen = allStats.weapon.data[key]
  const { refinement, ascension } = self.weapon

  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      (key == 'atk' ? selfBuff.base[key] : readStat(selfBuff.premod, key)).add(
        prod(base, allStatics('static')[curve])
      )
    ),
    ...Object.entries(gen.ascensionBonus).map(([key, values]) =>
      (key == 'atk'
        ? selfBuff.base[key]
        : readStat(selfBuff.premod, key as keyof typeof gen.ascensionBonus)
      ).add(subscript(ascension, values))
    ),
    ...Object.entries(gen.refinementBonus).map(([key, values]) =>
      readStat(
        selfBuff.weaponRefinement,
        key as keyof typeof gen.refinementBonus
      ).add(subscript(refinement, values))
    ),
  ]
}
