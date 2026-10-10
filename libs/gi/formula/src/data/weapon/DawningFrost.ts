import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'DawningFrost'
const charged_eleMasArr = [-1, 72, 90, 108, 126, 144]
const skill_eleMasArr = [-1, 48, 60, 72, 84, 96]

const {
  weapon: { refinement },
} = own
const { chargedHit, skillHit } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(
    chargedHit.ifOn(subscript(refinement, charged_eleMasArr))
  ),
  ownBuff.premod.eleMas.add(
    skillHit.ifOn(subscript(refinement, skill_eleMasArr))
  )
)
