import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheCatch'
const burstDmgSrc_ = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const burstCritSrc_ = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.burst.add(percent(subscript(refinement, burstDmgSrc_))),
  ownBuff.premod.critRate_.burst.add(
    percent(subscript(refinement, burstCritSrc_))
  )
)
