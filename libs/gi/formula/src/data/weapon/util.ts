import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { allStatics, readStat, self } from '../util'

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
      (key == 'atk' ? self.base[key] : readStat(self.premod, key)).add(
        prod(base, allStatics('static')[curve])
      )
    ),
    ...Object.entries(gen.ascensionBonus).map(([key, values]) =>
      (key == 'atk'
        ? self.base[key]
        : readStat(self.premod, key as keyof typeof gen.ascensionBonus)
      ).add(subscript(ascension, values))
    ),
    ...Object.entries(gen.refinementBonus).map(([key, values]) =>
      readStat(
        self.weaponRefinement,
        key as keyof typeof gen.refinementBonus
      ).add(subscript(refinement, values))
    ),

    // Specialized stats, items here are sheet-specific data (i.e., `sheet:<key>`)
    self.weapon.primary.add(self.base[primaryStat].sheet(key)),
    ...[...nonPrimaryStat].map((stat) =>
      self.weapon.secondary.add(readStat(self.premod, stat).sheet(key))
    ),
  ]
}
