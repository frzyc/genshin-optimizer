import { type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { prod, subscript } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { addStatCurve, allStatics, registerStatListing, self } from '../util'

export function entriesForWeapon(key: WeaponKey): TagMapNodeEntries {
  const gen = allStats.weapon.data[key]
  const { refinement, ascension } = self.weapon
  const specials = new Set(Object.keys(gen.ascensionBonus))

  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      addStatCurve(key, prod(base, allStatics('static')[curve]))
    ),
    ...Object.entries(gen.ascensionBonus).map(([key, values]) =>
      addStatCurve(key, subscript(ascension, values))
    ),
    ...Object.entries(gen.refinementBonus).map(([key, values]) =>
      addStatCurve(key, subscript(refinement, values))
    ),
    // Listing
    ...[...specials].map((key) => registerStatListing(key)),
  ]
}
