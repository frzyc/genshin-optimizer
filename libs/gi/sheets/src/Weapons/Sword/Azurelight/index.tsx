import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript, sum } from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Azurelight'
const [, trm] = trans('weapon', key)

const skillAtk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const noEnergyAtk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const noEnergyCritDMG_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const [condNoEnergyPath, condNoEnergy] = cond(key, 'noEnergy')
const afterSkillAtk_ = equal(
  'on',
  condAfterSkill,
  subscript(input.weapon.refinement, skillAtk_arr),
  { path: 'atk_' }
)
const noEnergyAtk_ = equal(
  'on',
  condAfterSkill,
  equal(
    condNoEnergy,
    'on',
    subscript(input.weapon.refinement, noEnergyAtk_arr)
  ),
  { path: 'atk_' }
)
const noEnergyCritDMG_ = equal(
  'on',
  condAfterSkill,
  equal(
    condNoEnergy,
    'on',
    subscript(input.weapon.refinement, noEnergyCritDMG_arr)
  )
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: sum(afterSkillAtk_, noEnergyAtk_),
    critDMG_: noEnergyCritDMG_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condAfterSkill,
      path: condAfterSkillPath,
      name: st('afterUse.skill'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: afterSkillAtk_,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condNoEnergy,
      path: condNoEnergyPath,
      canShow: equal(condAfterSkill, 'on', 1),
      name: trm('cond'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: noEnergyAtk_,
            },
            {
              node: noEnergyCritDMG_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
