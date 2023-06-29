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

const key: WeaponKey = 'DragonspineSpear'
const data_gen = allStats.weapon.data[key]

const dmgAoePerc = [-1, 0.8, 0.95, 1.1, 1.25, 1.4]
const dmgCryoPerc = [-1, 2, 2.4, 2.8, 3.2, 3.6]
const dmgAoe = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmgAoePerc, { unit: '%' }),
      input.total.atk
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    }
  )
)
const dmgOnCryoOp = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refinement, dmgCryoPerc, { unit: '%' }),
      input.total.atk
    ),
    'elemental',
    {
      hit: { ele: constant('physical') },
    }
  )
)
const data = dataObjForWeaponSheet(key, data_gen, undefined, {
  dmgAoe,
  dmgOnCryoOp,
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(dmgAoe, { name: WeaponSheet.trm(key)('aoeDmg') }),
        },
        {
          node: infoMut(dmgOnCryoOp, {
            name: WeaponSheet.trm(key)('cryoAffectedDmg'),
          }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
