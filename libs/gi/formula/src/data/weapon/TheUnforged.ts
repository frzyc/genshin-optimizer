import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allListConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheUnforged'
const atkSrc = [-1, 0.04, 0.05, 0.06, 0.07, 0.08]

const {
  weapon: { refinement },
} = own
const { GoldenMajesty } = allNumConditionals(key, true, 0, 5)
const { WithShield } = allListConditionals(key, ['protected'])

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(
      sum(1, WithShield.map({ protected: 1 })),
      GoldenMajesty,
      percent(subscript(refinement, atkSrc))
    )
  )
)
