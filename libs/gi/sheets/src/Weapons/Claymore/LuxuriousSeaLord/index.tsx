import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  equal,
  infoMut,
  input,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'LuxuriousSeaLord'

const burst_dmg_Src = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const dmg_Src = [-1, 1, 1.25, 1.5, 1.75, 2]
const burst_dmg_ = subscript(input.weapon.refinement, burst_dmg_Src)
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmg_Src, { unit: '%' }),
      input.total.atk,
    ),
    'elemental',
    { hit: { ele: constant('physical') } },
  ),
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      burst_dmg_,
    },
  },
  {
    dmg,
  },
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: burst_dmg_ }],
    },
    {
      header: headerTemplate(key, st('conditional')),
      fields: [
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
        {
          text: stg('cd'),
          value: 15,
          unit: 's',
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
