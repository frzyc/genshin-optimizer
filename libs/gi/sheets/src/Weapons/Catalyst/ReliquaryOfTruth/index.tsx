import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  compareEq,
  equal,
  input,
  percent,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ReliquaryOfTruth'

const critRate_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const eleMasArr = [-1, 80, 100, 120, 140, 160]
const critDMG_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const boost = 1.5

const critRate_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, critRate_arr)
)

const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const [condAfterLunarBloomPath, condAfterLunarBloom] = cond(
  key,
  'afterLunarBloom'
)
const afterSkillEleMas = equal(
  condAfterSkill,
  'on',
  compareEq(
    condAfterLunarBloom,
    'on',
    prod(percent(boost), subscript(input.weapon.refinement, eleMasArr)),
    subscript(input.weapon.refinement, eleMasArr)
  )
)

const afterLunarBloomCritDMG_ = equal(
  condAfterLunarBloom,
  'on',
  compareEq(
    condAfterSkill,
    'on',
    prod(percent(boost), subscript(input.weapon.refinement, critDMG_arr)),
    subscript(input.weapon.refinement, critDMG_arr)
  )
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    critRate_,
    eleMas: afterSkillEleMas,
    critDMG_: afterLunarBloomCritDMG_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: critRate_,
        },
      ],
    },
    {
      value: condAfterSkill,
      path: condAfterSkillPath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: afterSkillEleMas,
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
      value: condAfterLunarBloom,
      path: condAfterLunarBloomPath,
      header: headerTemplate(key, st('conditional')),
      name: st('elementalReaction.team.lunarbloom'),
      states: {
        on: {
          fields: [
            {
              node: afterLunarBloomCritDMG_,
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
  ],
}
export default new WeaponSheet(sheet, data)
