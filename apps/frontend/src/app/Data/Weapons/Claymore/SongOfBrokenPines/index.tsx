import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, stg, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'SongOfBrokenPines'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atk_Src = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const atkTeam_Src = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const atkSPD_Src = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const [condPassivePath, condPassive] = cond(key, 'RebelsBannerHymn')
const atk_ = subscript(input.weapon.refinement, atk_Src, { unit: '%' })
const atkTeam_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, atkTeam_Src, KeyMap.info('atk_'))
)
const atkSPD_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, atkSPD_Src)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
  },
  teamBuff: {
    premod: {
      atk_: atkTeam_,
      atkSPD_,
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
      name: trm('name'),
      states: {
        on: {
          fields: [
            {
              node: atkTeam_,
            },
            {
              node: atkSPD_,
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
