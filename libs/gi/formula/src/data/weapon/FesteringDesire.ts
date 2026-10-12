import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FesteringDesire'
const skill_dmgInc = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const skill_critInc = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.skill.add(percent(subscript(refinement, skill_dmgInc))),
  ownBuff.premod.critRate_.skill.add(
    percent(subscript(refinement, skill_critInc))
  )
)
