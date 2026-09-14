import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FerrousShadow'
const bonusInc = [-1, 0.3, 0.35, 0.4, 0.45, 0.5]

const {
  weapon: { refinement },
} = own
const { Unbending } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.charged.add(
    Unbending.ifOn(percent(subscript(refinement, bonusInc)))
  )
)
