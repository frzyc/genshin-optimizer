import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { allStatics, own, ownBuff, readStat } from '../util'

export function entriesForWeapon(key: WeaponKey): TagMapNodeEntries {
  const gen = allStats.weapon.data[key]
  const { refinement, ascension } = own.weapon
  const primaryStat = 'atk'
  const nonPrimaryStat = new Set(gen.lvlCurves.map(({ key }) => key))
  nonPrimaryStat.delete(primaryStat)

  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      (key == 'atk' ? ownBuff.base[key] : readStat(ownBuff.premod, key)).add(
        prod(base, allStatics('static')[curve]),
      ),
    ),
    ...Object.entries(gen.ascensionBonus).map(([key, values]) =>
      (key == 'atk' ? ownBuff.base[key] : readStat(ownBuff.premod, key)).add(
        subscript(ascension, values),
      ),
    ),
    ...Object.entries(gen.refinementBonus).map(([key, values]) =>
      readStat(ownBuff.weaponRefinement, key).add(
        subscript(refinement, values),
      ),
    ),

    // Specialized stats, items here are sheet-specific data (i.e., `sheet:<key>`)
    // Read from `ownBuff` to include only sheet's contribution.
    ownBuff.weapon.primary.add(ownBuff.base[primaryStat].sheet(key)),
    ...[...nonPrimaryStat].map((stat) =>
      ownBuff.weapon.secondary.add(readStat(ownBuff.premod, stat).sheet(key)),
    ),
  ]
}
