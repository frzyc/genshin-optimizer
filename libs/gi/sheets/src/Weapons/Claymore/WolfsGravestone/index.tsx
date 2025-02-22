import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equalStr, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'WolfsGravestone'

const atk_Src = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const atkTeam_Src = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, 'WolfishTracker')
const atk_ = subscript(input.weapon.refinement, atk_Src)
const nonstackWrite = equalStr(condPassive, 'on', input.charKey)
const [atkTeam_, atkTeam_inactive] = nonStackBuff(
  'wolf',
  'atk_',
  subscript(input.weapon.refinement, atkTeam_Src)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: atk_,
  },
  teamBuff: {
    premod: {
      atk_: atkTeam_,
    },
    nonStacking: {
      wolf: nonstackWrite,
    },
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: atk_ }],
    },
    {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: st('enemyLessPercentHP', { percent: 30 }),
      states: {
        on: {
          fields: [
            {
              node: atkTeam_,
            },
            {
              node: atkTeam_inactive,
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
