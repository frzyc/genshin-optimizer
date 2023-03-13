import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  prod,
  subscript,
} from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'CrescentPike'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)

const atkInc = [0.2, 0.25, 0.3, 0.35, 0.4]
const [condPassivePath, condPassive] = cond(key, 'InfusionNeedle')
const hit = equal(
  input.weapon.key,
  key,
  equal(
    condPassive,
    'on',
    customDmgNode(
      prod(
        input.total.atk,
        subscript(input.weapon.refineIndex, atkInc, { unit: '%' })
      ),
      'elemental',
      {
        hit: { ele: constant('physical') },
      }
    )
  )
)
const data = dataObjForWeaponSheet(key, data_gen, undefined, { hit })

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key),
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(hit, { name: WeaponSheet.trm(key)('hitName') }),
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
