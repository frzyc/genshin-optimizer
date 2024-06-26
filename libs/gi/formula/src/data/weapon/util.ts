import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { allStatics, listingItem, readStat, self } from '../util'

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

    // Listing (specialized)
    // All items here are sheet-specific data (i.e., `sheet:<key>`)
    self.listing.specialized.add(
      listingItem(self.base[primaryStat].sheet(key))
    ),
    ...[...nonPrimaryStat].map((stat) =>
      self.listing.specialized.add(
        listingItem(readStat(self.premod, stat).sheet(key))
      )
    ),
    ...[...Object.keys(gen.refinementBonus)].map((stat) =>
      self.listing.specialized.add(
        listingItem(
          readStat(
            self.weaponRefinement,
            stat as keyof typeof gen.refinementBonus
          ).sheet(key)
        )
      )
    ),
  ]
}
