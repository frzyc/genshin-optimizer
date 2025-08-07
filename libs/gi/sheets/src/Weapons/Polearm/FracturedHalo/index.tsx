import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FracturedHalo'

const atk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const lc_dmg_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const [condAfterSkillBurstPath, condAfterSkillBurst] = cond(
  key,
  'afterSkillBurst'
)
const [condAfterShieldPath, condAfterShield] = cond(key, 'afterShield')

const afterSkillBurst_atk_ = equal(
  condAfterSkillBurst,
  'on',
  subscript(input.weapon.refinement, atk_arr, { unit: '%' })
)
const afterShield_lc_dmg_ = equal(
  condAfterSkillBurst,
  'on',
  equal(
    condAfterShield,
    'on',
    subscript(input.weapon.refinement, lc_dmg_arr, { unit: '%' })
  )
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: afterSkillBurst_atk_,
  },
  teamBuff: {
    premod: {
      lunarcharged_dmg_: afterShield_lc_dmg_,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condAfterSkillBurst,
      path: condAfterSkillBurstPath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skillOrBurst'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: afterSkillBurst_atk_,
            },
            {
              text: stg('duration'),
              value: 20,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condAfterShield,
      path: condAfterShieldPath,
      canShow: equal(condAfterSkillBurst, 'on', 1),
      header: headerTemplate(key, st('conditional')),
      teamBuff: true,
      name: st('creatingShield'),
      states: {
        on: {
          fields: [
            {
              node: afterShield_lc_dmg_,
            },
            {
              text: stg('duration'),
              value: 20,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
