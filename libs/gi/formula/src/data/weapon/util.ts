import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { allStatics, readStat, self, selfBuff } from '../util'

export function entriesForWeapon(key: WeaponKey): TagMapNodeEntries {
  const gen = allStats.weapon.data[key]
  const { refinement, ascension } = self.weapon
  const primaryStat = 'atk'
  const nonPrimaryStat = new Set(gen.lvlCurves.map(({ key }) => key))
  nonPrimaryStat.delete(primaryStat)

  // Use `self` here instead of `selfBuff` so that the number is
  // still available even when the buff mechanism does not apply
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      (key == 'atk' ? selfBuff.base[key] : readStat(selfBuff.premod, key)).add(
        prod(base, allStatics('static')[curve])
      )
    ),
    ...Object.entries(gen.ascensionBonus).map(([key, values]) =>
      (key == 'atk' ? selfBuff.base[key] : readStat(selfBuff.premod, key)).add(
        subscript(ascension, values)
      )
    ),
    ...Object.entries(gen.refinementBonus).map(([key, values]) =>
      readStat(selfBuff.weaponRefinement, key).add(
        subscript(refinement, values)
      )
    ),

    // Specialized stats, items here are sheet-specific data (i.e., `sheet:<key>`)
    // Read from `selfBuff` to include only sheet's contribution.
    selfBuff.weapon.primary.add(selfBuff.base[primaryStat].sheet(key)),
    ...[...nonPrimaryStat].map((stat) =>
      selfBuff.weapon.secondary.add(readStat(selfBuff.premod, stat).sheet(key))
    ),
  ]
}
