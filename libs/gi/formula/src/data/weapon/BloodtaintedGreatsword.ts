import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BloodtaintedGreatsword'
const dmgInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { BaneOfFireAndThunder } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    BaneOfFireAndThunder.ifOn(percent(subscript(refinement, dmgInc)))
  )
)
