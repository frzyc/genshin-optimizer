import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  prod,
  subscript,
} from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'CrescentPike'
const data_gen = allStats.weapon.data[key]

const atkInc = [0.2, 0.25, 0.3, 0.35, 0.4]

const hit = equal(
  input.weapon.key,
  key,
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
const data = dataObjForWeaponSheet(key, data_gen, undefined, { hit })

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('talents.passive')),
      fields: [
        {
          node: infoMut(hit, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
