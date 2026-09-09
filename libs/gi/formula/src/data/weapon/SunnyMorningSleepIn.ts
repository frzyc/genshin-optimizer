import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SunnyMorningSleepIn'
const swirl_eleMasArr = [-1, 120, 150, 180, 210, 240]
const afterSkill_eleMasArr = [-1, 96, 120, 144, 168, 192]
const afterBurst_eleMasArr = [-1, 32, 40, 48, 56, 64]

const {
  weapon: { refinement },
} = own
const { swirl, afterSkill, afterBurst } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(swirl.ifOn(subscript(refinement, swirl_eleMasArr))),
  ownBuff.premod.eleMas.add(
    afterSkill.ifOn(subscript(refinement, afterSkill_eleMasArr))
  ),
  ownBuff.premod.eleMas.add(
    afterBurst.ifOn(subscript(refinement, afterBurst_eleMasArr))
  )
)
