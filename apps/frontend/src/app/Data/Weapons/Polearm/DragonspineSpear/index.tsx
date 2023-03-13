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
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'DragonspineSpear'
const data_gen = data_gen_json as WeaponData

const dmgAoePerc = [0.8, 0.95, 1.1, 1.25, 1.4]
const dmgCryoPerc = [2, 2.4, 2.8, 3.2, 3.6]
const dmgAoe = equal(
  input.weapon.key,
  key,
  customDmgNode(
    prod(
      subscript(input.weapon.refineIndex, dmgAoePerc, { unit: '%' }),
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
      subscript(input.weapon.refineIndex, dmgCryoPerc, { unit: '%' }),
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
