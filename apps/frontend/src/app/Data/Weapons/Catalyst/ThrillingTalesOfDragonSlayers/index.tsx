import { input, target } from '../../../../Formula'
import { equal, infoMut, subscript, unequal } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, stg, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'ThrillingTalesOfDragonSlayers'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atkSrc = [0.24, 0.3, 0.36, 0.42, 0.48]

const [condPassivePath, condPassive] = cond(key, 'Heritage')
const atk_Disp = equal(
  'on',
  condPassive,
  subscript(input.weapon.refineIndex, atkSrc)
)
const atk_ = unequal(
  input.activeCharKey,
  input.charKey, // Don't apply to wielding char
  equal(input.activeCharKey, target.charKey, atk_Disp) // Only apply to active char
)

const data = dataObjForWeaponSheet(key, data_gen, {
  teamBuff: {
    premod: {
      atk_,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: trm('condName'),
      canShow: unequal(input.activeCharKey, input.charKey, 1),
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: infoMut(atk_Disp, KeyMap.info('atk_')),
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
export default new WeaponSheet(key, sheet, data_gen, data)
