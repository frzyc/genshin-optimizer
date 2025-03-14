import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript, sum } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SunnyMorningSleepIn'

const swirl_eleMasArr = [-1, 120, 150, 180, 210, 240]
const [condSwirlPath, condSwirl] = cond(key, 'swirl')
const swirl_eleMas = equal(
  condSwirl,
  'on',
  subscript(input.weapon.refinement, swirl_eleMasArr),
  { path: 'eleMas' },
)

const afterSkill_eleMasArr = [-1, 96, 120, 144, 168, 192]
const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const afterSkill_eleMas = equal(
  condAfterSkill,
  'on',
  subscript(input.weapon.refinement, afterSkill_eleMasArr),
  { path: 'eleMas' },
)

const afterBurst_eleMasArr = [-1, 32, 40, 48, 56, 64]
const [condAfterBurstPath, condAfterBurst] = cond(key, 'afterBurst')
const afterBurst_eleMas = equal(
  condAfterBurst,
  'on',
  subscript(input.weapon.refinement, afterBurst_eleMasArr),
  { path: 'eleMas' },
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas: sum(swirl_eleMas, afterSkill_eleMas, afterBurst_eleMas),
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('conditional')),
      path: condSwirlPath,
      value: condSwirl,
      teamBuff: true,
      name: st('swirlReaction.base'),
      states: {
        on: {
          fields: [
            {
              node: swirl_eleMas,
            },
            {
              text: stg('duration'),
              value: '6',
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterSkillPath,
      value: condAfterSkill,
      teamBuff: true,
      name: st('hitOp.skill'),
      states: {
        on: {
          fields: [
            {
              node: afterSkill_eleMas,
            },
            {
              text: stg('duration'),
              value: '9',
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterBurstPath,
      value: condAfterBurst,
      teamBuff: true,
      name: st('hitOp.burst'),
      states: {
        on: {
          fields: [
            {
              node: afterBurst_eleMas,
            },
            {
              text: stg('duration'),
              value: '30',
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
