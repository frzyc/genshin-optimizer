import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  prod,
  subscript,
} from '../../../../Formula/utils'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FilletBlade'
const data_gen = allStats.weapon.data[key]

const dmg_Src = [-1, 2.4, 2.8, 3.2, 3.6, 4]
const cd_Src = [-1, 15, 14, 13, 12, 11]
const dmg_ = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmg_Src, { unit: '%' }),
      input.premod.atk
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    }
  )
)

const data = dataObjForWeaponSheet(key, data_gen, undefined, {
  dmg_,
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(dmg_, { name: st('dmg') }),
        },
        {
          text: stg('cd'),
          value: (data) => cd_Src[data.get(input.weapon.refinement).value],
          unit: 's',
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
