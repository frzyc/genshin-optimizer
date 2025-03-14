import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
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

const key: WeaponKey = 'SkywardAtlas'

const dmgBonus = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const eleBonus_ = Object.fromEntries(
  allElementKeys.map((ele) => [
    ele,
    subscript(input.weapon.refinement, dmgBonus),
  ]),
)
const dmgPerc = [-1, 1.6, 2, 2.4, 2.8, 3.2]

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
      ...Object.fromEntries(
        allElementKeys.map((ele) => [`${ele}_dmg_`, eleBonus_[ele]]),
      ),
    },
  },
  { dmg },
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        ...allElementKeys.map((ele) => ({ node: eleBonus_[ele] })),
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
