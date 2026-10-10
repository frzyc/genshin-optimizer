import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, percent, register, teamBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'CranesEchoingCall'
const plunging_dmg_arr = [-1, 0.28, 0.41, 0.54, 0.67, 0.8]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  teamBuff.premod.dmg_.plunging.addOnce(
    'crane',
    passive.ifOn(percent(subscript(refinement, plunging_dmg_arr)))
  )
)
