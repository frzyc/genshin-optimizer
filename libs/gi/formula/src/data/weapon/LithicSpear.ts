import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register, team } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'LithicSpear'
const atkInc = [-1, 0.07, 0.08, 0.09, 0.1, 0.11]
const critInc = [-1, 0.03, 0.04, 0.05, 0.06, 0.07]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(percent(subscript(refinement, atkInc)), team.common.count.liyue)
  ),
  ownBuff.premod.critRate_.add(
    prod(percent(subscript(refinement, critInc)), team.common.count.liyue)
  )
)
