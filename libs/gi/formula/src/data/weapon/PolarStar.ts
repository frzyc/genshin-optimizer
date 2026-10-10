import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PolarStar'
const eleSrc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const ashenStack1 = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const ashenStack2 = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const ashenStack3 = [-1, 0.3, 0.375, 0.45, 0.528, 0.6]
const ashenStack4 = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]
const ashenKeys = ['1', '2', '3', '4'] as const

const {
  weapon: { refinement },
} = own
const { GoldenMajesty } = allListConditionals(key, [...ashenKeys])
const ele_dmg_ = percent(subscript(refinement, eleSrc))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(ele_dmg_),
  ownBuff.premod.dmg_.burst.add(ele_dmg_),
  ownBuff.premod.atk_.add(
    lookup(
      subscript(GoldenMajesty.value, ['', ...ashenKeys]),
      {
        '1': percent(subscript(refinement, ashenStack1)),
        '2': percent(subscript(refinement, ashenStack2)),
        '3': percent(subscript(refinement, ashenStack3)),
        '4': percent(subscript(refinement, ashenStack4)),
      },
      0
    )
  )
)
