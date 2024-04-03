import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  subscript,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ThrillingTalesOfDragonSlayers'
const [, trm] = trans('weapon', key)

const atkSrc = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const [condPassivePath, condPassive] = cond(key, 'Heritage')
const atk_Disp = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, atkSrc)
)
const atk_ = unequal(
  input.activeCharKey,
  input.charKey, // Don't apply to wielding char
  equal(input.activeCharKey, target.charKey, atk_Disp) // Only apply to active char
)

const data = dataObjForWeaponSheet(key, {
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
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: infoMut(atk_Disp, { path: 'atk_' }),
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
