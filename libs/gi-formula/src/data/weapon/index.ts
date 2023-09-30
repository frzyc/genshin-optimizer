import { allWeaponKeys, type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { prod, subscript } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import {
  addStatCurve,
  allStatics,
  register,
  registerStatListing,
  self,
} from '../util'
import CalamityQueller from './CalamityQueller'
import KeyOfKhajNisut from './KeyOfKhajNisut'
import PrototypeAmber from './PrototypeAmber'
import TulaytullahsRemembrance from './TulaytullahsRemembrance'

const data: TagMapNodeEntries[] = [
  CalamityQueller,
  KeyOfKhajNisut,
  PrototypeAmber,
  TulaytullahsRemembrance,
  ...allWeaponKeys.map(entriesForWeapon),
]

function entriesForWeapon(key: WeaponKey): TagMapNodeEntries {
  const gen = allStats.weapon.data[key]
  const { refinement, ascension } = self.weapon
  const specials = new Set(Object.keys(gen.ascensionBonus))

  return register(key, [
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
  ])
}

export default data.flat()
