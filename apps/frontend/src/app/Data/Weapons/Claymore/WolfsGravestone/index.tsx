import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'WolfsGravestone'
const data_gen = allStats.weapon.data[key]

const atk_Src = [0.2, 0.25, 0.3, 0.35, 0.4]
const atkTeam_Src = [0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, 'WolfishTracker')
const atk_ = subscript(input.weapon.refineIndex, atk_Src)
const atkTeam_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refineIndex, atkTeam_Src, KeyMap.info('atk_'))
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_: atk_,
  },
  teamBuff: {
    premod: {
      atk_: atkTeam_,
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
export default new WeaponSheet(key, sheet, data_gen, data)
