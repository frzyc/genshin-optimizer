import { type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { prod, subscript } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { allStatics, listingItem, readStat, self, selfBuff } from '../util'

export function entriesForWeapon(key: WeaponKey): TagMapNodeEntries {
  const gen = allStats.weapon.data[key]
  const { refinement, ascension } = self.weapon
  const primaryStat = 'atk'
  const nonPrimaryStat = new Set(gen.lvlCurves.map(({ key }) => key))
  nonPrimaryStat.delete(primaryStat)

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

    // Listing (specialized)
    // All items here are sheet-specific data (i.e., `src:<key>`)
    self.listing.specialized.add(listingItem(self.base[primaryStat].src(key))),
    ...[...nonPrimaryStat].map((stat) =>
      self.listing.specialized.add(
        listingItem(readStat(self.premod, stat).src(key))
      )
    ),
    ...[...Object.keys(gen.refinementBonus)].map((stat) =>
      self.listing.specialized
        .src(key)
        .add(
          listingItem(
            readStat(
              self.weaponRefinement,
              stat as keyof typeof gen.refinementBonus
            )
          )
        )
    ),
  ]
}
