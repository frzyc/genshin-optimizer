import { allWeaponKeys, type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import type { AnyNode, RawTagMapEntries } from '@genshin-optimizer/waverider'
import { prod, subscript } from '@genshin-optimizer/waverider'
import type { Stat, Data } from '../util'
import { allStatics, self, selfBuff } from '../util'
import CalamityQueller from './CalamityQueller'
import KeyOfKhajNisut from './KeyOfKhajNisut'
import PrototypeAmber from './PrototypeAmber'
import TulaytullahsRemembrance from './TulaytullahsRemembrance'

const data: Data[] = [
  CalamityQueller,
  KeyOfKhajNisut,
  PrototypeAmber,
  TulaytullahsRemembrance,
  ...allWeaponKeys.map(entriesForWeapon),
]

function entriesForWeapon(key: WeaponKey): RawTagMapEntries<AnyNode> {
  const gen = allStats.weapon.data[key]
  const { refinement, ascension } = self.weapon
  return [
    // Stats
    ...gen.lvlCurves.map(({ key, base, curve }) =>
      selfBuff.base[key as Stat].add(prod(base, allStatics('static')[curve]))
    ),
    ...Object.entries(gen.ascensionBonus).map(([key, values]) =>
      selfBuff.base[key as Stat].add(subscript(ascension, values))
    ),
    ...Object.entries(gen.refinementBonus).map(([key, values]) =>
      selfBuff.premod[key as Stat].add(subscript(refinement, values))
    ),
  ]
}

export default data.flat()
