import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'VividNotions'
const dawn_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const twilight_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { dawn, twilight } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.critDMG_.plunging.add(
    dawn.ifOn(percent(subscript(refinement, dawn_arr)))
  ),
  ownBuff.premod.critDMG_.plunging.add(
    twilight.ifOn(percent(subscript(refinement, twilight_arr)))
  )
)
