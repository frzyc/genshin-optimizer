import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, infoMut, input, subscript, sum } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'DawningFrost'

const charged_eleMasArr = [-1, 72, 90, 108, 126, 144]
const skill_eleMasArr = [-1, 48, 60, 72, 84, 96]

const [condChargedHitPath, condChargedHit] = cond(key, 'chargedHit')
const [condSkillHitPath, condSkillHit] = cond(key, 'skillHit')
const charged_eleMas = equal(
  'on',
  condChargedHit,
  subscript(input.weapon.refinement, charged_eleMasArr)
)
const skill_eleMas = equal(
  'on',
  condSkillHit,
  subscript(input.weapon.refinement, skill_eleMasArr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas: sum(charged_eleMas, skill_eleMas),
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condChargedHit,
      path: condChargedHitPath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.charged'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(charged_eleMas, { path: 'eleMas' }),
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      value: condSkillHit,
      path: condSkillHitPath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.skill'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(skill_eleMas, { path: 'eleMas' }),
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
