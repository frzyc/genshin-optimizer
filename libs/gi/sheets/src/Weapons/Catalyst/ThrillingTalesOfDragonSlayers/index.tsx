import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  equalStr,
  infoMut,
  input,
  subscript,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ThrillingTalesOfDragonSlayers'
const [, trm] = trans('weapon', key)

const atkSrc = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const [condPassivePath, condPassive] = cond(key, 'Heritage')
const nonstackWrite = equalStr(condPassive, 'on', input.charKey)
const [atk_Disp, atk_dispInactive] = nonStackBuff(
  'ttds',
  'atk_',
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
    nonStacking: {
      ttds: nonstackWrite,
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
              node: infoMut(atk_Disp, { path: 'atk_', isTeamBuff: true }),
            },
            {
              node: atk_dispInactive,
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
