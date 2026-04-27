import { objKeyValMap } from '@genshin-optimizer/common/util'
import {
  type WeaponKey,
  allLunarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import { equal, infoMut, input, subscript, sum } from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'NocturnesCurtainCall'
const [, trm] = trans('weapon', key)

const hp_arr = [-1, 0.1, 0.12, 0.14, 0.16, 0.18]
// const energyArr = [-1, 14, 15, 16, 17, 18]
const condHp_arr = [-1, 0.14, 0.16, 0.18, 0.2, 0.22]
const lunarCritDMG_arr = [-1, 0.6, 0.8, 1, 1.2, 1.4]
const hp_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, hp_arr, { path: 'hp_' })
)
const [condPassivePath, condPassive] = cond(key, 'passive')
const passiveHp_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, condHp_arr, { path: 'hp_' })
)
const passiveLunarCritDMG_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, lunarCritDMG_arr)
)
const passiveLunarCritDMG_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_critDMG_`,
  infoMut(
    { ...passiveLunarCritDMG_ },
    { path: `${k}_critDMG_`, isTeamBuff: true }
  ),
])

const data = dataObjForWeaponSheet(key, {
  premod: {
    hp_: sum(hp_, passiveHp_),
    ...passiveLunarCritDMG_obj,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: hp_,
        },
      ],
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condPassivePath,
      value: condPassive,
      name: trm('cond'),
      states: {
        on: {
          fields: [
            {
              node: passiveHp_,
            },
            ...Object.values(passiveLunarCritDMG_obj).map((node) => ({ node })),
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
