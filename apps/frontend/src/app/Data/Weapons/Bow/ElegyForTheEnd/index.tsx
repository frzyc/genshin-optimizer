import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, stg, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'ElegyForTheEnd'
const [, trm] = trans('weapon', key)
const data_gen = allStats.weapon.data[key]
const eleMasInc = [60, 75, 90, 105, 120]
const eleMasInc2 = [100, 125, 150, 175, 200]
const atk_s = [0.2, 0.25, 0.3, 0.35, 0.4]

const [condPath, condNode] = cond(key, 'ThePartingRefrain')
const eleMas = subscript(
  input.weapon.refineIndex,
  eleMasInc,
  KeyMap.info('eleMas')
)
// TODO: These should not stack, similar to NO. But I don't want to copy NO's
// solution, since then these nodes won't show in the team buff panel. And it's
// a bit unlikely people will try to stack this buff
const eleMas2 = equal(
  condNode,
  'on',
  subscript(input.weapon.refineIndex, eleMasInc2, KeyMap.info('eleMas'))
)
const atk_ = equal(condNode, 'on', subscript(input.weapon.refineIndex, atk_s))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas,
  },
  teamBuff: {
    premod: {
      atk_,
      eleMas: eleMas2,
    },
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: eleMas,
        },
      ],
    },
    {
      value: condNode,
      path: condPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: eleMas2,
            },
            {
              node: atk_,
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
