import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TwinNephrite'
const refineInc = [-1, 0.12, 0.14, 0.16, 0.18, 0.2]

const {
  weapon: { refinement },
} = own
const { GuerillaTactics } = allBoolConditionals(key)

const inc = GuerillaTactics.ifOn(percent(subscript(refinement, refineInc)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(inc),
  ownBuff.premod.moveSPD_.add(inc)
)
