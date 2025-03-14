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
import { st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'DragonspineSpear'
const [, trm] = trans('weapon', key)
const dmgAoePerc = [-1, 0.8, 0.95, 1.1, 1.25, 1.4]
const dmgCryoPerc = [-1, 2, 2.4, 2.8, 3.2, 3.6]
const dmgAoe = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmgAoePerc, { unit: '%' }),
      input.total.atk,
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    },
  ),
)
const dmgOnCryoOp = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmgCryoPerc, { unit: '%' }),
      input.total.atk,
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    },
  ),
)
const data = dataObjForWeaponSheet(key, undefined, {
  dmgAoe,
  dmgOnCryoOp,
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(dmgAoe, { name: trm('aoeDmg') }),
        },
        {
          node: infoMut(dmgOnCryoOp, {
            name: trm('cryoAffectedDmg'),
          }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
