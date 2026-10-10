import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Azurelight'
const skillAtk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const noEnergyAtk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const noEnergyCritDMG_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { afterSkill, noEnergy } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    afterSkill.ifOn(percent(subscript(refinement, skillAtk_arr)))
  ),
  ownBuff.premod.atk_.add(
    afterSkill.ifOn(
      noEnergy.ifOn(percent(subscript(refinement, noEnergyAtk_arr)))
    )
  ),
  ownBuff.premod.critDMG_.add(
    afterSkill.ifOn(
      noEnergy.ifOn(percent(subscript(refinement, noEnergyCritDMG_arr)))
    )
  )
)
