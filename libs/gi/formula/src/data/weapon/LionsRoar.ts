import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'LionsRoar'
const dmgInc = [-1, 0.2, 0.24, 0.28, 0.32, 0.36]

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
