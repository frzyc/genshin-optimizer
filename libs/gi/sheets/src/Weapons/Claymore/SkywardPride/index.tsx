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
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SkywardPride'

const dmgInc = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const dmgPerc = [-1, 0.8, 1, 1.2, 1.4, 1.6]
const all_dmg_ = subscript(input.weapon.refinement, dmgInc)
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmgPerc, { unit: '%' }),
      input.total.atk,
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    },
  ),
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      all_dmg_,
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
      fields: [
        {
          node: all_dmg_,
        },
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
