import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  equalStr,
  infoMut,
  input,
  subscript,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ForestRegalia'
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'passive')
const eleMasArr = [-1, 60, 75, 90, 105, 120]
const nonstackWrite = equalStr(condPassive, 'on', input.charKey)
const [eleMas_disp, eleMas_dispInactive] = nonStackBuff(
  'leafCon',
  'eleMas',
  subscript(input.weapon.refinement, eleMasArr)
)
const eleMas = equal(input.activeCharKey, target.charKey, eleMas_disp)

const data = dataObjForWeaponSheet(key, {
  teamBuff: {
    premod: {
      eleMas,
    },
    nonStacking: {
      leafCon: nonstackWrite,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(eleMas_disp, { path: 'eleMas' }),
            },
            {
              node: eleMas_dispInactive,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 20,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
