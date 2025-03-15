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

const key: WeaponKey = 'Messenger'

const dmg_s = [-1, 1, 1.25, 1.5, 1.75, 2]
const dmg = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(subscript(input.weapon.refinement, dmg_s), input.total.atk),
    'elemental',
    { hit: { ele: constant('physical') } },
  ),
)

const data = dataObjForWeaponSheet(key, undefined, { dmg })

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(dmg, { name: st('dmg') }),
        },
      ],
    },
  ],
}

export default new WeaponSheet(sheet, data)
